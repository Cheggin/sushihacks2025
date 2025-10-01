import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom'; // This will track route changes

interface PageLayoutProps {
  title: string;
  rightText: React.ReactNode;
  children: React.ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({ title, rightText, children }) => {
  const location = useLocation(); // Track location
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Update active section based on route
  useEffect(() => {
    // Example: Set active section based on location pathname
    if (location.pathname === '/homepage') {
      setActiveSection('homepage');
    } else if (location.pathname === '/map') {
      setActiveSection('map');
    } else if (location.pathname === '/health') {
      setActiveSection('health');
    } else {
      setActiveSection(null); // Reset section if no match
    }
  }, [location]);

  return (
    <div className="rounded-3xl bg-white/8 backdrop-blur-xl border border-white/20 shadow-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10">
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        <div className="text-white">{rightText}</div>
      </div>

      {/* Section content with animation */}
      <div className="transition-all duration-500 ease-in-out opacity-100">
        {children}
      </div>
    </div>
  );
};

export default PageLayout;