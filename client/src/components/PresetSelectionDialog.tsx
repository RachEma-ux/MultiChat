import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { MODEL_PRESETS } from '@/lib/ai-providers';
import { CustomPreset } from './PresetsManagementModal';
import { QuickPreset } from '@/lib/quick-presets';

/**
 * Preset categories for organizing built-in presets.
 * Each category maps to specific preset IDs from MODEL_PRESETS.
 * @constant
 */
const PRESET_CATEGORIES = {
  coding: {
    name: 'Coding',
    presetIds: ['coding'] // matches MODEL_PRESETS keys
  },
  writing: {
    name: 'Writing',
    presetIds: ['creative']
  },
  research: {
    name: 'Research',
    presetIds: ['research']
  },
  general: {
    name: 'General',
    presetIds: ['general', 'fast']
  }
};

/**
 * Props for the PresetSelectionDialog component.
 * @interface PresetSelectionDialogProps
 */
interface PresetSelectionDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback to change the open state */
  onOpenChange: (open: boolean) => void;
  /** Array of user-created custom presets */
  customPresets: CustomPreset[];
  /** Array of presets already in Quick Presets (to filter out) */
  quickPresets: QuickPreset[];
  /** Callback when presets are selected and added */
  onAdd: (presets: Array<{ sourceId: string; sourceType: 'built-in' | 'custom'; name: string; description?: string; models: string[] }>) => void;
  /** Optional callback to create a new preset */
  onCreateNew?: () => void;
}

/**
 * Modal dialog for selecting presets to add to Quick Presets.
 * Features:
 * - Search/filter presets by name or model
 * - Collapsible categories (Coding, Writing, Research, General, Custom)
 * - Multi-select with checkboxes
 * - Create new preset link
 * - Keyboard navigation support
 * 
 * @component
 * @example
 * <PresetSelectionDialog
 *   open={showDialog}
 *   onOpenChange={setShowDialog}
 *   customPresets={customPresets}
 *   quickPresets={quickPresets}
 *   onAdd={handleAddPresets}
 *   onCreateNew={() => setShowEditor(true)}
 * />
 */
