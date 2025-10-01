import { useState, useEffect } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import PageLayout from '../components/PageLayout';
import { Card, CardContent } from '../components/ui/card';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Activity, Heart, TrendingUp, Hand } from 'lucide-react';

// User ID - In production, this would come from authentication
const USER_ID = 'user_001';

// API endpoints
const CTS_API_URL = 'http://localhost:8002';
const SENSOR_API_URL = 'http://localhost:8003';

type ViewMode = 'onboarding' | 'riskTest' | 'dashboard';
type RiskTestStep = 'intro' | 'painRating' | 'gripMeasurement' | 'pinchMeasurement' | 'summary' | 'results';
type TimeRange = 'week' | 'month' | 'year';

interface SensorReading {
  timestamp: number;
  fsr_raw: number;
  pinch_strength_kg: number;
  grip_strength_kg: number;
}

interface CTSPrediction {
  predicted_class: string;
  predicted_class_numeric: number;
  probabilities: {
    mild: number;
    moderate: number;
    severe: number;
  };
  confidence: number;
}

export default function Health() {
  // View state
  const [viewMode, setViewMode] = useState<ViewMode>('onboarding');
  const [riskTestStep, setRiskTestStep] = useState<RiskTestStep>('intro');
  const [timeRange, setTimeRange] = useState<TimeRange>('week');

  // Onboarding form data
  const [onboardingData, setOnboardingData] = useState({
    age: '',
    sex: '0',
    height: '',
    weight: '',
    ctsPainDuration: '',
  });

  // Risk test data
  const [painRating, setPainRating] = useState<number>(0);
  const [gripData, setGripData] = useState<SensorReading[]>([]);
  const [pinchData, setPinchData] = useState<SensorReading[]>([]);
  const [isCollectingGrip, setIsCollectingGrip] = useState(false);
  const [isCollectingPinch, setIsCollectingPinch] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [prediction, setPrediction] = useState<CTSPrediction | null>(null);

  // Convex queries and mutations
  const userProfile = useQuery(api.userProfiles.getByUserId, { userId: USER_ID });
  const assessments = useQuery(api.ctsAssessments.getByUserId, { userId: USER_ID });
  const createProfile = useMutation(api.userProfiles.create);
  const createAssessment = useMutation(api.ctsAssessments.create);

  // Determine initial view based on user profile
  useEffect(() => {
    if (userProfile === undefined) return; // Loading
    if (userProfile === null) {
      setViewMode('onboarding');
    } else if (userProfile.hasCompletedOnboarding) {
      setViewMode('dashboard');
    } else {
      setViewMode('onboarding');
    }
  }, [userProfile]);

  // Calculate BMI
  const calculateBMI = (weight: number, height: number): number => {
    const heightInMeters = height / 100;
    return weight / (heightInMeters * heightInMeters);
  };

  // Handle onboarding submission
  const handleOnboardingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const age = parseInt(onboardingData.age);
    const height = parseFloat(onboardingData.height);
    const weight = parseFloat(onboardingData.weight);
    const bmi = calculateBMI(weight, height);
    const ctsPainDuration = parseInt(onboardingData.ctsPainDuration);

    await createProfile({
      userId: USER_ID,
      age,
      sex: parseInt(onboardingData.sex),
      height,
      weight,
      bmi,
      ctsPainDuration,
      hasCompletedOnboarding: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    setViewMode('riskTest');
    setRiskTestStep('intro');
  };

  // Start risk test
  const startRiskTest = () => {
    setViewMode('riskTest');
    setRiskTestStep('intro');
    setGripData([]);
    setPinchData([]);
    setPrediction(null);
    setPainRating(0);
  };

  // Continue to pain rating
  const continueToPainRating = () => {
    setRiskTestStep('painRating');
  };

  // Continue to grip measurement
  const continueToGripMeasurement = () => {
    setRiskTestStep('gripMeasurement');
  };

  // Continue to pinch measurement
  const continueToPinchMeasurement = () => {
    setRiskTestStep('pinchMeasurement');
  };

  // Continue to summary
  const continueToSummary = async () => {
    // Get prediction before showing summary
    await getCTSPrediction();
    setRiskTestStep('summary');
  };

  // Collect grip strength data with LIVE streaming
  const collectGripData = async () => {
    setIsCollectingGrip(true);
    setGripData([]);

    try {
      // Start countdown at 7 seconds (will show while API connects and first data arrives)
      setCountdown(7);
      const countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(countdownInterval);
            return null;
          }
          return prev - 1;
        });
      }, 1000);

      // Start API call immediately (parallel with countdown)
      const response = await fetch(
        `${SENSOR_API_URL}/sensors/stream?device_name=SensorNode&duration=10&poll_interval=0.1`
      );

      if (!response.ok) {
        clearInterval(countdownInterval);
        setCountdown(null);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        clearInterval(countdownInterval);
        setCountdown(null);
        throw new Error('No reader available');
      }

      const tempReadings: SensorReading[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const eventData = JSON.parse(line.slice(6));

              if (eventData.event === 'reading' && eventData.data) {
                tempReadings.push(eventData.data);
                // Clear countdown when first data arrives
                if (tempReadings.length === 1) {
                  clearInterval(countdownInterval);
                  setCountdown(null);
                }
                // Update state with new reading for LIVE visualization
                setGripData([...tempReadings]);
              } else if (eventData.event === 'error') {
                clearInterval(countdownInterval);
                setCountdown(null);
                throw new Error(eventData.message);
              } else if (eventData.event === 'complete') {
                console.log('Grip collection complete');
              }
            } catch (parseError) {
              console.warn('Failed to parse SSE data:', parseError);
            }
          }
        }
      }

      clearInterval(countdownInterval);
      setCountdown(null);
      setGripData(tempReadings);
    } catch (error) {
      console.error('Grip strength collection failed:', error);
      alert(
        `Failed to collect grip strength data: ${error}. Make sure the sensor API is running on port 8003.`
      );
    } finally {
      setIsCollectingGrip(false);
    }
  };

  // Collect pinch strength data with LIVE streaming
  const collectPinchData = async () => {
    setIsCollectingPinch(true);
    setPinchData([]);

    try {
      // Start countdown at 7 seconds (will show while API connects and first data arrives)
      setCountdown(7);
      const countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(countdownInterval);
            return null;
          }
          return prev - 1;
        });
      }, 1000);

      // Start API call immediately (parallel with countdown)
      const response = await fetch(
        `${SENSOR_API_URL}/sensors/stream?device_name=SensorNode&duration=10&poll_interval=0.1`
      );

      if (!response.ok) {
        clearInterval(countdownInterval);
        setCountdown(null);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        clearInterval(countdownInterval);
        setCountdown(null);
        throw new Error('No reader available');
      }

      const tempReadings: SensorReading[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const eventData = JSON.parse(line.slice(6));

              if (eventData.event === 'reading' && eventData.data) {
                tempReadings.push(eventData.data);
                // Clear countdown when first data arrives
                if (tempReadings.length === 1) {
                  clearInterval(countdownInterval);
                  setCountdown(null);
                }
                // Update state with new reading for LIVE visualization
                setPinchData([...tempReadings]);
              } else if (eventData.event === 'error') {
                clearInterval(countdownInterval);
                setCountdown(null);
                throw new Error(eventData.message);
              } else if (eventData.event === 'complete') {
                console.log('Pinch collection complete');
              }
            } catch (parseError) {
              console.warn('Failed to parse SSE data:', parseError);
            }
          }
        }
      }

      clearInterval(countdownInterval);
      setCountdown(null);
      setPinchData(tempReadings);
    } catch (error) {
      console.error('Pinch strength collection failed:', error);
      alert(
        `Failed to collect pinch strength data: ${error}. Make sure the sensor API is running on port 8003.`
      );
    } finally {
      setIsCollectingPinch(false);
    }
  };

  // Get CTS prediction from API
  const getCTSPrediction = async () => {
    if (!userProfile || gripData.length === 0 || pinchData.length === 0) return;

    const avgGrip =
      gripData.reduce((sum, r) => sum + r.grip_strength_kg, 0) / gripData.length;
    const avgPinch =
      pinchData.reduce((sum, r) => sum + r.pinch_strength_kg, 0) / pinchData.length;

    try {
      const response = await fetch(`${CTS_API_URL}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          age: userProfile.age,
          bmi: userProfile.bmi,
          sex: userProfile.sex,
          duration: userProfile.ctsPainDuration,
          nrs: painRating,
          grip_strength: avgGrip,
          pinch_strength: avgPinch,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const predictionData = await response.json();
      setPrediction(predictionData);

      // Save to database
      await createAssessment({
        userId: USER_ID,
        timestamp: Date.now(),
        age: userProfile.age,
        bmi: userProfile.bmi,
        sex: userProfile.sex,
        duration: userProfile.ctsPainDuration,
        nrs: painRating,
        gripStrength: avgGrip,
        pinchStrength: avgPinch,
        predictedClass: predictionData.predicted_class,
        predictedClassNumeric: predictionData.predicted_class_numeric,
        probabilities: predictionData.probabilities,
        confidence: predictionData.confidence,
        sensorReadingsCount: gripData.length + pinchData.length,
        sensorCollectionDuration: 20, // 10 seconds each for grip and pinch
      });

      setRiskTestStep('results');
    } catch (error) {
      console.error('Prediction failed:', error);
      alert(`Failed to get CTS prediction: ${error}. Make sure the CTS API is running on port 8002.`);
    }
  };

  // Return to dashboard
  const returnToDashboard = () => {
    setViewMode('dashboard');
    setPainRating(0);
    setGripData([]);
    setPinchData([]);
    setPrediction(null);
    setRiskTestStep('intro');
  };

  // Convert medical severity to layman-friendly labels
  const getSeverityLabel = (severity: string): string => {
    const labels = {
      mild: 'Mild or No Carpal Tunnel',
      moderate: 'Moderate Carpal Tunnel',
      severe: 'Severe Carpal Tunnel',
    };
    return labels[severity as keyof typeof labels] || severity;
  };

  // Filter assessments by time range
  const getFilteredAssessments = () => {
    if (!assessments) return [];

    const now = Date.now();
    const ranges = {
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000,
      year: 365 * 24 * 60 * 60 * 1000,
    };

    return assessments.filter((a: any) => now - a.timestamp <= ranges[timeRange]);
  };

  // Prepare chart data
  const getChartData = () => {
    const filtered = getFilteredAssessments();
    return filtered.map((a: any) => ({
      date: new Date(a.timestamp).toLocaleDateString(),
      severity: a.predictedClassNumeric,
      severityLabel: a.predictedClass,
      grip: a.gripStrength,
      pinch: a.pinchStrength,
      confidence: a.confidence * 100,
    }));
  };

  // Render onboarding screen
  const renderOnboarding = () => (
    <PageLayout title="Welcome to Carpal Tunnel Monitoring" rightText="Let's get started">
      <Card>
        <CardContent>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">Tell us about yourself</h2>
            <p className="text-white/70">
              We need some basic information to provide you with personalized Carpal Tunnel risk assessments.
            </p>
          </div>

          <form onSubmit={handleOnboardingSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-1">Age</label>
                <input
                  type="number"
                  required
                  min="18"
                  max="100"
                  value={onboardingData.age}
                  onChange={(e) => setOnboardingData({ ...onboardingData, age: e.target.value })}
                  className="w-full px-4 py-2 border border-white/20 rounded-lg focus:border-cyan-400/60 focus:outline-none bg-white/5 backdrop-blur-sm text-white placeholder-white/40 transition-all"
                  placeholder="Your age"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1">Sex</label>
                <select
                  value={onboardingData.sex}
                  onChange={(e) => setOnboardingData({ ...onboardingData, sex: e.target.value })}
                  className="w-full px-4 py-2 border border-white/20 rounded-lg focus:border-cyan-400/60 focus:outline-none bg-white/5 backdrop-blur-sm text-white transition-all"
                >
                  <option value="0" className="bg-slate-800">Male</option>
                  <option value="1" className="bg-slate-800">Female</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1">Height (cm)</label>
                <input
                  type="number"
                  required
                  min="100"
                  max="250"
                  step="0.1"
                  value={onboardingData.height}
                  onChange={(e) =>
                    setOnboardingData({ ...onboardingData, height: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-white/20 rounded-lg focus:border-cyan-400/60 focus:outline-none bg-white/5 backdrop-blur-sm text-white placeholder-white/40 transition-all"
                  placeholder="e.g., 170"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1">Weight (kg)</label>
                <input
                  type="number"
                  required
                  min="30"
                  max="200"
                  step="0.1"
                  value={onboardingData.weight}
                  onChange={(e) =>
                    setOnboardingData({ ...onboardingData, weight: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-white/20 rounded-lg focus:border-cyan-400/60 focus:outline-none bg-white/5 backdrop-blur-sm text-white placeholder-white/40 transition-all"
                  placeholder="e.g., 70"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-white mb-1">
                  Carpal Tunnel Pain Duration (months)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  max="120"
                  value={onboardingData.ctsPainDuration}
                  onChange={(e) =>
                    setOnboardingData({
                      ...onboardingData,
                      ctsPainDuration: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-white/20 rounded-lg focus:border-cyan-400/60 focus:outline-none bg-white/5 backdrop-blur-sm text-white placeholder-white/40 transition-all"
                  placeholder="Enter 0 if you don't have Carpal Tunnel pain"
                />
                <p className="text-sm text-white/60 mt-1">
                  If you experience numbness, tingling, or pain in your hand/wrist, how long have
                  you had these symptoms?
                </p>
              </div>
            </div>

            {onboardingData.height && onboardingData.weight && (
              <div className="p-4 bg-cyan-400/10 border border-cyan-400/30 rounded-lg backdrop-blur-sm">
                <p className="text-sm text-white">
                  <strong>Your BMI:</strong>{' '}
                  {calculateBMI(
                    parseFloat(onboardingData.weight),
                    parseFloat(onboardingData.height)
                  ).toFixed(1)}
                </p>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-medium py-3 rounded-lg transition-all shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30"
            >
              Continue to Risk Assessment
            </button>
          </form>
        </CardContent>
      </Card>
    </PageLayout>
  );

  // Render risk test intro
  const renderRiskTestIntro = () => (
    <PageLayout title="Carpal Tunnel Risk Assessment" rightText="Step 1 of 4">
      <Card>
        <CardContent>
          <div className="text-center py-8">
            <div className="mb-6">
              <Activity className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-3">Let's assess your Carpal Tunnel risk</h2>
              <p className="text-white/70 max-w-lg mx-auto">
                This assessment will help us understand your current condition and provide
                personalized recommendations. The process takes about 3 minutes.
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-4 mb-8 max-w-3xl mx-auto">
              <div className="p-4 bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg hover:border-cyan-400/40 transition-all">
                <h3 className="font-semibold text-white mb-1">Pain Rating</h3>
                <p className="text-sm text-white/60">Rate pain level</p>
              </div>
              <div className="p-4 bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg hover:border-cyan-400/40 transition-all">
                <h3 className="font-semibold text-white mb-1">Grip Test</h3>
                <p className="text-sm text-white/60">Live measurement</p>
              </div>
              <div className="p-4 bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg hover:border-cyan-400/40 transition-all">
                <h3 className="font-semibold text-white mb-1">Pinch Test</h3>
                <p className="text-sm text-white/60">Live measurement</p>
              </div>
              <div className="p-4 bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg hover:border-cyan-400/40 transition-all">
                <h3 className="font-semibold text-white mb-1">Results</h3>
                <p className="text-sm text-white/60">Full assessment</p>
              </div>
            </div>

            <button
              onClick={continueToPainRating}
              className="bg-cyan-500 hover:bg-cyan-600 text-white font-medium px-8 py-3 rounded-lg transition-all shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30"
            >
              Begin Assessment
            </button>
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );

  // Render pain rating screen
  const renderPainRating = () => (
    <PageLayout title="Carpal Tunnel Risk Assessment" rightText="Step 2 of 4">
      <Card>
        <CardContent>
          <div className="max-w-2xl mx-auto py-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-3">
                How would you rate your pain today?
              </h2>
              <p className="text-white/70">
                Please rate your current hand/wrist pain on a scale from 0 (no pain) to 10 (worst
                pain imaginable).
              </p>
            </div>

            <div className="mb-8">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-white/60">No pain</span>
                <span className="text-sm text-white/60">Worst pain</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                value={painRating}
                onChange={(e) => setPainRating(parseInt(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
              />
              <div className="text-center mt-4">
                <span className="text-4xl font-bold text-cyan-400">{painRating}</span>
                <span className="text-xl text-white/60"> / 10</span>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setRiskTestStep('intro')}
                className="flex-1 border border-white/20 text-white font-medium py-3 rounded-lg hover:bg-white/10 transition-all"
              >
                Back
              </button>
              <button
                onClick={continueToGripMeasurement}
                className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white font-medium py-3 rounded-lg transition-all shadow-lg shadow-cyan-500/20"
              >
                Continue
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );

  // Render grip measurement screen
  const renderGripMeasurement = () => {
    const chartData = gripData.map((reading, idx) => ({
      index: idx,
      strength: reading.grip_strength_kg,
    }));

    return (
      <PageLayout title="Carpal Tunnel Risk Assessment" rightText="Step 3 of 4">
        <Card>
          <CardContent>
            <div className="max-w-3xl mx-auto py-8">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-3">
                  Measuring your grip strength
                </h2>
                <p className="text-white/70">
                  Please squeeze the sensor device firmly with your whole hand for 10 seconds.
                  Maintain steady pressure throughout the measurement.
                </p>
              </div>

              {!isCollectingGrip && gripData.length === 0 && (
                <div className="text-center py-12">
                  <Hand className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
                  <p className="text-white/70 mb-6">Ready to measure grip strength</p>
                  <button
                    onClick={collectGripData}
                    className="bg-cyan-500 hover:bg-cyan-600 text-white font-medium px-8 py-3 rounded-lg transition-all shadow-lg shadow-cyan-500/20"
                  >
                    Start Grip Measurement
                  </button>
                </div>
              )}

              {isCollectingGrip && countdown !== null && (
                <div className="text-center py-12">
                  <div className="mb-4">
                    <Hand className="w-16 h-16 text-cyan-400 mx-auto" />
                  </div>
                  <p className="text-lg font-semibold text-white mb-2">Get ready...</p>
                  <p className="text-white/70 mb-4">Live data starting in</p>
                  <p className="text-6xl font-bold text-cyan-400 animate-pulse">{countdown}</p>
                </div>
              )}

              {isCollectingGrip && countdown === null && gripData.length === 0 && (
                <div className="text-center py-12">
                  <div className="animate-pulse mb-4">
                    <Hand className="w-16 h-16 text-cyan-400 mx-auto" />
                  </div>
                  <p className="text-lg font-semibold text-white mb-2">Collecting data...</p>
                  <p className="text-white/70">Keep squeezing firmly!</p>
                </div>
              )}

              {gripData.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg text-white mb-4">
                    Live Grip Strength Data
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis
                        dataKey="index"
                        stroke="rgba(255,255,255,0.3)"
                        tick={{ fill: 'rgba(255,255,255,0.8)', fontSize: 12 }}
                        label={{ value: 'Reading', position: 'insideBottom', offset: -5, fill: 'rgba(255,255,255,0.7)' }}
                      />
                      <YAxis
                        stroke="rgba(255,255,255,0.3)"
                        tick={{ fill: 'rgba(255,255,255,0.8)', fontSize: 12 }}
                        label={{ value: 'Grip Strength (kg)', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.7)' }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(15, 23, 42, 0.95)',
                          border: '1px solid rgba(6,182,212,0.4)',
                          borderRadius: '12px',
                          backdropFilter: 'blur(16px)',
                        }}
                        itemStyle={{ color: '#06b6d4' }}
                        labelStyle={{ color: 'rgba(255,255,255,0.95)' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="strength"
                        stroke="#06b6d4"
                        strokeWidth={3}
                        name="Grip Strength"
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>

                  <div className="mt-6 p-4 bg-cyan-400/10 border border-cyan-400/30 rounded-lg backdrop-blur-sm">
                    <p className="text-sm text-white">
                      <strong>Average Grip Strength:</strong>{' '}
                      {(gripData.reduce((sum, r) => sum + r.grip_strength_kg, 0) / gripData.length).toFixed(2)} kg
                    </p>
                  </div>

                  {!isCollectingGrip && (
                    <div className="mt-6 flex gap-4">
                      <button
                        onClick={() => setGripData([])}
                        className="flex-1 border border-white/20 text-white font-medium py-3 rounded-lg hover:bg-white/10 transition-all"
                      >
                        Retake Measurement
                      </button>
                      <button
                        onClick={continueToPinchMeasurement}
                        className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white font-medium py-3 rounded-lg transition-all shadow-lg shadow-cyan-500/20"
                      >
                        Continue to Pinch Test
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </PageLayout>
    );
  };

  // Render pinch measurement screen
  const renderPinchMeasurement = () => {
    const chartData = pinchData.map((reading, idx) => ({
      index: idx,
      strength: reading.pinch_strength_kg,
    }));

    return (
      <PageLayout title="Carpal Tunnel Risk Assessment" rightText="Step 4 of 4">
        <Card>
          <CardContent>
            <div className="max-w-3xl mx-auto py-8">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-3">
                  Measuring your pinch strength
                </h2>
                <p className="text-white/70">
                  Please pinch the sensor with your thumb and index finger for 10 seconds. Use a
                  firm, steady pinching motion.
                </p>
              </div>

              {!isCollectingPinch && pinchData.length === 0 && (
                <div className="text-center py-12">
                  <Heart className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
                  <p className="text-white/70 mb-6">Ready to measure pinch strength</p>
                  <button
                    onClick={collectPinchData}
                    className="bg-cyan-500 hover:bg-cyan-600 text-white font-medium px-8 py-3 rounded-lg transition-all shadow-lg shadow-cyan-500/20"
                  >
                    Start Pinch Measurement
                  </button>
                </div>
              )}

              {isCollectingPinch && countdown !== null && (
                <div className="text-center py-12">
                  <div className="mb-4">
                    <Heart className="w-16 h-16 text-cyan-400 mx-auto" />
                  </div>
                  <p className="text-lg font-semibold text-white mb-2">Get ready...</p>
                  <p className="text-white/70 mb-4">Live data starting in</p>
                  <p className="text-6xl font-bold text-cyan-400 animate-pulse">{countdown}</p>
                </div>
              )}

              {isCollectingPinch && countdown === null && pinchData.length === 0 && (
                <div className="text-center py-12">
                  <div className="animate-pulse mb-4">
                    <Heart className="w-16 h-16 text-cyan-400 mx-auto" />
                  </div>
                  <p className="text-lg font-semibold text-white mb-2">Collecting data...</p>
                  <p className="text-white/70">Keep pinching firmly!</p>
                </div>
              )}

              {pinchData.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg text-white mb-4">
                    Live Pinch Strength Data
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis
                        dataKey="index"
                        stroke="rgba(255,255,255,0.3)"
                        tick={{ fill: 'rgba(255,255,255,0.8)', fontSize: 12 }}
                        label={{ value: 'Reading', position: 'insideBottom', offset: -5, fill: 'rgba(255,255,255,0.7)' }}
                      />
                      <YAxis
                        stroke="rgba(255,255,255,0.3)"
                        tick={{ fill: 'rgba(255,255,255,0.8)', fontSize: 12 }}
                        label={{
                          value: 'Pinch Strength (kg)',
                          angle: -90,
                          position: 'insideLeft',
                          fill: 'rgba(255,255,255,0.7)'
                        }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(15, 23, 42, 0.95)',
                          border: '1px solid rgba(6,182,212,0.4)',
                          borderRadius: '12px',
                          backdropFilter: 'blur(16px)',
                        }}
                        itemStyle={{ color: '#06b6d4' }}
                        labelStyle={{ color: 'rgba(255,255,255,0.95)' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="strength"
                        stroke="#10b981"
                        strokeWidth={3}
                        name="Pinch Strength"
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>

                  <div className="mt-6 p-4 bg-green-400/10 border border-green-400/30 rounded-lg backdrop-blur-sm">
                    <p className="text-sm text-white">
                      <strong>Average Pinch Strength:</strong>{' '}
                      {(
                        pinchData.reduce((sum, r) => sum + r.pinch_strength_kg, 0) /
                        pinchData.length
                      ).toFixed(2)}{' '}
                      kg
                    </p>
                  </div>

                  {!isCollectingPinch && (
                    <div className="mt-6 flex gap-4">
                      <button
                        onClick={() => setPinchData([])}
                        className="flex-1 border border-white/20 text-white font-medium py-3 rounded-lg hover:bg-white/10 transition-all"
                      >
                        Retake Measurement
                      </button>
                      <button
                        onClick={continueToSummary}
                        className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white font-medium py-3 rounded-lg transition-all shadow-lg shadow-cyan-500/20"
                      >
                        View Assessment
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </PageLayout>
    );
  };

  // Render summary screen (combines grip, pinch, and prediction)
  const renderSummary = () => {
    if (!prediction) {
      return (
        <PageLayout title="Calculating Assessment" rightText="Please wait">
          <Card>
            <CardContent>
              <div className="text-center py-12">
                <div className="animate-pulse mb-4">
                  <Activity className="w-16 h-16 text-cyan-400 mx-auto" />
                </div>
                <p className="text-lg font-semibold text-white mb-2">
                  Analyzing your measurements...
                </p>
                <p className="text-white/70">This will take just a moment</p>
              </div>
            </CardContent>
          </Card>
        </PageLayout>
      );
    }

    const severityColor = {
      mild: 'text-green-400',
      moderate: 'text-yellow-400',
      severe: 'text-red-400',
    }[prediction.predicted_class];

    const severityBg = {
      mild: 'bg-green-400/10 border-green-400/30',
      moderate: 'bg-yellow-400/10 border-yellow-400/30',
      severe: 'bg-red-400/10 border-red-400/30',
    }[prediction.predicted_class];

    const avgGrip = gripData.reduce((sum, r) => sum + r.grip_strength_kg, 0) / gripData.length;
    const avgPinch = pinchData.reduce((sum, r) => sum + r.pinch_strength_kg, 0) / pinchData.length;

    return (
      <PageLayout title="Your Complete Assessment" rightText="Results">
        <div className="space-y-6">
          {/* CTS Risk Level - Large Card */}
          <Card>
            <CardContent>
              <h3 className="font-semibold text-xl text-white mb-4 text-center">
                Your Carpal Tunnel Risk Level
              </h3>
              <div className={`${severityBg} border rounded-lg p-8 text-center mb-4 backdrop-blur-sm`}>
                <p className="text-sm text-white/60 mb-2">Severity Classification</p>
                <p className={`text-4xl font-bold ${severityColor} mb-4`}>
                  {getSeverityLabel(prediction.predicted_class)}
                </p>
                <p className="text-sm text-white/70">
                  Model Confidence: {(prediction.confidence * 100).toFixed(0)}%
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Measurement Summary */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent>
                <h3 className="font-semibold text-lg text-white mb-4">Pain Rating</h3>
                <div className="text-center">
                  <p className="text-4xl font-bold text-cyan-400">{painRating}</p>
                  <p className="text-sm text-white/60 mt-1">out of 10</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <h3 className="font-semibold text-lg text-white mb-4">Grip Strength</h3>
                <div className="text-center">
                  <p className="text-4xl font-bold text-cyan-400">{avgGrip.toFixed(2)}</p>
                  <p className="text-sm text-white/60 mt-1">kg</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <h3 className="font-semibold text-lg text-white mb-4">Pinch Strength</h3>
                <div className="text-center">
                  <p className="text-4xl font-bold text-green-400">{avgPinch.toFixed(2)}</p>
                  <p className="text-sm text-white/60 mt-1">kg</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Combined Strength Chart */}
          <Card>
            <CardContent>
              <h3 className="font-semibold text-lg text-white mb-4">
                Strength Measurement Timeline
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={[
                    ...gripData.map((r, idx) => ({
                      index: idx,
                      grip: r.grip_strength_kg,
                      pinch: null,
                      type: 'grip',
                    })),
                    ...pinchData.map((r, idx) => ({
                      index: gripData.length + idx,
                      grip: null,
                      pinch: r.pinch_strength_kg,
                      type: 'pinch',
                    })),
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis
                    dataKey="index"
                    stroke="rgba(255,255,255,0.3)"
                    tick={{ fill: 'rgba(255,255,255,0.8)', fontSize: 12 }}
                    label={{ value: 'Reading', position: 'insideBottom', offset: -5, fill: 'rgba(255,255,255,0.7)' }}
                  />
                  <YAxis
                    stroke="rgba(255,255,255,0.3)"
                    tick={{ fill: 'rgba(255,255,255,0.8)', fontSize: 12 }}
                    label={{ value: 'Strength (kg)', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.7)' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      border: '1px solid rgba(6,182,212,0.4)',
                      borderRadius: '12px',
                      backdropFilter: 'blur(16px)',
                    }}
                    itemStyle={{ color: '#06b6d4' }}
                    labelStyle={{ color: 'rgba(255,255,255,0.95)' }}
                  />
                  <Legend
                    wrapperStyle={{
                      paddingTop: '20px',
                    }}
                    iconType="line"
                    formatter={(value) => <span style={{ color: 'rgba(255,255,255,0.9)' }}>{value}</span>}
                  />
                  <Line
                    type="monotone"
                    dataKey="grip"
                    stroke="#06b6d4"
                    strokeWidth={3}
                    name="Grip Strength"
                    connectNulls={false}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="pinch"
                    stroke="#10b981"
                    strokeWidth={3}
                    name="Pinch Strength"
                    connectNulls={false}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recommendations Section */}
          <Card>
            <CardContent>
              <h3 className="font-semibold text-lg text-white mb-4">What this means for you</h3>
              {prediction.predicted_class === 'mild' && (
                <div className="space-y-3 text-sm text-white/80">
                  <p>
                    Your assessment indicates <strong className="text-white">mild or no Carpal Tunnel symptoms</strong>. This is good
                    news! Your hand strength and pain levels suggest minimal to no nerve compression at this time.
                  </p>
                  <p className="font-semibold mt-4 text-white">Recommendations:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Take regular breaks during repetitive hand activities</li>
                    <li>Practice wrist stretches and exercises</li>
                    <li>Monitor your symptoms and track changes</li>
                    <li>Consider ergonomic adjustments to your workspace</li>
                  </ul>
                </div>
              )}
              {prediction.predicted_class === 'moderate' && (
                <div className="space-y-3 text-sm text-white/80">
                  <p>
                    Your assessment indicates <strong className="text-white">moderate Carpal Tunnel symptoms</strong>. It's
                    important to take action now to prevent progression to more severe symptoms.
                  </p>
                  <p className="font-semibold mt-4 text-white">Recommendations:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Consider scheduling a consultation with a healthcare provider</li>
                    <li>Use a wrist splint, especially at night</li>
                    <li>Reduce repetitive hand movements when possible</li>
                    <li>Apply ice to reduce inflammation</li>
                    <li>Continue regular monitoring with this app</li>
                  </ul>
                </div>
              )}
              {prediction.predicted_class === 'severe' && (
                <div className="space-y-3 text-sm text-white/80">
                  <p>
                    Your assessment indicates <strong className="text-white">severe Carpal Tunnel symptoms</strong>. We strongly
                    recommend seeking medical attention to discuss treatment options and prevent
                    permanent nerve damage.
                  </p>
                  <p className="font-semibold mt-4 text-white">Recommendations:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>
                      <strong className="text-white">Schedule an appointment with a doctor as soon as possible</strong>
                    </li>
                    <li>Discuss treatment options including splinting, medication, or surgery</li>
                    <li>Avoid activities that aggravate your symptoms</li>
                    <li>Keep track of symptom progression</li>
                    <li>Don't delay seeking professional medical care</li>
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Button */}
          <div className="mt-6">
            <button
              onClick={returnToDashboard}
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-medium py-3 rounded-lg transition-all shadow-lg shadow-cyan-500/20"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </PageLayout>
    );
  };

  // Render dashboard with historical data
  const renderDashboard = () => {
    const chartData = getChartData();
    const hasAssessments = chartData.length > 0;

    return (
      <PageLayout
        title="Carpal Tunnel Health Dashboard"
        rightText={new Date().toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
        })}
      >
        <div className="space-y-6">
          {/* Risk Test Button */}
          <div className="flex justify-end">
            <button
              onClick={startRiskTest}
              className="bg-cyan-500 hover:bg-cyan-600 text-white font-medium px-6 py-3 rounded-lg transition-all shadow-lg shadow-cyan-500/20 flex items-center gap-2"
            >
              <Activity className="w-5 h-5" />
              Take New Risk Assessment
            </button>
          </div>

          {!hasAssessments ? (
            <Card>
              <CardContent>
                <div className="text-center py-12">
                  <TrendingUp className="w-16 h-16 text-white/40 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">No assessments yet</h3>
                  <p className="text-white/70 mb-6">
                    Take your first risk assessment to start tracking your Carpal Tunnel health over time.
                  </p>
                  <button
                    onClick={startRiskTest}
                    className="bg-cyan-500 hover:bg-cyan-600 text-white font-medium px-6 py-3 rounded-lg transition-all shadow-lg shadow-cyan-500/20"
                  >
                    Take Your First Assessment
                  </button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Time Range Selector */}
              <div className="flex justify-center gap-2">
                {(['week', 'month', 'year'] as TimeRange[]).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      timeRange === range
                        ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20'
                        : 'bg-white/5 border border-white/20 text-white hover:bg-white/10'
                    }`}
                  >
                    {range.charAt(0).toUpperCase() + range.slice(1)}
                  </button>
                ))}
              </div>

              {/* Charts */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardContent>
                    <h3 className="font-semibold text-lg text-white mb-4">
                      Carpal Tunnel Severity Over Time
                    </h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis
                          dataKey="date"
                          stroke="rgba(255,255,255,0.3)"
                          tick={{ fill: 'rgba(255,255,255,0.8)', fontSize: 12 }}
                        />
                        <YAxis
                          stroke="rgba(255,255,255,0.3)"
                          tick={{ fill: 'rgba(255,255,255,0.8)', fontSize: 10 }}
                          domain={[0, 2]}
                          ticks={[0, 1, 2]}
                          tickFormatter={(value) => ['Mild/None', 'Moderate', 'Severe'][value]}
                          width={80}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(15, 23, 42, 0.95)',
                            border: '1px solid rgba(6,182,212,0.4)',
                            borderRadius: '12px',
                            backdropFilter: 'blur(16px)',
                          }}
                          itemStyle={{ color: '#06b6d4' }}
                          labelStyle={{ color: 'rgba(255,255,255,0.95)' }}
                          formatter={(value: any) => ['Mild or No Carpal Tunnel', 'Moderate Carpal Tunnel', 'Severe Carpal Tunnel'][value]}
                        />
                        <Line
                          type="monotone"
                          dataKey="severity"
                          stroke="#06b6d4"
                          strokeWidth={3}
                          name="Severity"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent>
                    <h3 className="font-semibold text-lg text-white mb-4">
                      Strength Measurements
                    </h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis
                          dataKey="date"
                          stroke="rgba(255,255,255,0.3)"
                          tick={{ fill: 'rgba(255,255,255,0.8)', fontSize: 12 }}
                        />
                        <YAxis
                          stroke="rgba(255,255,255,0.3)"
                          tick={{ fill: 'rgba(255,255,255,0.8)', fontSize: 12 }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(15, 23, 42, 0.95)',
                            border: '1px solid rgba(6,182,212,0.4)',
                            borderRadius: '12px',
                            backdropFilter: 'blur(16px)',
                          }}
                          itemStyle={{ color: '#06b6d4' }}
                          labelStyle={{ color: 'rgba(255,255,255,0.95)' }}
                        />
                        <Legend
                          iconType="square"
                          formatter={(value) => <span style={{ color: 'rgba(255,255,255,0.9)' }}>{value}</span>}
                        />
                        <Bar dataKey="grip" fill="#06b6d4" name="Grip (kg)" />
                        <Bar dataKey="pinch" fill="#10b981" name="Pinch (kg)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Assessments */}
              <Card>
                <CardContent>
                  <h3 className="font-semibold text-lg text-white mb-4">Recent Assessments</h3>
                  <div className="space-y-3">
                    {chartData
                      .slice(-5)
                      .reverse()
                      .map((assessment, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 bg-white/5 border border-white/20 rounded-lg hover:bg-white/10 hover:border-cyan-400/40 transition-all"
                        >
                          <div>
                            <p className="font-medium text-white">{assessment.date}</p>
                            <p className="text-sm text-white/60">
                              Grip: {assessment.grip.toFixed(2)} kg | Pinch:{' '}
                              {assessment.pinch.toFixed(2)} kg
                            </p>
                          </div>
                          <div className="text-right">
                            <p
                              className={`font-semibold text-sm ${
                                assessment.severityLabel === 'mild'
                                  ? 'text-green-400'
                                  : assessment.severityLabel === 'moderate'
                                  ? 'text-yellow-400'
                                  : 'text-red-400'
                              }`}
                            >
                              {getSeverityLabel(assessment.severityLabel)}
                            </p>
                            <p className="text-sm text-white/60">
                              {assessment.confidence.toFixed(0)}% confidence
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </PageLayout>
    );
  };

  // Main render
  if (viewMode === 'onboarding') {
    return renderOnboarding();
  } else if (viewMode === 'riskTest') {
    if (riskTestStep === 'intro') return renderRiskTestIntro();
    if (riskTestStep === 'painRating') return renderPainRating();
    if (riskTestStep === 'gripMeasurement') return renderGripMeasurement();
    if (riskTestStep === 'pinchMeasurement') return renderPinchMeasurement();
    if (riskTestStep === 'summary') return renderSummary();
  } else if (viewMode === 'dashboard') {
    return renderDashboard();
  }

  return null;
}
