import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { QuickPreset } from '@/lib/quick-presets';

interface PresetsPanelProps {
  onApplyPreset: (models: string[]) => void;
  quickPresets: QuickPreset[];
  onNewPreset: () => void;
  onEditPreset: (id: string) => void;
  onDeletePreset: (id: string) => void;
  onRenamePreset: (id: string, newName: string) => void;
}

export function PresetsPanel({
  onApplyPreset,
  quickPresets,
  onNewPreset,
  onEditPreset,
  onDeletePreset,
  onRenamePreset
}: PresetsPanelProps) {
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const renameInputRef = useRef<HTMLInputElement>(null);

  const handleStartRename = (preset: QuickPreset) => {
    setRenamingId(preset.id);
    setRenameValue(preset.name);
    // Don't auto-focus to prevent keyboard popup
  };

  const handleRenameClick = () => {
    // Only focus when user explicitly clicks the input
    if (renameInputRef.current) {
      renameInputRef.current.removeAttribute('readonly');
      renameInputRef.current.focus();
    }
  };

  const handleRenameSubmit = () => {
    if (renamingId && renameValue.trim()) {
      onRenamePreset(renamingId, renameValue.trim());
    }
    setRenamingId(null);
    setRenameValue('');
  };

  const handleRenameCancel = () => {
    setRenamingId(null);
    setRenameValue('');
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleRenameSubmit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleRenameCancel();
    }
  };

  return (
    <div className="p-3 md:p-4 border-b border-border bg-muted/50">
      <div className="mb-3 p-3 bg-background rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium">Quick Presets</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onNewPreset}
            className="h-7 px-2 text-xs gap-1"
          >
            <Plus className="h-3 w-3" />
            New
          </Button>
        </div>
        <div className="space-y-2">
          {quickPresets.map((preset) => (
            <div key={preset.id} className="flex items-center gap-1">
              {renamingId === preset.id ? (
                <Input
                  ref={renameInputRef}
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onBlur={handleRenameSubmit}
                  onKeyDown={handleRenameKeyDown}
                  onClick={handleRenameClick}
                  className="h-8 text-xs flex-1"
                  autoFocus={false}
                  readOnly
                />
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onApplyPreset(preset.models)}
                  className="flex-1 justify-between text-xs h-8"
                >
                  <span
                    className="flex-1 text-left truncate"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartRename(preset);
                    }}
                  >
                    {preset.name}
                  </span>
                  <span className="ml-2 px-2 py-0.5 bg-primary/10 text-primary rounded-full text-[10px] font-medium">
                    {preset.models.length}
                  </span>
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEditPreset(preset.id)}
                className="h-8 w-8 p-0"
                title="Edit preset"
              >
                <Pencil className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDeletePreset(preset.id)}
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