export function PresetSelectionDialog({
  open,
  onOpenChange,
  customPresets,
  quickPresets,
  onAdd,
  onCreateNew
}: PresetSelectionDialogProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['coding', 'writing', 'research', 'general', 'custom']));
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const listRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Get all available presets (built-in + custom)
  const builtInPresets = Object.entries(MODEL_PRESETS).map(([key, preset]) => ({
    id: key,
    name: preset.name,
    description: preset.description,
    models: preset.models,
    type: 'built-in' as const
  }));

  const customPresetsWithType = customPresets.map(preset => ({
    id: preset.id,
    name: preset.name,
    description: preset.description,
    models: preset.models,
    type: 'custom' as const
  }));

  const allPresets = [...builtInPresets, ...customPresetsWithType];

  // Filter out presets already in Quick Presets
  const availablePresets = allPresets.filter(preset => {
    const alreadyInQuick = quickPresets.some(qp => 
      qp.sourceId === preset.id && qp.sourceType === preset.type
    );
    return !alreadyInQuick;
  });

  // Filter by search query
  const filteredPresets = useMemo(() => {
    if (!searchQuery.trim()) return availablePresets;
    const query = searchQuery.toLowerCase();
    return availablePresets.filter(preset => 
      preset.name.toLowerCase().includes(query) ||
      preset.models.some(model => model.toLowerCase().includes(query))
    );
  }, [availablePresets, searchQuery]);

  // Group presets by category
  const presetsByCategory = useMemo(() => {
    const result: Record<string, typeof filteredPresets> = {};
    
    // Initialize categories
    Object.keys(PRESET_CATEGORIES).forEach(cat => {
      result[cat] = [];
    });
    result['custom'] = [];

    filteredPresets.forEach(preset => {
      if (preset.type === 'custom') {
        result['custom'].push(preset);
      } else {
        // Find which category this built-in preset belongs to
        let found = false;
        for (const [catKey, catData] of Object.entries(PRESET_CATEGORIES)) {
          if (catData.presetIds.includes(preset.id)) {
            result[catKey].push(preset);
            found = true;
            break;
          }
        }
        // If not categorized, put in general
        if (!found) {
          result['general'].push(preset);
        }
      }
    });

    return result;
  }, [filteredPresets]);

  /**
   * Toggles the expanded/collapsed state of a category.
   * @param {string} category - The category key to toggle
   */
  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  /**
   * Toggles the selection state of a preset.
   * @param {string} presetId - The ID of the preset to toggle
   */
  const togglePreset = (presetId: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(presetId)) {
      newSelected.delete(presetId);
    } else {
      newSelected.add(presetId);
    }
    setSelectedIds(newSelected);
  };

  /**
   * Handles adding selected presets to Quick Presets.
   * Collects all selected presets and calls onAdd callback.
   */
  const handleAdd = () => {
    const presetsToAdd = allPresets
      .filter(p => selectedIds.has(p.id))
      .map(p => ({
        sourceId: p.id,
        sourceType: p.type,
        name: p.name,
        models: p.models
      }));

    onAdd(presetsToAdd);
    setSelectedIds(new Set());
    setSearchQuery('');
    onOpenChange(false);
  };

  /**
   * Handles closing the dialog and resetting state.
   */
  const handleClose = () => {
    setSelectedIds(new Set());
    setSearchQuery('');
    onOpenChange(false);
  };

  /**
   * Handles the "Create New Preset" action.
   * Closes the dialog and triggers the onCreateNew callback.
   */
  const handleCreateNew = () => {
    handleClose();
    if (onCreateNew) {
      onCreateNew();
    }
  };

  /**
   * Get flat list of all visible preset IDs for keyboard navigation.
   */
  const flatPresetIds = useMemo(() => {
    const ids: string[] = [];
    const categories = ['coding', 'writing', 'research', 'general', 'custom'];
    
    categories.forEach(catKey => {
      if (expandedCategories.has(catKey)) {
        const categoryPresets = presetsByCategory[catKey] || [];
        categoryPresets.forEach(p => ids.push(p.id));
      }
    });
    
    return ids;
  }, [presetsByCategory, expandedCategories]);

  /**
   * Handle keyboard navigation within the preset list.
   */
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (flatPresetIds.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => {
          const next = prev < flatPresetIds.length - 1 ? prev + 1 : 0;
          return next;
        });
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => {
          const next = prev > 0 ? prev - 1 : flatPresetIds.length - 1;
          return next;
        });
        break;
      case ' ':
      case 'Enter':
        if (focusedIndex >= 0 && focusedIndex < flatPresetIds.length) {
          e.preventDefault();
          togglePreset(flatPresetIds[focusedIndex]);
        }
        break;
      case 'Escape':
        handleClose();
        break;
    }
  }, [flatPresetIds, focusedIndex, togglePreset, handleClose]);

  // Reset focus when search changes
  useEffect(() => {
    setFocusedIndex(-1);
  }, [searchQuery]);

  // Focus search input when dialog opens
  useEffect(() => {
    if (open && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [open]);

  // Scroll focused item into view
  useEffect(() => {
    if (focusedIndex >= 0 && listRef.current) {
      const focusedId = flatPresetIds[focusedIndex];
      const element = listRef.current.querySelector(`[data-preset-id="${focusedId}"]`);
      if (element) {
        element.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [focusedIndex, flatPresetIds]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Presets to Quick Presets</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 flex-1 min-h-0" onKeyDown={handleKeyDown}>
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              placeholder="Search presets... (↑↓ to navigate, Space to select)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Presets List with Categories */}
          <div ref={listRef} className="flex-1 overflow-y-auto space-y-2 pr-2 min-h-[300px]">
            {filteredPresets.length === 0 ? (
              <div className="text-center text-muted-foreground py-8 border border-dashed rounded-lg">
                {searchQuery ? 'No presets match your search' : 'All presets are already in Quick Presets'}
              </div>
            ) : (
              <>
                {/* Built-in Categories */}
                {Object.entries(PRESET_CATEGORIES).map(([catKey, catData]) => {
                  const categoryPresets = presetsByCategory[catKey] || [];
                  if (categoryPresets.length === 0) return null;

                  const isExpanded = expandedCategories.has(catKey);
                  const selectedCount = categoryPresets.filter(p => selectedIds.has(p.id)).length;

                  return (
                    <div key={catKey} className="border rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleCategory(catKey)}
                        className="w-full flex items-center justify-between p-3 bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                          <span className="font-medium">{catData.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ({categoryPresets.length} preset{categoryPresets.length !== 1 ? 's' : ''})
                          </span>
                        </div>
                        {selectedCount > 0 && (
                          <span className="text-xs px-2 py-0.5 bg-primary text-primary-foreground rounded-full">
                            {selectedCount} selected
                          </span>
                        )}
                      </button>
                      {isExpanded && (
                        <div className="p-2 space-y-1">
                          {categoryPresets.map(preset => {
                            const isFocused = flatPresetIds[focusedIndex] === preset.id;
                            return (
                            <button
                              key={preset.id}
                              data-preset-id={preset.id}
                              onClick={() => togglePreset(preset.id)}
                              className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                                selectedIds.has(preset.id)
                                  ? 'bg-primary/10 border border-primary'
                                  : 'bg-background hover:bg-muted border border-transparent'
                              } ${isFocused ? 'ring-2 ring-primary ring-offset-1' : ''}`}
                            >
                              <div className="flex-1 text-left">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{preset.name}</span>
                                  <span className="text-xs text-muted-foreground">
                                    ({preset.models.length} models)
                                  </span>
                                </div>
                                {preset.description && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {preset.description}
                                  </p>
                                )}
                              </div>
                              <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                                selectedIds.has(preset.id)
                                  ? 'bg-primary border-primary text-primary-foreground'
                                  : 'border-input'
                              }`}>
                                {selectedIds.has(preset.id) && <span className="text-xs">✓</span>}
                              </div>
                            </button>
                          );
                        })}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Custom Presets Category */}
                {(presetsByCategory['custom'] || []).length > 0 && (
                  <div className="border rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleCategory('custom')}
                      className="w-full flex items-center justify-between p-3 bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        {expandedCategories.has('custom') ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                        <span className="font-medium">Custom Presets</span>
                        <span className="text-xs text-muted-foreground">
                          ({presetsByCategory['custom'].length} preset{presetsByCategory['custom'].length !== 1 ? 's' : ''})
                        </span>
                      </div>
                      {presetsByCategory['custom'].filter(p => selectedIds.has(p.id)).length > 0 && (
                        <span className="text-xs px-2 py-0.5 bg-primary text-primary-foreground rounded-full">
                          {presetsByCategory['custom'].filter(p => selectedIds.has(p.id)).length} selected
                        </span>
                      )}
                    </button>
                    {expandedCategories.has('custom') && (
                      <div className="p-2 space-y-1">
                        {presetsByCategory['custom'].map(preset => {
                          const isFocused = flatPresetIds[focusedIndex] === preset.id;
                          return (
                          <button
                            key={preset.id}
                            data-preset-id={preset.id}
                            onClick={() => togglePreset(preset.id)}
                            className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                              selectedIds.has(preset.id)
                                ? 'bg-primary/10 border border-primary'
                                : 'bg-background hover:bg-muted border border-transparent'
                            } ${isFocused ? 'ring-2 ring-primary ring-offset-1' : ''}`}
                          >
                            <div className="flex-1 text-left">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{preset.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  ({preset.models.length} models)
                                </span>
                              </div>
                            </div>
                            <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                              selectedIds.has(preset.id)
                                ? 'bg-primary border-primary text-primary-foreground'
                                : 'border-input'
                            }`}>
                              {selectedIds.has(preset.id) && <span className="text-xs">✓</span>}
                            </div>
                          </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Create New Preset Link */}
          {onCreateNew && (
            <div className="border-t pt-3">
              <button
                onClick={handleCreateNew}
                className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Create New Preset
              </button>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            {selectedIds.size > 0 && (
              <Button onClick={handleAdd}>
                Add {selectedIds.size} {selectedIds.size === 1 ? 'preset' : 'presets'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
