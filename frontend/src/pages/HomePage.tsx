import { useEffect, useState } from "react";
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import PageLayout from "../components/PageLayout"; // Import the new PageLayout component
import { Card, CardContent } from "../components/ui/card";
import AIAssistant from "../components/AIAssistant";
import PricePrediction from "../components/PricePrediction";
import DashboardSummary from "../components/DashboardSummary";
import {
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from "recharts";
import type { PieLabelRenderProps } from "recharts";
import { Search, Fish, MessageCircle } from "lucide-react";

// Dummy data
const fishData = [
  { id: "#F-001", fish: "Tuna", date: "31/01/2025" },
  { id: "#F-002", fish: "Salmon", date: "31/01/2025" },
  { id: "#F-003", fish: "Mackerel", date: "31/01/2025" },
  { id: "#F-004", fish: "Sardine", date: "31/01/2025" },
];

const onboardData = [
  { name: "Tuna", value: 8 },
  { name: "Eel", value: 6 },
  { name: "Sea Urchin", value: 10 },
  { name: "Mackerel", value: 5 },
];
// Professional colors for dark/transparent background - ocean palette
const COLORS = ["#3b82f6", "#06b6d4", "#f59e0b", "#ec4899", "#8b5cf6", "#10b981"];

// Calculate fishing conditions score (0-100) based on weather
const calculateFishingScore = (temp: number, weatherCode: number): number => {
  let score = 50; // Base score

  // Temperature optimization (20-25°C is ideal)
  if (temp >= 20 && temp <= 25) score += 20;
  else if (temp >= 15 && temp < 30) score += 10;
  else score -= 10;

  // Weather conditions
  if (weatherCode === 0 || weatherCode === 1) score += 30; // Clear/Mostly clear
  else if (weatherCode === 2 || weatherCode === 3) score += 20; // Partly cloudy
  else if (weatherCode >= 61 && weatherCode <= 65) score -= 20; // Rain
  else if (weatherCode >= 95) score -= 30; // Storms

  return Math.max(0, Math.min(100, score)); // Clamp between 0-100
};

const LATITUDE = 35.5311;
const LONGITUDE = 139.8894;

const weatherCodeToEmoji = (code: number) => {
  switch (code) {
    case 0: return "☀️";
    case 1: return "🌤️";
    case 2: return "⛅";
    case 3: return "🌥️";
    case 45: case 48: return "🌫️";
    case 51: case 53: case 55: return "🌧️";
    case 61: case 63: case 65: return "🌦️";
    case 71: case 73: case 75: return "🌨️";
    case 80: case 81: case 82: return "🌧️";
    case 95: case 96: case 99: return "🌩️";
    default: return "🌫️";
  }
};

const USER_ID = 'user_001';

export default function HomePage({ isHomePageVisible }: { isHomePageVisible: boolean }) {
  const [weather, setWeather] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fishingScore, setFishingScore] = useState<number>(0);
  const [temperature, setTemperature] = useState<number>(0);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [isAccessibleMode, setIsAccessibleMode] = useState(false);

  // Fetch CTS data
  const assessments = useQuery(api.ctsAssessments.getByUserId, { userId: USER_ID });

  // Get latest CTS assessment
  const latestAssessment = assessments && assessments.length > 0
    ? assessments.reduce((latest: any, current: any) =>
        current.timestamp > latest.timestamp ? current : latest
      )
    : null;

  const getConditionLabel = (score: number): string => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Poor";
  };

  const getConditionColor = (score: number): string => {
    if (score >= 80) return "#06b6d4"; // Cyan/Blue
    if (score >= 60) return "#10b981"; // Green
    if (score >= 40) return "#f59e0b"; // Amber
    return "#ef4444"; // Red
  };

  // Track accessible mode
  useEffect(() => {
    const checkAccessibleMode = () => {
      setIsAccessibleMode(document.documentElement.getAttribute('data-theme') === 'accessible');
    };
    
    checkAccessibleMode();
    
    // Listen for theme changes
    const observer = new MutationObserver(checkAccessibleMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${LATITUDE}&longitude=${LONGITUDE}&current_weather=true&timezone=Asia/Tokyo`
        );
        if (!res.ok) throw new Error("fetch failed");
        const data = await res.json();
        const cw = data.current_weather;
        if (cw) {
          setWeather(`${weatherCodeToEmoji(cw.weathercode)} ${cw.temperature}°C`);
          setTemperature(cw.temperature);
          const score = calculateFishingScore(cw.temperature, cw.weathercode);
          setFishingScore(score);
        } else {
          setWeather("No weather");
          setFishingScore(50);
        }
      } catch {
        setError("Weather error");
      } finally {
        setLoading(false);
      }
    };
    void fetchWeather();
  }, []);

  return (
    <>
      {showAIAssistant && (
        <AIAssistant
          onClose={() => setShowAIAssistant(false)}
          ctsData={latestAssessment ? {
            severity: latestAssessment.predictedClass,
            gripStrength: latestAssessment.gripStrength,
            pinchStrength: latestAssessment.pinchStrength,
          } : null}
        />
      )}
      <div
        className={`${
          isHomePageVisible
            ? "opacity-100 translate-y-0" // Visible and slide down
            : "opacity-0 translate-y-10" // Hidden and slide up
        } transition-all duration-500 ease-in-out h-full dashboard-content`}
      >
        <PageLayout
        title="Dashboard"
        rightText={
          <div className="flex items-center justify-between w-full gap-6">
            {/* AI Assistant - Left side for primary action */}
            <button
              onClick={() => setShowAIAssistant(true)}
              className="bg-cyan-500 hover:bg-cyan-600 text-white font-medium px-4 py-2.5 rounded-lg transition-all shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 flex items-center gap-2 text-sm"
            >
              <MessageCircle className="w-4 h-4" />
              Ask AI Assistant
            </button>
            
            {/* Date & Weather - Right side for contextual info */}
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-2 font-medium">
                <span className="text-white/90">
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                <span className="text-white/40">•</span>
                <span className="text-white/90">
                  {loading ? (
                    "Loading..."
                  ) : error ? (
                    <span className="text-red-300">{error}</span>
                  ) : (
                    weather
                  )}
                </span>
              </div>
            </div>
          </div>
        }
      >
        {/* Page content */}
        <div className="grid grid-cols-12 gap-3">
          {/* Dashboard Summary */}
          <DashboardSummary
            ctsData={latestAssessment ? {
              severity: latestAssessment.predictedClass,
              gripStrength: latestAssessment.gripStrength,
              pinchStrength: latestAssessment.pinchStrength,
              lastAssessment: new Date(latestAssessment.timestamp)
            } : null}
            fishingScore={fishingScore}
            temperature={temperature}
          />

          {/* Left list */}
          <Card className="col-span-4">
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-lg flex items-center gap-2 text-white">
                  <Fish className="w-5 h-5 text-cyan-400" />
                  Top Fish to Catch (14)
                </h2>
                <span className="text-sm text-white/80 font-medium">24h</span>
              </div>

              <div className="flex items-center bg-white/5 backdrop-blur-sm rounded-lg px-3 py-2 mb-4 border border-white/20 focus-within:border-cyan-400/60 focus-within:bg-white/10 transition-all search-container">
                <Search className="w-4 h-4 text-cyan-400/80" />
                <input
                  type="text"
                  placeholder="Search fish..."
                  className="bg-transparent w-full px-2 py-1 outline-none focus:outline-none focus:ring-0 focus:border-none text-sm text-white placeholder-white/40"
                />
              </div>

              <ul className="space-y-1">
                {fishData.map((f) => (
                  <li
                    key={f.id}
                    className="flex justify-between text-sm border-b border-white/20 py-3 hover:bg-white/10 hover:border-cyan-400/40 rounded-lg px-2 transition-all cursor-pointer group"
                  >
                    <span className="text-cyan-400 font-mono group-hover:text-cyan-300">{f.id}</span>
                    <span className="text-white font-medium group-hover:text-cyan-100">{f.fish}</span>
                    <span className="text-white/60 text-xs group-hover:text-white/80">{f.date}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Right chart area */}
          <div className="col-span-8 grid grid-cols-12 gap-3">
            <Card className="col-span-6">
              <CardContent>
                <h2 className="font-semibold text-base mb-2 text-white">
                  Fish Types
                </h2>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                    <Pie
                      data={onboardData}
                      cx="40%"
                      cy="50%"
                      outerRadius={50}
                      dataKey="value"
                      label={(props: PieLabelRenderProps) => {
                        const percent = typeof props.percent === 'number' ? props.percent : 0;
                        return `${String(props.name)} ${(percent * 100).toFixed(0)}%`;
                      }}
                      labelLine={{ stroke: isAccessibleMode ? 'rgba(15,23,42,0.3)' : 'rgba(255,255,255,0.5)', strokeWidth: 1 }}
                    >
                      {onboardData.map((entry, idx) => (
                        <Cell
                          key={`${entry.name}-${idx}`}
                          fill={COLORS[idx % COLORS.length]}
                          stroke="rgba(255,255,255,0.3)"
                          strokeWidth={2}
                          aria-label={entry.name}
                        />
                      ))}
                    </Pie>
                    <Legend
                      layout="vertical"
                      align="right"
                      verticalAlign="middle"
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{
                        paddingLeft: '15px',
                        fontSize: '12px',
                        lineHeight: '1.2',
                      }}
                      formatter={(value) => <span style={{ color: isAccessibleMode ? '#111827' : 'rgba(255,255,255,0.9)', fontWeight: '500' }}>{value}</span>}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isAccessibleMode ? '#ffffff' : 'rgba(15, 23, 42, 0.95)',
                        border: isAccessibleMode ? '2px solid #e2e8f0' : '1px solid rgba(59,130,246,0.4)',
                        borderRadius: '12px',
                        backdropFilter: isAccessibleMode ? 'none' : 'blur(16px)',
                        boxShadow: isAccessibleMode ? '0 8px 24px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.06)' : '0 8px 32px rgba(0,0,0,0.4)',
                      }}
                      itemStyle={{
                        color: isAccessibleMode ? '#0f172a' : '#3b82f6'
                      }}
                      labelStyle={{
                        color: isAccessibleMode ? '#0f172a' : 'rgba(255,255,255,0.95)',
                        fontWeight: 'bold'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="col-span-6">
              <CardContent>
                <h2 className="font-semibold text-base mb-2 text-white">
                  Fishing Conditions
                </h2>
                <div className="relative h-[160px] flex items-center justify-center">
                  {loading ? (
                    <div className="text-white/60">Loading...</div>
                  ) : (
                    <>
                      <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart
                          cx="50%"
                          cy="50%"
                          innerRadius="70%"
                          outerRadius="90%"
                          barSize={20}
                          data={[{ name: 'Score', value: fishingScore, fill: getConditionColor(fishingScore) }]}
                          startAngle={180}
                          endAngle={0}
                        >
                          <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                          <RadialBar
                            background={{ fill: 'rgba(255,255,255,0.1)' }}
                            dataKey="value"
                            cornerRadius={10}
                          />
                        </RadialBarChart>
                      </ResponsiveContainer>

                      {/* Center text overlay */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <div className="text-4xl font-bold text-white mb-1">{fishingScore}</div>
                        <div className="text-base font-semibold" style={{ color: getConditionColor(fishingScore) }}>
                          {getConditionLabel(fishingScore)}
                        </div>
                        <div className="text-xs text-white/60 mt-1">{temperature}°C</div>
                      </div>
                    </>
                  )}
                </div>

                {/* Legend */}
                <div className="grid grid-cols-4 gap-2 mt-3 text-xs text-white/70">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-[#06b6d4]"></div>
                    <span>Excellent</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-[#10b981]"></div>
                    <span>Good</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-[#f59e0b]"></div>
                    <span>Fair</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-[#ef4444]"></div>
                    <span>Poor</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-12">
              <PricePrediction />
            </Card>
          </div>
        </div>
      </PageLayout>
      </div>
    </>
  );
}