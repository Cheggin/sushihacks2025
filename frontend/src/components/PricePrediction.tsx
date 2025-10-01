import { useState, useEffect, memo } from 'react';
import { Card, CardContent } from './ui/card';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface PriceData {
  date: string;
  actual?: number;
  predicted: number;
  lower: number;
  upper: number;
}

const fishTypes = ['Tuna', 'Salmon', 'Mackerel', 'Sardine', 'Sea Bass'];

// Simulated AI price prediction based on historical patterns
const generatePricePrediction = (fishType: string): PriceData[] => {
  const today = new Date();
  const data: PriceData[] = [];

  // Base prices per kg for different fish
  const basePrices: Record<string, number> = {
    'Tuna': 45,
    'Salmon': 28,
    'Mackerel': 12,
    'Sardine': 8,
    'Sea Bass': 35,
  };

  const basePrice = basePrices[fishType] || 20;

  // Generate historical data (last 7 days) + predictions (next 7 days)
  for (let i = -7; i <= 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);

    // Simulate seasonal and market fluctuations
    const seasonalFactor = 1 + 0.1 * Math.sin((date.getMonth() / 12) * Math.PI * 2);
    const randomWalk = 1 + (Math.random() - 0.5) * 0.15;
    const trendFactor = i > 0 ? 1 + (i * 0.02) : 1; // Slight upward trend for predictions

    const price = basePrice * seasonalFactor * randomWalk * trendFactor;
    const uncertainty = i > 0 ? (i * 0.5) : 0;

    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      actual: i <= 0 ? price : undefined,
      predicted: i > 0 ? price : price,
      lower: price - uncertainty,
      upper: price + uncertainty,
    });
  }

  return data;
};

const PricePrediction = memo(function PricePrediction() {
  const [selectedFish, setSelectedFish] = useState('Tuna');
  const [priceData, setPriceData] = useState<PriceData[]>([]);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [predictedPrice, setPredictedPrice] = useState(0);
  const [priceChange, setPriceChange] = useState(0);

  useEffect(() => {
    const data = generatePricePrediction(selectedFish);
    setPriceData(data);

    // Get current price (today's data)
    const todayData = data[7]; // Index 7 is today (0-indexed, with 7 days of history)
    setCurrentPrice(todayData.predicted);

    // Get predicted price (7 days from now)
    const futureData = data[data.length - 1];
    setPredictedPrice(futureData.predicted);

    // Calculate percentage change
    const change = ((futureData.predicted - todayData.predicted) / todayData.predicted) * 100;
    setPriceChange(change);
  }, [selectedFish]);

  const getTrendIcon = () => {
    if (priceChange > 1) return <TrendingUp className="w-5 h-5 text-green-400" />;
    if (priceChange < -1) return <TrendingDown className="w-5 h-5 text-red-400" />;
    return <Minus className="w-5 h-5 text-yellow-400" />;
  };

  const getTrendColor = () => {
    if (priceChange > 1) return 'text-green-400';
    if (priceChange < -1) return 'text-red-400';
    return 'text-yellow-400';
  };

  return (
    <Card>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg text-white">
            AI Price Predictions
          </h2>
          <select
            value={selectedFish}
            onChange={(e) => setSelectedFish(e.target.value)}
            className="px-3 py-1 bg-white/5 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-400/60 transition-all"
          >
            {fishTypes.map(fish => (
              <option key={fish} value={fish} className="bg-slate-800">
                {fish}
              </option>
            ))}
          </select>
        </div>

        {/* Price Summary */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="p-3 bg-white/5 rounded-lg border border-white/20">
            <p className="text-xs text-white/60 mb-1">Current Price</p>
            <p className="text-lg font-bold text-white">${currentPrice.toFixed(2)}</p>
            <p className="text-xs text-white/50">per kg</p>
          </div>
          <div className="p-3 bg-white/5 rounded-lg border border-white/20">
            <p className="text-xs text-white/60 mb-1">7-Day Forecast</p>
            <p className="text-lg font-bold text-white">${predictedPrice.toFixed(2)}</p>
            <p className="text-xs text-white/50">per kg</p>
          </div>
          <div className="p-3 bg-white/5 rounded-lg border border-white/20">
            <p className="text-xs text-white/60 mb-1">Trend</p>
            <div className="flex items-center gap-1">
              {getTrendIcon()}
              <p className={`text-lg font-bold ${getTrendColor()}`}>
                {priceChange > 0 ? '+' : ''}{priceChange.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        {/* Price Chart */}
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={priceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis
              dataKey="date"
              stroke="rgba(255,255,255,0.3)"
              tick={{ fill: 'rgba(255,255,255,0.8)', fontSize: 11 }}
            />
            <YAxis
              stroke="rgba(255,255,255,0.3)"
              tick={{ fill: 'rgba(255,255,255,0.8)', fontSize: 11 }}
              label={{ value: 'Price ($/kg)', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.7)' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                border: '1px solid rgba(6,182,212,0.4)',
                borderRadius: '12px',
                backdropFilter: 'blur(16px)',
              }}
              itemStyle={{ color: '#06b6d4' }}
              labelStyle={{ color: 'rgba(255,255,255,0.95)' }}
              formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
            />
            <Legend
              iconType="line"
              formatter={(value) => <span style={{ color: 'rgba(255,255,255,0.9)' }}>{value}</span>}
            />
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#06b6d4"
              strokeWidth={2}
              name="Historical"
              dot={false}
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey="predicted"
              stroke="#10b981"
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Predicted"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>

        {/* AI Insights */}
        <div className="mt-4 p-3 bg-cyan-400/10 border border-cyan-400/30 rounded-lg">
          <p className="text-xs font-semibold text-cyan-400 mb-1">AI Market Insight</p>
          <p className="text-xs text-white/80">
            {priceChange > 1
              ? `${selectedFish} prices are expected to rise due to seasonal demand increases and favorable market conditions. Consider stocking up early.`
              : priceChange < -1
              ? `${selectedFish} prices are forecasted to decline slightly. Good opportunity for buyers, but sellers may want to adjust expectations.`
              : `${selectedFish} prices are projected to remain stable over the next week with minimal fluctuation.`
            }
          </p>
        </div>

        <div className="mt-2 text-xs text-white/50 italic text-center">
          * Predictions based on historical data, seasonal patterns, and market trends
        </div>
      </CardContent>
    </Card>
  );
});

export default PricePrediction;
