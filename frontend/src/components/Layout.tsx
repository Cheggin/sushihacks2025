import React from "react";
import { Route, Routes } from "react-router-dom";
import Navbar from "../components/Navbar";
import PageLayout from "../components/PageLayout"; // PageLayout import
import HomePage from "../pages/HomePage";
import Landing from "../pages/Landing";
import FishMapPage from "../pages/FishMapPage";
import Health from "../pages/Health";

const Layout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1d3f8b] via-[#2b6cb0] to-[#2563eb]">
      {/* Background color wrapper for the entire page */}
      <div className="flex flex-col">
        <Navbar /> {/* Navbar stays on top, above the background */}
        <main className="flex-1 p-6">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/map" element={<PageLayout title="Map" rightText="Weather info for map here"><FishMapPage /></PageLayout>} />
            <Route path="/health" element={<PageLayout title="Health" rightText="Weather info for health here"><Health /></PageLayout>} />
            <Route
              path="/homepage"
              element={
                <PageLayout title="Dashboard" rightText="Weather info will go here">
                  <HomePage />
                </PageLayout>
              }
            />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default Layout;