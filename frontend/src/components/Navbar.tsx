import { useState } from "react";
import { Palette } from "lucide-react";

interface NavbarProps {
  togglePopup: (page: string) => void;
}

export default function Navbar({ togglePopup }: NavbarProps) {
  const [mode, setMode] = useState<'default' | 'light'>('default');

  const toggleLightMode = () => {
    const newMode = mode === 'default' ? 'light' : 'default';
    setMode(newMode);
    if (newMode === 'light') {
      document.documentElement.setAttribute('data-theme', 'accessible');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  };

  const getModeLabel = () => {
    return mode === 'light' ? 'Light' : 'Color';
  };

  return (
    <nav className="mx-6 flex items-center justify-between px-2 py-6 relative" role="navigation" aria-label="Primary">
      <div className="flex items-center gap-3 rounded-3xl px-4 py-2 mr-16 h-[50px] border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-surface)_70%,transparent)] backdrop-blur-xl shadow-md">
        <img src="/logo.png" alt="CARP logo" className="h-8 w-8" />
        <span className="text-[var(--color-foreground)] font-bold">CARP</span>
      </div>

      <div className="flex gap-8 h-[50px] items-center text-[var(--color-foreground)] font-medium rounded-3xl px-4 py-2 border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-surface)_70%,transparent)] backdrop-blur-xl shadow-md">
        <button
          onClick={() => togglePopup("homepage")}
          className="px-3 py-2 rounded-md hover:bg-[rgba(148,163,184,0.1)] focus-visible:bg-[rgba(148,163,184,0.12)] focus-visible:outline-none"
        >
          Dashboard
        </button>
        <button
          onClick={() => togglePopup("health")}
          className="px-3 py-2 rounded-md hover:bg-[rgba(148,163,184,0.1)] focus-visible:bg-[rgba(148,163,184,0.12)] focus-visible:outline-none"
        >
          Health
        </button>
      </div>

      <div className="flex items-center gap-4 rounded-3xl px-4 py-2 ml-16 h-[50px] border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-surface)_70%,transparent)] backdrop-blur-xl shadow-md">
        <button
          onClick={toggleLightMode}
          className="flex items-center gap-2 text-[var(--color-foreground)] hover:text-[var(--color-on-primary)] hover:bg-[rgba(37,99,235,0.15)] px-3 py-2 rounded-md transition-colors focus-visible:outline-none"
          aria-pressed={mode === 'light'}
          aria-label="Toggle light mode"
        >
          <Palette className="w-4 h-4" />
          <span className="text-sm">{getModeLabel()}</span>
        </button>
        <img src="/avatar.png" alt="User avatar" className="h-8 w-8 rounded-full border-2 border-[var(--color-border)]" />
      </div>
    </nav>
  );
}