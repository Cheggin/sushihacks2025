import React, { useEffect, useState } from "react";
import PageLayout from "../components/PageLayout";
import { Card, CardContent } from "../components/ui/card";
import DashboardSummary from "../components/DashboardSummary";
import AIAssistant from "../components/AIAssistant";
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
import { Search, Fish, MessageCircle } from "lucide-react";

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
    case 0:
      return "☀️";
    case 1:
      return "🌤️";
    case 2:
      return "⛅";
    case 3:
      return "🌥️";
    case 45:
    case 48:
      return "🌫️";
    case 51:
    case 53:
    case 55:
      return "🌧️";
    case 61:
    case 63:
    case 65:
      return "🌦️";
    case 71:
    case 73:
    case 75:
      return "🌨️";
    case 80:
    case 81:
    case 82:
      return "🌧️";
    case 95:
    case 96:
    case 99:
      return "🌩️";
    default:
      return "🌫️";
  }
};

export default function HomePage({ isHomePageVisible }: { isHomePageVisible: boolean }) {
  const [weather, setWeather] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fishingScore, setFishingScore] = useState<number>(0);
  const [temperature, setTemperature] = useState<number>(0);
  const [showAIAssistant, setShowAIAssistant] = useState(false);

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
    <>
      {showAIAssistant && (
        <AIAssistant
          onClose={() => setShowAIAssistant(false)}
          ctsData={null}
        />
      )}
      <div
        className={`${
          isHomePageVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        } transition-all duration-500 ease-in-out h-full`}
      >
        <PageLayout
          title="Dashboard"
          rightText={
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowAIAssistant(true)}
                className="bg-cyan-500 hover:bg-cyan-600 text-white font-medium px-4 py-2 rounded-lg transition-all shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 flex items-center gap-2 text-sm"
              >
                <MessageCircle className="w-4 h-4" />
                Ask AI Assistant
              </button>
              <span>
                {loading ? "Loading weather..." : error ? <span style={{ color: "var(--text-secondary)" }}>{error}</span> : weather}
              </span>
            </div>
          }
        >
        {/* Page content */}
        <div className="grid grid-cols-12 gap-4">
          {/* Dashboard Summary - Today's Summary Box */}
          <DashboardSummary
            ctsData={null}
            fishingScore={fishingScore}
            temperature={temperature}
          />

          {/* Left list */}
          <Card className="col-span-3">
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <h2 style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 600, fontSize: "1.125rem", color: "var(--text-primary)" }}>
                  <Fish style={{ width: 20, height: 20, color: "var(--text-secondary)" }} />
                  <span>Top Fish to Fish (14)</span>
                </h2>
                <span style={{ color: "var(--text-secondary)", fontSize: 12, fontWeight: 500 }}>24h</span>
              </div>

              <div
                className="flex items-center rounded-lg px-3 py-2 mb-4 border transition-all"
                style={{
                  backgroundColor: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <Search style={{ width: 16, height: 16, color: "var(--text-secondary)" }} />
                <input
                  type="text"
                  placeholder="Search fish..."
                  className="bg-transparent w-full px-2 py-1 outline-none text-sm placeholder:text-[var(--muted)]"
                  style={{ color: "var(--text-primary)" }}
                />
              </div>

              <ul className="space-y-1">
                {fishData.map((f) => (
                  <li
                    key={f.id}
                    className="flex justify-between text-sm border-b py-3 hover:bg-white/5 rounded-lg px-2 transition-all cursor-pointer group"
                    style={{ borderBottomColor: "rgba(255,255,255,0.06)" }}
                  >
                    <span style={{ fontFamily: "monospace", color: "var(--text-secondary)" }}>{f.id}</span>
                    <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{f.fish}</span>
                    <span style={{ color: "var(--muted)", fontSize: 12 }}>{f.date}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Right chart area */}
          <div className="col-span-9 grid grid-cols-12 gap-4">
            <Card className="col-span-12">
              <CardContent>
                <h2 style={{ fontWeight: 600, marginBottom: 12, color: "var(--text-primary)" }}>Number of Fish Caught per Month</h2>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={catchData}>
                    <defs>
                      <linearGradient id="colorCaught" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="month"
                      stroke="var(--text-secondary)"
                      tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
                      axisLine={{ stroke: "rgba(0,0,0,0.08)" }}
                    />
                    <YAxis
                      stroke="var(--text-secondary)"
                      tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
                      axisLine={{ stroke: "rgba(0,0,0,0.08)" }}
                      label={{ value: "Fish Caught", angle: -90, position: "insideLeft", fill: "var(--text-secondary)" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(15, 23, 42, 0.95)",
                        border: "1px solid rgba(6,182,212,0.4)",
                        borderRadius: "12px",
                        backdropFilter: "blur(16px)",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                      }}
                      itemStyle={{ color: "#06b6d4" }}
                      labelStyle={{ color: "rgba(255,255,255,0.95)", fontWeight: "bold" }}
                      formatter={(value) => [`${value} fish`, "Caught"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="caught"
                      stroke="#06b6d4"
                      strokeWidth={3}
                      dot={{ fill: "#06b6d4", r: 5, strokeWidth: 2, stroke: "#0891b2" }}
                      activeDot={{ r: 7, fill: "#06b6d4", stroke: "#fff", strokeWidth: 2 }}
                      fill="url(#colorCaught)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="col-span-6">
              <CardContent>
                <h2 style={{ fontWeight: 600, marginBottom: 12, color: "var(--text-primary)" }}>Fish Types</h2>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={onboardData}
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${((percent as number) * 100).toFixed(0)}%`}
                      labelLine={{ stroke: "rgba(0,0,0,0.1)", strokeWidth: 1 }}
                    >
                      {onboardData.map((entry, idx) => (
                        <Cell key={idx} fill={COLORS[idx % COLORS.length]} stroke="rgba(0,0,0,0.06)" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Legend
                      layout="vertical"
                      align="right"
                      verticalAlign="middle"
                      iconType="circle"
                      iconSize={10}
                      wrapperStyle={{ paddingLeft: "20px", fontSize: "13px" }}
                      formatter={(value) => <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{value}</span>}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(15, 23, 42, 0.95)",
                        border: "1px solid rgba(59,130,246,0.4)",
                        borderRadius: "12px",
                        backdropFilter: "blur(16px)",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                      }}
                      itemStyle={{ color: "#3b82f6" }}
                      labelStyle={{ color: "rgba(255,255,255,0.95)", fontWeight: "bold" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="col-span-6">
              <CardContent>
                <h2 style={{ fontWeight: 600, marginBottom: 12, color: "var(--text-primary)" }}>Fishing Conditions</h2>
                <div className="relative h-[160px] flex items-center justify-center">
                  {loading ? (
                    <div style={{ color: "var(--muted)" }}>Loading...</div>
                  ) : (
                    <>
                      <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart
                          cx="50%"
                          cy="50%"
                          innerRadius="70%"
                          outerRadius="90%"
                          barSize={20}
                          data={[{ name: "Score", value: fishingScore, fill: getConditionColor(fishingScore) }]}
                          startAngle={180}
                          endAngle={0}
                        >
                          <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                          <RadialBar background={{ fill: "rgba(0,0,0,0.04)" }} dataKey="value" cornerRadius={10} />
                        </RadialBarChart>
                      </ResponsiveContainer>

                      {/* Center text overlay */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <div style={{ fontSize: 28, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>{fishingScore}</div>
                        <div className="font-semibold" style={{ color: getConditionColor(fishingScore) }}>
                          {getConditionLabel(fishingScore)}
                        </div>
                        <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>{temperature}°C</div>
                      </div>
                    </>
                  )}
                </div>

                {/* Legend */}
                <div className="grid grid-cols-4 gap-2 mt-3 text-xs" style={{ color: "var(--text-primary)" }}>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#06b6d4" }}></div>
                    <span>Excellent</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#10b981" }}></div>
                    <span>Good</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#f59e0b" }}></div>
                    <span>Fair</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#ef4444" }}></div>
                    <span>Poor</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </PageLayout>
      </div>
    </>
  );
}
