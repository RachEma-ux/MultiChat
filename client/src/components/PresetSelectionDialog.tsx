import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Check, X } from 'lucide-react';
import { MODEL_PRESETS } from '@/lib/ai-providers';
import { CustomPreset } from './PresetsManagementModal';
import { QuickPreset } from '@/lib/quick-presets';

/**
 * Props for the PresetSelectionDialog component.
 */
interface PresetSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customPresets: CustomPreset[];
  quickPresets: QuickPreset[];
  onAdd: (presets: Array<{ sourceId: string; sourceType: 'built-in' | 'custom'; name: string; description?: string; models: string[] }>) => void;
  onCreateNew?: () => void;
}

/**
 * Simple inline panel for selecting presets to add to Quick Presets.
 * Optimized for mobile performance - no Radix Dialog, minimal DOM.
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
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Get all available presets (built-in + custom) - memoized
  const allPresets = useMemo(() => {
    const builtIn = Object.entries(MODEL_PRESETS).map(([key, preset]) => ({
      id: key,
      name: preset.name,
      description: preset.description,
      models: preset.models,
      type: 'built-in' as const
    }));

    const custom = customPresets.map(preset => ({
      id: preset.id,
      name: preset.name,
      description: preset.description,
      models: preset.models,
      type: 'custom' as const
    }));

    return [...builtIn, ...custom];
  }, [customPresets]);

  // Filter out presets already in Quick Presets - memoized with stable reference
  const quickPresetIds = useMemo(() => {
    return new Set(quickPresets.map(qp => `${qp.sourceType}:${qp.sourceId}`));
  }, [quickPresets]);

  const availablePresets = useMemo(() => {
    return allPresets.filter(preset => {
      const key = `${preset.type}:${preset.id}`;
      return !quickPresetIds.has(key);
    });
  }, [allPresets, quickPresetIds]);

  // Filter by search query - memoized
  const filteredPresets = useMemo(() => {
    if (!searchQuery.trim()) return availablePresets;
    const query = searchQuery.toLowerCase();
    return availablePresets.filter(preset => 
      preset.name.toLowerCase().includes(query) ||
      preset.models.some(model => model.toLowerCase().includes(query))
    );
  }, [availablePresets, searchQuery]);

  const togglePreset = useCallback((presetId: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(presetId)) {
        newSet.delete(presetId);
      } else {
        newSet.add(presetId);
      }
      return newSet;
    });
  }, []);

  const handleAdd = useCallback(() => {
    const presetsToAdd = allPresets
      .filter(p => selectedIds.has(p.id))
      .map(p => ({
        sourceId: p.id,
        sourceType: p.type,
        name: p.name,
        description: p.description,
        models: p.models
      }));

    onAdd(presetsToAdd);
    setSelectedIds(new Set());
    setSearchQuery('');
    onOpenChange(false);
  }, [allPresets, selectedIds, onAdd, onOpenChange]);

  const handleClose = useCallback(() => {
    setSelectedIds(new Set());
    setSearchQuery('');
    onOpenChange(false);
  }, [onOpenChange]);

  // Focus search input when panel opens
  useEffect(() => {
    if (open && searchInputRef.current) {
      const timer = setTimeout(() => searchInputRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Don't render anything if not open
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/50" onClick={handleClose}>
      <div 
        className="bg-background border border-border rounded-lg shadow-lg w-full max-w-md max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Add Presets</h2>
          <Button variant="ghost" size="sm" onClick={handleClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-col gap-3 p-4 flex-1 min-h-0">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              placeholder="Search presets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>

          {/* Simple Presets List */}
          <div className="flex-1 overflow-y-auto space-y-1 min-h-[150px] max-h-[300px]">
            {filteredPresets.length === 0 ? (
              <div className="text-center text-muted-foreground py-6 text-sm">
                {searchQuery ? 'No presets match your search' : 'All presets are already added'}
              </div>
            ) : (
              filteredPresets.map(preset => {
                const isSelected = selectedIds.has(preset.id);
                return (
                  <button
                    key={preset.id}
                    onClick={() => togglePreset(preset.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${
                      isSelected
                        ? 'bg-primary/10 border border-primary'
                        : 'bg-muted/50 hover:bg-muted border border-transparent'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'bg-primary border-primary text-primary-foreground'
                        : 'border-input bg-background'
                    }`}>
                      {isSelected && <Check className="h-3 w-3" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm truncate">{preset.name}</span>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {preset.models.length} models
                        </span>
                      </div>
                      {preset.type === 'custom' && (
                        <span className="text-[10px] text-muted-foreground">Custom</span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Create New Preset Link */}
          {onCreateNew && (
            <button
              onClick={() => {
                handleClose();
                onCreateNew();
              }}
              className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors py-2"
            >
              <Plus className="h-4 w-4" />
              Create New Preset
            </button>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-2 p-4 border-t">
          <Button variant="outline" size="sm" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            size="sm" 
            onClick={handleAdd}
            disabled={selectedIds.size === 0}
          >
            Add {selectedIds.size > 0 ? `(${selectedIds.size})` : ''}
          </Button>
        </div>
      </div>
    </div>
  );
}
