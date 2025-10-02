import { memo } from 'react';
import { Card, CardContent } from './ui/card';
import { Activity, TrendingUp, Waves, AlertCircle } from 'lucide-react';

interface DashboardSummaryProps {
  ctsData?: {
    severity: string;
    gripStrength: number;
    pinchStrength: number;
    lastAssessment: Date;
  } | null;
  fishingScore: number;
  temperature: number;
}

const DashboardSummary = memo(function DashboardSummary({ ctsData, fishingScore, temperature }: DashboardSummaryProps) {
  const getCTSColor = (severity?: string) => {
    if (!severity) return 'bg-gray-500/20 border-gray-500/30 text-gray-400';
    if (severity === 'mild') return 'bg-green-500/20 border-green-500/30 text-green-400';
    if (severity === 'moderate') return 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400';
    return 'bg-red-500/20 border-red-500/30 text-red-400';
  };

  const getCTSLabel = (severity?: string) => {
    if (!severity) return 'Not Assessed';
    if (severity === 'mild') return 'Good Health';
    if (severity === 'moderate') return 'Moderate CTS';
    return 'Severe CTS';
  };

  const getCTSIcon = (severity?: string) => {
    if (!severity) return <AlertCircle className="w-5 h-5" />;
    if (severity === 'mild') return <Activity className="w-5 h-5" />;
    if (severity === 'moderate') return <AlertCircle className="w-5 h-5" />;
    return <AlertCircle className="w-5 h-5" />;
  };

  const getFishingConditionColor = (score: number) => {
    if (score >= 80) return 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400';
    if (score >= 60) return 'bg-green-500/20 border-green-500/30 text-green-400';
    if (score >= 40) return 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400';
    return 'bg-red-500/20 border-red-500/30 text-red-400';
  };

  const getFishingLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  // AI-generated fish recommendations based on health
  const getRecommendedFish = () => {
    if (!ctsData) return ['Tuna', 'Salmon', 'Mackerel'];

    if (ctsData.severity === 'severe') {
      return ['Sardines', 'Anchovies', 'Mackerel'];
    } else if (ctsData.severity === 'moderate') {
      return ['Mackerel', 'Sea Bass', 'Bonito'];
    }
    return ['Tuna', 'Yellowfin', 'Salmon'];
  };

  const recommendedFish = getRecommendedFish();

  return (
    <Card className="col-span-12">
      <CardContent>
        <div className="space-y-2">
          <div>
            <h2 className="text-lg font-bold text-white mb-0.5">Today's Summary</h2>
            <p className="text-xs text-white/60">Key metrics for optimal fishing today</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {/* CTS Health Status */}
            <div className={`p-3 rounded-lg border ${getCTSColor(ctsData?.severity)}`}>
              <div className="flex items-center gap-1.5 mb-1.5">
                {getCTSIcon(ctsData?.severity)}
                <span className="text-[10px] font-semibold uppercase tracking-wider">CTS Health</span>
              </div>
              <p className="text-xl font-bold mb-1">{getCTSLabel(ctsData?.severity)}</p>
              {ctsData && (
                <div className="space-y-0.5">
                  <p className="text-[10px] opacity-80">Grip: {ctsData.gripStrength.toFixed(1)} kg</p>
                  <p className="text-[10px] opacity-80">Pinch: {ctsData.pinchStrength.toFixed(1)} kg</p>
                </div>
              )}
              {!ctsData && (
                <p className="text-[10px] opacity-70">Visit Health to assess</p>
              )}
            </div>

            {/* Fishing Conditions */}
            <div className={`p-3 rounded-lg border ${getFishingConditionColor(fishingScore)}`}>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Waves className="w-4 h-4" />
                <span className="text-[10px] font-semibold uppercase tracking-wider">Conditions</span>
              </div>
              <p className="text-xl font-bold mb-1">{getFishingLabel(fishingScore)}</p>
              <div className="space-y-0.5">
                <p className="text-[10px] opacity-80">Score: {fishingScore}/100</p>
                <p className="text-[10px] opacity-80">Temp: {temperature}°C</p>
              </div>
            </div>

            {/* AI Recommendation */}
            <div className="p-3 rounded-lg border bg-cyan-500/10 border-cyan-500/30">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-cyan-400">
                  AI Recommendation
                </span>
              </div>
              <p className="text-xs text-white/80 leading-tight">
                {ctsData && ctsData.severity === 'severe' && (
                  "Focus on lighter species. Use ergonomic tools and take frequent breaks."
                )}
                {ctsData && ctsData.severity === 'moderate' && (
                  "Handle medium fish comfortably. Alternate catches and maintain proper grip."
                )}
                {(!ctsData || ctsData.severity === 'mild') && fishingScore >= 70 && (
                  "Excellent conditions! Great day for larger species like tuna and yellowfin."
                )}
                {(!ctsData || ctsData.severity === 'mild') && fishingScore < 70 && (
                  "Moderate conditions. Focus on reliable catches and good form."
                )}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

export default DashboardSummary;
