import { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { analyzeGeographicZones } from '../utils/fishZoneAnalyzer';
import 'leaflet/dist/leaflet.css';

interface FishOccurrence {
  id: string;
  scientificName: string;
  decimalLatitude: number;
  decimalLongitude: number;
  country?: string;
  family?: string;
  genus?: string;
}

interface FishMapProps {
  viewMode?: 'points' | 'zones';
  selectedType?: string;
}

function MapUpdater({ fishData }: { fishData: FishOccurrence[] }) {
  const map = useMap();

  useEffect(() => {
    if (fishData.length > 0) {
      const lats = fishData.map(f => f.decimalLatitude);
      const lngs = fishData.map(f => f.decimalLongitude);
      const bounds: [[number, number], [number, number]] = [
        [Math.min(...lats), Math.min(...lngs)],
        [Math.max(...lats), Math.max(...lngs)],
      ];
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [fishData, map]);

  return null;
}

export default function FishMap({ viewMode = 'points', selectedType = 'All Fish' }: FishMapProps) {
  const [fishData, setFishData] = useState<FishOccurrence[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFishData() {
      try {
        const response = await fetch('/data/fish_occurrences.json');
        const data: FishOccurrence[] = await response.json();

        // Filter by selected type
        let filtered = data;
        if (selectedType !== 'All Fish') {
          if (selectedType === 'Tuna (Thunnus)') {
            filtered = data.filter(f => f.genus === 'Thunnus' || f.family === 'Scombridae');
          } else if (selectedType === 'Skipjack (Katsuwonus pelamis)') {
            filtered = data.filter(f => f.scientificName === 'Katsuwonus pelamis');
          } else if (selectedType === 'Yellowfin (Thunnus albacares)') {
            filtered = data.filter(f => f.scientificName === 'Thunnus albacares');
          } else if (selectedType === 'Albacore (Thunnus alalunga)') {
            filtered = data.filter(f => f.scientificName === 'Thunnus alalunga');
          } else if (selectedType === 'Japanese Eel (Anguilla japonica)') {
            filtered = data.filter(f => f.scientificName === 'Anguilla japonica');
          } else if (selectedType === 'Lanternfish (Myctophidae)') {
            filtered = data.filter(f => f.family === 'Myctophidae');
          }
        }

        setFishData(filtered);
      } catch (error) {
        console.error('Error loading fish data:', error);
      } finally {
        setLoading(false);
      }
    }

    void loadFishData();
  }, [selectedType]);

  const zones = useMemo(() => {
    if (viewMode === 'zones') {
      return analyzeGeographicZones(fishData, 2);
    }
    return [];
  }, [fishData, viewMode]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-background">
        <div className="text-xl text-text-secondary">Loading fish data...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={[10, 115]}
        zoom={4}
        className="w-full h-full"
        style={{ background: '#E8F4F8' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapUpdater fishData={fishData} />

        {viewMode === 'zones' ? (
          zones.map(zone => (
            <CircleMarker
              key={zone.id}
              center={[zone.centerLat, zone.centerLng]}
              radius={15}
              pathOptions={{
                fillColor: zone.color,
                fillOpacity: 0.4,
                color: zone.color,
                weight: 2,
              }}
            >
              <Popup>
                <div className="text-sm">
                  <strong>{zone.dominantSpecies}</strong>
                  <br />
                  {zone.totalCount} fish
                  <br />
                  {Object.keys(zone.speciesCount).length} species
                </div>
              </Popup>
            </CircleMarker>
          ))
        ) : (
          fishData.map(fish => (
            <CircleMarker
              key={fish.id}
              center={[fish.decimalLatitude, fish.decimalLongitude]}
              radius={3}
              pathOptions={{
                fillColor: '#5ECDBF',
                fillOpacity: 0.6,
                color: '#45B7A8',
                weight: 1,
              }}
            >
              <Popup>
                <div className="text-sm">
                  <strong>{fish.scientificName}</strong>
                  <br />
                  {fish.decimalLatitude.toFixed(4)}°, {fish.decimalLongitude.toFixed(4)}°
                </div>
              </Popup>
            </CircleMarker>
          ))
        )}
      </MapContainer>

      {/* Stats Footer */}
      <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-border p-4 flex justify-around">
        <div className="text-center">
          <div className="text-2xl font-bold text-text-primary">{fishData.length.toLocaleString()}</div>
          <div className="text-xs text-text-secondary">Fish Records</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-text-primary">
            {new Set(fishData.map(f => f.country)).size}
          </div>
          <div className="text-xs text-text-secondary">Countries</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-text-primary">{viewMode}</div>
          <div className="text-xs text-text-secondary">View Mode</div>
        </div>
      </div>
    </div>
  );
}
