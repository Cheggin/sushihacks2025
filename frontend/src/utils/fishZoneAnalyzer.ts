interface FishOccurrence {
  id: string;
  scientificName: string;
  decimalLatitude: number;
  decimalLongitude: number;
  country?: string;
  family?: string;
  genus?: string;
}

export interface FishZone {
  id: string;
  centerLat: number;
  centerLng: number;
  radius: number;
  dominantSpecies: string;
  speciesCount: { [species: string]: number };
  totalCount: number;
  color: string;
  bounds: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  };
}

const ZONE_COLORS = [
  '#FF6B6B', // Red - Tuna
  '#4ECDC4', // Teal - Lanternfish
  '#45B7D1', // Blue - Eels
  '#FFA07A', // Salmon - Mixed coastal
  '#98D8C8', // Mint - Deep sea
  '#FFD93D', // Yellow - Reef fish
  '#6C5CE7', // Purple - Rare species
  '#A8E6CF', // Light green - Common species
];

const SPECIES_COLOR_MAP: { [key: string]: string } = {
  'Thunnus': '#FF6B6B', // Tuna - Red
  'Katsuwonus pelamis': '#FF6B6B', // Skipjack - Red
  'Anguilla japonica': '#45B7D1', // Japanese Eel - Blue
  'Myctophidae': '#4ECDC4', // Lanternfish - Teal
  'Scombridae': '#FF6B6B', // Tuna family - Red
  'Congridae': '#45B7D1', // Conger eels - Blue
  'Pomacentridae': '#FFD93D', // Damselfish - Yellow
  'Labridae': '#FFD93D', // Wrasses - Yellow
};

export function analyzeGeographicZones(
  fishData: FishOccurrence[],
  gridSize: number = 5 // degrees lat/lng per zone
): FishZone[] {
  if (fishData.length === 0) return [];

  // Find bounds
  const lats = fishData.map(f => f.decimalLatitude);
  const lngs = fishData.map(f => f.decimalLongitude);
  const minLat = Math.floor(Math.min(...lats) / gridSize) * gridSize;
  const maxLat = Math.ceil(Math.max(...lats) / gridSize) * gridSize;
  const minLng = Math.floor(Math.min(...lngs) / gridSize) * gridSize;
  const maxLng = Math.ceil(Math.max(...lngs) / gridSize) * gridSize;

  // Create grid zones
  const zoneMap = new Map<string, FishOccurrence[]>();

  fishData.forEach(fish => {
    const zoneLat = Math.floor(fish.decimalLatitude / gridSize) * gridSize;
    const zoneLng = Math.floor(fish.decimalLongitude / gridSize) * gridSize;
    const zoneKey = `${zoneLat},${zoneLng}`;

    if (!zoneMap.has(zoneKey)) {
      zoneMap.set(zoneKey, []);
    }
    zoneMap.get(zoneKey)!.push(fish);
  });

  // Analyze each zone
  const zones: FishZone[] = [];
  let zoneIndex = 0;

  zoneMap.forEach((fishes, zoneKey) => {
    const [zoneLat, zoneLng] = zoneKey.split(',').map(Number);

    // Count species in this zone
    const speciesCount: { [species: string]: number } = {};
    fishes.forEach(fish => {
      const species = fish.scientificName || 'Unknown';
      speciesCount[species] = (speciesCount[species] || 0) + 1;
    });

    // Find dominant species
    const sortedSpecies = Object.entries(speciesCount).sort((a, b) => b[1] - a[1]);
    const dominantSpecies = sortedSpecies[0][0];

    // Assign color based on dominant species
    let color = ZONE_COLORS[zoneIndex % ZONE_COLORS.length];

    // Check if dominant species or family has a specific color
    for (const [key, speciesColor] of Object.entries(SPECIES_COLOR_MAP)) {
      if (dominantSpecies.includes(key) ||
          fishes[0]?.family === key ||
          fishes[0]?.genus === key) {
        color = speciesColor;
        break;
      }
    }

    zones.push({
      id: `zone-${zoneIndex++}`,
      centerLat: zoneLat + gridSize / 2,
      centerLng: zoneLng + gridSize / 2,
      radius: gridSize * 111000 / 2, // Convert degrees to meters (approx)
      dominantSpecies,
      speciesCount,
      totalCount: fishes.length,
      color,
      bounds: {
        minLat: zoneLat,
        maxLat: zoneLat + gridSize,
        minLng: zoneLng,
        maxLng: zoneLng + gridSize,
      },
    });
  });

  return zones;
}

export function getZoneStatistics(zones: FishZone[]) {
  const totalFish = zones.reduce((sum, zone) => sum + zone.totalCount, 0);
  const uniqueSpecies = new Set<string>();
  const speciesByZone: { [species: string]: number } = {};

  zones.forEach(zone => {
    uniqueSpecies.add(zone.dominantSpecies);
    speciesByZone[zone.dominantSpecies] = (speciesByZone[zone.dominantSpecies] || 0) + 1;
  });

  return {
    totalZones: zones.length,
    totalFish,
    uniqueDominantSpecies: uniqueSpecies.size,
    speciesByZone: Object.entries(speciesByZone)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5),
  };
}

export function getColorForSpecies(speciesName: string, family?: string, genus?: string): string {
  // Check direct species match
  for (const [key, color] of Object.entries(SPECIES_COLOR_MAP)) {
    if (speciesName.includes(key)) return color;
  }

  // Check family match
  if (family && SPECIES_COLOR_MAP[family]) {
    return SPECIES_COLOR_MAP[family];
  }

  // Check genus match
  if (genus && SPECIES_COLOR_MAP[genus]) {
    return SPECIES_COLOR_MAP[genus];
  }

  // Default color
  return '#A8E6CF';
}