import { useState } from 'react';
import { Link } from 'react-router-dom';
import FishMap from '../components/FishMap';

const FISH_TYPES = [
  'All Fish',
  'Tuna (Thunnus)',
  'Skipjack (Katsuwonus pelamis)',
  'Yellowfin (Thunnus albacares)',
  'Albacore (Thunnus alalunga)',
  'Japanese Eel (Anguilla japonica)',
  'Lanternfish (Myctophidae)',
];

export default function FishMapPage() {
  const [selectedType, setSelectedType] = useState('All Fish');
  const [viewMode, setViewMode] = useState<'points' | 'zones'>('points');

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card border-b border-border">
        <div className="p-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-text-primary">Fish Distribution Map</h1>
            <p className="text-sm text-text-secondary">
              19,465 fish occurrences across the Asia-Pacific region
            </p>
          </div>
          <Link
            to="/"
            className="px-4 py-2 border border-border hover:border-primary rounded-lg text-text-primary transition-colors text-sm"
          >
            ← Back
          </Link>
        </div>

        {/* Fish Type Filter */}
        <div className="px-4 pb-3 overflow-x-auto">
          <div className="flex gap-2">
            {FISH_TYPES.map(type => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1.5 border rounded-md text-sm whitespace-nowrap transition-colors ${
                  selectedType === type
                    ? 'border-primary bg-primary text-white'
                    : 'border-border text-text-secondary hover:border-primary'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="px-4 pb-3 flex gap-2">
          <button
            onClick={() => setViewMode('points')}
            className={`px-4 py-1.5 border rounded-md text-sm transition-colors ${
              viewMode === 'points'
                ? 'border-primary bg-primary text-white'
                : 'border-border text-text-secondary hover:border-primary'
            }`}
          >
            Individual Points
          </button>
          <button
            onClick={() => setViewMode('zones')}
            className={`px-4 py-1.5 border rounded-md text-sm transition-colors ${
              viewMode === 'zones'
                ? 'border-primary bg-primary text-white'
                : 'border-border text-text-secondary hover:border-primary'
            }`}
          >
            Geographic Zones
          </button>
        </div>

        {/* Zone Legend (only show in zones mode) */}
        {viewMode === 'zones' && (
          <div className="px-4 pb-3">
            <div className="border border-border rounded-md p-3">
              <h3 className="text-xs font-semibold text-text-primary mb-2">Zone Colors:</h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm border border-border" style={{ backgroundColor: '#FF6B6B' }}></div>
                  <span className="text-text-secondary">Tuna</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm border border-border" style={{ backgroundColor: '#45B7D1' }}></div>
                  <span className="text-text-secondary">Eels</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm border border-border" style={{ backgroundColor: '#4ECDC4' }}></div>
                  <span className="text-text-secondary">Lanternfish</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm border border-border" style={{ backgroundColor: '#FFD93D' }}></div>
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
