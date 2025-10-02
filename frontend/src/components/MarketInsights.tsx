import React from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Lightbulb, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';

interface Market {
  name: string;
  rating?: number;
  address: string;
  phone?: string;
  location?: { lat: number; lng: number };
}

interface Insights {
  summary: string;
  total_markets: number;
  average_rating: number;
  key_findings: string[];
  recommendations: string[];
}

interface MarketInsightsProps {
  markets: Market[];
  insights?: Insights | null;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

const MarketInsights: React.FC<MarketInsightsProps> = ({
  markets,
  insights,
  loading,
  error,
  onRetry
}) => {
  // Loading State
  if (loading) {
    return (
      <Card className="rounded-2xl overflow-hidden flex flex-col h-full">
        <CardContent className="p-6 flex flex-col items-center justify-center min-h-[580px]">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mb-4"></div>
          <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
            Analyzing Markets...
          </h3>
          <p className="text-sm text-center" style={{ color: "var(--muted)" }}>
            Our AI is generating insights from {markets.length} fish markets.
            This may take 20-30 seconds.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Error State
  if (error) {
    return (
      <Card className="rounded-2xl overflow-hidden flex flex-col h-full">
        <CardContent className="p-6 flex flex-col items-center justify-center min-h-[580px]">
          <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2 text-red-400">
            Analysis Failed
          </h3>
          <p className="text-sm text-center mb-4" style={{ color: "var(--muted)" }}>
            {error}
          </p>
          {onRetry && (
            <Button
              onClick={onRetry}
              style={{ background: "linear-gradient(90deg, #3b82f6, #06b6d4)", color: "#fff" }}
            >
              Retry Analysis
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // Empty State
  if (!insights || markets.length === 0) {
    return (
      <Card className="rounded-2xl overflow-hidden flex flex-col h-full">
        <CardContent className="p-6 flex flex-col items-center justify-center min-h-[580px]">
          <Lightbulb className="w-16 h-16 text-slate-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
            Market Insights
          </h3>
          <p className="text-sm text-center" style={{ color: "var(--muted)" }}>
            AI-powered insights will appear here once markets are loaded.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Success State with Insights
  return (
    <Card className="rounded-2xl overflow-hidden flex flex-col" style={{ height: "calc(3 * 160px + 100px)" }}>
      <CardContent className="p-6 flex flex-col h-full overflow-y-auto">
        {/* Header */}
        <div className="mb-4 pb-4 border-b border-white/10">
          <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
            <Lightbulb className="w-5 h-5 text-yellow-400" />
            Market Insights
          </h3>
          <div className="flex gap-4 mt-2 text-xs" style={{ color: "var(--muted)" }}>
            <span>{insights.total_markets} markets analyzed</span>
            <span>⭐ {insights.average_rating.toFixed(1)} avg rating</span>
          </div>
        </div>

        {/* Summary */}
        <div className="mb-4">
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            {insights.summary}
          </p>
        </div>

        {/* Key Findings */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
            <TrendingUp className="w-4 h-4 text-blue-400" />
            Key Findings
          </h4>
          <ul className="space-y-2">
            {insights.key_findings.map((finding, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                <span className="text-blue-400 mt-0.5">•</span>
                <span className="leading-relaxed">{finding}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Recommendations */}
        <div>
          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
            <CheckCircle className="w-4 h-4 text-green-400" />
            Recommendations
          </h4>
          <ul className="space-y-2">
            {insights.recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                <span className="text-green-400 mt-0.5">✓</span>
                <span className="leading-relaxed">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketInsights;
