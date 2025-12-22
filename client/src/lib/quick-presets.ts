import { MODEL_PRESETS } from './ai-providers';

export interface QuickPreset {
  id: string;
  sourceId: string; // ID of the original preset (built-in key or custom preset ID)
  sourceType: 'built-in' | 'custom';
  name: string; // Can be modified locally
  description?: string; // Brief description of the preset's use case
  models: string[]; // Can be modified locally
  isModified: boolean; // True if name or models differ from source
  isFavorite?: boolean; // True if preset is pinned/starred
  usageCount?: number; // Number of times preset has been used
  lastUsedAt?: string; // ISO timestamp of last usage
  createdAt?: string; // ISO timestamp when preset was added
}

/**
 * Preset version for history tracking
 */
export interface PresetVersion {
  id: string;
  presetId: string;
  name: string;
  description?: string;
  models: string[];
  timestamp: string;
  changeType: 'created' | 'renamed' | 'models_changed' | 'restored';
}

const STORAGE_KEY = 'quickPresets';
const USAGE_STORAGE_KEY = 'presetUsageStats';
const VERSION_HISTORY_KEY = 'presetVersionHistory';

/**
 * Sort options for presets
 */
export type PresetSortOption = 'manual' | 'usage' | 'name' | 'date' | 'favorites';

/**
 * Usage statistics for presets
 */
export interface PresetUsageStats {
  [presetId: string]: {
    usageCount: number;
    lastUsedAt: string;
  };
}

/**
 * Load usage stats from localStorage
 */
export function loadUsageStats(): PresetUsageStats {
  try {
    const stored = localStorage.getItem(USAGE_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load usage stats:', error);
  }
  return {};
}

/**
 * Save usage stats to localStorage
 */
export function saveUsageStats(stats: PresetUsageStats): void {
  try {
    localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(stats));
  } catch (error) {
    console.error('Failed to save usage stats:', error);
  }
}

/**
 * Track preset usage - call this when a preset is applied
 */
export function trackPresetUsage(presetId: string): PresetUsageStats {
  const stats = loadUsageStats();
  const existing = stats[presetId] || { usageCount: 0, lastUsedAt: '' };
  stats[presetId] = {
    usageCount: existing.usageCount + 1,
    lastUsedAt: new Date().toISOString(),
  };
  saveUsageStats(stats);
  return stats;
}

/**
 * Get usage count for a preset
 */
export function getPresetUsageCount(presetId: string): number {
  const stats = loadUsageStats();
  return stats[presetId]?.usageCount || 0;
}

/**
 * Get most used presets sorted by usage count
 */
export function getMostUsedPresets(presets: QuickPreset[], limit: number = 5): QuickPreset[] {
  const stats = loadUsageStats();
  return [...presets]
    .map(p => ({ ...p, usageCount: stats[p.id]?.usageCount || 0 }))
    .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
    .slice(0, limit);
}

/**
 * Sort presets by the specified option
 */
export function sortPresets(presets: QuickPreset[], sortBy: PresetSortOption, usageStats: PresetUsageStats): QuickPreset[] {
  const sorted = [...presets];
  
  switch (sortBy) {
    case 'usage':
      return sorted.sort((a, b) => {
        const aUsage = usageStats[a.id]?.usageCount || 0;
        const bUsage = usageStats[b.id]?.usageCount || 0;
        return bUsage - aUsage;
      });
    
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    
    case 'date':
      return sorted.sort((a, b) => {
        const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bDate - aDate; // Newest first
      });
    
    case 'favorites':
      return sorted.sort((a, b) => {
        if (a.isFavorite && !b.isFavorite) return -1;
        if (!a.isFavorite && b.isFavorite) return 1;
        // Secondary sort by usage
        const aUsage = usageStats[a.id]?.usageCount || 0;
        const bUsage = usageStats[b.id]?.usageCount || 0;
        return bUsage - aUsage;
      });
    
    case 'manual':
    default:
      return sorted; // Keep original order
  }
}

