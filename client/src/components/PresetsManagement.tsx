import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X, Plus, Edit, Trash2, Copy, Save } from 'lucide-react';
import { toast } from 'sonner';

interface CustomPreset {
  id: string;
  name: string;
  description: string;
  models: string[];
  type: 'custom';
}

interface BuiltInPreset {
  name: string;
  models: string[];
}

interface PresetsManagementProps {
  AI_PROVIDERS: Record<string, { name: string; models: string[]; color: string }>;
  customPresets: CustomPreset[];
  builtInPresets: Record<string, BuiltInPreset>;
  defaultModels: string[];
  onSaveCustomPresets: (presets: CustomPreset[]) => void;
  onSaveDefaultModels: (models: string[]) => void;
  onClose: () => void;
}

export function PresetsManagement({
  AI_PROVIDERS,
  customPresets,
  builtInPresets,
  defaultModels,
  onSaveCustomPresets,
  onSaveDefaultModels,
  onClose,
}: PresetsManagementProps) {
  const [activeTab, setActiveTab] = useState<'presets' | 'defaults'>('presets');
  const [localCustomPresets, setLocalCustomPresets] = useState<CustomPreset[]>(customPresets);
  const [localDefaultModels, setLocalDefaultModels] = useState<string[]>(defaultModels);
  const [editingPreset, setEditingPreset] = useState<CustomPreset | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [presetDescription, setPresetDescription] = useState('');
  const [presetModels, setPresetModels] = useState<string[]>([]);

  const handleCreatePreset = () => {
    setIsCreating(true);
    setEditingPreset(null);
    setPresetName('');
    setPresetDescription('');
    setPresetModels([]);
  };

  const handleEditPreset = (preset: CustomPreset) => {
    setEditingPreset(preset);
    setIsCreating(false);
    setPresetName(preset.name);
    setPresetDescription(preset.description);
    setPresetModels(preset.models);
  };

  const handleSavePreset = () => {
    if (!presetName.trim()) {
      toast.error('Please enter a preset name');
      return;
    }
    if (presetModels.length === 0) {
      toast.error('Please select at least one model');
      return;
    }

    if (editingPreset) {
      // Update existing preset
      const updated = localCustomPresets.map(p =>
        p.id === editingPreset.id
          ? { ...p, name: presetName, description: presetDescription, models: presetModels }
          : p
      );
      setLocalCustomPresets(updated);
      toast.success('Preset updated');
    } else {
      // Create new preset
      const newPreset: CustomPreset = {
        id: Date.now().toString(),
        name: presetName,
        description: presetDescription,
        models: presetModels,
        type: 'custom',
      };
      setLocalCustomPresets([...localCustomPresets, newPreset]);
      toast.success('Preset created');
    }

    setIsCreating(false);
    setEditingPreset(null);
    setPresetName('');
    setPresetDescription('');
    setPresetModels([]);
  };

  const handleDeletePreset = (id: string) => {
    setLocalCustomPresets(localCustomPresets.filter(p => p.id !== id));
    toast.success('Preset deleted');
  };

  const handleDuplicatePreset = (preset: CustomPreset | BuiltInPreset, isBuiltIn: boolean) => {
    const newPreset: CustomPreset = {
      id: Date.now().toString(),
      name: `${preset.name} (Copy)`,
      description: isBuiltIn ? '' : (preset as CustomPreset).description,
      models: [...preset.models],
      type: 'custom',
    };
    setLocalCustomPresets([...localCustomPresets, newPreset]);
    toast.success('Preset duplicated');
  };

  const togglePresetModel = (modelKey: string) => {
    setPresetModels(prev =>
      prev.includes(modelKey)
        ? prev.filter(m => m !== modelKey)
        : [...prev, modelKey]
    );
  };

  const toggleDefaultModel = (modelKey: string) => {
    setLocalDefaultModels(prev =>
      prev.includes(modelKey)
        ? prev.filter(m => m !== modelKey)
        : [...prev, modelKey]
    );
  };

  const handleSaveAll = () => {
    onSaveCustomPresets(localCustomPresets);
    onSaveDefaultModels(localDefaultModels);
    toast.success('All changes saved');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background border border-border rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-xl font-semibold">Presets Management</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab('presets')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'presets'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Presets
          </button>
          <button
            onClick={() => setActiveTab('defaults')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'defaults'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Default Models
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'presets' && (
            <div className="space-y-4">
              {/* Create/Edit Form */}
              {(isCreating || editingPreset) && (
                <div className="border border-border rounded-lg p-4 space-y-4">
                  <h3 className="font-semibold">
                    {editingPreset ? 'Edit Preset' : 'Create New Preset'}
                  </h3>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Preset Name</label>
                    <Input
                      value={presetName}
                      onChange={(e) => setPresetName(e.target.value)}
                      placeholder="e.g., My Coding Team"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Description (Optional)</label>
                    <Input
                      value={presetDescription}
                      onChange={(e) => setPresetDescription(e.target.value)}
                      placeholder="Brief description of this preset"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Select Models</label>
                    <div className="border border-border rounded-lg p-3 max-h-60 overflow-y-auto space-y-3">
                      {Object.entries(AI_PROVIDERS).map(([providerKey, provider]) => (
                        <div key={providerKey}>
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`w-2 h-2 rounded-full ${provider.color}`} />
                            <span className="font-medium text-sm">{provider.name}</span>
                          </div>
                          <div className="ml-4 space-y-1">
                            {provider.models.map(model => {
                              const modelKey = `${providerKey}:${model}`;
                              return (
                                <label
                                  key={modelKey}
                                  className="flex items-center gap-2 p-2 hover:bg-accent rounded cursor-pointer"
                                >
                                  <Checkbox
                                    checked={presetModels.includes(modelKey)}
                                    onCheckedChange={() => togglePresetModel(modelKey)}
                                  />
                                  <span className="text-sm">{model}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleSavePreset}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Preset
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsCreating(false);
                        setEditingPreset(null);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Create Button */}
              {!isCreating && !editingPreset && (
                <Button onClick={handleCreatePreset}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Preset
                </Button>
              )}

              {/* Built-in Presets */}
              <div>
                <h3 className="font-semibold mb-3">Built-in Presets</h3>
                <div className="space-y-2">
                  {Object.entries(builtInPresets).map(([key, preset]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between p-3 border border-border rounded-lg"
                    >
                      <div>
                        <div className="font-medium">{preset.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {preset.models.length} models
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDuplicatePreset(preset, true)}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom Presets */}
              <div>
                <h3 className="font-semibold mb-3">Custom Presets</h3>
                {localCustomPresets.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No custom presets yet</p>
                ) : (
                  <div className="space-y-2">
                    {localCustomPresets.map(preset => (
                      <div
                        key={preset.id}
                        className="flex items-center justify-between p-3 border border-border rounded-lg"
                      >
                        <div>
                          <div className="font-medium">{preset.name}</div>
                          {preset.description && (
                            <div className="text-sm text-muted-foreground">{preset.description}</div>
                          )}
                          <div className="text-sm text-muted-foreground">
                            {preset.models.length} models
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditPreset(preset)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDuplicatePreset(preset, false)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeletePreset(preset.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'defaults' && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Select models to be automatically added when starting a new chat
              </p>

              <div className="border border-border rounded-lg p-3 space-y-3">
                {Object.entries(AI_PROVIDERS).map(([providerKey, provider]) => (
                  <div key={providerKey}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-2 h-2 rounded-full ${provider.color}`} />
                      <span className="font-medium text-sm">{provider.name}</span>
                    </div>
                    <div className="ml-4 space-y-1">
                      {provider.models.map(model => {
                        const modelKey = `${providerKey}:${model}`;
                        return (
                          <label
                            key={modelKey}
                            className="flex items-center gap-2 p-2 hover:bg-accent rounded cursor-pointer"
                          >
                            <Checkbox
                              checked={localDefaultModels.includes(modelKey)}
                              onCheckedChange={() => toggleDefaultModel(modelKey)}
                            />
                            <span className="text-sm">{model}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSaveAll}>
            Save All Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
