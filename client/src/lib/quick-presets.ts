import { MODEL_PRESETS } from './ai-providers';

export interface QuickPreset {
  id: string;
  sourceId: string; // ID of the original preset (built-in key or custom preset ID)
  sourceType: 'built-in' | 'custom';
  name: string; // Can be modified locally
  models: string[]; // Can be modified locally
  isModified: boolean; // True if name or models differ from source
}

const STORAGE_KEY = 'quickPresets';

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
      models: [...preset.models],
      isModified: false,
    };
  });
}

/**
 * Add new presets to Quick Presets
 */
export function addQuickPresets(
  currentPresets: QuickPreset[],
  newPresets: Array<{ sourceId: string; sourceType: 'built-in' | 'custom'; name: string; models: string[] }>
): QuickPreset[] {
  const added = newPresets.map((preset) => ({
    id: `quick-${Date.now()}-${Math.random()}`,
    sourceId: preset.sourceId,
    sourceType: preset.sourceType,
    name: preset.name,
    models: [...preset.models],
    isModified: false,
  }));
  
  return [...currentPresets, ...added];
}

/**
 * Update a Quick Preset
 */
export function updateQuickPreset(
  presets: QuickPreset[],
  id: string,
  updates: Partial<Pick<QuickPreset, 'name' | 'models'>>
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
