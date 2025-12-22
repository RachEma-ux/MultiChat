import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Layout, Plus, Trash2, Save, X, Check } from 'lucide-react';
import { toast } from 'sonner';

export interface WindowLayout {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isPinned: boolean;
}

export interface WindowLayoutPreset {
  id: string;
  name: string;
  windows: WindowLayout[];
  createdAt: string;
}

interface WindowLayoutPresetsProps {
  isOpen: boolean;
  onClose: () => void;
  currentWindows: WindowLayout[];
  onApplyPreset: (windows: WindowLayout[]) => void;
}

export function WindowLayoutPresets({
  isOpen,
  onClose,
  currentWindows,
  onApplyPreset,
}: WindowLayoutPresetsProps) {
  const [presets, setPresets] = useState<WindowLayoutPreset[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('windowLayoutPresets');
    if (stored) {
      try {
        setPresets(JSON.parse(stored));
      } catch (e) {
        console.error('Error loading window layout presets:', e);
      }
    }
  }, []);

  const savePresets = (updated: WindowLayoutPreset[]) => {
    setPresets(updated);
    localStorage.setItem('windowLayoutPresets', JSON.stringify(updated));
  };

  const handleSaveCurrentLayout = () => {
    if (!newPresetName.trim()) {
      toast.error('Please enter a preset name');
      return;
    }

    if (currentWindows.length === 0) {
      toast.error('No windows to save');
      return;
    }

    const newPreset: WindowLayoutPreset = {
      id: `preset-${Date.now()}`,
      name: newPresetName.trim(),
      windows: currentWindows,
      createdAt: new Date().toISOString(),
    };

    savePresets([...presets, newPreset]);
    setNewPresetName('');
    setIsCreating(false);
    toast.success(`Layout "${newPreset.name}" saved`);
  };

  const handleDeletePreset = (id: string) => {
    const updated = presets.filter(p => p.id !== id);
    savePresets(updated);
    toast.success('Layout preset deleted');
  };

  const handleApplyPreset = (preset: WindowLayoutPreset) => {
    onApplyPreset(preset.windows);
    onClose();
    toast.success(`Applied layout: ${preset.name}`);
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-[400]"
        onClick={onClose}
      />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-card border border-border rounded-lg shadow-xl z-[410] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Layout className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Window Layouts</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Save Current Layout */}
          <div className="p-3 bg-muted/50 rounded-lg">
            <h3 className="text-sm font-medium mb-2">Save Current Layout</h3>
            {isCreating ? (
              <div className="flex gap-2">
                <Input
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                  placeholder="Layout name..."
                  className="flex-1 h-8 text-sm"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveCurrentLayout();
                    if (e.key === 'Escape') setIsCreating(false);
                  }}
                />
                <Button
                  size="sm"
                  onClick={handleSaveCurrentLayout}
                  className="h-8"
                >
                  <Check className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCreating(false)}
                  className="h-8"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCreating(true)}
                className="w-full h-8 text-xs gap-1"
                disabled={currentWindows.length === 0}
              >
                <Save className="h-3 w-3" />
                Save {currentWindows.length} window{currentWindows.length !== 1 ? 's' : ''} as preset
              </Button>
            )}
          </div>

          {/* Saved Presets */}
          <div>
            <h3 className="text-sm font-medium mb-2">Saved Layouts</h3>
            {presets.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">
                No saved layouts yet. Arrange your windows and save a preset.
              </p>
            ) : (
              <div className="space-y-2">
                {presets.map((preset) => (
                  <div
                    key={preset.id}
                    className="flex items-center gap-2 p-2 bg-background rounded-lg border border-border"
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleApplyPreset(preset)}
                      className="flex-1 justify-start text-left h-auto py-2"
                    >
                      <div>
                        <div className="font-medium text-sm">{preset.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {preset.windows.length} window{preset.windows.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePreset(preset.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-border">
          <Button variant="outline" onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      </div>
    </>
  );
}