/**
 * Load Quick Presets from localStorage
 */
export function loadQuickPresets(): QuickPreset[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load quick presets:', error);
  }
  
  // Return default built-in presets if nothing stored
  return initializeDefaultQuickPresets();
}

/**
 * Save Quick Presets to localStorage
 */
export function saveQuickPresets(presets: QuickPreset[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
  } catch (error) {
    console.error('Failed to save quick presets:', error);
  }
}

/**
 * Initialize default Quick Presets from built-in presets
 */
function initializeDefaultQuickPresets(): QuickPreset[] {
  const builtInKeys = Object.keys(MODEL_PRESETS);
  return builtInKeys.map((key) => {
    const preset = MODEL_PRESETS[key as keyof typeof MODEL_PRESETS];
    return {
      id: `quick-${Date.now()}-${Math.random()}`,
      sourceId: key,
      sourceType: 'built-in' as const,
      name: preset.name,
      description: preset.description,
      models: [...preset.models],
      isModified: false,
      isFavorite: false,
      createdAt: new Date().toISOString(),
    };
  });
}

/**
 * Add new presets to Quick Presets
 */
export function addQuickPresets(
  currentPresets: QuickPreset[],
  newPresets: Array<{ sourceId: string; sourceType: 'built-in' | 'custom'; name: string; description?: string; models: string[] }>
): QuickPreset[] {
  const now = new Date().toISOString();
  const added = newPresets.map((preset) => {
    const newPreset: QuickPreset = {
      id: `quick-${Date.now()}-${Math.random()}`,
      sourceId: preset.sourceId,
      sourceType: preset.sourceType,
      name: preset.name,
      description: preset.description,
      models: [...preset.models],
      isModified: false,
      isFavorite: false,
      createdAt: now,
    };
    // Record version history
    addVersionHistory(newPreset, 'created');
    return newPreset;
  });
  
  return [...currentPresets, ...added];
}

/**
 * Update a Quick Preset
 */
export function updateQuickPreset(
  presets: QuickPreset[],
  id: string,
  updates: Partial<Pick<QuickPreset, 'name' | 'models' | 'description' | 'isFavorite'>>
): QuickPreset[] {
  return presets.map((preset) => {
    if (preset.id !== id) return preset;
    
    const updated = { ...preset, ...updates };
    
    // Check if modified from source
    if (preset.sourceType === 'built-in') {
      const source = MODEL_PRESETS[preset.sourceId as keyof typeof MODEL_PRESETS];
      if (source) {
        updated.isModified =
          updated.name !== source.name ||
          JSON.stringify(updated.models.sort()) !== JSON.stringify([...source.models].sort());
      }
    }
    
    // Record version history for name or model changes
    if (updates.name && updates.name !== preset.name) {
      addVersionHistory(updated, 'renamed');
    } else if (updates.models && JSON.stringify(updates.models) !== JSON.stringify(preset.models)) {
      addVersionHistory(updated, 'models_changed');
    }
    
    return updated;
  });
}

/**
 * Remove a Quick Preset
 */
export function removeQuickPreset(presets: QuickPreset[], id: string): QuickPreset[] {
  return presets.filter((preset) => preset.id !== id);
}

/**
 * Reorder Quick Presets
 */
export function reorderQuickPresets(presets: QuickPreset[], startIndex: number, endIndex: number): QuickPreset[] {
  const result = Array.from(presets);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
}

/**
 * Toggle favorite status of a Quick Preset
 */
export function toggleFavorite(presets: QuickPreset[], id: string): QuickPreset[] {
  return presets.map((preset) => {
    if (preset.id !== id) return preset;
    return { ...preset, isFavorite: !preset.isFavorite };
  });
}

/**
 * Sort presets with favorites at the top
 */
