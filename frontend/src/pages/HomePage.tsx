import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from "recharts";
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
  { name: "Mackeral", value: 5 },
];
const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#4e79a7"];

const turnaroundData = [
  { time: "0–12h", value: 5 },
  { time: "13–24h", value: 8 },
  { time: "25–36h", value: 16 },
  { time: "37–48h", value: 7 },
  { time: ">48h", value: 4 },
];

const LATITUDE = 35.5311; // Hardcoded latitude
const LONGITUDE = 139.8894; // Hardcoded longitude

// Map weather codes to emojis
const weatherCodeToEmoji = (code: number): string => {
  switch (code) {
    case 0:
      return "☀️"; // Clear sky
    case 1:
      return "🌤️"; // Mainly clear
    case 2:
      return "⛅"; // Partly cloudy
    case 3:
      return "🌥️"; // Overcast
    case 45:
      return "🌫️"; // Fog
    case 48:
      return "🌫️"; // Depositing rime fog
    case 51:
      return "🌧️"; // Light drizzle
    case 53:
      return "🌧️"; // Moderate drizzle
    case 55:
      return "🌧️"; // Heavy drizzle
    case 61:
      return "🌦️"; // Light rain showers
    case 63:
      return "🌦️"; // Moderate rain showers
    case 65:
      return "🌧️"; // Heavy rain showers
    case 71:
      return "🌨️"; // Light snow showers
    case 73:
      return "🌨️"; // Moderate snow showers
    case 75:
      return "❄️"; // Heavy snow showers
    case 80:
      return "🌧️"; // Light rain
    case 81:
      return "🌧️"; // Moderate rain
    case 82:
      return "🌧️"; // Heavy rain
    case 95:
      return "🌩️"; // Thunderstorm
    case 96:
      return "🌩️"; // Thunderstorm with light hail
    case 99:
      return "🌩️"; // Thunderstorm with heavy hail
    default:
      return "🌫️"; // Default to fog if unknown code
  }
};

export default function HomePage() {
  // States for weather data and loading/error states
  const [weather, setWeather] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch weather data
  useEffect(() => {
    const fetchWeatherData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${LATITUDE}&longitude=${LONGITUDE}&current_weather=true&timezone=Asia/Tokyo`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch weather data");
        }

        const data = await response.json();
        const { current_weather } = data;

        if (current_weather) {
          const weatherEmoji = weatherCodeToEmoji(current_weather.weathercode);
          setWeather(`${weatherEmoji} ${current_weather.temperature}°C`);
        } else {
          setWeather("Unable to fetch weather data.");
        }
      } catch (err) {
        setError("Error fetching weather data.");
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-blue-300 to-blue-500 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <div className="flex gap-4 text-white">
          {/* Display loading, weather, or error */}
          {loading ? (
            <span>Loading weather...</span>
          ) : error ? (
            <span className="text-red-500">{error}</span>
          ) : (
            <span>{weather}</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Top Fish List */}
        <Card className="col-span-3 rounded-2xl shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <Fish className="w-5 h-5" /> Top Fish to Fish (14)
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
              {fishData.map((fish) => (
                <li
                  key={fish.id}
                  className="flex justify-between text-sm border-b py-2 hover:bg-gray-50 cursor-pointer"
                >
                  <span className="text-blue-600">{fish.id}</span>
                  <span>{fish.fish}</span>
                  <span className="text-gray-500">{fish.date}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Charts & Stats */}
        <div className="col-span-9 grid grid-cols-12 gap-6">
          {/* KPI Trend */}
          <Card className="col-span-12 rounded-2xl shadow-lg">
            <CardContent className="p-4">
              <h2 className="font-bold text-lg mb-2">KPI Trend Overview</h2>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={kpiData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="cases" stroke="#4e79a7" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Fish Types */}
          <Card className="col-span-6 rounded-2xl shadow-lg">
            <CardContent className="p-4">
              <h2 className="font-bold text-lg mb-2">Fish Types</h2>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={onboardData}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                    label
                  >
                    {onboardData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend
                    layout="vertical"
                    align="left"
                    verticalAlign="middle"
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{
                      position: 'absolute',
                      left: '20px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontSize: '12px',
                      paddingLeft: '10px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Turnaround Time */}
          <Card className="col-span-6 rounded-2xl shadow-lg">
            <CardContent className="p-4">
              <h2 className="font-bold text-lg mb-2">Turnaround Time</h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={turnaroundData}>
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#4e79a7" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}