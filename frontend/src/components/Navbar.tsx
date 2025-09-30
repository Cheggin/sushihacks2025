import React from "react";
import { Bell, Settings } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-6 py-3 bg-gradient-to-r from-blue-300 to-blue-500 shadow-md rounded-b-2xl">
      {/* Left: Logo */}
      <div className="flex items-center gap-2">
        <img src="/logo.png" alt="Logo" className="h-8 w-8" />
        <span className="text-white font-bold text-lg">CARP</span>
      </div>

      {/* Middle: Nav links */}
      <div className="flex gap-6 text-white font-medium">
        <a href="homepage" className="hover:text-blue-100">Dashboard</a>
        <a href="map" className="hover:text-blue-100">Map</a>
        <a href="#" className="hover:text-blue-100">My Fish</a>
        <a href="dashboard" className="hover:text-blue-100">Health</a>
        <a href="#" className="hover:text-blue-100">Send out fish</a>
      </div>

      {/* Right: Notifications + Profile */}
      <div className="flex items-center gap-4">
        <button className="text-white hover:text-blue-100">
          <Bell className="w-5 h-5" />
        </button>
        <button className="text-white hover:text-blue-100">
          <Settings className="w-5 h-5" />
        </button>
        <img
          src="/avatar.png"
          alt="User"
          className="h-8 w-8 rounded-full border-2 border-white"
        />
      </div>
    </nav>
  );
}