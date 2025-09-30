import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl w-full text-center space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-5xl font-bold text-text-primary">
            Fish Distribution Analytics
          </h1>
          <p className="text-xl text-text-secondary">
            Explore 19,465 fish occurrences across the Asia-Pacific region
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-6 mt-12">
          <Link
            to="/map"
            className="bg-card border border-border hover:border-primary rounded-lg p-8 transition-colors"
          >
            <h2 className="text-2xl font-bold text-text-primary mb-2">
              Fish Distribution Map
            </h2>
            <p className="text-text-secondary">
              Interactive map showing fish species locations across the Asia-Pacific
            </p>
          </Link>

          <Link
            to="/dashboard"
            className="bg-card border border-border hover:border-primary rounded-lg p-8 transition-colors"
          >
            <h2 className="text-2xl font-bold text-text-primary mb-2">
              CTS Risk Dashboard
            </h2>
            <p className="text-text-secondary">
              Carpal Tunnel Syndrome risk assessment and health tracking
            </p>
          </Link>
        </div>

        {/* Features */}
        <div className="mt-16 grid md:grid-cols-3 gap-6 text-left">
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-semibold text-text-primary mb-1">
              19,465 Records
            </h3>
            <p className="text-sm text-text-secondary">
              Comprehensive dataset spanning 1900-2013
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-semibold text-text-primary mb-1">
              20 Countries
            </h3>
            <p className="text-sm text-text-secondary">
              Coverage across Asia-Pacific region
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-semibold text-text-primary mb-1">
              5,741 Species
            </h3>
            <p className="text-sm text-text-secondary">
              Diverse marine biodiversity data
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
