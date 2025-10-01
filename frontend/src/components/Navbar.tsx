import React from "react";
import { Link } from "react-router-dom";

interface NavbarProps {
  togglePopup: (page: string) => void;
}

export default function Navbar({ togglePopup }: NavbarProps) {
  return (
    <nav className="mx-6 flex items-center justify-between px-2 py-6 z-20">
      <div className="flex items-center gap-3 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-md px-4 py-2 mr-16 h-[50px]">
        <img src="/logo.png" alt="logo" className="h-8 w-8" />
        <span className="text-white font-bold">CARP</span>
      </div>

      <div className="flex gap-12 h-[50px] items-center text-white font-medium rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-md px-4 py-2">
        <button
          onClick={() => togglePopup("homepage")}
          className="hover:text-blue-100"
        >
          Dashboard
        </button>
        <button
          onClick={() => togglePopup("map")}
          className="hover:text-blue-100"
        >
          Map
        </button>
        <button
          onClick={() => togglePopup("health")}
          className="hover:text-blue-100"
        >
          Health
        </button>
      </div>

      <div className="flex items-center gap-4 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-md px-4 py-2 ml-16 h-[50px]">
        <button className="text-white hover:text-blue-100">Bell</button>
        <button className="text-white hover:text-blue-100">Settings</button>
        <img src="/avatar.png" alt="user" className="h-8 w-8 rounded-full border-2 border-white" />
      </div>
    </nav>
  );
}