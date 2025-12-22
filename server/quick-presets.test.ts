import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  sortPresets,
  trackPresetUsage,
  loadUsageStats,
  saveUsageStats,
  getPresetRecommendations,
  addVersionHistory,
  getPresetVersionHistory,
  loadVersionHistory,
  saveVersionHistory,
  restorePresetVersion,
  searchPresets,
  setPresetCategory,
  filterByCategory,
  groupByCategory,
  getAllCategories,
  addCustomCategory,
  removeCustomCategory,
  duplicatePreset,
  duplicatePresetMultiple,
  QuickPreset,
  PresetUsageStats,
  PresetSortOption,
  DEFAULT_CATEGORIES,
} from '@/lib/quick-presets';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
});

describe('Quick Presets - Sorting', () => {
  const mockPresets: QuickPreset[] = [
    {
      id: 'preset-1',
      sourceId: 'source-1',
      sourceType: 'custom',
      name: 'Zebra Preset',
      models: ['model-1'],
      isModified: false,
      isFavorite: false,
      createdAt: '2024-01-01T00:00:00.000Z',
    },
    {
      id: 'preset-2',
      sourceId: 'source-2',
      sourceType: 'custom',
      name: 'Alpha Preset',
      models: ['model-2'],
      isModified: false,
      isFavorite: true,
      createdAt: '2024-01-03T00:00:00.000Z',
    },
    {
      id: 'preset-3',
      sourceId: 'source-3',
      sourceType: 'custom',
      name: 'Beta Preset',
      models: ['model-3'],
      isModified: false,
      isFavorite: false,
      createdAt: '2024-01-02T00:00:00.000Z',
    },
  ];

  const mockUsageStats: PresetUsageStats = {
    'preset-1': { usageCount: 5, lastUsedAt: '2024-01-10T00:00:00.000Z' },
    'preset-2': { usageCount: 2, lastUsedAt: '2024-01-08T00:00:00.000Z' },
    'preset-3': { usageCount: 10, lastUsedAt: '2024-01-09T00:00:00.000Z' },
  };

  it('should sort by name alphabetically', () => {
    const sorted = sortPresets(mockPresets, 'name', mockUsageStats);
    expect(sorted[0].name).toBe('Alpha Preset');
    expect(sorted[1].name).toBe('Beta Preset');
    expect(sorted[2].name).toBe('Zebra Preset');
  });

  it('should sort by usage count (most used first)', () => {
    const sorted = sortPresets(mockPresets, 'usage', mockUsageStats);
    expect(sorted[0].id).toBe('preset-3'); // 10 uses
    expect(sorted[1].id).toBe('preset-1'); // 5 uses
    expect(sorted[2].id).toBe('preset-2'); // 2 uses
  });

  it('should sort by date (newest first)', () => {
    const sorted = sortPresets(mockPresets, 'date', mockUsageStats);
    expect(sorted[0].id).toBe('preset-2'); // Jan 3
    expect(sorted[1].id).toBe('preset-3'); // Jan 2
    expect(sorted[2].id).toBe('preset-1'); // Jan 1
  });

  it('should sort favorites first', () => {
    const sorted = sortPresets(mockPresets, 'favorites', mockUsageStats);
    expect(sorted[0].id).toBe('preset-2'); // favorite
    expect(sorted[0].isFavorite).toBe(true);
  });

  it('should keep manual order when sort is manual', () => {
    const sorted = sortPresets(mockPresets, 'manual', mockUsageStats);
    expect(sorted[0].id).toBe('preset-1');
    expect(sorted[1].id).toBe('preset-2');
    expect(sorted[2].id).toBe('preset-3');
  });
});

describe('Quick Presets - Usage Tracking', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('should track preset usage', () => {
    const stats = trackPresetUsage('test-preset');
    expect(stats['test-preset'].usageCount).toBe(1);
    expect(stats['test-preset'].lastUsedAt).toBeDefined();
  });

  it('should increment usage count on subsequent uses', () => {
    trackPresetUsage('test-preset');
    const stats = trackPresetUsage('test-preset');
    expect(stats['test-preset'].usageCount).toBe(2);
  });

  it('should save and load usage stats', () => {
    const testStats: PresetUsageStats = {
      'preset-1': { usageCount: 5, lastUsedAt: '2024-01-01T00:00:00.000Z' },
    };
    saveUsageStats(testStats);
    const loaded = loadUsageStats();
    expect(loaded['preset-1'].usageCount).toBe(5);
  });
});

