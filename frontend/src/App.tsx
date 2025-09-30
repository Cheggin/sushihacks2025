import { useState } from 'react';
import FishMap from './components/FishMap';

const FISH_TYPES = [
  'All Fish',
  'Tuna (Thunnus)',
  'Skipjack (Katsuwonus pelamis)',
  'Yellowfin (Thunnus albacares)',
  'Albacore (Thunnus alalunga)',
  'Japanese Eel (Anguilla japonica)',
  'Lanternfish (Myctophidae)',
];

export default function App() {
  const [selectedType, setSelectedType] = useState('All Fish');
  const [viewMode, setViewMode] = useState<'points' | 'zones'>('points');

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card border-b-2 border-border">
        <div className="p-4">
          <h1 className="text-2xl font-bold text-text-primary">
            Fish Distribution Map
          </h1>
          <p className="text-sm text-text-secondary">
            Explore 19,465 fish occurrences across the Asia-Pacific region
          </p>
        </div>

        {/* Fish Type Filter */}
        <div className="px-4 pb-3 overflow-x-auto">
          <div className="flex gap-2">
            {FISH_TYPES.map(type => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedType === type
                    ? 'bg-primary text-white'
                    : 'bg-background text-text-secondary hover:bg-border'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="px-4 pb-4 flex justify-center gap-2">
          <button
            onClick={() => setViewMode('points')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'points'
                ? 'bg-primary text-white'
                : 'bg-background text-text-secondary hover:bg-border'
            }`}
          >
            Individual Points
          </button>
          <button
            onClick={() => setViewMode('zones')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'zones'
                ? 'bg-primary text-white'
                : 'bg-background text-text-secondary hover:bg-border'
            }`}
          >
            Geographic Zones
          </button>
        </div>

        {/* Zone Legend (only show in zones mode) */}
        {viewMode === 'zones' && (
          <div className="px-4 pb-4">
            <div className="bg-background rounded-lg p-3">
              <h3 className="text-xs font-bold text-text-primary mb-2">
                Zone Colors:
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#FF6B6B]"></div>
                  <span className="text-text-secondary">Tuna</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#45B7D1]"></div>
                  <span className="text-text-secondary">Eels</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#4ECDC4]"></div>
                  <span className="text-text-secondary">Lanternfish</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#FFD93D]"></div>
                  <span className="text-text-secondary">Reef Fish</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Map */}
      <main className="flex-1 relative">
        <FishMap viewMode={viewMode} selectedType={selectedType} />
      </main>
    </div>
  );
}
