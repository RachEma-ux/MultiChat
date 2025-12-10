import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Plus, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { AI_PROVIDERS } from '@/lib/ai-providers';
import { CustomPreset } from './PresetsManagementModal';

interface SelectedModel {
  provider: string;
  model: string;
}
interface PresetEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingPreset?: CustomPreset | null;
  onSave: (preset: CustomPreset) => void;
}

export function PresetEditorModal({ isOpen, onClose, editingPreset, onSave }: PresetEditorModalProps) {
  const [presetName, setPresetName] = useState('');
  const [presetDescription, setPresetDescription] = useState('');
  const [selectedModels, setSelectedModels] = useState<SelectedModel[]>([]);

  useEffect(() => {
    if (editingPreset) {
      setPresetName(editingPreset.name);
      setPresetDescription(editingPreset.description || '');
      setSelectedModels(editingPreset.models);
    } else {
      setPresetName('');
      setPresetDescription('');
      setSelectedModels([]);
    }
  }, [editingPreset, isOpen]);

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

    onSave(preset);
    toast.success(editingPreset ? 'Preset updated' : 'Preset created');
  };

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

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />
      <div className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl bg-card rounded-lg shadow-2xl z-50 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">
            {editingPreset ? 'Edit Preset' : 'Create New Preset'}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Preset Name */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">Preset Name</label>
            <Input
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              placeholder="Enter preset name"
              className="w-full"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">Description (Optional)</label>
            <textarea
              value={presetDescription}
              onChange={(e) => setPresetDescription(e.target.value)}
              placeholder="Brief description of this preset's purpose"
              rows={2}
              className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          {/* Select Models */}
          <div className="space-y-3">
            <label className="text-sm font-semibold">Select Models</label>
            <div className="space-y-4">
              {Object.entries(AI_PROVIDERS).map(([key, provider]) => (
                <div key={key} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${provider.color}`} />
                    <span className="text-sm font-medium">{provider.name}</span>
                  </div>
                  <div className="pl-5 space-y-2">
                    {provider.models.map((model) => (
                      <div key={model} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`${key}-${model}`}
                          checked={isModelSelected(key, model)}
                          onChange={() => toggleModel(key, model)}
                          className="h-4 w-4"
                        />
                        <label
                          htmlFor={`${key}-${model}`}
                          className="text-sm cursor-pointer"
                        >
                          {model}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
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
    </>
  );
}
