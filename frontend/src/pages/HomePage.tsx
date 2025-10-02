import { useEffect, useState } from "react";
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import PageLayout from "../components/PageLayout"; // Import the new PageLayout component
import { Card, CardContent } from "../components/ui/card";
import AIAssistant from "../components/AIAssistant";
import PricePrediction from "../components/PricePrediction";
import DashboardSummary from "../components/DashboardSummary";
import { Search, Fish, MessageCircle, ChevronUp, ChevronDown } from "lucide-react";

// Dummy data with percentages integrated
const fishData = [
  { id: "#F-001", fish: "Tuna", date: "31/01/2025", percentage: 28 },
  { id: "#F-002", fish: "Eel", date: "31/01/2025", percentage: 21 },
  { id: "#F-003", fish: "Sea Urchin", date: "31/01/2025", percentage: 34 },
  { id: "#F-004", fish: "Mackerel", date: "31/01/2025", percentage: 17 },
];

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

type SortKey = 'id' | 'fish' | 'percentage' | 'date';
type SortDirection = 'asc' | 'desc';

export default function HomePage({ isHomePageVisible }: { isHomePageVisible: boolean }) {
  const [weather, setWeather] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fishingScore, setFishingScore] = useState<number>(0);
  const [temperature, setTemperature] = useState<number>(0);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Fetch CTS data
  const assessments = useQuery(api.ctsAssessments.getByUserId, { userId: USER_ID });

  // Get latest CTS assessment
  const latestAssessment = assessments && assessments.length > 0
    ? assessments.reduce((latest: any, current: any) =>
        current.timestamp > latest.timestamp ? current : latest
      )
    : null;

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const sortedFishData = [...fishData].sort((a, b) => {
    let comparison = 0;

    if (sortKey === 'id') {
      comparison = a.id.localeCompare(b.id);
    } else if (sortKey === 'fish') {
      comparison = a.fish.localeCompare(b.fish);
    } else if (sortKey === 'percentage') {
      comparison = a.percentage - b.percentage;
    } else if (sortKey === 'date') {
      comparison = a.date.localeCompare(b.date);
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const SortIcon = ({ columnKey }: { columnKey: SortKey }) => {
    if (sortKey !== columnKey) {
      return <ChevronUp className="w-3 h-3 inline ml-1 opacity-20" />;
    }
    return sortDirection === 'asc' ?
      <ChevronUp className="w-3 h-3 inline ml-1" /> :
      <ChevronDown className="w-3 h-3 inline ml-1" />;
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

              {/* Header Labels */}
              <div className="flex justify-between items-center text-xs font-semibold text-white/60 uppercase tracking-wider px-2 pb-2 border-b border-white/30">
                <button
                  onClick={() => handleSort('id')}
                  className="w-16 text-left hover:text-cyan-400 transition-colors"
                >
                  ID<SortIcon columnKey="id" />
                </button>
                <button
                  onClick={() => handleSort('fish')}
                  className="flex-1 text-center hover:text-cyan-400 transition-colors"
                >
                  Fish<SortIcon columnKey="fish" />
                </button>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleSort('percentage')}
                    className="w-12 text-right whitespace-nowrap hover:text-cyan-400 transition-colors"
                  >
                    Catch %<SortIcon columnKey="percentage" />
                  </button>
                  <button
                    onClick={() => handleSort('date')}
                    className="w-20 text-right hover:text-cyan-400 transition-colors"
                  >
                    Date<SortIcon columnKey="date" />
                  </button>
                </div>
              </div>

              <ul className="space-y-1 mt-1">
                {sortedFishData.map((f) => (
                  <li
                    key={f.id}
                    className="flex justify-between items-center text-sm border-b border-white/20 py-3 hover:bg-white/10 hover:border-cyan-400/40 rounded-lg px-2 transition-all cursor-pointer group"
                  >
                    <span className="text-cyan-400 font-mono group-hover:text-cyan-300 w-16">{f.id}</span>
                    <span className="text-white font-medium group-hover:text-cyan-100 flex-1 text-center">{f.fish}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-cyan-400 text-sm font-semibold w-12 text-right">{f.percentage}%</span>
                      <span className="text-white/60 text-xs group-hover:text-white/80 w-20 text-right">{f.date}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Price Predictions */}
          <Card className="col-span-8">
            <PricePrediction />
          </Card>
        </div>
      </PageLayout>
      </div>
    </>
  );
}