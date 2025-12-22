import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, TrendingUp, Clock, Star, X } from 'lucide-react';
import { QuickPreset, PresetUsageStats, getPresetRecommendations, PresetRecommendation } from '@/lib/quick-presets';

interface PresetRecommendationsProps {
  presets: QuickPreset[];
  usageStats: PresetUsageStats;
  currentModels: string[];
  onApplyPreset: (preset: QuickPreset) => void;
  onDismiss?: () => void;
  className?: string;
}

/**
 * Component that displays smart preset recommendations based on usage patterns
 */
export function PresetRecommendations({
  presets,
  usageStats,
  currentModels,
  onApplyPreset,
  onDismiss,
  className = '',
}: PresetRecommendationsProps) {
  // Stabilize currentModels reference to prevent unnecessary recalculations
  const stableCurrentModels = useMemo(() => currentModels, [JSON.stringify(currentModels)]);
  
  const recommendations = useMemo(() => {
    return getPresetRecommendations(presets, usageStats, stableCurrentModels, 3);
  }, [presets, usageStats, stableCurrentModels]);

  if (recommendations.length === 0) {
    return null;
  }

  const getReasonIcon = (reason: string) => {
    if (reason.includes('most used') || reason.includes('time')) {
      return <TrendingUp className="h-3 w-3 text-green-500" />;
    }
    if (reason.includes('recently')) {
      return <Clock className="h-3 w-3 text-blue-500" />;
    }
    if (reason.includes('favorite')) {
      return <Star className="h-3 w-3 text-yellow-500" />;
    }
    if (reason.includes('Similar')) {
      return <Sparkles className="h-3 w-3 text-purple-500" />;
    }
    return <Sparkles className="h-3 w-3 text-primary" />;
  };

  return (
    <div className={`bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-3 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-xs font-medium">Suggested Presets</span>
        </div>
        {onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
      
      <div className="space-y-1.5">
        {recommendations.map((rec) => (
          <button
            key={rec.preset.id}
            onClick={() => onApplyPreset(rec.preset)}
            className="w-full flex items-center gap-2 p-2 rounded-md bg-background/50 hover:bg-background transition-colors text-left group"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium truncate">{rec.preset.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded shrink-0">
                  {rec.preset.models.length}
                </span>
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                {getReasonIcon(rec.reason)}
                <span className="text-[10px] text-muted-foreground truncate">
                  {rec.reason}
                </span>
              </div>
            </div>
            <span className="text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              Apply
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Compact inline recommendation badge
 */
interface RecommendationBadgeProps {
  recommendation: PresetRecommendation;
  onClick: () => void;
}

export function RecommendationBadge({ recommendation, onClick }: RecommendationBadgeProps) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors text-xs"
    >
      <Sparkles className="h-3 w-3 text-primary" />
      <span className="font-medium">{recommendation.preset.name}</span>
    </button>
  );
}
