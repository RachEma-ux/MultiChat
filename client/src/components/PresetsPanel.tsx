import { Button } from '@/components/ui/button';
import { MODEL_PRESETS } from '@/lib/ai-providers';

interface CustomPreset {
  name: string;
  description?: string;
  models: string[];
}

interface PresetsPanelProps {
  onApplyPreset: (models: string[]) => void;
  customPresets?: CustomPreset[];
}

export function PresetsPanel({ onApplyPreset, customPresets = [] }: PresetsPanelProps) {
  // Built-in presets
  const builtInPresets = Object.entries(MODEL_PRESETS).map(([key, preset]) => ({
    id: key,
    name: preset.name,
    models: preset.models,
    isBuiltIn: true
  }));

  // Custom presets
  const customPresetsList = customPresets.map((preset, index) => ({
    id: `custom-${index}`,
    name: preset.name,
    models: preset.models,
    isBuiltIn: false
  }));

  // Merge all presets: built-in first, then custom
  const allPresets = [...builtInPresets, ...customPresetsList];

  return (
    <div className="p-3 md:p-4 border-b border-border bg-muted/50">
      <div className="mb-3 p-3 bg-background rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium">Quick Presets</h3>
        </div>
        <div className="space-y-2">
          {allPresets.map((preset) => (
            <Button
              key={preset.id}
              variant="outline"
              size="sm"
              onClick={() => onApplyPreset(preset.models)}
              className="w-full justify-start text-xs"
            >
              {preset.name}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
