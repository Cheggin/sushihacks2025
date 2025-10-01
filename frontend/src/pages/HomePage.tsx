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
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { Search, Fish } from "lucide-react";

// Dummy data
const fishData = [
  { id: "#F-001", fish: "Tuna", date: "31/01/2025" },
  { id: "#F-002", fish: "Salmon", date: "31/01/2025" },
  { id: "#F-003", fish: "Mackerel", date: "31/01/2025" },
  { id: "#F-004", fish: "Sardine", date: "31/01/2025" },
];

const kpiData = [
  { month: "Jan", cases: 20 },
  { month: "Feb", cases: 30 },
  { month: "Mar", cases: 25 },
  { month: "Apr", cases: 40 },
  { month: "May", cases: 45 },
  { month: "Jun", cases: 50 },
  { month: "Jul", cases: 56 },
  { month: "Aug", cases: 42 },
  { month: "Sep", cases: 47 },
  { month: "Oct", cases: 38 },
  { month: "Nov", cases: 43 },
  { month: "Dec", cases: 39 },
];

const onboardData = [
  { name: "Tuna", value: 8 },
  { name: "Eel", value: 6 },
  { name: "Sea Urchin", value: 10 },
  { name: "Mackerel", value: 5 },
];
const COLORS = ["#4e79a7", "#82ca9d", "#ffc658", "#8884d8"];

const turnaroundData = [
  { time: "0–12h", value: 5 },
  { time: "13–24h", value: 8 },
  { time: "25–36h", value: 16 },
  { time: "37–48h", value: 7 },
  { time: ">48h", value: 4 },
];

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
        } else {
          setWeather("No weather");
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
                <h2 className="font-semibold text-lg flex items-center gap-2 text-black">
                  <Fish className="w-5 h-5 text-blue-600" /> Top Fish to Fish (14)
                </h2>
                <span className="text-sm text-gray-500">24h</span>
              </div>

              <div className="flex items-center bg-gray-100 rounded-lg px-2 mb-4">
                <Search className="w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search fish..."
                  className="bg-transparent w-full px-2 py-1 outline-none text-sm"
                />
              </div>

              <ul>
                {fishData.map((f) => (
                  <li key={f.id} className="flex justify-between text-sm border-b py-2 hover:bg-gray-50">
                    <span className="text-blue-600">{f.id}</span>
                    <span className="text-black">{f.fish}</span>
                    <span className="text-gray-500">{f.date}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Right chart area */}
          <div className="col-span-9 grid grid-cols-12 gap-6">
            <Card className="col-span-12">
              <CardContent>
                <h2 className="font-semibold text-lg mb-2 text-black">KPI Trend Overview</h2>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={kpiData}>
                    <XAxis dataKey="month" stroke="#555" />
                    <YAxis stroke="#555" />
                    <Tooltip />
                    <Line type="monotone" dataKey="cases" stroke="#4e79a7" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="col-span-6">
              <CardContent>
                <h2 className="font-semibold text-lg mb-2 text-black">Fish Types</h2>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={onboardData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label>
                      {onboardData.map((entry, idx) => (
                        <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend layout="vertical" align="left" verticalAlign="middle" iconType="circle" iconSize={8} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="col-span-6">
              <CardContent>
                <h2 className="font-semibold text-lg mb-2 text-black">Turnaround Time</h2>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={turnaroundData}>
                    <XAxis dataKey="time" stroke="#555" />
                    <YAxis stroke="#555" />
                    <Tooltip />
                    <Bar dataKey="value" fill="#4e79a7" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      </PageLayout>
    </div>
  );
}