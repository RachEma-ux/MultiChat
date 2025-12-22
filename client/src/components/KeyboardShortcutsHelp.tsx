import { X, Keyboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SHORTCUT_KEYS, formatShortcut } from '@/hooks/useKeyboardShortcuts';

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsHelp({ isOpen, onClose }: KeyboardShortcutsHelpProps) {
  if (!isOpen) return null;

  const shortcuts = [
    { ...SHORTCUT_KEYS.NEW_CHAT, category: 'Chat' },
    { ...SHORTCUT_KEYS.SAVE_CHAT, category: 'Chat' },
    { ...SHORTCUT_KEYS.CLEAR_CHAT, category: 'Chat' },
    { ...SHORTCUT_KEYS.SEARCH, category: 'Navigation' },
    { ...SHORTCUT_KEYS.SETTINGS, category: 'Navigation' },
    { ...SHORTCUT_KEYS.TOGGLE_SIDEBAR, category: 'Navigation' },
    { ...SHORTCUT_KEYS.FOCUS_INPUT, category: 'Input' },
    { ...SHORTCUT_KEYS.CLOSE, category: 'General' },
  ];

  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, typeof shortcuts>);

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="relative bg-card border border-border rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Keyboard className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold">Keyboard Shortcuts</h2>
          </div>
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
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
            <div key={category}>
              <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">
                {category}
              </h3>
              <div className="space-y-2">
                {categoryShortcuts.map((shortcut) => (
                  <div 
                    key={shortcut.description}
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <span className="text-sm">{shortcut.description}</span>
                    <kbd className="px-2.5 py-1.5 text-xs font-mono font-semibold bg-muted border border-border rounded-md shadow-sm">
                      {formatShortcut(shortcut)}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="bg-muted/30 border-t border-border px-6 py-3">
          <p className="text-xs text-muted-foreground text-center">
            Press <kbd className="px-1.5 py-0.5 text-xs font-mono bg-muted border border-border rounded">?</kbd> to toggle this help
          </p>
        </div>
      </div>
    </div>
  );
}
