import React, { useState } from "react";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import FishMapPage from "./pages/FishMapPage";
import HealthPage from "./pages/Health";
import Landing from "./pages/Landing";
import GlobeBackground from "./components/GlobeBackground";
import FishSidebar from "./components/FishSidebar";
import type { FishOccurrence } from "./types/fish";

interface UserMarker {
  name: string;
  lat: number;
  lng: number;
}

export default function App() {
  const [userMarker, setUserMarker] = useState<UserMarker | null>(null);
  const [activePopup, setActivePopup] = useState<string | null>(null);
  const [isHomePageVisible, setIsHomePageVisible] = useState<boolean>(false);
  const [isMapPageVisible, setIsMapPageVisible] = useState<boolean>(false);
  const [isHealthPageVisible, setIsHealthPageVisible] = useState<boolean>(false);
  const [selectedFish, setSelectedFish] = useState<FishOccurrence | null>(null);

  const handleLandingSubmit = (name: string, lat: number, lng: number) => {
    setUserMarker({ name, lat, lng });
  };

  const togglePopup = (page: string) => {
    if (activePopup === page) {
      if (page === "homepage") {
        setIsHomePageVisible(false);
        setTimeout(() => setActivePopup(null), 1000);
      } else if (page === "map") {
        setIsMapPageVisible(false);
        setTimeout(() => setActivePopup(null), 1000);
      } else if (page === "health") {
        setIsHealthPageVisible(false);
        setTimeout(() => setActivePopup(null), 1000);
      }
    } else {
      // Show the new popup
      setActivePopup(page);
      if (page === "homepage") setIsHomePageVisible(true);
      else if (page === "map") setIsMapPageVisible(true);
      else if (page === "health") setIsHealthPageVisible(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Globe background */}
      <GlobeBackground onFishClick={setSelectedFish} userMarker={userMarker} />

      {/* Landing Page Overlay */}
      {!userMarker && (
        <div className="fixed inset-0 z-40">
          <Landing onSubmit={handleLandingSubmit} />
        </div>
      )}

      {/* Fish Details Sidebar */}
      <FishSidebar fish={selectedFish} onClose={() => setSelectedFish(null)} />

      {/* Main content area */}
      <main className="flex-1 p-6 relative" style={{ zIndex: activePopup ? 20 : 5 }}>
        {/* Home Page Popup */}
        {activePopup === "homepage" && (
          <div
            className={`${
              isHomePageVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"
            } transition-all duration-1000 ease-in-out`}
          >
            <HomePage isHomePageVisible={isHomePageVisible} />
          </div>
        )}

        {/* Map Page Popup for now; will delete */}
        {activePopup === "map" && (
          <div
            className={`${
              isMapPageVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            } transition-all duration-1000 ease-in-out`}
          >
            <FishMapPage />
          </div>
        )}

        {/* Health Page Popup */}
        {activePopup === "health" && (
          <div
            className={`${
              isHealthPageVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            } transition-all duration-1000 ease-in-out`}
          >
            <HealthPage />
          </div>
        )}
      </main>

      {/* Navbar - at bottom */}
      <div className="relative z-30">
        <Navbar togglePopup={togglePopup} />
      </div>
    </div>
  );
}