import { useState } from 'react';

interface LandingProps {
  onSubmit: (name: string, lat: number, lng: number) => void;
}

export default function Landing({ onSubmit }: LandingProps) {
  const [name, setName] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (!name.trim()) {
      alert('Please enter your name');
      return;
    }

    if (isNaN(lat) || lat < -90 || lat > 90) {
      alert('Please enter a valid latitude (-90 to 90)');
      return;
    }

    if (isNaN(lng) || lng < -180 || lng > 180) {
      alert('Please enter a valid longitude (-180 to 180)');
      return;
    }

    onSubmit(name, lat, lng);
  };

  const getCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude.toFixed(6));
          setLongitude(position.coords.longitude.toFixed(6));
        },
        (error) => {
          alert('Could not get your location: ' + error.message);
        }
      );
    } else {
      alert('Geolocation is not supported by your browser');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black/40 backdrop-blur-sm relative overflow-hidden">

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="mb-6 flex justify-center">
            <div className="w-24 h-24 bg-white/10 backdrop-blur-xl border-2 border-white/20 rounded-2xl flex items-center justify-center">
              <div className="text-4xl">🐟</div>
            </div>
          </div>

          <h1 className="text-6xl font-bold text-white mb-4">CARP</h1>
          <p className="text-xl text-white/70 mb-2">Collaborative Aquatic Resource Platform</p>
          <p className="text-sm text-white/50">Track, analyze, and trade fish occurrences globally</p>
        </div>

        {/* Login Form */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Mark Your Location</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-white/80 mb-2">
                Your Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/40 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="latitude" className="block text-sm font-medium text-white/80 mb-2">
                Latitude
              </label>
              <input
                id="latitude"
                type="text"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="e.g., 35.6762"
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/40 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="longitude" className="block text-sm font-medium text-white/80 mb-2">
                Longitude
              </label>
              <input
                id="longitude"
                type="text"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="e.g., 139.6503"
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/40 transition-colors"
              />
            </div>

            <button
              type="button"
              onClick={getCurrentLocation}
              className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition-colors text-sm"
            >
              📍 Use My Current Location
            </button>

            <button
              type="submit"
              className="w-full px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]"
            >
              Enter CARP
            </button>
          </form>
        </div>

        <p className="text-center text-white/40 text-xs mt-6">
          Your location will be marked on the global fish occurrence map
        </p>
      </div>
    </div>
  );
}
