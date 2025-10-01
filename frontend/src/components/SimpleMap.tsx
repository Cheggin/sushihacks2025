import { useEffect, useState } from 'react';
import type { FishOccurrence } from '../types/fish';

interface SimpleMapProps {
  onFishClick: (fish: FishOccurrence) => void;
  userMarker: { name: string; lat: number; lng: number; } | null;
  filters?: {
    searchText: string;
    fishTypes: string[];
    locations: string[];
    priceRange: [number, number];
  } | null;
  onCountsUpdate?: (filtered: number, total: number) => void;
}

export default function SimpleMap({ onFishClick, userMarker, filters, onCountsUpdate }: SimpleMapProps) {
  const [fishData, setFishData] = useState<FishOccurrence[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>('All Regions');

  console.log('SimpleMap: Component rendering');

  useEffect(() => {
    console.log('SimpleMap: Loading fish data');
    const loadFishData = async () => {
      try {
        const response = await fetch('/all_fish.csv');
        const csvText = await response.text();
        const lines = csvText.split('\n');
        const headers = lines[0].split(',');

        const sampledData: FishOccurrence[] = [];
        const sampleRate = Math.max(1, Math.floor(lines.length / 1000));

        for (let i = 1; i < lines.length; i += sampleRate) {
          const line = lines[i];
          if (!line.trim()) continue;

          const values = line.split(',');
          const row: any = {};
          headers.forEach((header, index) => {
            row[header.trim()] = values[index]?.trim();
          });

          const lat = parseFloat(row.decimalLatitude);
          const lng = parseFloat(row.decimalLongitude);

          if (!isNaN(lat) && !isNaN(lng)) {
            sampledData.push({
              id: row.id || '',
              catalogNumber: row.catalogNumber || '',
              scientificName: row.scientificName || '',
              vernacularName: row.vernacularName || '',
              decimalLatitude: lat,
              decimalLongitude: lng,
              country: row.country || '',
              waterBody: row.waterBody || '',
              locality: row.locality || '',
              year: row.year ? parseInt(row.year) : undefined,
              month: row.month ? parseFloat(row.month) : undefined,
              individualCount: row.individualCount ? parseInt(row.individualCount) : undefined,
              genus: row.genus || '',
              family: row.family || '',
              class: row.class || '',
              phylum: row.phylum || '',
            });
          }
        }

        setFishData(sampledData);
        if (onCountsUpdate) {
          onCountsUpdate(sampledData.length, sampledData.length);
        }
      } catch (error) {
        console.error('Error loading fish data:', error);
      }
    };

    void loadFishData();
  }, [onCountsUpdate]);

  // Group fish by region
  const regions = {
    'All Regions': fishData,
    'Pacific Ocean': fishData.filter(f => f.waterBody?.toLowerCase().includes('pacific')),
    'Indian Ocean': fishData.filter(f => f.waterBody?.toLowerCase().includes('indian')),
    'Atlantic Ocean': fishData.filter(f => f.waterBody?.toLowerCase().includes('atlantic')),
    'Asia': fishData.filter(f => ['Japan', 'China', 'Korea', 'Taiwan', 'Philippines'].includes(f.country)),
  };

  const displayedFish = regions[selectedRegion as keyof typeof regions] || fishData;
  const displayLimit = 50; // Show first 50 for performance

  return (
    <div className="fixed inset-0 z-0 bg-gradient-to-br from-slate-100 to-slate-200 overflow-auto">
      <div className="container mx-auto p-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-2 border-slate-300">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Fish Distribution Map (Accessible 2D View)
          </h1>
          <p className="text-slate-600">
            {fishData.length.toLocaleString()} fish occurrences across the Asia-Pacific region
          </p>
        </div>

        {/* Region Filter */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 border-2 border-slate-300">
          <label className="block text-sm font-semibold text-slate-900 mb-2">
            Filter by Region:
          </label>
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg bg-white text-slate-900 font-medium focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-600"
          >
            {Object.keys(regions).map(region => (
              <option key={region} value={region}>
                {region} ({regions[region as keyof typeof regions].length} occurrences)
              </option>
            ))}
          </select>
        </div>

        {/* User Location */}
        {userMarker && (
          <div className="bg-cyan-50 border-2 border-cyan-400 rounded-lg shadow-md p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-cyan-600 rounded-full"></div>
              <div>
                <p className="font-semibold text-slate-900">Your Location: {userMarker.name}</p>
                <p className="text-sm text-slate-600">
                  Lat: {userMarker.lat.toFixed(4)}, Lng: {userMarker.lng.toFixed(4)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Fish List */}
        <div className="bg-white rounded-lg shadow-md border-2 border-slate-300 overflow-hidden">
          <div className="bg-slate-100 border-b-2 border-slate-300 p-4">
            <h2 className="text-xl font-bold text-slate-900">
              Fish Occurrences in {selectedRegion}
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Showing {Math.min(displayLimit, displayedFish.length)} of {displayedFish.length} results
            </p>
          </div>

          <div className="divide-y-2 divide-slate-200">
            {displayedFish.slice(0, displayLimit).map((fish, idx) => (
              <button
                key={idx}
                onClick={() => onFishClick(fish)}
                className="w-full p-4 hover:bg-slate-50 transition-colors text-left focus:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-cyan-600"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">
                      {fish.vernacularName || fish.scientificName}
                    </h3>
                    <p className="text-sm text-slate-600 italic mt-1">
                      {fish.scientificName}
                    </p>
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-600">
                      {fish.country && (
                        <span className="px-2 py-1 bg-blue-100 border border-blue-300 rounded font-medium">
                          📍 {fish.country}
                        </span>
                      )}
                      {fish.waterBody && (
                        <span className="px-2 py-1 bg-cyan-100 border border-cyan-300 rounded font-medium">
                          🌊 {fish.waterBody}
                        </span>
                      )}
                      {fish.genus && (
                        <span className="px-2 py-1 bg-green-100 border border-green-300 rounded font-medium">
                          🐟 {fish.genus}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <div className="text-slate-900 font-mono">
                      Lat: {fish.decimalLatitude.toFixed(2)}°
                    </div>
                    <div className="text-slate-900 font-mono">
                      Lng: {fish.decimalLongitude.toFixed(2)}°
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {displayedFish.length > displayLimit && (
            <div className="bg-slate-100 border-t-2 border-slate-300 p-4 text-center">
              <p className="text-sm text-slate-600">
                Showing first {displayLimit} results for performance. Use region filters to narrow your search.
              </p>
            </div>
          )}

          {displayedFish.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-slate-500 text-lg">No fish found in this region.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
