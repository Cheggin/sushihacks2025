import React, { useMemo, useState } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import MapView, { Marker, Heatmap, Circle, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { analyzeGeographicZones, FishZone } from '../utils/fishZoneAnalyzer';

const { width } = Dimensions.get('window');

interface FishOccurrence {
  id: string;
  scientificName: string;
  decimalLatitude: number;
  decimalLongitude: number;
  country?: string;
  family?: string;
  genus?: string;
}

interface FishMapViewProps {
  fishData: FishOccurrence[];
  viewMode: 'heatmap' | 'markers' | 'zones';
  region: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
}

const FishMapView: React.FC<FishMapViewProps> = ({ fishData, viewMode, region }) => {
  const [currentRegion, setCurrentRegion] = useState<Region>(region);
  // Filter fish data to only show points in current viewport
  const visibleFishData = useMemo(() => {
    const buffer = 0.5; // Add 0.5 degree buffer to include points just outside view
    const minLat = currentRegion.latitude - currentRegion.latitudeDelta / 2 - buffer;
    const maxLat = currentRegion.latitude + currentRegion.latitudeDelta / 2 + buffer;
    const minLng = currentRegion.longitude - currentRegion.longitudeDelta / 2 - buffer;
    const maxLng = currentRegion.longitude + currentRegion.longitudeDelta / 2 + buffer;

    return fishData.filter(fish =>
      fish.decimalLatitude >= minLat &&
      fish.decimalLatitude <= maxLat &&
      fish.decimalLongitude >= minLng &&
      fish.decimalLongitude <= maxLng
    );
  }, [fishData, currentRegion]);

  const heatmapPoints = visibleFishData.map(fish => ({
    latitude: fish.decimalLatitude,
    longitude: fish.decimalLongitude,
    weight: 1,
  }));

  // Analyze zones based on current data with smaller grid size for more granularity
  const zones = useMemo(() => {
    return analyzeGeographicZones(visibleFishData, 2); // Changed from 5 to 2 degrees for finer detail
  }, [visibleFishData]);

  const renderZones = () => {
    return zones.map((zone: FishZone) => {
      return (
        <Circle
          key={zone.id}
          center={{
            latitude: zone.centerLat,
            longitude: zone.centerLng,
          }}
          radius={zone.radius * 0.9} // Slightly smaller to avoid too much overlap
          fillColor={`${zone.color}60`} // Add transparency (60 = ~37% opacity)
          strokeColor={zone.color}
          strokeWidth={1}
        />
      );
    });
  };

  return (
    <MapView
      style={styles.map}
      initialRegion={region}
      provider={PROVIDER_GOOGLE}
      onRegionChangeComplete={(newRegion) => setCurrentRegion(newRegion)}
    >
      {viewMode === 'zones' ? (
        <>
          {renderZones()}
          {/* Add markers for zone centers */}
          {zones.map((zone: FishZone) => (
            <Marker
              key={`marker-${zone.id}`}
              coordinate={{
                latitude: zone.centerLat,
                longitude: zone.centerLng,
              }}
              title={zone.dominantSpecies}
              description={`${zone.totalCount} fish, ${Object.keys(zone.speciesCount).length} species`}
            />
          ))}
        </>
      ) : viewMode === 'heatmap' ? (
        <Heatmap
          points={heatmapPoints}
          opacity={0.7}
          radius={50}
          gradient={{
            colors: ['#00FF00', '#FFFF00', '#FF0000'],
            startPoints: [0.2, 0.5, 1.0],
            colorMapSize: 256,
          }}
        />
      ) : (
        // Render ALL visible fish points as individual markers
        visibleFishData.map(fish => (
          <Marker
            key={fish.id}
            coordinate={{
              latitude: fish.decimalLatitude,
              longitude: fish.decimalLongitude,
            }}
            title={fish.scientificName}
            description={fish.country || 'Unknown location'}
          />
        ))
      )}
    </MapView>
  );
};

const styles = StyleSheet.create({
  map: {
    flex: 1,
    width: width,
  },
});

export default FishMapView;