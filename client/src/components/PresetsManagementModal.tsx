import { Button } from '@/components/ui/button';
import { X, Zap } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { AI_PROVIDERS } from '@/lib/ai-providers';

interface SelectedModel {
  provider: string;
  model: string;
}

export interface CustomPreset {
  id: string;
  name: string;
  description: string;
  models: SelectedModel[];
  isCustom: boolean;
}

interface PresetsManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  customPresets: CustomPreset[];
  onSavePreset: (preset: CustomPreset) => void;
  editingPreset?: CustomPreset | null;
}

export function PresetsManagementModal({
  isOpen,
  onClose,
  customPresets,
  onSavePreset,
  editingPreset
}: PresetsManagementModalProps) {
  const [presetName, setPresetName] = useState(editingPreset?.name || '');
  const [presetDescription, setPresetDescription] = useState(editingPreset?.description || '');
  const [selectedModels, setSelectedModels] = useState<SelectedModel[]>(editingPreset?.models || []);

  if (!isOpen) return null;

  const toggleModel = (provider: string, model: string) => {
    const exists = selectedModels.some(m => m.provider === provider && m.model === model);
    if (exists) {
      setSelectedModels(selectedModels.filter(m => !(m.provider === provider && m.model === model)));
    } else {
      setSelectedModels([...selectedModels, { provider, model }]);
    }
  };

  const isModelSelected = (provider: string, model: string) => {
    return selectedModels.some(m => m.provider === provider && m.model === model);
  };

  const handleSave = () => {
    if (!presetName.trim()) {
      toast.error('Preset name required');
      return;
    }
    if (selectedModels.length === 0) {
      toast.error('Select at least one model');
      return;
    }

    const preset: CustomPreset = {
      id: editingPreset?.id || Date.now().toString(),
      name: presetName,
      description: presetDescription,
      models: selectedModels,
      isCustom: true
    };

    onSavePreset(preset);
    toast.success(editingPreset ? 'Preset updated' : 'Preset created');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-card rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            <h2 className="text-lg font-semibold">
              {editingPreset ? 'Edit Preset' : 'Create Preset'}
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Preset Name */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Preset Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              placeholder="Enter preset name"
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Description (Optional)
            </label>
            <textarea
              value={presetDescription}
              onChange={(e) => setPresetDescription(e.target.value)}
              placeholder="Brief description of this preset's purpose"
              rows={3}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm resize-none"
            />
          </div>

          {/* Select Models */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Select Models <span className="text-red-500">*</span>
            </label>
            <div className="space-y-3">
              {Object.values(AI_PROVIDERS).map((provider: any) => (
                <div key={provider.name} className="border border-border rounded-md p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: provider.color }}
                    />
                    <span className="font-medium text-sm">{provider.name}</span>
                  </div>
                  <div className="space-y-1 pl-5">
                    {provider.models.map((model: string) => (
                      <label
                        key={model}
                        className="flex items-center gap-2 cursor-pointer hover:bg-accent/50 p-1 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={isModelSelected(provider.name, model)}
                          onChange={() => toggleModel(provider.name, model)}
                          className="h-4 w-4"
                        />
                        <span className="text-sm">{model}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Models Summary */}
          {selectedModels.length > 0 && (
            <div className="bg-muted rounded-md p-3">
              <p className="text-sm font-medium mb-2">
                Selected: {selectedModels.length} model{selectedModels.length !== 1 ? 's' : ''}
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedModels.map((m, idx) => (
                  <div
                    key={idx}
                    className="text-xs bg-background px-2 py-1 rounded border border-border"
                  >
                    {m.provider} - {m.model}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-border">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
          >
            {editingPreset ? 'Update Preset' : 'Create Preset'}
          </Button>
        </div>
      </div>
    </div>
  );
}
