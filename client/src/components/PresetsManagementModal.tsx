import { useState, useEffect, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { X, Plus, Edit, Trash2, Copy, Save, Download, Upload, Search, GripVertical, Tag, ChevronDown, FolderOpen } from 'lucide-react';
import useCategories from '@/hooks/useCategories';
import { BUILT_IN_CATEGORY_IDS } from '@/types/category';
import { toast } from 'sonner';

export interface CustomPreset {
  id: string;
  name: string;
  description: string;
  models: string[];
  type: 'custom';
  tags?: string[];
  categoryId?: string; // References Category.id from useCategories
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

export function PresetsManagementModal({
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
  const [selectedProvider, setSelectedProvider] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [showProviderDropdown, setShowProviderDropdown] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [openProviders, setOpenProviders] = useState<Record<string, boolean>>({});
  const [deletingPresetId, setDeletingPresetId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [presetTags, setPresetTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);
  const [presetCategoryId, setPresetCategoryId] = useState<string>(BUILT_IN_CATEGORY_IDS.UNCATEGORIZED);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  
  // Get categories from centralized hook
  const { categories } = useCategories();

  // Sync local state when props change
  useEffect(() => {
    setLocalCustomPresets(customPresets);
  }, [customPresets]);

  useEffect(() => {
    setLocalDefaultModels(defaultModels);
  }, [defaultModels]);

  const handleCreatePreset = () => {
    setIsCreating(true);
    setEditingPreset(null);
    setPresetName('');
    setPresetDescription('');
    setPresetModels([]);
    setPresetTags([]);
    setPresetCategoryId(BUILT_IN_CATEGORY_IDS.UNCATEGORIZED);
  };

  const handleEditPreset = (preset: CustomPreset) => {
    setEditingPreset(preset);
    setIsCreating(false);
    setPresetName(preset.name);
    setPresetDescription(preset.description);
    setPresetModels([...preset.models]); // Create a new array copy
    setPresetTags(preset.tags || []);
    setPresetCategoryId(preset.categoryId || BUILT_IN_CATEGORY_IDS.UNCATEGORIZED);
    
    // Scroll to top to show the edit form
    setTimeout(() => {
      const modalContent = document.querySelector('[class*="overflow-y-auto"]');
      if (modalContent) {
        modalContent.scrollTop = 0;
      }
    }, 100);
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

    console.log('Saving preset with models:', presetModels);

    if (editingPreset) {
      // Update existing preset
      const updated = localCustomPresets.map(p =>
        p.id === editingPreset.id
          ? { ...p, name: presetName, description: presetDescription, models: [...presetModels], tags: presetTags, categoryId: presetCategoryId }
          : p
      );
      console.log('Updated presets:', updated);
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
        tags: presetTags,
        categoryId: presetCategoryId,
      };
      setLocalCustomPresets([...localCustomPresets, newPreset]);
      toast.success('Preset created');
    }

    setIsCreating(false);
    setEditingPreset(null);
    setPresetTags([]);
    setPresetName('');
    setPresetDescription('');
    setPresetModels([]);
    setPresetCategoryId(BUILT_IN_CATEGORY_IDS.UNCATEGORIZED);
  };

  const handleDeletePreset = (id: string) => {
    setDeletingPresetId(id);
  };

  const confirmDeletePreset = () => {
    if (deletingPresetId) {
      setLocalCustomPresets(localCustomPresets.filter(p => p.id !== deletingPresetId));
      toast.success('Preset deleted');
      setDeletingPresetId(null);
    }
  };

  const cancelDeletePreset = () => {
    setDeletingPresetId(null);
  };

  const handleExportPresets = () => {
    const dataStr = JSON.stringify(localCustomPresets, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `presets-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Presets exported');
  };

  const handleImportPresets = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string) as CustomPreset[];
        // Validate structure
        if (!Array.isArray(imported)) {
          toast.error('Invalid preset file format');
          return;
        }
        // Merge with existing presets, avoiding duplicates by ID
        const existingIds = new Set(localCustomPresets.map(p => p.id));
        const newPresets = imported.filter(p => !existingIds.has(p.id));
        setLocalCustomPresets([...localCustomPresets, ...newPresets]);
        toast.success(`Imported ${newPresets.length} preset(s)`);
      } catch (error) {
        toast.error('Failed to import presets');
      }
    };
    reader.readAsText(file);
    // Reset input
    event.target.value = '';
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
    console.log('Saving all changes. Custom presets:', localCustomPresets);
    onSaveCustomPresets(localCustomPresets);
    onSaveDefaultModels(localDefaultModels);
    toast.success('All changes saved');
    onClose();
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(localCustomPresets);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setLocalCustomPresets(items);
    toast.success('Preset reordered');
  };

  const handleAddTag = () => {
    if (!newTag.trim()) return;
    if (presetTags.includes(newTag.trim())) {
      toast.error('Tag already exists');
      return;
    }
    setPresetTags([...presetTags, newTag.trim()]);
    setNewTag('');
  };

  const handleRemoveTag = (tag: string) => {
    setPresetTags(presetTags.filter(t => t !== tag));
  };

  // Get all unique tags from all presets
  const allTags = Array.from(
    new Set(
      localCustomPresets.flatMap(p => p.tags || [])
    )
  );

  // Filter presets based on search query and selected tag
  const filteredCustomPresets = localCustomPresets.filter(preset => {
    const matchesSearch = searchQuery === '' || 
      preset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      preset.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      preset.models.some(m => m.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesTag = !selectedTagFilter || (preset.tags && preset.tags.includes(selectedTagFilter));
    
    return matchesSearch && matchesTag;
  });

  const filteredBuiltInPresets = Object.entries(builtInPresets).filter(([key, preset]) => {
    return searchQuery === '' ||
      preset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      preset.models.some(m => m.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[400] flex items-center justify-center p-4">
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

                  {/* Category Dropdown */}
                  <div>
                    <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                      <FolderOpen className="h-4 w-4" />
                      Category
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => {
                          setShowCategoryDropdown(!showCategoryDropdown);
                          setShowProviderDropdown(false);
                          setShowModelDropdown(false);
                        }}
                        className="w-full flex items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        {(() => {
                          const selectedCategory = categories.find(c => c.id === presetCategoryId);
                          return selectedCategory ? (
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: selectedCategory.color }}
                              />
                              <span>{selectedCategory.icon}</span>
                              <span>{selectedCategory.name}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Select a category</span>
                          );
                        })()}
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </button>
                      
                      {showCategoryDropdown && (
                        <>
                          <div 
                            className="fixed inset-0 z-[449]" 
                            onClick={() => setShowCategoryDropdown(false)}
                          />
                          <div className="absolute top-full left-0 right-0 mt-1 z-[450] bg-popover text-popover-foreground border border-border rounded-md shadow-lg max-h-[300px] overflow-y-auto">
                            {categories.map((category) => (
                              <button
                                key={category.id}
                                type="button"
                                onClick={() => {
                                  setPresetCategoryId(category.id);
                                  setShowCategoryDropdown(false);
                                }}
                                className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors text-left ${
                                  presetCategoryId === category.id ? 'bg-accent' : ''
                                }`}
                              >
                                <div
                                  className="w-3 h-3 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: category.color }}
                                />
                                <span className="flex-shrink-0">{category.icon}</span>
                                <span className="truncate">{category.name}</span>
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Add Models</label>
                    <div className="space-y-3">
                      {/* Provider Dropdown */}
                      <div>
                        <label className="text-sm text-muted-foreground mb-1 block">Select Provider</label>
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
                                <div className={`w-2 h-2 rounded-full ${AI_PROVIDERS[selectedProvider]?.color}`} />
                                <span>{AI_PROVIDERS[selectedProvider]?.name}</span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">Choose a provider</span>
                            )}
                            <ChevronDown className="h-4 w-4 opacity-50" />
                          </button>
                          
                          {showProviderDropdown && (
                            <>
                              <div 
                                className="fixed inset-0 z-[449]" 
                                onClick={() => setShowProviderDropdown(false)}
                              />
                              <div className="absolute top-full left-0 right-0 mt-1 z-[450] bg-popover text-popover-foreground border border-border rounded-md shadow-lg max-h-[300px] overflow-y-auto">
                                {Object.entries(AI_PROVIDERS).map(([key, provider]) => (
                                  <button
                                    key={key}
                                    type="button"
                                    onClick={() => {
                                      setSelectedProvider(key);
                                      setSelectedModel('');
                                      setShowProviderDropdown(false);
                                    }}
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

                      {/* Model Dropdown */}
                      {selectedProvider && (
                        <div>
                          <label className="text-sm text-muted-foreground mb-1 block">Select Model</label>
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
                                  className="fixed inset-0 z-[449]" 
                                  onClick={() => setShowModelDropdown(false)}
                                />
                                <div className="absolute top-full left-0 right-0 mt-1 z-[450] bg-popover text-popover-foreground border border-border rounded-md shadow-lg max-h-[300px] overflow-y-auto">
                                  {AI_PROVIDERS[selectedProvider]?.models.map((model) => (
                                    <button
                                      key={model}
                                      type="button"
                                      onClick={() => {
                                        setSelectedModel(model);
                                        setShowModelDropdown(false);
                                      }}
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
                        <Button
                          onClick={() => {
                            const modelKey = `${selectedProvider}:${selectedModel}`;
                            if (!presetModels.includes(modelKey)) {
                              setPresetModels([...presetModels, modelKey]);
                              toast.success(`Added ${selectedModel}`);
                            } else {
                              toast.error('Model already added');
                            }
                          }}
                          size="sm"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add {selectedModel}
                        </Button>
                      )}

                      {/* Selected Models List */}
                      {presetModels.length > 0 && (
                        <div className="border border-border rounded-lg p-3 space-y-2">
                          <div className="text-sm font-medium mb-2">Selected Models ({presetModels.length})</div>
                          {presetModels.map((modelKey) => {
                            const [providerKey, modelName] = modelKey.split(':');
                            const provider = AI_PROVIDERS[providerKey];
                            return (
                              <div
                                key={modelKey}
                                className="flex items-center justify-between p-2 bg-accent rounded"
                              >
                                <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${provider?.color}`} />
                                  <span className="text-sm">{modelName}</span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => togglePresetModel(modelKey)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      Tags (Optional)
                    </label>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddTag();
                            }
                          }}
                          placeholder="e.g., Work, Personal, Coding"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleAddTag}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      {presetTags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {presetTags.map((tag) => (
                            <div
                              key={tag}
                              className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-xs"
                            >
                              <span>{tag}</span>
                              <button
                                onClick={() => handleRemoveTag(tag)}
                                className="hover:bg-primary/20 rounded-full p-0.5"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
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

              {/* Search and Filter */}
              {!isCreating && !editingPreset && (
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search presets by name, description, or model..."
                      className="pl-10"
                    />
                  </div>
                  {allTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="text-sm text-muted-foreground">Filter by tag:</span>
                      <button
                        onClick={() => setSelectedTagFilter(null)}
                        className={`px-2 py-1 rounded-full text-xs transition-colors ${
                          !selectedTagFilter
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-accent hover:bg-accent/80'
                        }`}
                      >
                        All
                      </button>
                      {allTags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => setSelectedTagFilter(tag)}
                          className={`px-2 py-1 rounded-full text-xs transition-colors ${
                            selectedTagFilter === tag
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-accent hover:bg-accent/80'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Export/Import */}
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={handleExportPresets} className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Export Presets
                </Button>
                <label className="flex-1">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportPresets}
                    className="hidden"
                  />
                  <Button variant="outline" className="w-full" asChild>
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      Import Presets
                    </span>
                  </Button>
                </label>
              </div>

              {/* Built-in Presets */}
              <div>
                <h3 className="font-semibold mb-3">Built-in Presets</h3>
                <div className="space-y-2">
                  {filteredBuiltInPresets.map(([key, preset]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between p-3 border border-border rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <div className="font-medium">{preset.name}</div>
                        <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium">
                          {preset.models.length}
                        </span>
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
                {filteredCustomPresets.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    {localCustomPresets.length === 0 ? 'No custom presets yet' : 'No presets match your search'}
                  </p>
                ) : (
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="custom-presets">
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="space-y-2"
                        >
                          {filteredCustomPresets.map((preset, index) => (
                            <Draggable key={preset.id} draggableId={preset.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={`flex items-center gap-2 p-3 border border-border rounded-lg transition-colors ${
                                    snapshot.isDragging ? 'bg-accent shadow-lg' : ''
                                  }`}
                                >
                                  <div
                                    {...provided.dragHandleProps}
                                    className="cursor-grab active:cursor-grabbing"
                                  >
                                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                      <div className="font-medium">{preset.name}</div>
                                      <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium">
                                        {preset.models.length}
                                      </span>
                                      {preset.tags && preset.tags.length > 0 && (
                                        <div className="flex gap-1 flex-wrap">
                                          {preset.tags.map((tag) => (
                                            <span
                                              key={tag}
                                              className="px-2 py-0.5 bg-accent text-accent-foreground rounded-full text-xs"
                                            >
                                              {tag}
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                    {preset.description && (
                                      <div className="text-sm text-muted-foreground">{preset.description}</div>
                                    )}
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
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                )}
              </div>
            </div>
          )}

          {activeTab === 'defaults' && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Select models to be automatically added when starting a new chat
              </p>

              <div className="space-y-2">
                {Object.entries(AI_PROVIDERS).map(([providerKey, provider]) => {
                  const isOpen = openProviders[providerKey] || false;
                  const providerModels = provider.models.filter(model => 
                    localDefaultModels.includes(`${providerKey}:${model}`)
                  );
                  const selectedCount = providerModels.length;

                  const toggleProvider = () => {
                    setOpenProviders(prev => ({
                      ...prev,
                      [providerKey]: !prev[providerKey]
                    }));
                  };

                  return (
                    <div key={providerKey} className="border border-border rounded-lg overflow-hidden">
                      <button
                        onClick={toggleProvider}
                        className="w-full flex items-center justify-between p-3 hover:bg-accent transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${provider.color}`} />
                          <span className="font-medium text-sm">{provider.name}</span>
                          {selectedCount > 0 && (
                            <span className="text-xs text-muted-foreground">({selectedCount} selected)</span>
                          )}
                        </div>
                        <svg
                          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {isOpen && (
                        <div className="p-3 pt-0 space-y-1">
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
                      )}
                    </div>
                  );
                })}
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

      {/* Delete Confirmation Dialog */}
      {deletingPresetId && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="bg-background border border-border rounded-lg p-6 max-w-md w-full mx-4 space-y-4">
            <h3 className="text-lg font-semibold">Delete Preset?</h3>
            <p className="text-muted-foreground">
              Are you sure you want to delete this preset? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" onClick={cancelDeletePreset}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDeletePreset}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
