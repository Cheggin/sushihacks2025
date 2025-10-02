import React from "react";

interface PageLayoutProps {
  title: string;
  rightText: React.ReactNode;
  children: React.ReactNode;
  togglePopup: (page: string) => void;
}

const PageLayout: React.FC<PageLayoutProps> = ({ title, rightText, children, togglePopup }) => {

  return (
    <div
      className="rounded-3xl backdrop-blur-xl p-6 h-full flex flex-col overflow-hidden"
      style={{
        backgroundColor: "transparent", // main background handled by outer container, PageLayout should be glass/card-like via CSS variables
        color: "var(--text-primary)",
      }}
    >
      {/* Header with integrated navbar */}
      <div
        className="flex items-center justify-between pb-4 mb-6 flex-shrink-0"
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="flex items-center gap-12">
          <h1 className="text-2xl font-bold" style={{ color: "white" }}>
            {title}
          </h1>
          {/* Navigation buttons */}
          <div className="flex gap-12 items-center font-medium">
            <button onClick={() => togglePopup("homepage")} style={{ color: "white" }} className="hover:underline">
              Dashboard
            </button>
            <button onClick={() => togglePopup("map")} style={{ color: "white" }} className="hover:underline">
              Markets
            </button>
            <button onClick={() => togglePopup("health")} style={{ color: "white" }} className="hover:underline">
              Health
            </button>
          </div>
        </div>
        <div style={{ color: "white" }}>{rightText}</div>
      </div>

      {/* Section content with animation */}
      <div className="transition-all duration-500 ease-in-out opacity-100 flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
};

export default PageLayout;