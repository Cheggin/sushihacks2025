import React, { useState } from "react";
import { Palette } from "lucide-react";

interface NavbarProps {
  togglePopup: (page: string) => void;
}

export default function Navbar({ togglePopup }: NavbarProps) {
  const [colorMode, setColorMode] = useState<'color' | 'bw'>('color');

  const toggleColorMode = () => {
    const newMode = colorMode === 'color' ? 'bw' : 'color';
    setColorMode(newMode);

    // Apply color theme to document
    document.documentElement.setAttribute('data-theme', newMode);
  };

  const getColorLabel = () => {
    return colorMode === 'color' ? 'Color' : 'B&W';
  };

  return (
    <nav className="mx-6 flex items-center justify-between px-2 py-6 relative">
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
          onClick={() => togglePopup("health")}
          className="hover:text-blue-100"
        >
          Health
        </button>
      </div>

      <div className="flex items-center gap-4 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-md px-4 py-2 ml-16 h-[50px]">
        <button
          onClick={toggleColorMode}
          className="flex items-center gap-2 text-white hover:text-blue-100 transition-colors"
        >
          <Palette className="w-4 h-4" />
          <span className="text-sm">{getColorLabel()}</span>
        </button>
        <img src="/avatar.png" alt="user" className="h-8 w-8 rounded-full border-2 border-white" />
      </div>
    </nav>
  );
}