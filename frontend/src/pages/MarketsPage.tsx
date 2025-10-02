import React, { useState } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { MapPin, Phone, Clock, Star } from "lucide-react";
import PageLayout from "../components/PageLayout";

// Dummy Data for the Market Page
const marketData = [
  {
    id: "M1",
    name: "Pike Place Fish Market",
    address: "86 Pike Place, Seattle, WA 98101",
    hours: "6:00 AM - 5:00 PM",
    rating: 4.8,
    description: "Historic fish market known for fresh seafood and fish-throwing tradition",
    phone: "+1 (206) 682-7181",
  },
  {
    id: "M2",
    name: "Sydney Fish Market",
    address: "Bank Street & Pyrmont Bridge Road, Sydney",
    hours: "7:00 AM - 4:00 PM",
    rating: 4.6,
    description: "Largest fish market in the Southern Hemisphere",
    phone: "+61 2 9004 1100",
  },
  {
    id: "M3",
    name: "Tsukiji Outer Market",
    address: "4 Chome-16-2 Tsukiji, Tokyo",
    hours: "5:00 AM - 2:00 PM",
    rating: 4.7,
    description: "Famous market district with fresh seafood and kitchen supplies",
    phone: "+81 3-3541-9444",
  },
];

const MarketsPage = ({ isMarketsPageVisible, togglePopup }: { isMarketsPageVisible: boolean; togglePopup: (page: string) => void }) => {
  const [selectedMarket, setSelectedMarket] = useState(marketData[0]);
  const [showCallOverlay, setShowCallOverlay] = useState(false);

  return (
    <div
      className={`${
        isMarketsPageVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      } transition-all duration-500 ease-in-out`}
    >
      <PageLayout title="Fish Markets" rightText={<span style={{ color: "var(--text-secondary)" }}>Find local markets</span>} togglePopup={togglePopup}>
        <div className="relative min-h-screen">
          {/* Background remains whatever you already have (kept intentionally) */}
          <div className="relative z-10 px-6 py-8 space-y-6">
            {/* Large Card with Market List */}
            <Card className="rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {marketData.map((market) => (
                    <div
                      key={market.id}
                      className={`p-4 rounded-lg cursor-pointer transition-all ${selectedMarket.id === market.id ? "scale-[1.01]" : "hover:scale-[1.01]"}`}
                      onClick={() => setSelectedMarket(market)}
                      style={{
                        border: "1px solid transparent",
                        backgroundColor: "transparent",
                        color: "var(--text-primary)",
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                            {market.name}
                          </h3>
                          <div className="flex items-center gap-1" style={{ color: "var(--text-secondary)", marginTop: 4 }}>
                            <Star className="w-4 h-4" />
                            <span>{market.rating}</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 space-y-1 text-sm" style={{ color: "var(--muted)" }}>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{market.address}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{market.hours}</span>
                        </div>
                      </div>
                      <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>{market.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Call Button Card with AI Caller Image */}
            <div className="relative -mt-24 ml-48 z-10">
              <Card className="relative overflow-hidden w-72 h-96">
                <img
                  src="/ai_caller.png"
                  alt="AI Caller"
                  className="absolute -top-48 right-1/2 transform translate-x-1/2 w-[500px] h-[500px] object-contain z-20"
                />
                <CardContent className="p-6 absolute bottom-0 left-0 right-0">
                  <Button
                    className="w-full py-6 text-lg flex items-center justify-center gap-3"
                    style={{
                      background: "linear-gradient(90deg, #3b82f6, #06b6d4)",
                      color: "#fff",
                    }}
                    onClick={() => setShowCallOverlay(true)}
                  >
                    <Phone className="w-6 h-6" />
                    Call Market
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Call Options Overlay */}
          {showCallOverlay && (
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
        </div>
      </PageLayout>
    </div>
  );
};

export default MarketsPage;