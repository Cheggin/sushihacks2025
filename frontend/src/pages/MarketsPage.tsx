import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { MapPin, Phone, Star, Navigation } from "lucide-react";
import PageLayout from "../components/PageLayout";
import axios from "axios";

interface Market {
  name: string;
  rating?: number;
  address: string;
  place_id: string;
  phone?: string;
  location?: {
    lat: number;
    lng: number;
  };
  distance?: number; // Distance in km
}

type SortType = "rating" | "distance";

const MarketsPage = ({
  isMarketsPageVisible,
  togglePopup,
  userLocation
}: {
  isMarketsPageVisible: boolean;
  togglePopup: (page: string) => void;
  userLocation?: { lat: number; lng: number } | null;
}) => {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCallOverlay, setShowCallOverlay] = useState(false);
  const [sortType, setSortType] = useState<SortType>("rating");

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Sort markets based on sort type
  const sortMarkets = (marketList: Market[], type: SortType): Market[] => {
    return [...marketList].sort((a, b) => {
      if (type === "rating") {
        // Sort by rating (descending), put markets without ratings at the end
        if (!a.rating && !b.rating) return 0;
        if (!a.rating) return 1;
        if (!b.rating) return -1;
        return b.rating - a.rating;
      } else {
        // Sort by distance (ascending), put markets without distance at the end
        if (!a.distance && !b.distance) return 0;
        if (!a.distance) return 1;
        if (!b.distance) return -1;
        return a.distance - b.distance;
      }
    });
  };

  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        setLoading(true);
        setError(null);

        // Use user location or default to Tokyo (Tsukiji area)
        const lat = userLocation?.lat || 35.6762;
        const lng = userLocation?.lng || 139.6503;

        const response = await axios.get(`http://localhost:8000/nearby-with-details`, {
          params: {
            lat,
            lng,
            keyword: "fish market",
            radius: 5000, // 5km radius
            limit: 10
          }
        });

        // Calculate distances and create market objects
        const marketsWithDistance: Market[] = response.data.results.map((place: any) => {
          const market: Market = {
            name: place.name || "Unknown Market",
            rating: place.rating,
            address: place.address || "Address not available",
            place_id: place.place_id,
            phone: place.phone,
            location: place.location
          };

          // Calculate distance if both locations are available
          if (place.location && place.location.lat && place.location.lng) {
            market.distance = calculateDistance(lat, lng, place.location.lat, place.location.lng);
          }

          return market;
        });

        // Sort and limit markets to 4
        const sortedMarkets = sortMarkets(marketsWithDistance, sortType).slice(0, 4);

        setMarkets(sortedMarkets);
        if (sortedMarkets.length > 0) {
          setSelectedMarket(sortedMarkets[0]);
        }
      } catch (err) {
        console.error("Error fetching markets:", err);
        setError("Failed to load fish markets. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (isMarketsPageVisible) {
      fetchMarkets();
    }
  }, [isMarketsPageVisible, userLocation]);

  // Re-sort markets when sort type changes
  useEffect(() => {
    if (markets.length > 0) {
      const sortedMarkets = sortMarkets(markets, sortType).slice(0, 4);
      setMarkets(sortedMarkets);
      if (sortedMarkets.length > 0 && !sortedMarkets.find(m => m.place_id === selectedMarket?.place_id)) {
        setSelectedMarket(sortedMarkets[0]);
      }
    }
  }, [sortType]);

  return (
    <div
      className={`${
        isMarketsPageVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      } transition-all duration-500 ease-in-out`}
    >
      <PageLayout title="Fish Markets" rightText={<span style={{ color: "var(--text-secondary)" }}>Find local markets</span>} togglePopup={togglePopup}>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-white text-lg">Loading fish markets...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-red-400 text-lg">{error}</div>
          </div>
        ) : markets.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-white text-lg">No fish markets found nearby</div>
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-4">
            {/* Market List - Left Side */}
            <div className="col-span-8">
              <Card className="rounded-2xl overflow-hidden flex flex-col">
                <CardContent className="p-6 flex flex-col">
                  {/* Sort Controls */}
                  <div className="mb-4 flex items-center gap-3 pb-4 border-b border-white/10">
                    <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Sort by:</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSortType("rating")}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          sortType === "rating"
                            ? "bg-blue-500/20 border border-blue-500/50 text-blue-400"
                            : "bg-white/5 border border-white/10 hover:bg-white/10"
                        }`}
                        style={{ color: sortType === "rating" ? "#60a5fa" : "var(--text-secondary)" }}
                      >
                        <div className="flex items-center gap-1.5">
                          <Star className="w-3.5 h-3.5" />
                          Rating
                        </div>
                      </button>
                      <button
                        onClick={() => setSortType("distance")}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          sortType === "distance"
                            ? "bg-blue-500/20 border border-blue-500/50 text-blue-400"
                            : "bg-white/5 border border-white/10 hover:bg-white/10"
                        }`}
                        style={{ color: sortType === "distance" ? "#60a5fa" : "var(--text-secondary)" }}
                      >
                        <div className="flex items-center gap-1.5">
                          <Navigation className="w-3.5 h-3.5" />
                          Distance
                        </div>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3 overflow-y-auto" style={{ maxHeight: "calc(3 * 160px)" }}>
                    {markets.map((market) => (
                    <div
                      key={market.place_id}
                      className={`p-4 rounded-xl cursor-pointer transition-all border ${
                        selectedMarket?.place_id === market.place_id
                          ? "bg-blue-500/15 border-blue-400/60 shadow-lg shadow-blue-500/20"
                          : "bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/60 hover:border-slate-600/60"
                      }`}
                      onClick={() => setSelectedMarket(market)}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="text-base font-bold text-white mb-2">
                            {market.name}
                          </h3>
                          <div className="flex items-center gap-2">
                            {market.rating && (
                              <div className="flex items-center gap-1 text-white">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-semibold text-sm">{market.rating.toFixed(1)}</span>
                              </div>
                            )}
                            {market.distance && (
                              <div className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-400/30">
                                <Navigation className="w-3 h-3" />
                                <span className="font-medium">{market.distance.toFixed(1)} km</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-2 text-slate-300">
                          <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5 text-slate-400" />
                          <span className="line-clamp-1">{market.address}</span>
                        </div>
                        {market.phone && (
                          <a
                            href={`tel:${market.phone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/40 text-cyan-300"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span className="font-medium text-xs">{market.phone}</span>
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Caller - Right Side */}
          <div className="col-span-4">
            <Card className="relative overflow-hidden flex flex-col" style={{ height: "calc(3 * 160px + 100px)" }}>
              <div className="flex-1 flex items-end justify-center pt-6">
                <img
                  src="/ai_caller.png"
                  alt="AI Caller"
                  className="w-full max-w-[280px] h-auto object-contain"
                />
              </div>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2 text-center" style={{ color: "var(--text-primary)" }}>
                  AI Call Assistant
                </h3>
                <p className="text-sm mb-4 text-center" style={{ color: "var(--muted)" }}>
                  Let our AI assistant call and make reservations for you
                </p>
                <Button
                  className="w-full py-3 text-base flex items-center justify-center gap-2"
                  style={{
                    background: "linear-gradient(90deg, #3b82f6, #06b6d4)",
                    color: "#fff",
                  }}
                  onClick={() => setShowCallOverlay(true)}
                  disabled={!selectedMarket}
                >
                  <Phone className="w-5 h-5" />
                  Call {selectedMarket?.name || "Market"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        )}

        {/* Call Options Overlay */}
        {showCallOverlay && selectedMarket && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="flex gap-4 p-4">
              <Card className="w-64">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-center mb-2" style={{ color: "var(--text-primary)" }}>
                    AI Assistant Call
                  </h3>
                  <p className="text-sm" style={{ color: "var(--muted)", marginBottom: 12 }}>
                    Let our AI assistant help you make a reservation
                  </p>
                  <Button
                    className="w-full py-2"
                    style={{ background: "linear-gradient(90deg,#3b82f6,#06b6d4)", color: "#fff" }}
                    onClick={() => {
                      setShowCallOverlay(false);
                    }}
                  >
                    Start AI Call
                  </Button>
                </CardContent>
              </Card>

              <Card className="w-64">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-center mb-2" style={{ color: "var(--text-primary)" }}>
                    Direct Call
                  </h3>
                  <p className="text-sm" style={{ color: "var(--muted)", marginBottom: 12 }}>
                    Call the market directly: {selectedMarket.phone}
                  </p>
                  <Button
                    className="w-full py-2"
                    style={{ background: "linear-gradient(90deg,#10b981,#06b6d4)", color: "#fff" }}
                    onClick={() => {
                      setShowCallOverlay(false);
                    }}
                  >
                    Call Now
                  </Button>
                </CardContent>
              </Card>
            </div>
            <Button
              className="absolute top-4 right-4"
              style={{ backgroundColor: "rgba(255,255,255,0.9)", color: "var(--muted)" }}
              onClick={() => setShowCallOverlay(false)}
            >
              Close
            </Button>
          </div>
        )}
      </PageLayout>
    </div>
  );
};

export default MarketsPage;
