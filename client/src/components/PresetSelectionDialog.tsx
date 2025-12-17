import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check } from 'lucide-react';
import { MODEL_PRESETS } from '@/lib/ai-providers';
import { CustomPreset } from './PresetsManagementModal';
import { QuickPreset } from '@/lib/quick-presets';

interface PresetSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customPresets: CustomPreset[];
  quickPresets: QuickPreset[];
  onAdd: (presets: Array<{ sourceId: string; sourceType: 'built-in' | 'custom'; name: string; models: string[] }>) => void;
}

export function PresetSelectionDialog({
  open,
  onOpenChange,
  customPresets,
  quickPresets,
  onAdd
}: PresetSelectionDialogProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedPresetId, setSelectedPresetId] = useState<string>('');

  // Get all available presets (built-in + custom)
  const builtInPresets = Object.entries(MODEL_PRESETS).map(([key, preset]) => ({
    id: key,
    name: preset.name,
    models: preset.models,
    type: 'built-in' as const
  }));

  const customPresetsWithType = customPresets.map(preset => ({
    id: preset.id,
    name: preset.name,
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

  const handleSelectPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    const newSelected = new Set(selectedIds);
    if (newSelected.has(presetId)) {
      newSelected.delete(presetId);
    } else {
      newSelected.add(presetId);
    }
    setSelectedIds(newSelected);
    // Reset dropdown after selection
    setTimeout(() => setSelectedPresetId(''), 100);
  };

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
    setSelectedPresetId('');
    onOpenChange(false);
  };

  // Removed readonly workaround - now input works directly

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Add Presets to Quick Presets</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 min-h-[400px]">
          {/* Dropdown Selector */}
          <div>
            {availablePresets.length === 0 ? (
              <div className="text-center text-muted-foreground py-8 border border-dashed rounded-lg">
                All presets are already in Quick Presets
              </div>
            ) : (
              <Select value={selectedPresetId} onValueChange={handleSelectPreset}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a preset to add..." />
                </SelectTrigger>
                <SelectContent>
                  {availablePresets.map(preset => (
                    <SelectItem key={preset.id} value={preset.id}>
                      <div className="flex items-center gap-2">
                        <span>{preset.name}</span>
                        <span className="text-xs text-muted-foreground">({preset.models.length} models)</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Selected Presets List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {selectedIds.size === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                Select presets from the dropdown above
              </div>
            ) : (
              Array.from(selectedIds).map(id => {
                const preset = allPresets.find(p => p.id === id);
                if (!preset) return null;
                return (
                  <div
                    key={preset.id}
                    className="w-full p-4 rounded-lg border border-primary bg-primary/5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{preset.name}</h3>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                            {preset.type === 'built-in' ? 'Built-in' : 'Custom'}
                          </span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {preset.models.map((model, idx) => (
                            <span
                              key={idx}
                              className="text-xs px-2 py-1 rounded bg-secondary text-secondary-foreground"
                            >
                              {model}
                            </span>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const newSelected = new Set(selectedIds);
                          newSelected.delete(id);
                          setSelectedIds(newSelected);
                        }}
                        className="shrink-0 text-muted-foreground hover:text-foreground"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedIds(new Set());
                setSelectedPresetId('');
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            {selectedIds.size > 0 && (
              <Button onClick={handleAdd}>
                Add {selectedIds.size} {selectedIds.size === 1 ? 'preset' : 'presets'} to Quick Presets
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
