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
  hovered?: boolean;
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

interface GlobeBackgroundProps {
  onFishClick: (fish: FishOccurrence) => void;
  userMarker: UserMarker | null;
}

export default function GlobeBackground({ onFishClick, userMarker }: GlobeBackgroundProps) {
  const globeEl = useRef<HTMLDivElement>(null);
  const globeInstance = useRef<any>(null);
  const [fishData, setFishData] = useState<FishOccurrence[]>([]);
  const [countries, setCountries] = useState<any>([]);

  // Load and parse CSV data
  useEffect(() => {
    const loadFishData = async () => {
      try {
        const response = await fetch('/occurrence_parsed.csv');
        const csvText = await response.text();
        const lines = csvText.split('\n');
        const headers = lines[0].split(',');

        // Sample the data to avoid too many points (take every 50th point)
        const sampledData: FishOccurrence[] = [];
        for (let i = 1; i < lines.length; i += 50) {
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

  // Update points when fish data is loaded
  useEffect(() => {
    if (!globeInstance.current || fishData.length === 0) return;

    const pointsData = fishData.map((fish) => ({
      lat: fish.decimalLatitude,
      lng: fish.decimalLongitude,
      size: 0.15,
      color: getColorFromFishType(fish.scientificName, fish.genus, fish.family),
      name: fish.scientificName || 'Unknown',
      genus: fish.genus || fish.family || 'Unknown',
      occurrence: fish
    }));

    globeInstance.current
      .pointsData(pointsData)
      .pointAltitude((d: PointData) => d.hovered ? 0.08 : 0.01)
      .pointRadius((d: PointData) => d.hovered ? d.size * 2.5 : d.size)
      .pointColor((d: PointData) => d.hovered ? '#ffffff' : d.color)
      .pointLabel((d: PointData) => `
        <div style="background: rgba(0,0,0,0.9); padding: 10px; border-radius: 6px; color: white; text-align: center; border: 2px solid ${d.color};">
          <div style="font-weight: bold; margin-bottom: 4px; font-size: 1.1em;">${d.name}</div>
          <div style="font-size: 0.85em; color: #aaa;">Genus: ${d.genus}</div>
          <div style="font-size: 0.85em; color: #aaa;">${d.occurrence.waterBody || 'Western Pacific'}</div>
          <div style="font-size: 0.75em; color: ${d.color}; margin-top: 6px; font-weight: bold;">🖱️ CLICK FOR DETAILS</div>
        </div>
      `)
      .onPointHover((point: PointData | null) => {
        // Update hovered state
        pointsData.forEach(p => p.hovered = false);
        if (point) {
          point.hovered = true;
        }
        // Re-render points
        globeInstance.current.pointsData([...pointsData]);
      })
      .onPointClick((point: PointData) => {
        console.log('Fish occurrence clicked:', point.occurrence);

        // Create a visual pulse effect
        const originalSize = point.size;
        point.size = originalSize * 3;
        globeInstance.current.pointsData([...pointsData]);

        setTimeout(() => {
          point.size = originalSize;
          globeInstance.current.pointsData([...pointsData]);
        }, 200);

        // Open sidebar with fish details
        onFishClick(point.occurrence);
      })
      .pointsMerge(false);

    // Add subtle rings for visual effect (only for a subset)
    const ringsData = fishData
      .filter((_, i) => i % 100 === 0) // Only add rings to every 100th point
      .map((fish) => ({
        lat: fish.decimalLatitude,
        lng: fish.decimalLongitude,
        maxR: 2,
        propagationSpeed: 1,
        repeatPeriod: 3000,
        color: getColorFromFishType(fish.scientificName, fish.genus, fish.family)
      }));

    globeInstance.current
      .ringsData(ringsData)
      .ringColor((d: RingData) => d.color)
      .ringMaxRadius('maxR')
      .ringPropagationSpeed('propagationSpeed')
      .ringRepeatPeriod('repeatPeriod');

  }, [fishData, onFishClick]);

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
