import React, { useEffect, useState } from "react";
import PageLayout from "../components/PageLayout"; // Import the new PageLayout component
import { Card, CardContent } from "../components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
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
import { Search, Fish } from "lucide-react";

// Dummy data
const fishData = [
  { id: "#F-001", fish: "Tuna", date: "31/01/2025" },
  { id: "#F-002", fish: "Salmon", date: "31/01/2025" },
  { id: "#F-003", fish: "Mackerel", date: "31/01/2025" },
  { id: "#F-004", fish: "Sardine", date: "31/01/2025" },
];

const catchData = [
  { month: "Jan", caught: 145 },
  { month: "Feb", caught: 132 },
  { month: "Mar", caught: 178 },
  { month: "Apr", caught: 203 },
  { month: "May", caught: 245 },
  { month: "Jun", caught: 267 },
  { month: "Jul", caught: 289 },
  { month: "Aug", caught: 312 },
  { month: "Sep", caught: 198 },
  { month: "Oct", caught: 167 },
  { month: "Nov", caught: 143 },
  { month: "Dec", caught: 156 },
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

export default function HomePage({ isHomePageVisible }: { isHomePageVisible: boolean }) {
  const [weather, setWeather] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fishingScore, setFishingScore] = useState<number>(0);
  const [temperature, setTemperature] = useState<number>(0);

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
    fetchWeather();
  }, []);

  return (
    <div
      className={`${
        isHomePageVisible
          ? "opacity-100 translate-y-0" // Visible and slide down
          : "opacity-0 translate-y-10" // Hidden and slide up
      } transition-all duration-500 ease-in-out`}
    >
      <PageLayout
        title="Dashboard"
        rightText={
          loading ? (
            "Loading weather..."
          ) : error ? (
            <span className="text-red-300">{error}</span>
          ) : (
            weather
          )
        }
      >
        {/* Page content */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left list */}
          <Card className="col-span-3">
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-lg flex items-center gap-2 text-white">
                  <Fish className="w-5 h-5 text-cyan-400" />
                  Top Fish to Fish (14)
                </h2>
                <span className="text-sm text-white/80 font-medium">24h</span>
              </div>

              <div className="flex items-center bg-white/5 backdrop-blur-sm rounded-lg px-3 py-2 mb-4 border border-white/20 focus-within:border-cyan-400/60 focus-within:bg-white/10 transition-all">
                <Search className="w-4 h-4 text-cyan-400/80" />
                <input
                  type="text"
                  placeholder="Search fish..."
                  className="bg-transparent w-full px-2 py-1 outline-none text-sm text-white placeholder-white/40"
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
          <div className="col-span-9 grid grid-cols-12 gap-6">
            <Card className="col-span-12">
              <CardContent>
                <h2 className="font-semibold text-lg mb-4 text-white">
                  Number of Fish Caught per Month
                </h2>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={catchData}>
                    <XAxis
                      dataKey="month"
                      stroke="rgba(255,255,255,0.3)"
                      tick={{ fill: 'rgba(255,255,255,0.8)', fontSize: 12 }}
                      axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                    />
                    <YAxis
                      stroke="rgba(255,255,255,0.3)"
                      tick={{ fill: 'rgba(255,255,255,0.8)', fontSize: 12 }}
                      axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                      gridLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                      label={{ value: 'Fish Caught', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.7)' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        border: '1px solid rgba(6,182,212,0.4)',
                        borderRadius: '12px',
                        backdropFilter: 'blur(16px)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                      }}
                      itemStyle={{ color: '#06b6d4' }}
                      labelStyle={{ color: 'rgba(255,255,255,0.95)', fontWeight: 'bold' }}
                      formatter={(value) => [`${value} fish`, 'Caught']}
                    />
                    <Line
                      type="monotone"
                      dataKey="caught"
                      stroke="#06b6d4"
                      strokeWidth={3}
                      dot={{ fill: '#06b6d4', r: 5, strokeWidth: 2, stroke: '#0891b2' }}
                      activeDot={{ r: 7, fill: '#06b6d4', stroke: '#fff', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="col-span-6">
              <CardContent>
                <h2 className="font-semibold text-lg mb-4 text-white">
                  Fish Types
                </h2>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={onboardData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={{ stroke: 'rgba(255,255,255,0.5)', strokeWidth: 1 }}
                    >
                      {onboardData.map((entry, idx) => (
                        <Cell
                          key={idx}
                          fill={COLORS[idx % COLORS.length]}
                          stroke="rgba(255,255,255,0.3)"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Legend
                      layout="vertical"
                      align="right"
                      verticalAlign="middle"
                      iconType="circle"
                      iconSize={10}
                      wrapperStyle={{
                        paddingLeft: '20px',
                        fontSize: '13px',
                      }}
                      formatter={(value) => <span style={{ color: 'rgba(255,255,255,0.9)', fontWeight: '500' }}>{value}</span>}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        border: '1px solid rgba(59,130,246,0.4)',
                        borderRadius: '12px',
                        backdropFilter: 'blur(16px)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                      }}
                      itemStyle={{ color: '#3b82f6' }}
                      labelStyle={{ color: 'rgba(255,255,255,0.95)', fontWeight: 'bold' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="col-span-6">
              <CardContent>
                <h2 className="font-semibold text-lg mb-4 text-white">
                  Fishing Conditions
                </h2>
                <div className="relative h-[200px] flex items-center justify-center">
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
                        <div className="text-5xl font-bold text-white mb-1">{fishingScore}</div>
                        <div className="text-lg font-semibold" style={{ color: getConditionColor(fishingScore) }}>
                          {getConditionLabel(fishingScore)}
                        </div>
                        <div className="text-xs text-white/60 mt-1">{temperature}°C</div>
                      </div>
                    </>
                  )}
                </div>

                {/* Legend */}
                <div className="grid grid-cols-4 gap-2 mt-4 text-xs text-white/70">
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
          </div>
        </div>
      </PageLayout>
    </div>
  );
}