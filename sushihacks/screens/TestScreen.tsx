import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useNavigation } from '@react-navigation/native';

const TestScreen = () => {
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [testComplete, setTestComplete] = useState(false);
  const [pinchData, setPinchData] = useState<number[]>([]);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [riskLevel, setRiskLevel] = useState<'Low' | 'Medium' | 'High' | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const navigation = useNavigation();

  useEffect(() => {
    if (isTestRunning && timeElapsed >= 5) {
      stopTest();
    }
  }, [timeElapsed, isTestRunning]);

  const generateMockPinchStrength = () => {
    // Generate realistic mock data with some variation
    const baseStrength = 20 + Math.random() * 30;
    const variation = (Math.random() - 0.5) * 5;
    return Math.max(0, Math.min(60, baseStrength + variation));
  };

  const startTest = () => {
    setIsTestRunning(true);
    setTestComplete(false);
    setPinchData([]);
    setTimeElapsed(0);
    setRiskLevel(null);

    intervalRef.current = setInterval(() => {
      setPinchData(prev => {
        const newData = [...prev, generateMockPinchStrength()];
        return newData.slice(-50); // Keep last 50 data points
      });
      setTimeElapsed(prev => prev + 0.1);
    }, 100); // Update every 100ms for smooth animation
  };

  const stopTest = () => {
    setIsTestRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    calculateRisk();
    setTestComplete(true);
  };

  const calculateRisk = () => {
    if (pinchData.length === 0) return;

    const avgStrength = pinchData.reduce((a, b) => a + b, 0) / pinchData.length;
    const variance = pinchData.reduce((sum, val) => sum + Math.pow(val - avgStrength, 2), 0) / pinchData.length;

    // Mock risk calculation based on average strength and variance
    if (avgStrength > 35 && variance < 20) {
      setRiskLevel('Low');
    } else if (avgStrength > 25 || variance < 30) {
      setRiskLevel('Medium');
    } else {
      setRiskLevel('High');
    }
  };

  const resetTest = () => {
    setIsTestRunning(false);
    setTestComplete(false);
    setPinchData([]);
    setTimeElapsed(0);
    setRiskLevel(null);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const getRiskColor = () => {
    switch (riskLevel) {
      case 'Low': return '#4CAF50';
      case 'Medium': return '#FFC107';
      case 'High': return '#F44336';
      default: return '#666';
    }
  };

  const chartData = {
    labels: Array(Math.min(pinchData.length, 10)).fill('').map((_, i) =>
      (i * 0.5).toFixed(1)
    ),
    datasets: [{
      data: pinchData.length > 0 ? pinchData.slice(-10) : [0],
    }],
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Carpal Tunnel Risk Test</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.instructionCard}>
          <Text style={styles.instructionTitle}>Instructions</Text>
          <Text style={styles.instructionText}>
            1. Place the device between your thumb and index finger{'\n'}
            2. Press "Start Test" when ready{'\n'}
            3. Apply consistent pinch pressure for 5 seconds{'\n'}
            4. View your risk assessment results
          </Text>
        </View>

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>
            Pinch Strength (lbs) - {timeElapsed.toFixed(1)}s / 5.0s
          </Text>
          {pinchData.length > 0 ? (
            <LineChart
              data={chartData}
              width={Dimensions.get('window').width - 40}
              height={220}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 1,
                color: (opacity = 1) => `rgba(81, 150, 244, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '4',
                  strokeWidth: '2',
                  stroke: '#5196F4',
                },
              }}
              bezier
              style={styles.chart}
            />
          ) : (
            <View style={styles.placeholderChart}>
              <Text style={styles.placeholderText}>
                Press "Start Test" to begin measuring
              </Text>
            </View>
          )}
        </View>

        {testComplete && riskLevel && (
          <View style={[styles.resultCard, { borderColor: getRiskColor() }]}>
            <Text style={styles.resultTitle}>Test Results</Text>
            <Text style={[styles.riskLevel, { color: getRiskColor() }]}>
              Risk Level: {riskLevel}
            </Text>
            <Text style={styles.resultDescription}>
              {riskLevel === 'Low' && 'Your pinch strength indicates a low risk of developing carpal tunnel syndrome. Continue with regular preventive exercises.'}
              {riskLevel === 'Medium' && 'Your pinch strength shows moderate risk factors. Consider ergonomic improvements and regular hand exercises.'}
              {riskLevel === 'High' && 'Your results suggest elevated risk factors. We recommend consulting with a healthcare professional for a comprehensive evaluation.'}
            </Text>
          </View>
        )}

        <View style={styles.buttonContainer}>
          {!isTestRunning && !testComplete && (
            <TouchableOpacity style={styles.startButton} onPress={startTest}>
              <Text style={styles.startButtonText}>Start Test</Text>
            </TouchableOpacity>
          )}
          {isTestRunning && (
            <TouchableOpacity style={styles.stopButton} onPress={stopTest}>
              <Text style={styles.stopButtonText}>Stop Test</Text>
            </TouchableOpacity>
          )}
          {testComplete && (
            <TouchableOpacity style={styles.resetButton} onPress={resetTest}>
              <Text style={styles.resetButtonText}>Take Another Test</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    color: '#5196F4',
    fontSize: 16,
    fontWeight: '500',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    padding: 20,
  },
  instructionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  instructionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  instructionText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
    textAlign: 'center',
  },
  chart: {
    borderRadius: 12,
  },
  placeholderChart: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
  },
  placeholderText: {
    color: '#999',
    fontSize: 16,
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  riskLevel: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  resultDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
  },
  buttonContainer: {
    marginTop: 10,
  },
  startButton: {
    backgroundColor: '#5196F4',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  stopButton: {
    backgroundColor: '#F44336',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  stopButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  resetButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default TestScreen;