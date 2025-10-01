import React from 'react';

// Change the type of rightText to React.ReactNode
interface PageLayoutProps {
  title: string;
  rightText: React.ReactNode; // This allows strings, JSX elements, or null
  children: React.ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({ title, rightText, children }) => {
  return (
    <div className="rounded-3xl bg-white/8 backdrop-blur-xl border border-white/20 shadow-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10">
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        <div className="text-white">{rightText}</div> {/* This will render the rightText */}
      </div>

      {/* Content */}
      <div>{children}</div>
    </div>
  );
};

export default PageLayout;