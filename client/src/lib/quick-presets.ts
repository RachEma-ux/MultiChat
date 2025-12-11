import { CustomPreset } from '@/components/PresetsManagementModal';
import { MODEL_PRESETS } from './ai-providers';

export interface QuickPreset {
  id: string;                    // Unique ID for this quick preset entry
  sourceId?: string;             // Reference to original preset ID (if from Presets Management)
  sourceType: 'built-in' | 'custom';  // Type of source preset
  name: string;                  // Display name (can be modified locally)
  models: string[];              // Selected models (can be modified locally)
  description?: string;          // Description (can be modified locally)
  tags?: string[];               // Tags (can be modified locally)
  isModified: boolean;           // True if different from source
}

/**
 * Initialize Quick Presets from built-in presets on first load
 */
export function initializeQuickPresets(): QuickPreset[] {
  const stored = localStorage.getItem('quickPresets');
  if (stored) {
    return JSON.parse(stored);
  }

  // Initialize with all built-in presets
  const builtInPresets: QuickPreset[] = Object.entries(MODEL_PRESETS).map(([key, preset]) => ({
    id: `quick-${Date.now()}-${key}`,
    sourceId: key,
    sourceType: 'built-in' as const,
    name: preset.name,
    models: preset.models,
    isModified: false
  }));

  localStorage.setItem('quickPresets', JSON.stringify(builtInPresets));
  return builtInPresets;
}

/**
 * Save Quick Presets to localStorage
 */
export function saveQuickPresets(presets: QuickPreset[]): void {
  localStorage.setItem('quickPresets', JSON.stringify(presets));
}

/**
 * Add a preset to Quick Presets
 */
export function addToQuickPresets(
  preset: CustomPreset | { name: string; models: string[] },
  sourceType: 'built-in' | 'custom',
  sourceId?: string
): QuickPreset {
  return {
    id: `quick-${Date.now()}-${Math.random()}`,
    sourceId,
    sourceType,
    name: preset.name,
    models: preset.models,
    description: 'description' in preset ? preset.description : undefined,
    tags: 'tags' in preset ? preset.tags : undefined,
    isModified: false
  };
}

/**
 * Get the source preset for a Quick Preset
 */
export function getSourcePreset(
  quickPreset: QuickPreset,
  customPresets: CustomPreset[]
): CustomPreset | { name: string; models: string[] } | null {
  if (!quickPreset.sourceId) return null;

  if (quickPreset.sourceType === 'built-in') {
    const preset = MODEL_PRESETS[quickPreset.sourceId as keyof typeof MODEL_PRESETS];
    if (preset) {
      return { name: preset.name, models: preset.models };
    }
  } else if (quickPreset.sourceType === 'custom') {
    return customPresets.find(p => p.id === quickPreset.sourceId) || null;
  }

  return null;
}

/**
 * Check if a Quick Preset has been modified from its source
 */
export function isQuickPresetModified(
  quickPreset: QuickPreset,
  customPresets: CustomPreset[]
): boolean {
  const source = getSourcePreset(quickPreset, customPresets);
  if (!source) return true; // Source deleted, consider modified

  // Compare name and models
  if (quickPreset.name !== source.name) return true;
  if (quickPreset.models.length !== source.models.length) return true;
  if (!quickPreset.models.every(m => source.models.includes(m))) return true;

  return false;
}

/**
 * Update a Quick Preset
 */
export function updateQuickPreset(
  presets: QuickPreset[],
  index: number,
  updates: Partial<QuickPreset>,
  customPresets: CustomPreset[]
): QuickPreset[] {
  const updated = [...presets];
  const preset = { ...updated[index], ...updates };
  
  // Check if modified from source
  preset.isModified = isQuickPresetModified(preset, customPresets);
  
  updated[index] = preset;
  return updated;
}

/**
 * Remove a Quick Preset
 */
export function removeQuickPreset(presets: QuickPreset[], index: number): QuickPreset[] {
  return presets.filter((_, i) => i !== index);
}