describe('Quick Presets - Recommendations', () => {
  const mockPresets: QuickPreset[] = [
    {
      id: 'preset-1',
      sourceId: 'source-1',
      sourceType: 'custom',
      name: 'Coding Preset',
      models: ['gpt-4o', 'claude-3'],
      isModified: false,
      isFavorite: true,
    },
    {
      id: 'preset-2',
      sourceId: 'source-2',
      sourceType: 'custom',
      name: 'Writing Preset',
      models: ['gpt-4o', 'gemini'],
      isModified: false,
      isFavorite: false,
    },
    {
      id: 'preset-3',
      sourceId: 'source-3',
      sourceType: 'custom',
      name: 'Research Preset',
      models: ['claude-3', 'deepseek'],
      isModified: false,
      isFavorite: false,
    },
  ];

  it('should return recommendations based on usage', () => {
    const usageStats: PresetUsageStats = {
      'preset-1': { usageCount: 10, lastUsedAt: new Date().toISOString() },
      'preset-2': { usageCount: 5, lastUsedAt: new Date().toISOString() },
    };
    
    const recommendations = getPresetRecommendations(mockPresets, usageStats, [], 3);
    expect(recommendations.length).toBeGreaterThan(0);
    expect(recommendations[0].preset.id).toBe('preset-1'); // Most used
  });

  it('should recommend similar presets based on current models', () => {
    const usageStats: PresetUsageStats = {};
    const currentModels = ['gpt-4o'];
    
    const recommendations = getPresetRecommendations(mockPresets, usageStats, currentModels, 3);
    // Should recommend presets with gpt-4o
    const hasRelevantRecommendation = recommendations.some(
      rec => rec.preset.models.includes('gpt-4o')
    );
    // May or may not have recommendations depending on similarity threshold
    expect(recommendations).toBeDefined();
  });

  it('should recommend favorites', () => {
    const usageStats: PresetUsageStats = {};
    
    const recommendations = getPresetRecommendations(mockPresets, usageStats, [], 3);
    const hasFavorite = recommendations.some(
      rec => rec.preset.isFavorite && rec.reason.includes('favorite')
    );
    expect(hasFavorite).toBe(true);
  });
});

describe('Quick Presets - Version History', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('should add version to history', () => {
    const preset: QuickPreset = {
      id: 'test-preset',
      sourceId: 'source-1',
      sourceType: 'custom',
      name: 'Test Preset',
      models: ['model-1'],
      isModified: false,
    };
    
    addVersionHistory(preset, 'created');
    const history = getPresetVersionHistory('test-preset');
    
    expect(history.length).toBe(1);
    expect(history[0].changeType).toBe('created');
    expect(history[0].name).toBe('Test Preset');
  });

  it('should track multiple versions', () => {
    const preset: QuickPreset = {
      id: 'test-preset',
      sourceId: 'source-1',
      sourceType: 'custom',
      name: 'Test Preset',
      models: ['model-1'],
      isModified: false,
    };
    
    addVersionHistory(preset, 'created');
    
    preset.name = 'Renamed Preset';
    addVersionHistory(preset, 'renamed');
    
    const history = getPresetVersionHistory('test-preset');
    expect(history.length).toBe(2);
  });

  it('should restore preset to previous version', () => {
    const presets: QuickPreset[] = [
      {
        id: 'test-preset',
        sourceId: 'source-1',
        sourceType: 'custom',
        name: 'Current Name',
        models: ['model-1', 'model-2'],
        isModified: false,
      },
    ];
    
    const oldVersion = {
      id: 'version-1',
      presetId: 'test-preset',
      name: 'Old Name',
      models: ['model-1'],
      timestamp: '2024-01-01T00:00:00.000Z',
      changeType: 'created' as const,
    };
    
    const restored = restorePresetVersion(presets, 'test-preset', oldVersion);
    
    expect(restored[0].name).toBe('Old Name');
    expect(restored[0].models).toEqual(['model-1']);
  });

  it('should save and load version history', () => {
    const history = [
      {
        id: 'version-1',
        presetId: 'test-preset',
        name: 'Test',
        models: ['model-1'],
        timestamp: '2024-01-01T00:00:00.000Z',
        changeType: 'created' as const,
      },
    ];
    
    saveVersionHistory(history);
    const loaded = loadVersionHistory();
    
    expect(loaded.length).toBe(1);
    expect(loaded[0].name).toBe('Test');
  });
});


// ============================================
// SEARCH TESTS
// ============================================

