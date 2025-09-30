import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import FishMapView from '../components/FishMapView';
import { analyzeGeographicZones, getZoneStatistics } from '../utils/fishZoneAnalyzer';

const { width } = Dimensions.get('window');

interface FishOccurrence {
  id: string;
  scientificName: string;
  decimalLatitude: number;
  decimalLongitude: number;
  country?: string;
  eventDate?: string;
  family?: string;
  order?: string;
  minimumDepthInMeters?: number;
}

const FISH_TYPES = [
  'All Fish',
  'Tuna (Thunnus)',
  'Skipjack (Katsuwonus pelamis)',
  'Yellowfin (Thunnus albacares)',
  'Albacore (Thunnus alalunga)',
  'Japanese Eel (Anguilla japonica)',
  'Lanternfish (Myctophidae)',
];

export default function FishMap() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [fishData, setFishData] = useState<FishOccurrence[]>([]);
  const [selectedType, setSelectedType] = useState('All Fish');
  const [viewMode, setViewMode] = useState<'heatmap' | 'markers' | 'zones'>('zones');

  useEffect(() => {
    fetchFishData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedType]);

  const fetchFishData = async () => {
    setLoading(true);
    try {
      // Load fish data from local JSON file
      const fishData = require('../assets/data/fish_occurrences.json');

      // Filter by selected type
      let filtered = fishData;

      if (selectedType !== 'All Fish') {
        if (selectedType === 'Tuna (Thunnus)') {
          filtered = fishData.filter((f: any) =>
            f.genus === 'Thunnus' || f.family === 'Scombridae'
          );
        } else if (selectedType === 'Skipjack (Katsuwonus pelamis)') {
          filtered = fishData.filter((f: any) => f.scientificName === 'Katsuwonus pelamis');
        } else if (selectedType === 'Yellowfin (Thunnus albacares)') {
          filtered = fishData.filter((f: any) => f.scientificName === 'Thunnus albacares');
        } else if (selectedType === 'Albacore (Thunnus alalunga)') {
          filtered = fishData.filter((f: any) => f.scientificName === 'Thunnus alalunga');
        } else if (selectedType === 'Japanese Eel (Anguilla japonica)') {
          filtered = fishData.filter((f: any) => f.scientificName === 'Anguilla japonica');
        } else if (selectedType === 'Lanternfish (Myctophidae)') {
          filtered = fishData.filter((f: any) => f.family === 'Myctophidae');
        }
      }

      setFishData(filtered);
    } catch (error) {
      console.error('Error loading fish data:', error);
      // Fallback to mock data
      setFishData(generateMockData());
    } finally {
      setLoading(false);
    }
  };

  const generateMockData = (): FishOccurrence[] => {
    // Mock data for Asia-Pacific region based on actual dataset
    const mockLocations = [
      { lat: -6.2, lng: 106.8, country: 'Indonesia' }, // Jakarta area
      { lat: 1.3, lng: 103.8, country: 'Singapore' },
      { lat: 13.7, lng: 100.5, country: 'Thailand' }, // Bangkok area
      { lat: 14.6, lng: 121.0, country: 'Philippines' }, // Manila area
      { lat: 35.7, lng: 139.7, country: 'Japan' }, // Tokyo area
      { lat: 3.1, lng: 101.7, country: 'Malaysia' }, // Kuala Lumpur area
      { lat: 10.8, lng: 106.7, country: 'Vietnam' }, // Ho Chi Minh area
      { lat: 25.0, lng: 121.5, country: 'Taiwan' },
    ];

    const data: FishOccurrence[] = [];
    mockLocations.forEach((loc, idx) => {
      // Generate multiple points around each location
      for (let i = 0; i < 50; i++) {
        data.push({
          id: `mock-${idx}-${i}`,
          scientificName: selectedType === 'All Fish' ? 'Various species' : selectedType,
          decimalLatitude: loc.lat + (Math.random() - 0.5) * 10,
          decimalLongitude: loc.lng + (Math.random() - 0.5) * 10,
          country: loc.country,
          eventDate: '2020-01-01',
          family: 'Scombridae',
        });
      }
    });
    return data;
  };

  const getRegion = () => {
    if (fishData.length === 0) {
      // Default to Asia-Pacific region
      return {
        latitude: 10.0,
        longitude: 115.0,
        latitudeDelta: 50,
        longitudeDelta: 50,
      };
    }

    const lats = fishData.map(f => f.decimalLatitude);
    const lngs = fishData.map(f => f.decimalLongitude);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: (maxLat - minLat) * 1.5 || 10,
      longitudeDelta: (maxLng - minLng) * 1.5 || 10,
    };
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Fish Distribution Map</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Fish Type Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {FISH_TYPES.map(type => (
          <TouchableOpacity
            key={type}
            style={[
              styles.filterButton,
              selectedType === type && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedType(type)}
          >
            <Text
              style={[
                styles.filterButtonText,
                selectedType === type && styles.filterButtonTextActive,
              ]}
            >
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* View Mode Toggle */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            viewMode === 'zones' && styles.toggleButtonActive,
          ]}
          onPress={() => setViewMode('zones')}
        >
          <Text
            style={[
              styles.toggleText,
              viewMode === 'zones' && styles.toggleTextActive,
            ]}
          >
            Zones
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            viewMode === 'heatmap' && styles.toggleButtonActive,
          ]}
          onPress={() => setViewMode('heatmap')}
        >
          <Text
            style={[
              styles.toggleText,
              viewMode === 'heatmap' && styles.toggleTextActive,
            ]}
          >
            Heatmap
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            viewMode === 'markers' && styles.toggleButtonActive,
          ]}
          onPress={() => setViewMode('markers')}
        >
          <Text
            style={[
              styles.toggleText,
              viewMode === 'markers' && styles.toggleTextActive,
            ]}
          >
            Markers
          </Text>
        </TouchableOpacity>
      </View>

      {/* Map */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading fish data...</Text>
        </View>
      ) : (
        <FishMapView
          fishData={fishData}
          viewMode={viewMode}
          region={getRegion()}
        />
      )}

      {/* Stats Footer */}
      <View style={styles.footer}>
        {viewMode === 'zones' ? (
          <>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>
                {analyzeGeographicZones(fishData, 2).length}
              </Text>
              <Text style={styles.statLabel}>Zones</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{fishData.length.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Fish</Text>
            </View>
            <View style={styles.legendBox}>
              <Text style={styles.legendTitle}>Zone Colors:</Text>
              <View style={styles.legendRow}>
                <View style={[styles.colorDot, { backgroundColor: '#FF6B6B' }]} />
                <Text style={styles.legendText}>Tuna</Text>
              </View>
              <View style={styles.legendRow}>
                <View style={[styles.colorDot, { backgroundColor: '#45B7D1' }]} />
                <Text style={styles.legendText}>Eels</Text>
              </View>
              <View style={styles.legendRow}>
                <View style={[styles.colorDot, { backgroundColor: '#4ECDC4' }]} />
                <Text style={styles.legendText}>Lanternfish</Text>
              </View>
              <View style={styles.legendRow}>
                <View style={[styles.colorDot, { backgroundColor: '#FFD93D' }]} />
                <Text style={styles.legendText}>Reef Fish</Text>
              </View>
            </View>
          </>
        ) : (
          <>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{fishData.length.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Records</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>
                {new Set(fishData.map(f => f.country)).size}
              </Text>
              <Text style={styles.statLabel}>Countries</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{viewMode}</Text>
              <Text style={styles.statLabel}>View Mode</Text>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 60,
  },
  filterContainer: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterContent: {
    paddingHorizontal: 15,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  toggleContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
  },
  toggleButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  toggleButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  toggleText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  toggleTextActive: {
    color: '#fff',
  },
  map: {
    flex: 1,
    width: width,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    backgroundColor: '#f8f9fa',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  legendBox: {
    flex: 2,
    paddingLeft: 15,
  },
  legendTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 11,
    color: '#666',
  },
});