import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { X, Plus, Pencil, Trash2, ChevronDown } from 'lucide-react';
import { AI_PROVIDERS } from '@/lib/ai-providers';
import { CustomPreset } from './PresetsManagementModal';
import { toast } from 'sonner';

interface ModelSelectorProps {
  selectedModels: string[];
  showPresets?: boolean;
  onToggleModel: (provider: string, model: string) => void;
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
  showPresets = false,
  onToggleModel,
  onTogglePresets,
  onApplyPreset,
  onCreatePreset,
  customPresets = [],
  onEditPreset,
  onDeletePreset
}: ModelSelectorProps) {
  // Internal state for provider/model selection
  const [selectedProvider, setSelectedProvider] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [showProviderDropdown, setShowProviderDropdown] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);

  const handleProviderSelect = useCallback((providerKey: string) => {
    setSelectedProvider(providerKey);
    setSelectedModel('');
    setShowProviderDropdown(false);
  }, []);

  const handleModelSelect = useCallback((model: string) => {
    setSelectedModel(model);
    setShowModelDropdown(false);
  }, []);

  const handleAddModel = useCallback(() => {
    if (selectedProvider && selectedModel) {
      const modelKey = `${selectedProvider}:${selectedModel}`;
      if (!selectedModels.includes(modelKey)) {
        onToggleModel(selectedProvider, selectedModel);
        toast.success(`Added ${selectedModel}`);
      } else {
        toast.error('Model already selected');
      }
    }
  }, [selectedProvider, selectedModel, selectedModels, onToggleModel]);

  const providerEntries = Object.entries(AI_PROVIDERS);
  const currentProvider = selectedProvider ? AI_PROVIDERS[selectedProvider as keyof typeof AI_PROVIDERS] : null;

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
        
        {/* Provider Dropdown - Custom Implementation */}
        <div className="px-3">
          <label className="text-xs font-medium mb-2 block">Select Provider</label>
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowProviderDropdown(!showProviderDropdown);
                setShowModelDropdown(false);
              }}
              className="w-full flex items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {selectedProvider ? (
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${currentProvider?.color}`} />
                  <span>{currentProvider?.name}</span>
                </div>
              ) : (
                <span className="text-muted-foreground">Choose a provider</span>
              )}
              <ChevronDown className="h-4 w-4 opacity-50" />
            </button>
            
            {showProviderDropdown && (
              <>
                <div 
                  className="fixed inset-0 z-[400]" 
                  onClick={() => setShowProviderDropdown(false)}
                />
                <div className="absolute top-full left-0 right-0 mt-1 z-[500] bg-popover text-popover-foreground border border-border rounded-md shadow-lg max-h-[300px] overflow-y-auto">
                  {providerEntries.map(([key, provider]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleProviderSelect(key)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors text-left"
                    >
                      <div className={`w-2 h-2 rounded-full ${provider.color}`} />
                      <span>{provider.name}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Model Dropdown - Custom Implementation */}
        {selectedProvider && (
          <div className="px-3">
            <label className="text-xs font-medium mb-2 block">Select Model</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowModelDropdown(!showModelDropdown);
                  setShowProviderDropdown(false);
                }}
                className="w-full flex items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {selectedModel ? (
                  <span>{selectedModel}</span>
                ) : (
                  <span className="text-muted-foreground">Choose a model</span>
                )}
                <ChevronDown className="h-4 w-4 opacity-50" />
              </button>
              
              {showModelDropdown && (
                <>
                  <div 
                    className="fixed inset-0 z-[400]" 
                    onClick={() => setShowModelDropdown(false)}
                  />
                  <div className="absolute top-full left-0 right-0 mt-1 z-[500] bg-popover text-popover-foreground border border-border rounded-md shadow-lg max-h-[300px] overflow-y-auto">
                    {currentProvider?.models.map((model) => (
                      <button
                        key={model}
                        type="button"
                        onClick={() => handleModelSelect(model)}
                        className="w-full px-3 py-2 text-sm hover:bg-accent transition-colors text-left"
                      >
                        {model}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Add Button */}
        {selectedProvider && selectedModel && (
          <div className="px-3">
            <Button
              onClick={handleAddModel}
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