export function sortByFavorite(presets: QuickPreset[]): QuickPreset[] {
  return [...presets].sort((a, b) => {
    if (a.isFavorite && !b.isFavorite) return -1;
    if (!a.isFavorite && b.isFavorite) return 1;
    return 0;
  });
}

/**
 * Export presets to JSON string
 */
export function exportPresets(presets: QuickPreset[]): string {
  const exportData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    presets: presets.map(p => ({
      name: p.name,
      description: p.description,
      models: p.models,
      sourceType: p.sourceType,
      sourceId: p.sourceId,
      isFavorite: p.isFavorite,
    })),
  };
  return JSON.stringify(exportData, null, 2);
}

/**
 * Import presets from JSON string
 */
export function importPresets(jsonString: string): QuickPreset[] | null {
  try {
    const data = JSON.parse(jsonString);
    if (!data.presets || !Array.isArray(data.presets)) {
      return null;
    }
    const now = new Date().toISOString();
    return data.presets.map((p: any) => ({
      id: `quick-${Date.now()}-${Math.random()}`,
      sourceId: p.sourceId || `imported-${Date.now()}`,
      sourceType: p.sourceType || 'custom',
      name: p.name,
      description: p.description,
      models: p.models || [],
      isModified: false,
      isFavorite: p.isFavorite || false,
      createdAt: now,
    }));
  } catch (error) {
    console.error('Failed to import presets:', error);
    return null;
  }
}


/**
 * Generate a shareable URL for a preset
 * The preset data is encoded in base64 in the URL hash
 */
export function generateShareableUrl(preset: QuickPreset): string {
  const shareData = {
    name: preset.name,
    description: preset.description,
    models: preset.models,
  };
  const encoded = btoa(JSON.stringify(shareData));
  const baseUrl = window.location.origin + window.location.pathname;
  return `${baseUrl}#preset=${encoded}`;
}

/**
 * Parse a preset from a shareable URL
 * Returns null if the URL doesn't contain valid preset data
 */
export function parsePresetFromUrl(url: string): { name: string; description?: string; models: string[] } | null {
  try {
    const hashIndex = url.indexOf('#preset=');
    if (hashIndex === -1) return null;
    
    const encoded = url.substring(hashIndex + 8);
    const decoded = atob(encoded);
    const data = JSON.parse(decoded);
    
    if (!data.name || !Array.isArray(data.models)) {
      return null;
    }
    
    return {
      name: data.name,
      description: data.description,
      models: data.models,
    };
  } catch (error) {
    console.error('Failed to parse preset from URL:', error);
    return null;
  }
}

/**
 * Check if current URL contains a shared preset and return it
 */
export function checkUrlForSharedPreset(): { name: string; description?: string; models: string[] } | null {
  return parsePresetFromUrl(window.location.href);
}

// ============================================
// VERSION HISTORY FUNCTIONS
// ============================================

/**
 * Load version history from localStorage
 */
