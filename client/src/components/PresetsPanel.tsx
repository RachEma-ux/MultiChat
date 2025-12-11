import { Button } from '@/components/ui/button';
import { MODEL_PRESETS } from '@/lib/ai-providers';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { QuickPreset } from '@/lib/quick-presets';

interface PresetsPanelProps {
  onApplyPreset: (models: string[]) => void;
  quickPresets?: QuickPreset[];
  onOpenPresetsManagement?: () => void;
  onEditPreset?: (preset: QuickPreset, index: number) => void;
  onDeletePreset?: (index: number) => void;
  onRenamePreset?: (index: number, newName: string) => void;
}

export function PresetsPanel({ 
  onApplyPreset, 
  quickPresets = [],
  onOpenPresetsManagement,
  onEditPreset,
  onDeletePreset,
  onRenamePreset
}: PresetsPanelProps) {
  const [editingPresetIndex, setEditingPresetIndex] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');

  return (
    <div className="p-3 md:p-4 border-b border-border bg-muted/50">
      <div className="mb-3 p-3 bg-background rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium">Quick Presets</h3>
          {onOpenPresetsManagement && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onOpenPresetsManagement}
              className="h-7 px-2 text-xs"
            >
              <Plus className="w-3 h-3 mr-1" />
              New
            </Button>
          )}
        </div>
        <div className="space-y-2">
          {quickPresets.map((preset, index) => {
            const isEditing = editingPresetIndex === index;
            
            return (
              <div key={preset.id} className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onApplyPreset(preset.models)}
                  className="flex-1 justify-between text-xs"
                >
                  {isEditing ? (
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onBlur={() => {
                        if (editingName.trim() && onRenamePreset) {
                          onRenamePreset(index, editingName.trim());
                        }
                        setEditingPresetIndex(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          if (editingName.trim() && onRenamePreset) {
                            onRenamePreset(index, editingName.trim());
                          }
                          setEditingPresetIndex(null);
                        } else if (e.key === 'Escape') {
                          setEditingPresetIndex(null);
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                      className="flex-1 bg-transparent border-none outline-none focus:ring-0 px-0"
                    />
                  ) : (
                    <span
                      onClick={(e) => {
                        if (onRenamePreset) {
                          e.stopPropagation();
                          setEditingPresetIndex(index);
                          setEditingName(preset.name);
                        }
                      }}
                      className="cursor-pointer hover:text-primary"
                    >
                      {preset.name}
                    </span>
                  )}
                  <span className="ml-2 px-2 py-0.5 bg-primary/10 text-primary rounded-full text-[10px] font-medium">
                    {preset.models.length}
                  </span>
                </Button>
                
                {onEditPreset && onDeletePreset && (
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditPreset(preset, index);
                      }}
                      className="h-8 w-8 p-0"
                      title="Edit preset"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeletePreset(index);
                      }}
                      className="h-8 w-8 p-0 hover:text-destructive"
                      title="Delete preset"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
