import React, { useEffect, useState } from "react";
import PageLayout from "../components/PageLayout";
import { Card, CardContent } from "../components/ui/card";
import DashboardSummary from "../components/DashboardSummary";
import AIAssistant from "../components/AIAssistant";
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
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
import { Fish, MessageCircle, Palette } from "lucide-react";

// User ID - In production, this would come from authentication
const USER_ID = 'user_001';

interface RankedFish {
  scientific_name: string;
  rank: number;
  cleaning_difficulty: string;
  commonality: string;
  peak_season: string;
  is_edible: boolean;
  score: number;
}

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

interface FishingConditions {
  temp: number;
  weatherCode: number;
  date?: Date; // parsed from API timestamp
  timeOfDay?: number;
  windSpeed?: number;
}

const calculateFishingScore = ({
  temp,
  weatherCode,
  date = new Date(),
  timeOfDay = date.getHours(),
  windSpeed
}: FishingConditions): number => {
  let score = 50;

  // ---- Temperature curve: ideal ~22°C
  const tempPenalty = Math.pow(temp - 22, 2) * 0.5;
  score -= tempPenalty;

  // ---- Weather conditions
  if ([0, 1].includes(weatherCode)) score += 20;
  else if ([2, 3].includes(weatherCode)) score += 10;
  else if (weatherCode >= 61 && weatherCode <= 67) score -= 25;
  else if (weatherCode >= 80 && weatherCode <= 86) score -= 30;
  else if (weatherCode >= 95) score -= 40;

  // ---- Time of day
  if (timeOfDay >= 5 && timeOfDay <= 9) score += 10;
  else if (timeOfDay >= 16 && timeOfDay <= 19) score += 8;
  else if (timeOfDay >= 0 && timeOfDay <= 4) score -= 10;
  else score -= 5;

  // ---- Season
  const month = date.getMonth();
  if ([5, 6, 7].includes(month)) score += 10; // Summer
  else if ([3, 4].includes(month)) score += 5; // Spring
  else if ([10, 11, 0].includes(month)) score -= 5; // Winter

  // ---- Wind
  if (typeof windSpeed === 'number') {
    if (windSpeed > 12) score -= 15;
    else if (windSpeed > 8) score -= 10;
    else if (windSpeed < 3) score += 5;
  }

  return Math.round(Math.max(0, Math.min(100, score)));
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

export default function HomePage({ isHomePageVisible, togglePopup }: { isHomePageVisible: boolean; togglePopup: (page: string) => void }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fishingScore, setFishingScore] = useState<number>(0);
  const [temperature, setTemperature] = useState<number>(0);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [rankedFish, setRankedFish] = useState<RankedFish[]>([]);
  const [fishLoading, setFishLoading] = useState(true);
  const [colorMode, setColorMode] = useState<"color" | "bw">(() => {
    const saved = localStorage.getItem("theme");
    return (saved as "color" | "bw") || "color";
  });

  // Fetch most recent CTS assessment
  const latestAssessment = useQuery(api.ctsAssessments.getMostRecent, { userId: USER_ID });

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

  const toggleColorMode = () => {
    const newMode = colorMode === "color" ? "bw" : "color";
    setColorMode(newMode);
    localStorage.setItem("theme", newMode);
    document.documentElement.setAttribute("data-theme", newMode);
  };

  const getColorLabel = () => {
    return colorMode === "color" ? "Dark" : "Light";
  };

  // Apply saved theme on mount
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", colorMode);
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
          setTemperature(cw.temperature);

          // Parse time from Open-Meteo API (ISO 8601 format)
          const currentDate = new Date(cw.time);
          const currentHour = currentDate.getHours();

          // Enhanced score calculation
          const score = calculateFishingScore({
            temp: cw.temperature,
            weatherCode: cw.weathercode,
            date: currentDate,
            timeOfDay: currentHour,
            windSpeed: cw.windspeed,
          });

          setFishingScore(score);
        } else {
          setTemperature(0);
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


  // Fetch top fish rankings
  useEffect(() => {
    const fetchFishRankings = async () => {
      setFishLoading(true);
      try {
        const response = await fetch('http://localhost:8000/fish-ranking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fish_list: [
              "Thunnus albacares",    // Yellowfin Tuna
              "Oncorhynchus keta",    // Chum Salmon
              "Scomber japonicus",    // Mackerel
              "Sardinops sagax",      // Sardine
              "Katsuwonus pelamis",   // Skipjack Tuna
              "Seriola quinqueradiata", // Yellowtail
              "Engraulis japonicus",  // Japanese Anchovy
            ]
          })
        });

        if (!response.ok) throw new Error('Failed to fetch fish rankings');

        const data = await response.json();
        // Convert response object to array with scientific names
        const ranked: RankedFish[] = Object.entries(data).map(([scientificName, fishData]: [string, any]) => ({
          scientific_name: scientificName,
          ...fishData
        }));
        // Sort by rank and take top 14
        const sorted = ranked.sort((a, b) => a.rank - b.rank).slice(0, 14);
        setRankedFish(sorted);
      } catch (err) {
        console.error('Error fetching fish rankings:', err);
      } finally {
        setFishLoading(false);
      }
    };

    fetchFishRankings();
  }, []);

  // Transform latestAssessment to match DashboardSummary's expected format
  const ctsData = latestAssessment ? {
    severity: latestAssessment.predictedClass,
    gripStrength: latestAssessment.gripStrength,
    pinchStrength: latestAssessment.pinchStrength,
    lastAssessment: new Date(latestAssessment.timestamp),
  } : null;

  return (
    <>
      {showAIAssistant && (
        <AIAssistant
          onClose={() => setShowAIAssistant(false)}
          ctsData={ctsData}
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
              <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg border border-white/10">
                <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  {loading ? "..." : error ? "N/A" : `☀️ ${temperature.toFixed(1)}°C`}
                </span>
              </div>
              <button
                onClick={toggleColorMode}
                className="flex items-center gap-2 transition-colors hover:opacity-80"
                style={{ color: "white" }}
              >
                <Palette className="w-4 h-4" />
                <span className="text-sm">{getColorLabel()}</span>
              </button>
            </div>
          }
          togglePopup={togglePopup}
        >
        {/* Page content */}
        <div className="grid grid-cols-12 gap-2">
          {/* Dashboard Summary - Today's Summary Box */}
          <DashboardSummary
            ctsData={ctsData}
            fishingScore={fishingScore}
            temperature={temperature}
          />

          {/* Left list */}
          <Card className="col-span-3">
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <h2 style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 600, fontSize: "1.125rem", color: "var(--text-primary)" }}>
                  <Fish style={{ width: 20, height: 20, color: "var(--text-secondary)" }} />
                  <span>Top Fish to Fish ({rankedFish.length})</span>
                </h2>
                <span style={{ color: "var(--text-secondary)", fontSize: 12, fontWeight: 500 }}>Ranked</span>
              </div>

              {fishLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div style={{ color: "var(--text-secondary)" }}>Loading...</div>
                </div>
              ) : (
                <ul className="space-y-1 max-h-[520px] overflow-y-auto">
                  {rankedFish.map((fish) => {
                    // Map scientific name to common name
                    const commonNames: { [key: string]: string } = {
                      "Thunnus albacares": "Yellowfin Tuna",
                      "Oncorhynchus keta": "Chum Salmon",
                      "Scomber japonicus": "Mackerel",
                      "Sardinops sagax": "Sardine",
                      "Katsuwonus pelamis": "Skipjack Tuna",
                      "Seriola quinqueradiata": "Yellowtail",
                      "Engraulis japonicus": "Japanese Anchovy"
                    };
                    const commonName = commonNames[fish.scientific_name] || fish.scientific_name;

                    // Calculate formula components based on actual backend logic
                    // Formula: score = (is_edible * commonality) / (peak_season_score + cleaning_difficulty)
                    const edibleMultiplier = fish.is_edible ? 1 : 0;
                    const commonalityValue = fish.commonality === "rare" ? 1 : fish.commonality === "uncommon" ? 2 : 3;
                    const cleaningValue = fish.cleaning_difficulty === "easy" ? 1 : fish.cleaning_difficulty === "medium" ? 2 : 3;
                    // Calculate peak_season_score from the formula: peak_season_score = (edible * commonality) / score - cleaning_difficulty
                    const peakSeasonScore = edibleMultiplier > 0 && fish.score > 0
                      ? Math.max(1, (edibleMultiplier * commonalityValue) / fish.score - cleaningValue)
                      : 1;

                    return (
                      <li
                        key={fish.scientific_name}
                        className="flex flex-col text-sm border-b py-2 hover:bg-white/5 rounded-lg px-2 transition-all cursor-pointer group"
                        style={{ borderBottomColor: "rgba(255,255,255,0.06)" }}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-start gap-2 flex-1">
                            <span style={{ color: "var(--text-secondary)", fontSize: 11, fontWeight: 600, minWidth: 20 }}>#{fish.rank}</span>
                            <div className="flex flex-col gap-0.5">
                              <span style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: 13 }} className="group-hover:text-cyan-400 transition-colors">
                                {commonName}
                              </span>
                              <span style={{ color: "var(--muted)", fontSize: 9, fontStyle: "italic" }}>{fish.scientific_name}</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-0.5">
                            <div className="flex items-center gap-1 px-2 py-1 rounded-md" style={{ backgroundColor: "rgba(6, 182, 212, 0.15)", border: "1px solid rgba(6, 182, 212, 0.3)" }}>
                              <span style={{ color: "#06b6d4", fontSize: 11, fontWeight: 700 }}>
                                {fish.score.toFixed(3)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Score Formula Display */}
                        <div className="mt-2 px-2 py-1.5 rounded-md" style={{ backgroundColor: "rgba(6, 182, 212, 0.05)", border: "1px solid rgba(6, 182, 212, 0.15)" }}>
                          <div className="flex items-center gap-1 flex-wrap text-[10px]" style={{ color: "var(--text-secondary)", fontFamily: "monospace" }}>
                            <span style={{ color: "#06b6d4", fontWeight: 700 }}>Score:</span>
                            <span>(</span>
                            <span style={{ color: fish.is_edible ? "#10b981" : "#ef4444", fontWeight: 600 }} title="is_edible: 1 if true, 0 if false">{edibleMultiplier}</span>
                            <span>×</span>
                            <span style={{ color: "#8b5cf6", fontWeight: 600 }} title="commonality: rare=1, uncommon=2, common=3">{commonalityValue}</span>
                            <span>) ÷ (</span>
                            <span style={{ color: "#f59e0b", fontWeight: 600 }} title="peak_season_score: 1 if in season, up to 6 if far from season">{peakSeasonScore.toFixed(1)}</span>
                            <span>+</span>
                            <span style={{ color: "#ec4899", fontWeight: 600 }} title="cleaning_difficulty: easy=1, medium=2, hard=3">{cleaningValue}</span>
                            <span>) =</span>
                            <span style={{ color: "#06b6d4", fontWeight: 700, fontSize: 11 }}>{fish.score.toFixed(3)}</span>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Right chart area */}
          <div className="col-span-9 grid grid-cols-12 gap-2">
            <Card className="col-span-12">
              <CardContent>
                <h2 style={{ fontWeight: 600, marginBottom: 8, color: "var(--text-primary)" }}>Number of Fish Caught per Month</h2>
                <ResponsiveContainer width="100%" height={130}>
                  <LineChart data={catchData} margin={{ left: 20, right: 10, top: 5, bottom: 5 }}>
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
                      label={{ value: "Fish Caught", angle: -90, position: "insideLeft", fill: "var(--text-secondary)", offset: -5 }}
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
                <h2 style={{ fontWeight: 600, marginBottom: 8, color: "var(--text-primary)" }}>Fish Types</h2>
                <ResponsiveContainer width="100%" height={140}>
                  <PieChart>
                    <Pie
                      data={onboardData}
                      cx="50%"
                      cy="50%"
                      outerRadius={50}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={{ stroke: "rgba(255,255,255,0.2)", strokeWidth: 1 }}
                    >
                      {onboardData.map((entry, idx) => (
                        <Cell key={idx} fill={COLORS[idx % COLORS.length]} stroke="rgba(0,0,0,0.06)" strokeWidth={2} />
                      ))}
                    </Pie>
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
                <h2 style={{ fontWeight: 600, marginBottom: 8, color: "var(--text-primary)" }}>Fishing Conditions</h2>
                <div className="relative h-[120px] flex items-center justify-center">
                  {loading ? (
                    <div style={{ color: "var(--muted)" }}>Loading...</div>
                  ) : (
                    <>
                      <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart
                          cx="50%"
                          cy="50%"
                          innerRadius="75%"
                          outerRadius="95%"
                          barSize={16}
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
                        <div style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)", marginBottom: 2 }}>{fishingScore}</div>
                        <div className="font-semibold text-sm" style={{ color: getConditionColor(fishingScore) }}>
                          {getConditionLabel(fishingScore)}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>{temperature}°C</div>
                      </div>
                    </>
                  )}
                </div>

                {/* Legend */}
                <div className="grid grid-cols-4 gap-1 mt-2" style={{ color: "var(--text-primary)", fontSize: "10px" }}>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#06b6d4" }}></div>
                    <span>Excellent</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#10b981" }}></div>
                    <span>Good</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#f59e0b" }}></div>
                    <span>Fair</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#ef4444" }}></div>
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
