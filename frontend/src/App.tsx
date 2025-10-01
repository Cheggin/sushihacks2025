import React, { useState } from "react";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import FishMapPage from "./pages/FishMapPage";
import HealthPage from "./pages/Health";

export default function App() {
  const [activePopup, setActivePopup] = useState<string | null>(null);
  const [isHomePageVisible, setIsHomePageVisible] = useState<boolean>(false);
  const [isMapPageVisible, setIsMapPageVisible] = useState<boolean>(false);
  const [isHealthPageVisible, setIsHealthPageVisible] = useState<boolean>(false);

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
    <div className="min-h-screen bg-gradient-to-br from-[#1d3f8b] via-[#2b6cb0] to-[#2563eb] flex flex-col">
      <main className="flex-1 p-6">
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

      <Navbar togglePopup={togglePopup} />
    </div>
  );
}