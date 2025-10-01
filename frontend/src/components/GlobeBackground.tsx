import { useRef, useEffect, useState } from 'react';
import Globe from 'globe.gl';
import type { FishOccurrence } from '../types/fish';

interface PointData {
  lat: number;
  lng: number;
  size: number;
  color: string;
  name: string;
  genus: string;
  occurrence: FishOccurrence;
  id?: string;
  altitudeOffset: number; // Deterministic altitude to prevent z-fighting
  renderOrder: number; // Stable render order
}

interface RingData {
  lat: number;
  lng: number;
  maxR: number;
  propagationSpeed: number;
  repeatPeriod: number;
  color: string;
}

interface UserMarker {
  name: string;
  lat: number;
  lng: number;
}

interface SearchFilters {
  searchText: string;
  fishTypes: string[];
  locations: string[];
  priceRange: [number, number];
}

interface GlobeBackgroundProps {
  onFishClick: (fish: FishOccurrence) => void;
  userMarker: UserMarker | null;
  filters?: SearchFilters | null;
  onCountsUpdate?: (filtered: number, total: number) => void;
}

export default function GlobeBackground({ onFishClick, userMarker, filters, onCountsUpdate }: GlobeBackgroundProps) {
  const globeEl = useRef<HTMLDivElement>(null);
  const globeInstance = useRef<any>(null);
  const [fishData, setFishData] = useState<FishOccurrence[]>([]);
  const [countries, setCountries] = useState<any>([]);
  const hoveredPointRef = useRef<PointData | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load and parse CSV data
  useEffect(() => {
    const loadFishData = async () => {
      try {
        const response = await fetch('/all_fish.csv');
        const csvText = await response.text();
        const lines = csvText.split('\n');
        const headers = lines[0].split(',');

        // Sample data for performance (show ~2000 points instead of all)
        const sampledData: FishOccurrence[] = [];
        const sampleRate = Math.max(1, Math.floor(lines.length / 2000)); // Sample to ~2000 points

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
      } catch (error) {
        console.error('Error loading fish data:', error);
      }
    };

    loadFishData();
  }, []);

  // Load country data for labels
  useEffect(() => {
    fetch('//unpkg.com/world-atlas/countries-110m.json')
      .then(res => res.json())
      .then(data => {
        setCountries(data);
      })
      .catch(err => console.error('Error loading countries:', err));
  }, []);

  // Initialize globe
  useEffect(() => {
    if (!globeEl.current) return;

    const globe = (Globe as any)()(globeEl.current)
      .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
      .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
      .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
      .showAtmosphere(true)
      .atmosphereColor('#4a90e2')
      .atmosphereAltitude(0.25)
      .width(window.innerWidth)
      .height(window.innerHeight);

    // Set initial camera position for Asia-Pacific view
    globe.camera().position.z = 450;
    globe.camera().position.x = 100;
    globe.camera().position.y = 50;

    // Point the camera at Asia-Pacific region
    globe.pointOfView({ lat: 25, lng: 130, altitude: 2.5 }, 0);

    // Enable zoom controls
    globe.controls().autoRotate = false;
    globe.controls().enableZoom = true;
    globe.controls().minDistance = 0; // Closest zoom (no limit)
    globe.controls().maxDistance = 1000; // Farthest zoom

    globeInstance.current = globe;

    const handleResize = () => {
      if (globeEl.current && globeInstance.current) {
        globeInstance.current.width(window.innerWidth);
        globeInstance.current.height(window.innerHeight);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    // Keyboard controls for zoom
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!globeInstance.current) return;

      const camera = globe.camera();
      const zoomSpeed = 30;

      if (e.key === '=' || e.key === '+') {
        // Zoom in
        const distance = camera.position.length();
        const newDistance = Math.max(0, distance - zoomSpeed);
        camera.position.multiplyScalar(newDistance / distance);
      } else if (e.key === '-' || e.key === '_') {
        // Zoom out
        const distance = camera.position.length();
        const newDistance = Math.min(1000, distance + zoomSpeed);
        camera.position.multiplyScalar(newDistance / distance);
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyPress);
      if (globeInstance.current) {
        globeInstance.current._destructor();
      }
    };
  }, []);

  // Generate deterministic hash from string for stable rendering
  const generateHash = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  };

  // Generate deterministic altitude offset to prevent z-fighting
  const getAltitudeOffset = (fish: FishOccurrence): number => {
    // Use ID + scientific name for unique hash
    const uniqueKey = `${fish.id}_${fish.scientificName}_${fish.catalogNumber}`;
    const hash = generateHash(uniqueKey);
    // Generate small altitude offset (0.001 to 0.020)
    // This ensures overlapping points render at different altitudes
    return 0.001 + (hash % 20) * 0.001;
  };

  // Generate deterministic position offset to spread overlapping points
  const getPositionOffset = (fish: FishOccurrence): { latOffset: number; lngOffset: number } => {
    const uniqueKey = `${fish.id}_${fish.scientificName}`;
    const hash = generateHash(uniqueKey);

    // Generate tiny offsets (-0.05 to +0.05 degrees, roughly 5km)
    const latOffset = ((hash % 100) - 50) * 0.001;
    const lngOffset = (((hash >> 8) % 100) - 50) * 0.001;

    return { latOffset, lngOffset };
  };

  // Get stable render order for consistent z-fighting resolution
  const getRenderOrder = (fish: FishOccurrence): number => {
    const uniqueKey = `${fish.id}_${fish.scientificName}`;
    return generateHash(uniqueKey);
  };

  // Helper function to get common name
  const getCommonName = (scientificName: string, genus?: string, family?: string): string => {
    const commonNames: Record<string, string> = {
      'Thunnus albacares': 'Yellowfin Tuna', 'Thunnus': 'Tuna', 'Katsuwonus': 'Skipjack Tuna',
      'Euthynnus': 'Little Tunny', 'Gymnosarda unicolor': 'Dogtooth Tuna', 'Scombridae': 'Tuna/Mackerel',
      'Acanthurus': 'Surgeonfish', 'Abudefduf': 'Sergeant Major', 'Amphiprion': 'Clownfish',
      'Chromis': 'Chromis', 'Dascyllus': 'Dascyllus', 'Cephalopholis': 'Grouper',
      'Epinephelus': 'Grouper', 'Chaetodon': 'Butterflyfish', 'Centropyge': 'Dwarf Angelfish',
      'Caesio': 'Fusilier', 'Caranx': 'Jack', 'Arothron': 'Pufferfish', 'Canthigaster': 'Sharpnose Puffer',
      'Amblygobius': 'Sand Goby', 'Amblyeleotris': 'Shrimp Goby', 'Salarias': 'Algae Blenny',
      'Ecsenius': 'Blenny', 'Acropora': 'Staghorn Coral', 'Porites': 'Finger Coral',
      'Fungia': 'Mushroom Coral', 'Copepoda': 'Copepod', 'Calanus': 'Copepod',
      'Acartia': 'Copepod', 'Holothuria': 'Sea Cucumber', 'Acanthaster planci': 'Crown-of-Thorns Starfish',
    };
    if (commonNames[scientificName]) return commonNames[scientificName];
    if (genus && commonNames[genus]) return commonNames[genus];
    if (family && commonNames[family]) return commonNames[family];
    return scientificName.split(' ')[0];
  };

  // Helper function to match fish against category filters
  const matchesFishType = (fish: FishOccurrence, fishTypes: string[]): boolean => {
    if (fishTypes.length === 0 || fishTypes.includes('All Fish')) return true;

    const categoryMap: Record<string, string[]> = {
      'Tuna & Mackerel': ['Scombridae', 'Thunnus', 'Katsuwonus', 'Euthynnus', 'Gymnosarda'],
      'Surgeonfish': ['Acanthuridae', 'Acanthurus'],
      'Damselfish': ['Pomacentridae', 'Abudefduf', 'Chromis', 'Dascyllus'],
      'Clownfish': ['Amphiprion'],
      'Groupers': ['Serranidae', 'Epinephelus', 'Cephalopholis'],
      'Wrasses': ['Labridae', 'Anampses', 'Cheilinus'],
      'Angelfish': ['Pomacanthidae', 'Centropyge'],
      'Gobies': ['Gobiidae', 'Amblygobius'],
      'Pufferfish': ['Tetraodontidae', 'Arothron', 'Canthigaster'],
      'Triggerfish': ['Balistidae', 'Balistoides'],
      'Sharks & Rays': ['Carcharhinidae', 'Carcharhinus', 'Dasyatidae'],
      'Corals': ['Scleractinia', 'Acropora', 'Fungia', 'Porites'],
      'Copepods': ['Copepoda', 'Calanus', 'Acartia'],
      'Invertebrates': ['Echinoidea', 'Holothuroidea', 'Asteroidea'],
    };

    return fishTypes.some(type => {
      const families = categoryMap[type] || [];
      return families.some(f =>
        fish.family?.includes(f) ||
        fish.genus?.includes(f) ||
        fish.scientificName?.includes(f)
      );
    });
  };

  // Generate consistent price for a fish based on its scientific name
  const getFishPrice = (scientificName: string): number => {
    // Use hash of scientific name to generate consistent price
    let hash = 0;
    for (let i = 0; i < scientificName.length; i++) {
      hash = ((hash << 5) - hash) + scientificName.charCodeAt(i);
      hash = hash & hash;
    }
    const basePrice = 20 + Math.abs(hash % 50); // $20-70
    return parseFloat(basePrice.toFixed(2));
  };

  // Filter fish data based on search filters (all fish in CSV are already edible)
  const getFilteredFishData = (): FishOccurrence[] => {
    if (!filters) return fishData;

    return fishData.filter(fish => {
      // Text search filter
      if (filters.searchText) {
        const searchLower = filters.searchText.toLowerCase();
        const commonName = getCommonName(fish.scientificName, fish.genus, fish.family).toLowerCase();
        const scientificName = fish.scientificName?.toLowerCase() || '';
        const genus = fish.genus?.toLowerCase() || '';

        if (!scientificName.includes(searchLower) &&
            !commonName.includes(searchLower) &&
            !genus.includes(searchLower)) {
          return false;
        }
      }

      // Fish type filter
      if (!matchesFishType(fish, filters.fishTypes)) {
        return false;
      }

      // Location filter
      if (filters.locations.length > 0 && !filters.locations.includes('All Regions')) {
        const location = fish.waterBody || fish.locality || '';
        const hasMatch = filters.locations.some(loc =>
          location.toLowerCase().includes(loc.toLowerCase())
        );
        if (!hasMatch) return false;
      }

      // Price range filter
      const price = getFishPrice(fish.scientificName);
      if (price < filters.priceRange[0] || price > filters.priceRange[1]) {
        return false;
      }

      return true;
    });
  };

  // Update points when fish data is loaded or filters change
  useEffect(() => {
    if (!globeInstance.current || fishData.length === 0) return;

    const filteredFish = getFilteredFishData();

    // Update counts for search panel
    if (onCountsUpdate) {
      onCountsUpdate(filteredFish.length, fishData.length);
    }

    // Create individual points with deterministic offsets to prevent z-fighting
    const pointsData: PointData[] = filteredFish.map(fish => {
      const posOffset = getPositionOffset(fish);
      const altitudeOffset = getAltitudeOffset(fish);
      const renderOrder = getRenderOrder(fish);

      return {
        lat: fish.decimalLatitude + posOffset.latOffset,
        lng: fish.decimalLongitude + posOffset.lngOffset,
        size: 0.15,
        color: getColorFromFishType(fish.scientificName, fish.genus, fish.family),
        name: fish.scientificName,
        genus: fish.genus || fish.family || 'Unknown',
        occurrence: fish,
        id: fish.id,
        altitudeOffset,
        renderOrder,
      };
    });

    // Sort by render order to ensure stable, consistent rendering
    // Points with lower render order will be drawn first (appear behind)
    pointsData.sort((a, b) => a.renderOrder - b.renderOrder);

    globeInstance.current
      .pointsData(pointsData)
      .pointAltitude((d: PointData) => {
        // Use deterministic altitude offset to prevent z-fighting
        // Boost altitude on hover for visual feedback
        const baseAltitude = d.altitudeOffset;
        return hoveredPointRef.current?.id === d.id ? baseAltitude + 0.1 : baseAltitude;
      })
      .pointRadius((d: PointData) => {
        // Increase size on hover
        return hoveredPointRef.current?.id === d.id ? d.size * 2 : d.size;
      })
      .pointColor((d: PointData) => {
        // Highlight on hover
        return hoveredPointRef.current?.id === d.id ? '#ffffff' : d.color;
      })
      .pointLabel((d: PointData) => {
        // Tooltip for individual fish
        return `
          <div style="background: rgba(0,0,0,0.95); padding: 12px 16px; border-radius: 8px; color: white; text-align: center; border: 2px solid ${d.color}; box-shadow: 0 4px 12px rgba(0,0,0,0.5); max-width: 300px;">
            <div style="font-weight: bold; margin-bottom: 6px; font-size: 1.15em; line-height: 1.3;">${d.occurrence.scientificName}</div>
            <div style="font-size: 0.9em; color: #ccc; margin-bottom: 2px;">Genus: ${d.genus}</div>
            <div style="font-size: 0.9em; color: #ccc; margin-bottom: 8px;">${d.occurrence.waterBody || 'Western Pacific'}</div>
            <div style="font-size: 0.8em; color: ${d.color}; font-weight: bold; padding: 4px 8px; background: rgba(255,255,255,0.1); border-radius: 4px;">🖱️ CLICK FOR DETAILS</div>
          </div>
        `;
      })
      .onPointHover((point: PointData | null) => {
        // Clear any existing timeout
        if (hoverTimeoutRef.current) {
          clearTimeout(hoverTimeoutRef.current);
        }

        // Add slight delay to stabilize hover
        hoverTimeoutRef.current = setTimeout(() => {
          const previousHovered = hoveredPointRef.current;
          hoveredPointRef.current = point;

          // Only update if hover state actually changed
          if (previousHovered?.id !== point?.id) {
            globeInstance.current
              .pointAltitude(globeInstance.current.pointAltitude())
              .pointRadius(globeInstance.current.pointRadius())
              .pointColor(globeInstance.current.pointColor());
          }
        }, 50); // 50ms delay for stability
      })
      .onPointClick((point: PointData) => {
        console.log('Fish occurrence clicked:', point.occurrence);

        // Show the fish details in sidebar
        onFishClick(point.occurrence);

        // Visual feedback - brief highlight
        const originalColor = point.color;
        point.color = '#ffffff';
        globeInstance.current.pointColor(globeInstance.current.pointColor());

        setTimeout(() => {
          point.color = originalColor;
          globeInstance.current.pointColor(globeInstance.current.pointColor());
        }, 150);
      })
      .pointsMerge(false) // Disable merging to maintain individual points
      .pointsTransitionDuration(0); // Disable transitions for stable rendering

    // Add subtle rings for visual effect (only for a subset)
    // Use deterministic selection based on fish ID to ensure consistent ring placement
    const ringsData = filteredFish
      .filter(fish => {
        const hash = generateHash(fish.id);
        return hash % 100 === 0; // Deterministic selection
      })
      .slice(0, 50) // Limit to 50 rings for performance
      .map((fish) => {
        const posOffset = getPositionOffset(fish);
        return {
          lat: fish.decimalLatitude + posOffset.latOffset,
          lng: fish.decimalLongitude + posOffset.lngOffset,
          maxR: 2,
          propagationSpeed: 1,
          repeatPeriod: 3000,
          color: getColorFromFishType(fish.scientificName, fish.genus, fish.family)
        };
      });

    globeInstance.current
      .ringsData(ringsData)
      .ringColor((d: RingData) => d.color)
      .ringMaxRadius('maxR')
      .ringPropagationSpeed('propagationSpeed')
      .ringRepeatPeriod('repeatPeriod');

    return () => {
      // Cleanup hover timeout
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, [fishData, filters, onFishClick, onCountsUpdate]);

  // Add user marker when available
  useEffect(() => {
    if (!globeInstance.current || !userMarker) return;

    const userMarkerData = [{
      lat: userMarker.lat,
      lng: userMarker.lng,
      label: userMarker.name,
      size: 2,
      color: '#FFD700'
    }];

    globeInstance.current
      .htmlElementsData(userMarkerData)
      .htmlElement((d: any) => {
        const el = document.createElement('div');
        el.innerHTML = `
          <div style="
            position: relative;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="
              width: 20px;
              height: 20px;
              background: linear-gradient(135deg, #FFD700, #FFA500);
              border: 3px solid white;
              border-radius: 50%;
              box-shadow: 0 4px 12px rgba(255, 215, 0, 0.6);
              animation: pulse 2s infinite;
            "></div>
            <div style="
              position: absolute;
              top: -30px;
              white-space: nowrap;
              background: rgba(0, 0, 0, 0.8);
              color: white;
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 12px;
              font-weight: bold;
              pointer-events: none;
            ">${d.label}</div>
          </div>
        `;

        // Add pulse animation
        const style = document.createElement('style');
        style.innerHTML = `
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.2); opacity: 0.8; }
          }
        `;
        el.appendChild(style);

        return el;
      })
      .htmlAltitude(0.05);

    // Fly to user location with closer zoom
    globeInstance.current.pointOfView(
      { lat: userMarker.lat, lng: userMarker.lng, altitude: 0.5 },
      2000
    );

  }, [userMarker]);

  // Add country polygons and labels when data is loaded
  useEffect(() => {
    if (!globeInstance.current || !countries.features) return;

    globeInstance.current
      .polygonsData(countries.features)
      .polygonAltitude(0.001)
      .polygonCapColor(() => 'rgba(0, 0, 0, 0)')
      .polygonSideColor(() => 'rgba(255, 255, 255, 0.05)')
      .polygonStrokeColor(() => 'rgba(255, 255, 255, 0.3)')
      .polygonLabel(({ properties }: any) => `
        <div style="background: rgba(0,0,0,0.8); padding: 6px 10px; border-radius: 4px; color: white; font-weight: bold;">
          ${properties.name}
        </div>
      `);

    // Add country labels that are always visible
    globeInstance.current
      .labelsData(countries.features)
      .labelLat((d: any) => {
        // Calculate centroid latitude (simplified)
        return 0;
      })
      .labelLng((d: any) => 0)
      .labelText((d: any) => d.properties.name)
      .labelSize(0.5)
      .labelColor(() => 'rgba(255, 255, 255, 0.7)')
      .labelResolution(2)
      .labelAltitude(0.01);
  }, [countries]);

  const getColorFromFishType = (scientificName: string, genus?: string, family?: string) => {
    // Color mapping based on scientific names and taxonomy
    const colors: Record<string, string> = {
      // Tuna species - Dark blue/grey shades
      'Thunnus albacares': '#2c3e50',
      'Thunnus': '#34495e',
      'Katsuwonus': '#1a252f',
      'Euthynnus': '#2c3e50',
      'Gymnosarda unicolor': '#34495e',
      'Scombridae': '#2c3e50',

      // Pleuromamma species - Blue shades
      'Pleuromamma xiphias': '#4a90e2',
      'Pleuromamma': '#5B9BD5',

      // Euchaeta species - Green shades
      'Euchaeta wolfendeni': '#50c878',
      'Euchaeta spinosa': '#2ecc71',
      'Euchaeta': '#27AE60',

      // Disseta species - Red/Pink
      'Disseta scopularis': '#ff6b6b',
      'Disseta': '#E74C3C',

      // Calanus species - Yellow/Gold
      'Calanus': '#ffd700',

      // Megacalanus species - Orange
      'Megacalanus': '#ff8c42',

      // Eucalanus species - Purple
      'Eucalanus': '#9b59b6',

      // Undinula species - Teal
      'Undinula': '#1abc9c',

      // Other copepod genera
      'Metridia': '#3498db',
      'Candacia': '#e74c3c',
      'Heterorhabdus': '#f39c12',
      'Lucicutia': '#16a085',
      'Scolecithrix': '#8e44ad',
      'Rhincalanus': '#e67e22',
      'Gaetanus': '#c0392b',
      'Pareuchaeta': '#95a5a6',
    };

    // Try exact scientific name match first
    if (colors[scientificName]) {
      return colors[scientificName];
    }

    // Try genus match
    if (genus && colors[genus]) {
      return colors[genus];
    }

    // Try partial match in scientific name
    for (const key in colors) {
      if (scientificName.includes(key)) {
        return colors[key];
      }
    }

    // Family-based colors as fallback
    const familyColors: Record<string, string> = {
      'Metridinidae': '#4a90e2',
      'Euchaetidae': '#50c878',
      'Calanidae': '#ffd700',
      'Heterorhabdidae': '#ff6b6b',
      'Eucalanidae': '#9b59b6',
      'Lucicutiidae': '#16a085',
      'Scolecitrichidae': '#8e44ad',
      'Megacalanidae': '#ff8c42',
    };

    if (family && familyColors[family]) {
      return familyColors[family];
    }

    // Generate a consistent color based on the first letter of the name
    // This ensures different species get different colors
    const firstLetter = scientificName.charCodeAt(0);
    const hue = (firstLetter * 137.5) % 360; // Golden angle for good distribution
    return `hsl(${hue}, 70%, 60%)`;
  };

  return (
    <div
      ref={globeEl}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 10,
        background: 'radial-gradient(circle at center, #0a1628 0%, #000814 100%)',
        pointerEvents: 'auto',
      }}
    />
  );
}