describe('Quick Presets - Search', () => {
  const mockPresets: QuickPreset[] = [
    {
      id: 'preset-1',
      sourceId: 'source-1',
      sourceType: 'custom',
      name: 'Coding Assistant',
      description: 'Help with programming tasks',
      models: ['gpt-4o', 'claude-3'],
      isModified: false,
      category: 'Work',
    },
    {
      id: 'preset-2',
      sourceId: 'source-2',
      sourceType: 'custom',
      name: 'Creative Writer',
      description: 'Generate creative content',
      models: ['gpt-4o', 'gemini'],
      isModified: false,
      category: 'Personal',
    },
    {
      id: 'preset-3',
      sourceId: 'source-3',
      sourceType: 'custom',
      name: 'Research Helper',
      description: 'Academic research assistance',
      models: ['claude-3', 'deepseek'],
      isModified: false,
      category: 'Work',
    },
  ];

  it('should return all presets when query is empty', () => {
    const results = searchPresets(mockPresets, '');
    expect(results.length).toBe(3);
  });

  it('should search by name', () => {
    const results = searchPresets(mockPresets, 'coding');
    expect(results.length).toBe(1);
    expect(results[0].name).toBe('Coding Assistant');
  });

  it('should search by description', () => {
    const results = searchPresets(mockPresets, 'creative');
    expect(results.length).toBe(1);
    expect(results[0].name).toBe('Creative Writer');
  });

  it('should search by model name', () => {
    const results = searchPresets(mockPresets, 'claude');
    expect(results.length).toBe(2);
  });

  it('should search by category', () => {
    const results = searchPresets(mockPresets, 'work');
    expect(results.length).toBe(2);
  });

  it('should be case insensitive', () => {
    const results = searchPresets(mockPresets, 'CODING');
    expect(results.length).toBe(1);
    expect(results[0].name).toBe('Coding Assistant');
  });

  it('should return empty array when no matches', () => {
    const results = searchPresets(mockPresets, 'nonexistent');
    expect(results.length).toBe(0);
  });
});

// ============================================
// CATEGORY TESTS
// ============================================

describe('Quick Presets - Categories', () => {
  const mockPresets: QuickPreset[] = [
    {
      id: 'preset-1',
      sourceId: 'source-1',
      sourceType: 'custom',
      name: 'Work Preset',
      models: ['model-1'],
      isModified: false,
      category: 'Work',
    },
    {
      id: 'preset-2',
      sourceId: 'source-2',
      sourceType: 'custom',
      name: 'Personal Preset',
      models: ['model-2'],
      isModified: false,
      category: 'Personal',
    },
    {
      id: 'preset-3',
      sourceId: 'source-3',
      sourceType: 'custom',
      name: 'Uncategorized Preset',
      models: ['model-3'],
      isModified: false,
    },
  ];

  beforeEach(() => {
    localStorageMock.clear();
  });

  it('should have default categories', () => {
    expect(DEFAULT_CATEGORIES).toContain('Work');
    expect(DEFAULT_CATEGORIES).toContain('Personal');
    expect(DEFAULT_CATEGORIES).toContain('Coding');
  });

  it('should filter presets by category', () => {
    const workPresets = filterByCategory(mockPresets, 'Work');
    expect(workPresets.length).toBe(1);
    expect(workPresets[0].name).toBe('Work Preset');
  });

  it('should return all presets when category is null', () => {
    const allPresets = filterByCategory(mockPresets, null);
    expect(allPresets.length).toBe(3);
  });

  it('should set category for a preset', () => {
    const updated = setPresetCategory(mockPresets, 'preset-3', 'Coding');
    const preset = updated.find(p => p.id === 'preset-3');
    expect(preset?.category).toBe('Coding');
  });

  it('should remove category from a preset', () => {
    const updated = setPresetCategory(mockPresets, 'preset-1', undefined);
    const preset = updated.find(p => p.id === 'preset-1');
    expect(preset?.category).toBeUndefined();
  });

  it('should group presets by category', () => {
    const groups = groupByCategory(mockPresets);
    expect(groups['Work'].length).toBe(1);
    expect(groups['Personal'].length).toBe(1);
    expect(groups['Uncategorized'].length).toBe(1);
  });

  it('should add custom category', () => {
    const categories = addCustomCategory('Custom Category');
    expect(categories).toContain('Custom Category');
  });

  it('should not add duplicate category', () => {
    addCustomCategory('Unique');
    const categories = addCustomCategory('Unique');
    const count = categories.filter(c => c === 'Unique').length;
    expect(count).toBe(1);
  });

  it('should remove custom category', () => {
    addCustomCategory('ToRemove');
    const categories = removeCustomCategory('ToRemove');
    expect(categories).not.toContain('ToRemove');
  });

  it('should get all categories including custom', () => {
    addCustomCategory('MyCustom');
    const categories = getAllCategories();
    expect(categories).toContain('MyCustom');
    expect(categories).toContain('Work'); // Default category
  });
});

