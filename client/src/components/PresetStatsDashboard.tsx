import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { 
  X, BarChart2, TrendingUp, Star, Layers, Clock, Hash, 
  ChevronDown, ChevronUp, PieChart
} from 'lucide-react';
import { 
  QuickPreset, 
  PresetUsageStats, 
  getPresetStatistics, 
  PresetStatistics,
  getUsageSummary 
} from '@/lib/quick-presets';

interface PresetStatsDashboardProps {
  presets: QuickPreset[];
  usageStats: PresetUsageStats;
  onClose: () => void;
  onSelectPreset?: (presetId: string) => void;
}

export function PresetStatsDashboard({
  presets,
  usageStats,
  onClose,
  onSelectPreset,
}: PresetStatsDashboardProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>('overview');
  
  const stats = useMemo(() => 
    getPresetStatistics(presets, usageStats),
    [presets, usageStats]
  );
  
  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };
  
  // Get top 5 models by popularity
  const topModels = useMemo(() => {
    return Object.entries(stats.modelPopularity)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
  }, [stats.modelPopularity]);
  
  // Get category distribution for pie chart visualization
  const categoryDistribution = useMemo(() => {
    const entries = Object.entries(stats.categoryCounts)
      .filter(([key]) => key !== 'All')
      .filter(([, count]) => count > 0)
      .sort(([, a], [, b]) => b - a);
    return entries;
  }, [stats.categoryCounts]);
  
  return (
    <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
      <div className="bg-background border border-border rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
          <div className="flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Preset Statistics</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Quick Summary */}
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">{getUsageSummary(stats)}</p>
          </div>
          
          {/* Overview Section */}
          <div className="border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('overview')}
              className="w-full flex items-center justify-between px-4 py-3 bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <PieChart className="h-4 w-4 text-primary" />
                <span className="font-medium">Overview</span>
              </div>
              {expandedSection === 'overview' ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
            {expandedSection === 'overview' && (
              <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard
                  icon={<Layers className="h-4 w-4" />}
                  label="Total Presets"
                  value={stats.totalPresets}
                />
                <StatCard
                  icon={<Hash className="h-4 w-4" />}
                  label="Total Usage"
                  value={stats.totalUsage}
                />
                <StatCard
                  icon={<Star className="h-4 w-4" />}
                  label="Favorites"
                  value={stats.favoriteCount}
                />
                <StatCard
                  icon={<TrendingUp className="h-4 w-4" />}
                  label="Avg Models"
                  value={stats.averageModelsPerPreset}
                />
              </div>
            )}
          </div>
          
          {/* Top Used Presets */}
          <div className="border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('topUsed')}
              className="w-full flex items-center justify-between px-4 py-3 bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="font-medium">Top Used Presets</span>
                <span className="text-xs text-muted-foreground">({stats.topUsedPresets.length})</span>
              </div>
              {expandedSection === 'topUsed' ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
            {expandedSection === 'topUsed' && (
              <div className="p-4 space-y-2">
                {stats.topUsedPresets.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No usage data yet. Start using presets to see statistics!
                  </p>
                ) : (
                  stats.topUsedPresets.map(({ preset, usageCount }, index) => (
                    <div
                      key={preset.id}
                      className="flex items-center justify-between p-2 rounded-md hover:bg-accent/50 cursor-pointer transition-colors"
                      onClick={() => onSelectPreset?.(preset.id)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-muted-foreground w-6">
                          #{index + 1}
                        </span>
                        <div>
                          <p className="font-medium">{preset.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {preset.models.length} models
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-primary">{usageCount}</p>
                        <p className="text-xs text-muted-foreground">uses</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          
          {/* Recently Used */}
          <div className="border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('recent')}
              className="w-full flex items-center justify-between px-4 py-3 bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <span className="font-medium">Recently Used</span>
                <span className="text-xs text-muted-foreground">({stats.recentlyUsedPresets.length})</span>
              </div>
              {expandedSection === 'recent' ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
            {expandedSection === 'recent' && (
              <div className="p-4 space-y-2">
                {stats.recentlyUsedPresets.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No recent usage. Start using presets to see history!
                  </p>
                ) : (
                  stats.recentlyUsedPresets.map(({ preset, lastUsedAt }) => (
                    <div
                      key={preset.id}
                      className="flex items-center justify-between p-2 rounded-md hover:bg-accent/50 cursor-pointer transition-colors"
                      onClick={() => onSelectPreset?.(preset.id)}
                    >
                      <div>
                        <p className="font-medium">{preset.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {preset.models.length} models
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatRelativeTime(lastUsedAt)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          
          {/* Category Distribution */}
          <div className="border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('categories')}
              className="w-full flex items-center justify-between px-4 py-3 bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-purple-500" />
                <span className="font-medium">Category Distribution</span>
              </div>
              {expandedSection === 'categories' ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
            {expandedSection === 'categories' && (
              <div className="p-4 space-y-2">
                {categoryDistribution.map(([category, count]) => (
                  <div key={category} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">{category}</span>
                        <span className="text-sm text-muted-foreground">{count}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{
                            width: `${(count / stats.totalPresets) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Popular Models */}
          <div className="border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('models')}
              className="w-full flex items-center justify-between px-4 py-3 bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <BarChart2 className="h-4 w-4 text-orange-500" />
                <span className="font-medium">Popular Models</span>
              </div>
              {expandedSection === 'models' ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
            {expandedSection === 'models' && (
              <div className="p-4 space-y-2">
                {topModels.map(([model, count]) => (
                  <div key={model} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-mono">{model}</span>
                        <span className="text-sm text-muted-foreground">
                          {count} preset{count !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-orange-500 rounded-full transition-all"
                          style={{
                            width: `${(count / stats.totalPresets) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Activity Section */}
          <div className="border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('activity')}
              className="w-full flex items-center justify-between px-4 py-3 bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-cyan-500" />
                <span className="font-medium">Activity</span>
              </div>
              {expandedSection === 'activity' ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
            {expandedSection === 'activity' && (
              <div className="p-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-primary">
                      {stats.presetsCreatedThisWeek}
                    </p>
                    <p className="text-xs text-muted-foreground">Created This Week</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-primary">
                      {stats.presetsCreatedThisMonth}
                    </p>
                    <p className="text-xs text-muted-foreground">Created This Month</p>
                  </div>
                </div>
                
                {/* Simple usage trend visualization */}
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">Usage Trend (Last 7 Days)</p>
                  <div className="flex items-end gap-1 h-16">
                    {stats.usageTrend.map(({ date, count }) => {
                      const maxCount = Math.max(...stats.usageTrend.map(t => t.count), 1);
                      const height = (count / maxCount) * 100;
                      return (
                        <div
                          key={date}
                          className="flex-1 flex flex-col items-center gap-1"
                          title={`${date}: ${count} uses`}
                        >
                          <div
                            className="w-full bg-primary/80 rounded-t transition-all hover:bg-primary"
                            style={{ height: `${Math.max(height, 4)}%` }}
                          />
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(date).toLocaleDateString('en', { weekday: 'short' }).charAt(0)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Footer */}
        <div className="px-4 py-3 border-t border-border bg-card">
          <Button variant="outline" className="w-full" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

// Helper component for stat cards
function StatCard({ 
  icon, 
  label, 
  value 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: number | string;
}) {
  return (
    <div className="bg-muted/50 rounded-lg p-3 text-center">
      <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}

// Helper function to format relative time
function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}
