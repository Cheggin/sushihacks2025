import { X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { FishOccurrence } from '../types/fish';

interface FishSidebarProps {
  fish: FishOccurrence | null;
  onClose: () => void;
}

// Generate mock price data
const generatePriceHistory = (fishName: string) => {
  const basePrice = Math.random() * 50 + 20; // $20-70 base price
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return months.map((month, index) => ({
    month,
    price: parseFloat((basePrice + (Math.random() - 0.5) * 20).toFixed(2))
  }));
};

const getLastPrice = (fishName: string) => {
  return parseFloat((Math.random() * 50 + 20).toFixed(2));
};

export default function FishSidebar({ fish, onClose }: FishSidebarProps) {
  if (!fish) return null;

  const priceHistory = generatePriceHistory(fish.scientificName);
  const lastPrice = getLastPrice(fish.scientificName);

  return (
    <div
      className={`fixed top-0 right-0 h-full w-96 bg-white/10 backdrop-blur-xl border-l border-white/20 shadow-2xl z-50 transform transition-transform duration-300 ${
        fish ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="h-full flex flex-col p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">{fish.scientificName}</h2>
            {fish.vernacularName && (
              <p className="text-base text-white/80 mb-1">{fish.vernacularName}</p>
            )}
            <p className="text-sm text-white/60">{fish.genus || 'Unknown Genus'}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Last Price Sold Box */}
        <div className="bg-white/5 border border-white/20 rounded-xl p-6 mb-6">
          <div className="text-sm text-white/60 mb-2">Last Price Sold</div>
          <div className="text-4xl font-bold text-white mb-1">${lastPrice}</div>
          <div className="text-xs text-green-400">+5.2% from last month</div>
        </div>

        {/* Fish Details */}
        <div className="bg-white/5 border border-white/20 rounded-xl p-4 mb-6">
          <h3 className="text-sm font-semibold text-white mb-3">Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-white/60">Family:</span>
              <span className="text-white font-medium">{fish.family || 'Unknown'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Location:</span>
              <span className="text-white font-medium">{fish.waterBody || fish.locality || 'Unknown'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Country:</span>
              <span className="text-white font-medium">{fish.country || 'Unknown'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Coordinates:</span>
              <span className="text-white font-medium text-xs">
                {fish.decimalLatitude.toFixed(4)}, {fish.decimalLongitude.toFixed(4)}
              </span>
            </div>
          </div>
        </div>

        {/* Past Sell Prices Graph */}
        <div className="bg-white/5 border border-white/20 rounded-xl p-4 flex-1">
          <h3 className="text-sm font-semibold text-white mb-4">Past Sell Prices (2024)</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={priceHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis
                dataKey="month"
                stroke="rgba(255,255,255,0.5)"
                fontSize={11}
                tick={{ fill: 'rgba(255,255,255,0.7)' }}
              />
              <YAxis
                stroke="rgba(255,255,255,0.5)"
                fontSize={11}
                tick={{ fill: 'rgba(255,255,255,0.7)' }}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  color: 'white'
                }}
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#5ECDBF"
                strokeWidth={2}
                dot={{ fill: '#5ECDBF', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
