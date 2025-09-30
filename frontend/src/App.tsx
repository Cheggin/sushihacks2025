import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import Landing from './pages/Landing';
import FishMapPage from './pages/FishMapPage';
import Dashboard from './pages/Dashboard';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 p-6">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/map" element={<FishMapPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/homepage" element={<HomePage />} />
        </Routes>
      </main>
    </div>
  );
}