import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus, Pencil, Trash2 } from 'lucide-react';
import { AI_PROVIDERS } from '@/lib/ai-providers';
import { CustomPreset } from './PresetsManagementModal';

interface ModelSelectorProps {
  selectedModels: string[];
  selectedProvider: string;
  selectedModel: string;
  showPresets?: boolean;
  onProviderChange: (provider: string) => void;
  onModelChange: (model: string) => void;
  onToggleModel: (provider: string, model: string) => void;
  onAddModel: () => void;
  onTogglePresets?: () => void;
  onApplyPreset?: (preset: { name: string; models: string[] }) => void;
  onCreatePreset?: () => void;
  customPresets?: CustomPreset[];
  onEditPreset?: (preset: CustomPreset) => void;
  onDeletePreset?: (id: string) => void;
}

const getProviderColor = (provider?: string): string => {
  if (!provider) return 'bg-gray-500';
  const providerData = AI_PROVIDERS[provider as keyof typeof AI_PROVIDERS];
  return providerData?.color || 'bg-gray-500';
};

export function ModelSelector({
  selectedModels,
  selectedProvider,
  selectedModel,
  showPresets = false,
  onProviderChange,
  onModelChange,
  onToggleModel,
  onAddModel,
  onTogglePresets,
  onApplyPreset,
  onCreatePreset,
  customPresets = [],
  onEditPreset,
  onDeletePreset
}: ModelSelectorProps) {
  return (
    <div className="p-3 md:p-4 border-b border-border bg-muted/50">
      {/* Selected Models */}
      {selectedModels.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {selectedModels.map(modelKey => {
            const [provider, model] = modelKey.split(':');
            return (
              <div
                key={modelKey}
                className="flex items-center gap-2 px-2 md:px-3 py-1 md:py-1.5 bg-background rounded-full text-xs md:text-sm"
              >
                <div className={`w-2 h-2 rounded-full ${getProviderColor(provider)}`} />
                <span className="truncate max-w-[120px]">{model}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0"
                  onClick={() => onToggleModel(provider, model)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {/* Presets Panel */}
      {showPresets && (
        <div className="mb-3 p-3 bg-background rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium">Quick Presets</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCreatePreset}
              className="h-7 px-2 text-xs gap-1"
            >
              <Plus className="h-3 w-3" />
              New
            </Button>
          </div>
          <div className="space-y-2">
            {customPresets.map((preset) => (
              <div key={preset.id} className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onApplyPreset?.({ name: preset.name, models: preset.models })}
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
                  onClick={() => onEditPreset?.(preset)}
                  className="h-8 w-8 p-0"
                  title="Edit preset"
                >
                  <Pencil className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeletePreset?.(preset.id)}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  title="Delete preset"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
            {customPresets.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-2">
                No presets yet. Create one to quickly select multiple models.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Model Selection Dropdowns */}
      <div className="space-y-3">
        <h3 className="text-xs font-medium text-muted-foreground uppercase px-3 mb-3">Add Models</h3>
        
        {/* Provider Dropdown */}
        <div className="px-3">
          <label className="text-xs font-medium mb-2 block">Select Provider</label>
          <Select value={selectedProvider} onValueChange={(value) => {
            onProviderChange(value);
            onModelChange(''); // Reset model when provider changes
          }}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose a provider" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(AI_PROVIDERS).map(([key, provider]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${provider.color}`} />
                    {provider.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Model Dropdown */}
        {selectedProvider && (
          <div className="px-3">
            <label className="text-xs font-medium mb-2 block">Select Model</label>
            <Select value={selectedModel} onValueChange={onModelChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a model" />
              </SelectTrigger>
              <SelectContent>
                {AI_PROVIDERS[selectedProvider as keyof typeof AI_PROVIDERS]?.models.map((model) => (
                  <SelectItem key={model} value={model}>
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Add Button */}
        {selectedProvider && selectedModel && (
          <div className="px-3">
            <Button
              onClick={onAddModel}
              className="w-full"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add {selectedModel}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