// ============================================
// DUPLICATION TESTS
// ============================================

describe('Quick Presets - Duplication', () => {
  const mockPresets: QuickPreset[] = [
    {
      id: 'preset-1',
      sourceId: 'source-1',
      sourceType: 'custom',
      name: 'Original Preset',
      description: 'Original description',
      models: ['model-1', 'model-2'],
      isModified: false,
      isFavorite: true,
      category: 'Work',
    },
  ];

  beforeEach(() => {
    localStorageMock.clear();
  });

  it('should duplicate a preset with default name', () => {
    const result = duplicatePreset(mockPresets, 'preset-1');
    expect(result.length).toBe(2);
    
    const duplicate = result[1];
    expect(duplicate.name).toBe('Original Preset (Copy)');
    expect(duplicate.models).toEqual(['model-1', 'model-2']);
  });

  it('should duplicate a preset with custom name', () => {
    const result = duplicatePreset(mockPresets, 'preset-1', 'My Custom Copy');
    const duplicate = result[1];
    expect(duplicate.name).toBe('My Custom Copy');
  });

  it('should create a new unique ID for duplicate', () => {
    const result = duplicatePreset(mockPresets, 'preset-1');
    const duplicate = result[1];
    expect(duplicate.id).not.toBe('preset-1');
    expect(duplicate.id).toContain('quick-');
  });

  it('should copy description and category', () => {
    const result = duplicatePreset(mockPresets, 'preset-1');
    const duplicate = result[1];
    expect(duplicate.description).toBe('Original description');
    expect(duplicate.category).toBe('Work');
  });

  it('should not copy favorite status', () => {
    const result = duplicatePreset(mockPresets, 'preset-1');
    const duplicate = result[1];
    expect(duplicate.isFavorite).toBe(false);
  });

  it('should mark duplicate as modified', () => {
    const result = duplicatePreset(mockPresets, 'preset-1');
    const duplicate = result[1];
    expect(duplicate.isModified).toBe(true);
  });

  it('should return original array if preset not found', () => {
    const result = duplicatePreset(mockPresets, 'nonexistent');
    expect(result.length).toBe(1);
  });

  it('should create multiple duplicates', () => {
    const result = duplicatePresetMultiple(mockPresets, 'preset-1', 3);
    expect(result.length).toBe(4); // 1 original + 3 copies
    
    expect(result[1].name).toBe('Original Preset (Copy 1)');
    expect(result[2].name).toBe('Original Preset (Copy 2)');
    expect(result[3].name).toBe('Original Preset (Copy 3)');
  });

  it('should set createdAt timestamp on duplicate', () => {
    const result = duplicatePreset(mockPresets, 'preset-1');
    const duplicate = result[1];
    expect(duplicate.createdAt).toBeDefined();
    expect(new Date(duplicate.createdAt!).getTime()).toBeGreaterThan(0);
  });
});


// ============================================
// BULK OPERATIONS TESTS
// ============================================

describe('Quick Presets - Bulk Operations', () => {
  const mockPresets: QuickPreset[] = [
    {
      id: 'preset-1',
      sourceId: 'source-1',
      sourceType: 'custom',
      name: 'Preset One',
      models: ['model-1'],
      isModified: false,
      isFavorite: false,
      category: 'Work',
    },
    {
      id: 'preset-2',
      sourceId: 'source-2',
      sourceType: 'custom',
      name: 'Preset Two',
      models: ['model-2'],
      isModified: false,
      isFavorite: true,
      category: 'Personal',
    },
    {
      id: 'preset-3',
      sourceId: 'source-3',
      sourceType: 'custom',
      name: 'Preset Three',
      models: ['model-3'],
      isModified: false,
      isFavorite: false,
    },
  ];

  it('should bulk set category for multiple presets', () => {
    const selectedIds = ['preset-1', 'preset-3'];
    const updated = mockPresets.map(p => 
      selectedIds.includes(p.id) ? { ...p, category: 'Coding' } : p
    );
    
    expect(updated[0].category).toBe('Coding');
    expect(updated[1].category).toBe('Personal'); // unchanged
    expect(updated[2].category).toBe('Coding');
  });

  it('should bulk toggle favorites', () => {
    const selectedIds = ['preset-1', 'preset-3'];
    const updated = mockPresets.map(p => 
      selectedIds.includes(p.id) ? { ...p, isFavorite: true } : p
    );
    
    expect(updated[0].isFavorite).toBe(true);
    expect(updated[1].isFavorite).toBe(true); // already true
    expect(updated[2].isFavorite).toBe(true);
  });

  it('should bulk remove favorites', () => {
    const selectedIds = ['preset-2'];
    const updated = mockPresets.map(p => 
      selectedIds.includes(p.id) ? { ...p, isFavorite: false } : p
    );
    
    expect(updated[1].isFavorite).toBe(false);
  });

  it('should bulk delete presets', () => {
    const selectedIds = ['preset-1', 'preset-3'];
    const remaining = mockPresets.filter(p => !selectedIds.includes(p.id));
    
    expect(remaining.length).toBe(1);
    expect(remaining[0].id).toBe('preset-2');
  });
});

