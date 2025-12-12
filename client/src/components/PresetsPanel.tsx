import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { QuickPreset } from '@/lib/quick-presets';

interface PresetsPanelProps {
  onApplyPreset: (models: string[]) => void;
  quickPresets: QuickPreset[];
  onNewPreset: () => void;
  onEditPreset: (id: string) => void;
  onDeletePreset: (id: string) => void;
}

export function PresetsPanel({
  onApplyPreset,
  quickPresets,
  onNewPreset,
  onEditPreset,
  onDeletePreset
}: PresetsPanelProps) {

  return (
    <div className="p-3 md:p-4 border-b border-border bg-muted/50">
      <div className="mb-3 p-3 bg-background rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium">Quick Presets</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onNewPreset}
            onTouchEnd={(e) => { e.preventDefault(); onNewPreset(); }}
            className="h-7 px-2 text-xs gap-1"
          >
            <Plus className="h-3 w-3" />
            New
          </Button>
        </div>
        <div className="space-y-2">
          {quickPresets.map((preset) => (
            <div key={preset.id} className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onApplyPreset(preset.models)}
                onTouchEnd={(e) => { e.preventDefault(); onApplyPreset(preset.models); }}
                className="flex-1 justify-between text-xs h-8"
              >
                <span className="flex-1 text-left truncate">
                  {preset.name}
                </span>
                <span className="ml-2 px-2 py-0.5 bg-primary/10 text-primary rounded-full text-[10px] font-medium">
                  {preset.models.length}
                </span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEditPreset(preset.id)}
                onTouchEnd={(e) => { e.preventDefault(); onEditPreset(preset.id); }}
                className="h-8 w-8 p-0"
                title="Edit preset"
              >
                <Pencil className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDeletePreset(preset.id)}
                onTouchEnd={(e) => { e.preventDefault(); onDeletePreset(preset.id); }}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                title="Delete preset"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
