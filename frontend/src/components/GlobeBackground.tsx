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

export default function GlobeBackground() {
  const globeEl = useRef<HTMLDivElement>(null);
  const globeInstance = useRef<any>(null);
  const [fishData, setFishData] = useState<FishOccurrence[]>([]);

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

  // Initialize globe
  useEffect(() => {
    if (!globeEl.current) return;

    const globe = (Globe as any)()(globeEl.current)
      .globeImageUrl('//cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg')
      .bumpImageUrl('//cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png')
      .backgroundImageUrl('//cdn.jsdelivr.net/npm/three-globe/example/img/night-sky.png')
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

    // Enable auto-rotation and zoom
    globe.controls().autoRotate = true;
    globe.controls().autoRotateSpeed = 0.3;
    globe.controls().enableZoom = true;
    globe.controls().minDistance = 150; // Closest zoom
    globe.controls().maxDistance = 800; // Farthest zoom

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
        const newDistance = Math.max(150, distance - zoomSpeed);
        camera.position.multiplyScalar(newDistance / distance);
      } else if (e.key === '-' || e.key === '_') {
        // Zoom out
        const distance = camera.position.length();
        const newDistance = Math.min(800, distance + zoomSpeed);
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
      size: 0.4,
      color: getColorFromGenus(fish.genus || fish.family || ''),
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

        alert(`Fish Details:

Scientific Name: ${point.occurrence.scientificName}
Genus: ${point.occurrence.genus || 'Unknown'}
Family: ${point.occurrence.family || 'Unknown'}
Location: ${point.occurrence.waterBody || point.occurrence.locality || 'Unknown'}
Country: ${point.occurrence.country || 'Unknown'}
Year: ${point.occurrence.year || 'Unknown'}
Individual Count: ${point.occurrence.individualCount || 'Unknown'}
Coordinates: ${point.occurrence.decimalLatitude.toFixed(4)}, ${point.occurrence.decimalLongitude.toFixed(4)}`);
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
        color: getColorFromGenus(fish.genus || fish.family || '')
      }));

    globeInstance.current
      .ringsData(ringsData)
      .ringColor((d: RingData) => d.color)
      .ringMaxRadius('maxR')
      .ringPropagationSpeed('propagationSpeed')
      .ringRepeatPeriod('repeatPeriod');

  }, [fishData]);

  const getColorFromGenus = (genus: string) => {
    // Color mapping based on common fish genera/families
    const colors: Record<string, string> = {
      'Pleuromamma': '#4a90e2',
      'Euchaeta': '#50c878',
      'Disseta': '#ff6b6b',
      'Calanus': '#ffd700',
      'Megacalanus': '#ff8c42',
      'Eucalanus': '#9b59b6',
      'Undinula': '#1abc9c',
      'Metridinidae': '#4a90e2',
      'Euchaetidae': '#50c878',
      'Calanidae': '#ffd700',
      'Heterorhabdidae': '#ff6b6b',
    };

    // Check if genus matches any key
    for (const key in colors) {
      if (genus.includes(key)) {
        return colors[key];
      }
    }

    // Default ocean blue color
    return '#5ECDBF';
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
