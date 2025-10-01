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
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">Today's Summary</h2>
            <p className="text-sm text-white/60">Key metrics for optimal fishing today</p>
          </div>

          <div className="grid grid-cols-12 gap-4">
            {/* CTS Health Status */}
            <div className={`col-span-3 p-4 rounded-lg border ${getCTSColor(ctsData?.severity)}`}>
              <div className="flex items-center gap-2 mb-2">
                {getCTSIcon(ctsData?.severity)}
                <span className="text-xs font-semibold uppercase tracking-wider">CTS Health</span>
              </div>
              <p className="text-2xl font-bold mb-1">{getCTSLabel(ctsData?.severity)}</p>
              {ctsData && (
                <div className="space-y-1">
                  <p className="text-xs opacity-80">Grip: {ctsData.gripStrength.toFixed(1)} kg</p>
                  <p className="text-xs opacity-80">Pinch: {ctsData.pinchStrength.toFixed(1)} kg</p>
                </div>
              )}
              {!ctsData && (
                <p className="text-xs opacity-70">Visit Health to assess</p>
              )}
            </div>

            {/* Fishing Conditions */}
            <div className={`col-span-3 p-4 rounded-lg border ${getFishingConditionColor(fishingScore)}`}>
              <div className="flex items-center gap-2 mb-2">
                <Waves className="w-5 h-5" />
                <span className="text-xs font-semibold uppercase tracking-wider">Conditions</span>
              </div>
              <p className="text-2xl font-bold mb-1">{getFishingLabel(fishingScore)}</p>
              <div className="space-y-1">
                <p className="text-xs opacity-80">Score: {fishingScore}/100</p>
                <p className="text-xs opacity-80">Temp: {temperature}°C</p>
              </div>
            </div>

            {/* Optimal Fish to Catch */}
            <div className="col-span-6 p-4 rounded-lg border bg-purple-500/20 border-purple-500/30">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-purple-400">
                  Top Fish to Catch
                </span>
              </div>
              <p className="text-sm text-white/80 mb-3">
                {ctsData
                  ? `Based on your ${ctsData.severity} CTS level and current conditions`
                  : 'Based on current fishing conditions'
                }
              </p>
              <div className="flex gap-2">
                {recommendedFish.map((fish, idx) => (
                  <div
                    key={idx}
                    className="flex-1 px-3 py-2 bg-white/5 rounded-lg border border-white/20 text-center"
                  >
                    <p className="text-base font-semibold text-white">{fish}</p>
                    <p className="text-xs text-white/60 mt-1">#{idx + 1}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Insight Banner */}
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
            <div className="flex items-start gap-2">
              <div className="p-1 bg-cyan-500/20 rounded">
                <Activity className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-cyan-400 mb-1">AI Recommendation</p>
                <p className="text-xs text-white/80">
                  {ctsData && ctsData.severity === 'severe' && (
                    "Focus on lighter species today. Your hand strength suggests taking it easy with smaller catches like sardines and anchovies. Use ergonomic tools and take frequent breaks."
                  )}
                  {ctsData && ctsData.severity === 'moderate' && (
                    "You can handle medium-sized fish comfortably. Alternate between catches and maintain proper grip technique. Sea bass and mackerel are good choices."
                  )}
                  {(!ctsData || ctsData.severity === 'mild') && fishingScore >= 70 && (
                    "Excellent conditions for fishing! Your health metrics look good and weather is optimal. Great day for pursuing larger species like tuna and yellowfin."
                  )}
                  {(!ctsData || ctsData.severity === 'mild') && fishingScore < 70 && (
                    "Moderate conditions today. Focus on reliable catches and maintain good form. Consider timing your fishing for early morning or late afternoon."
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

export default DashboardSummary;