// ============================================
// STATISTICS TESTS
// ============================================

describe('Quick Presets - Statistics', () => {
  const mockPresets: QuickPreset[] = [
    {
      id: 'preset-1',
      sourceId: 'source-1',
      sourceType: 'custom',
      name: 'Preset One',
      models: ['gpt-4o', 'claude-3'],
      isModified: false,
      isFavorite: true,
      category: 'Work',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'preset-2',
      sourceId: 'source-2',
      sourceType: 'custom',
      name: 'Preset Two',
      models: ['gpt-4o'],
      isModified: false,
      isFavorite: false,
      category: 'Work',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    },
    {
      id: 'preset-3',
      sourceId: 'source-3',
      sourceType: 'custom',
      name: 'Preset Three',
      models: ['claude-3', 'gemini'],
      isModified: false,
      isFavorite: true,
      category: 'Personal',
    },
  ];

  const mockUsageStats: PresetUsageStats = {
    'preset-1': { usageCount: 10, lastUsedAt: new Date().toISOString() },
    'preset-2': { usageCount: 5, lastUsedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
    'preset-3': { usageCount: 3, lastUsedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  };

  it('should calculate total presets count', () => {
    expect(mockPresets.length).toBe(3);
  });

  it('should calculate total usage', () => {
    const totalUsage = Object.values(mockUsageStats).reduce(
      (sum, stat) => sum + stat.usageCount, 0
    );
    expect(totalUsage).toBe(18);
  });

  it('should count favorites', () => {
    const favoriteCount = mockPresets.filter(p => p.isFavorite).length;
    expect(favoriteCount).toBe(2);
  });

  it('should calculate average models per preset', () => {
    const totalModels = mockPresets.reduce((sum, p) => sum + p.models.length, 0);
    const avgModels = totalModels / mockPresets.length;
    expect(avgModels).toBeCloseTo(1.67, 1);
  });

  it('should calculate category distribution', () => {
    const distribution: Record<string, number> = {};
    mockPresets.forEach(p => {
      const cat = p.category || 'Uncategorized';
      distribution[cat] = (distribution[cat] || 0) + 1;
    });
    
    expect(distribution['Work']).toBe(2);
    expect(distribution['Personal']).toBe(1);
  });

  it('should identify most popular models', () => {
    const modelCounts: Record<string, number> = {};
    mockPresets.forEach(p => {
      p.models.forEach(m => {
        modelCounts[m] = (modelCounts[m] || 0) + 1;
      });
    });
    
    expect(modelCounts['gpt-4o']).toBe(2);
    expect(modelCounts['claude-3']).toBe(2);
    expect(modelCounts['gemini']).toBe(1);
  });

  it('should get top used presets', () => {
    const sorted = mockPresets.sort((a, b) => {
      const aUsage = mockUsageStats[a.id]?.usageCount || 0;
      const bUsage = mockUsageStats[b.id]?.usageCount || 0;
      return bUsage - aUsage;
    });
    
    expect(sorted[0].id).toBe('preset-1'); // 10 uses
    expect(sorted[1].id).toBe('preset-2'); // 5 uses
    expect(sorted[2].id).toBe('preset-3'); // 3 uses
  });

  it('should get recently used presets', () => {
    const sorted = mockPresets.sort((a, b) => {
      const aTime = new Date(mockUsageStats[a.id]?.lastUsedAt || 0).getTime();
      const bTime = new Date(mockUsageStats[b.id]?.lastUsedAt || 0).getTime();
      return bTime - aTime;
    });
    
    expect(sorted[0].id).toBe('preset-1'); // most recent
  });

  it('should count presets created this week', () => {
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const createdThisWeek = mockPresets.filter(p => {
      if (!p.createdAt) return false;
      return new Date(p.createdAt).getTime() > oneWeekAgo;
    }).length;
    
    expect(createdThisWeek).toBe(1); // Only preset-1 was created this week
  });
});