export function loadVersionHistory(): PresetVersion[] {
  try {
    const stored = localStorage.getItem(VERSION_HISTORY_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load version history:', error);
  }
  return [];
}

/**
 * Save version history to localStorage
 */
export function saveVersionHistory(history: PresetVersion[]): void {
  try {
    // Keep only last 100 versions to prevent storage bloat
    const trimmed = history.slice(-100);
    localStorage.setItem(VERSION_HISTORY_KEY, JSON.stringify(trimmed));
  } catch (error) {
    console.error('Failed to save version history:', error);
  }
}

/**
 * Add a version to history
 */
export function addVersionHistory(preset: QuickPreset, changeType: PresetVersion['changeType']): void {
  const history = loadVersionHistory();
  const version: PresetVersion = {
    id: `version-${Date.now()}-${Math.random()}`,
    presetId: preset.id,
    name: preset.name,
    description: preset.description,
    models: [...preset.models],
    timestamp: new Date().toISOString(),
    changeType,
  };
  history.push(version);
  saveVersionHistory(history);
}

/**
 * Get version history for a specific preset
 */
export function getPresetVersionHistory(presetId: string): PresetVersion[] {
  const history = loadVersionHistory();
  return history
    .filter(v => v.presetId === presetId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

/**
 * Restore a preset to a previous version
 */
export function restorePresetVersion(
  presets: QuickPreset[],
  presetId: string,
  version: PresetVersion
): QuickPreset[] {
  return presets.map((preset) => {
    if (preset.id !== presetId) return preset;
    
    const restored: QuickPreset = {
      ...preset,
      name: version.name,
      description: version.description,
      models: [...version.models],
    };
    
    // Record the restore action
    addVersionHistory(restored, 'restored');
    
    return restored;
  });
}

/**
 * Get all unique presets that have version history
 */
export function getPresetsWithHistory(): string[] {
  const history = loadVersionHistory();
  return [...new Set(history.map(v => v.presetId))];
}

// ============================================
// RECOMMENDATION FUNCTIONS
// ============================================

/**
 * Recommendation based on usage patterns
 */
export interface PresetRecommendation {
  preset: QuickPreset;
  reason: string;
  score: number;
}

/**
 * Get preset recommendations based on usage patterns
 */
export function getPresetRecommendations(
  presets: QuickPreset[],
  usageStats: PresetUsageStats,
  currentModels: string[],
  limit: number = 3
): PresetRecommendation[] {
  const recommendations: PresetRecommendation[] = [];
  
  // 1. Recommend frequently used presets
  const frequentlyUsed = presets
    .filter(p => (usageStats[p.id]?.usageCount || 0) > 0)
    .sort((a, b) => (usageStats[b.id]?.usageCount || 0) - (usageStats[a.id]?.usageCount || 0))
    .slice(0, 2);
  
  frequentlyUsed.forEach(preset => {
    const count = usageStats[preset.id]?.usageCount || 0;
    recommendations.push({
      preset,
      reason: `Used ${count} time${count > 1 ? 's' : ''} - your most used preset`,
      score: count * 10,
    });
  });
  
  // 2. Recommend based on similar model selection
  if (currentModels.length > 0) {
    presets.forEach(preset => {
      const overlap = preset.models.filter(m => currentModels.includes(m)).length;
      if (overlap > 0 && overlap < preset.models.length) {
        const similarity = overlap / Math.max(preset.models.length, currentModels.length);
        if (similarity >= 0.3 && similarity < 1) {
          recommendations.push({
            preset,
            reason: `Similar to your current selection (${overlap} model${overlap > 1 ? 's' : ''} in common)`,
            score: similarity * 50,
          });
        }
      }
    });
  }
  
  // 3. Recommend recently used presets
  const recentlyUsed = presets
    .filter(p => usageStats[p.id]?.lastUsedAt)
    .sort((a, b) => {
      const aTime = new Date(usageStats[a.id]?.lastUsedAt || 0).getTime();
      const bTime = new Date(usageStats[b.id]?.lastUsedAt || 0).getTime();
      return bTime - aTime;
    })
    .slice(0, 2);
  
  recentlyUsed.forEach(preset => {
    const lastUsed = usageStats[preset.id]?.lastUsedAt;
    if (lastUsed) {
      const hoursAgo = (Date.now() - new Date(lastUsed).getTime()) / (1000 * 60 * 60);
      if (hoursAgo < 24) {
        recommendations.push({
          preset,
          reason: `Used recently (${hoursAgo < 1 ? 'less than an hour' : Math.round(hoursAgo) + ' hours'} ago)`,
          score: Math.max(0, 30 - hoursAgo),
        });
      }
    }
  });
  
  // 4. Recommend favorited presets that haven't been used recently
  const favoritesNotRecent = presets
    .filter(p => p.isFavorite)
    .filter(p => {
      const lastUsed = usageStats[p.id]?.lastUsedAt;
      if (!lastUsed) return true;
      const hoursAgo = (Date.now() - new Date(lastUsed).getTime()) / (1000 * 60 * 60);
      return hoursAgo > 24;
    });
  
  favoritesNotRecent.forEach(preset => {
    recommendations.push({
      preset,
      reason: 'One of your favorites',
      score: 25,
    });
  });
  
  // Remove duplicates and sort by score
  const uniqueRecommendations = recommendations
    .filter((rec, index, self) => 
      index === self.findIndex(r => r.preset.id === rec.preset.id)
    )
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
  
  return uniqueRecommendations;
}

/**
 * Get time-based recommendations (e.g., morning vs evening patterns)
 */
export function getTimeBasedRecommendations(
  presets: QuickPreset[],
  usageStats: PresetUsageStats
): QuickPreset[] {
  const currentHour = new Date().getHours();
  const isWorkHours = currentHour >= 9 && currentHour < 17;
  
  // Simple heuristic: during work hours, recommend coding/research presets
  // Outside work hours, recommend creative/general presets
  const workKeywords = ['coding', 'code', 'research', 'technical', 'development', 'analyst'];
  const leisureKeywords = ['creative', 'writing', 'brainstorm', 'general'];
  
  const keywords = isWorkHours ? workKeywords : leisureKeywords;
  
  return presets.filter(preset => {
    const nameLower = preset.name.toLowerCase();
    const descLower = (preset.description || '').toLowerCase();
    return keywords.some(kw => nameLower.includes(kw) || descLower.includes(kw));
  }).slice(0, 2);
}

// ============================================
// PRESET TEMPLATES
// ============================================

/**
 * Preset templates for common use cases
 */
export interface PresetTemplate {
  id: string;
  name: string;
  description: string;
  category: 'support' | 'writing' | 'brainstorm' | 'analysis' | 'development';
  suggestedModels: string[];
  systemPrompt?: string;
}

export const PRESET_TEMPLATES: PresetTemplate[] = [
  // Customer Support Templates
  {
    id: 'template-support-friendly',
    name: 'Friendly Support Agent',
    description: 'Warm, empathetic responses for customer inquiries',
    category: 'support',
    suggestedModels: ['gpt-4o', 'claude-3-5-sonnet-20241022', 'gemini-1.5-pro'],
    systemPrompt: 'You are a friendly and empathetic customer support agent. Be warm, understanding, and helpful.',
  },
  {
    id: 'template-support-technical',
    name: 'Technical Support Specialist',
    description: 'Detailed technical troubleshooting and solutions',
    category: 'support',
    suggestedModels: ['gpt-4o', 'claude-3-5-sonnet-20241022', 'deepseek-chat'],
    systemPrompt: 'You are a technical support specialist. Provide clear, step-by-step troubleshooting guidance.',
  },
  
  // Technical Writing Templates
  {
    id: 'template-writing-docs',
    name: 'Documentation Writer',
    description: 'Clear, structured technical documentation',
    category: 'writing',
    suggestedModels: ['claude-3-5-sonnet-20241022', 'gpt-4o', 'gemini-1.5-pro'],
    systemPrompt: 'You are a technical writer. Create clear, well-structured documentation with examples.',
  },
  {
    id: 'template-writing-blog',
    name: 'Blog Post Creator',
    description: 'Engaging blog posts with SEO optimization',
    category: 'writing',
    suggestedModels: ['claude-3-5-sonnet-20241022', 'gpt-4o', 'gemini-1.5-flash'],
    systemPrompt: 'You are a professional blog writer. Create engaging, SEO-friendly content.',
  },
  {
    id: 'template-writing-email',
    name: 'Professional Email Writer',
    description: 'Polished business emails and correspondence',
    category: 'writing',
    suggestedModels: ['gpt-4o', 'claude-3-5-sonnet-20241022'],
    systemPrompt: 'You are a professional communication specialist. Write clear, polished business emails.',
  },
  
  // Brainstorming Templates
  {
    id: 'template-brainstorm-ideas',
    name: 'Creative Ideation',
    description: 'Generate diverse creative ideas and concepts',
    category: 'brainstorm',
    suggestedModels: ['claude-3-5-sonnet-20241022', 'gpt-4o', 'gemini-1.5-pro'],
    systemPrompt: 'You are a creative consultant. Generate diverse, innovative ideas without self-censoring.',
  },
  {
    id: 'template-brainstorm-problem',
    name: 'Problem Solver',
    description: 'Analyze problems from multiple angles',
    category: 'brainstorm',
    suggestedModels: ['gpt-4o', 'claude-3-5-sonnet-20241022', 'deepseek-chat'],
    systemPrompt: 'You are a strategic problem solver. Analyze issues from multiple perspectives and suggest solutions.',
  },
  {
    id: 'template-brainstorm-critique',
    name: 'Devil\'s Advocate',
    description: 'Challenge assumptions and find weaknesses',
    category: 'brainstorm',
    suggestedModels: ['claude-3-5-sonnet-20241022', 'gpt-4o'],
    systemPrompt: 'You are a critical thinker. Challenge assumptions, find weaknesses, and suggest improvements.',
  },
  
  // Analysis Templates
  {
    id: 'template-analysis-data',
    name: 'Data Analyst',
    description: 'Interpret data and extract insights',
    category: 'analysis',
    suggestedModels: ['gpt-4o', 'claude-3-5-sonnet-20241022', 'deepseek-chat'],
    systemPrompt: 'You are a data analyst. Interpret data, identify patterns, and provide actionable insights.',
  },
  {
    id: 'template-analysis-research',
    name: 'Research Assistant',
    description: 'Comprehensive research and summarization',
    category: 'analysis',
    suggestedModels: ['claude-3-5-sonnet-20241022', 'gpt-4o', 'gemini-1.5-pro'],
    systemPrompt: 'You are a research assistant. Provide thorough, well-sourced information and summaries.',
  },
  
  // Development Templates
  {
    id: 'template-dev-code-review',
    name: 'Code Reviewer',
    description: 'Review code for bugs, style, and best practices',
    category: 'development',
    suggestedModels: ['claude-3-5-sonnet-20241022', 'gpt-4o', 'deepseek-coder'],
    systemPrompt: 'You are a senior code reviewer. Identify bugs, suggest improvements, and enforce best practices.',
  },
  {
    id: 'template-dev-architect',
    name: 'System Architect',
    description: 'Design scalable system architectures',
    category: 'development',
    suggestedModels: ['claude-3-5-sonnet-20241022', 'gpt-4o', 'deepseek-chat'],
    systemPrompt: 'You are a system architect. Design scalable, maintainable architectures with clear explanations.',
  },
];

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: PresetTemplate['category']): PresetTemplate[] {
  return PRESET_TEMPLATES.filter(t => t.category === category);
}

/**
 * Get all template categories
 */
export function getTemplateCategories(): { id: PresetTemplate['category']; name: string; count: number }[] {
  const categories: { id: PresetTemplate['category']; name: string }[] = [
    { id: 'support', name: 'Customer Support' },
    { id: 'writing', name: 'Technical Writing' },
    { id: 'brainstorm', name: 'Brainstorming' },
    { id: 'analysis', name: 'Analysis' },
    { id: 'development', name: 'Development' },
  ];
  
  return categories.map(cat => ({
    ...cat,
    count: PRESET_TEMPLATES.filter(t => t.category === cat.id).length,
  }));
}

/**
 * Create a QuickPreset from a template
 */
export function createPresetFromTemplate(template: PresetTemplate): QuickPreset {
  return {
    id: `quick-${Date.now()}-${Math.random()}`,
    sourceId: template.id,
    sourceType: 'custom',
    name: template.name,
    description: template.description,
    models: [...template.suggestedModels],
    isModified: false,
    isFavorite: false,
    usageCount: 0,
    createdAt: new Date().toISOString(),
  };
}
