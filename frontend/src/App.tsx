import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar"; // Import Navbar here
import HomePage from "./pages/HomePage";
import Landing from './pages/Landing';
import FishMapPage from './pages/FishMapPage';
import Health from "./pages/Health";

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1d3f8b] via-[#2b6cb0] to-[#2563eb]"> {/* Background color here */}
      <Navbar /> {/* Navbar stays on top, above the background */}
      
      {/* Main content */}
      <main className="flex-1 p-6">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/map" element={<FishMapPage />} />
          <Route path="/health" element={<Health />} />
          <Route path="/homepage" element={<HomePage />} />
        </Routes>
      </main>
    </div>
  );
}