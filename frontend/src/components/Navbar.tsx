import React from "react";
import { Bell, Settings } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="mx-6 flex items-center justify-between px-2 py-6 z-20">
      {/* Left: Logo */}
      <div className="flex items-center gap-3 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-md px-4 py-2 mr-16 h-[50px]">
        <img src="/logo.png" alt="logo" className="h-8 w-8" />
        <span className="text-white font-bold">CARP</span>
      </div>

      {/* Center: Navigation Links */}
      <div className="flex gap-12 h-[50px] items-center text-white font-medium rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-md px-4 py-2">
        <a href="/homepage" className="hover:text-blue-100">Dashboard</a>
        <a href="/map" className="hover:text-blue-100">Map</a>
        <a href="#" className="hover:text-blue-100">My Fish</a>
        <a href="/health" className="hover:text-blue-100">Health</a>
        <a href="#" className="hover:text-blue-100">Send out fish</a>
      </div>

      {/* Right: Notifications, Settings, and Profile */}
      <div className="flex items-center gap-4 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-md px-4 py-2 ml-16 h-[50px]">
        <button className="text-white hover:text-blue-100">
          <Bell className="w-5 h-5" />
        </button>
        <button className="text-white hover:text-blue-100">
          <Settings className="w-5 h-5" />
        </button>
        <img src="/avatar.png" alt="user" className="h-8 w-8 rounded-full border-2 border-white" />
      </div>
    </nav>
  );
}