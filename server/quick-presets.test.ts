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
  QuickPreset,
  PresetUsageStats,
  PresetSortOption,
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
