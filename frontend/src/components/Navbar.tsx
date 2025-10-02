import React, { useState, useEffect } from "react";
import { Palette } from "lucide-react";

interface NavbarProps {
  togglePopup: (page: string) => void;
}

export default function Navbar({ togglePopup }: NavbarProps) {
  const [colorMode, setColorMode] = useState<"color" | "bw">(
    (document.documentElement.getAttribute("data-theme") as "color" | "bw") || "color"
  );

  useEffect(() => {
    // ensure document has a default data-theme
    if (!document.documentElement.getAttribute("data-theme")) {
      document.documentElement.setAttribute("data-theme", "color");
    }
  }, []);

  const toggleColorMode = () => {
    const newMode = colorMode === "color" ? "bw" : "color";
    setColorMode(newMode);
    document.documentElement.setAttribute("data-theme", newMode);
  };

  const getColorLabel = () => {
    return colorMode === "color" ? "Dark" : "Light";
  };

  return (
    <nav className="w-full flex items-center justify-between px-6 py-4 relative">
      {/* Left: Logo */}
      <div
        className="flex items-center gap-3 rounded-3xl backdrop-blur-xl shadow-md px-4 py-2 h-[50px]"
        style={{
          backgroundColor: "var(--card-bg)",
          border: "1px solid var(--card-border)",
          color: "var(--text-primary)",
        }}
      >
        <img src="/logo.png" alt="logo" className="h-8 w-8" />
        <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>CARP</span>
      </div>

      {/* Center: Navigation */}
      <div
        className="flex gap-12 h-[50px] items-center font-medium rounded-3xl px-4 py-2"
        style={{
          backgroundColor: "var(--card-bg)",
          border: "1px solid var(--card-border)",
          color: "var(--text-primary)",
        }}
      >
        <button onClick={() => togglePopup("homepage")} style={{ color: "var(--text-primary)" }} className="hover:underline">
          Dashboard
        </button>
        <button onClick={() => togglePopup("map")} style={{ color: "var(--text-primary)" }} className="hover:underline">
          Map
        </button>
        <button onClick={() => togglePopup("health")} style={{ color: "var(--text-primary)" }} className="hover:underline">
          Health
        </button>
      </div>

      {/* Right: Color Switch */}
      <div
        className="flex items-center gap-4 rounded-3xl px-4 py-2 h-[50px]"
        style={{
          backgroundColor: "var(--card-bg)",
          border: "1px solid var(--card-border)",
          color: "var(--text-primary)",
        }}
      >
        <button
          onClick={toggleColorMode}
          className="flex items-center gap-2 transition-colors"
          style={{ color: "var(--text-primary)" }}
        >
          <Palette className="w-4 h-4" />
          <span className="text-sm">{getColorLabel()}</span>
        </button>
        <img
          src="/avatar.png"
          alt="user"
          className="h-8 w-8 rounded-full"
          style={{ border: "2px solid var(--card-border)" }}
        />
      </div>
    </nav>
  );
}