import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type Mode = 'empty' | 'chat' | 'conversation' | 'agents';

interface ModeMenuProps {
  currentMode: Mode;
}

const MODE_CONFIG: Record<Mode, { label: string; path: string }> = {
  agents: { label: 'Agents', path: '/agents' },
  chat: { label: 'Chat', path: '/chat' },
  conversation: { label: 'Conversation', path: '/conversation' },
  empty: { label: 'Empty', path: '/' },
};

export function ModeMenu({ currentMode }: ModeMenuProps) {
  const [, setLocation] = useLocation();
  const [showModeMenu, setShowModeMenu] = useState(false);

  const handleModeSelect = (mode: Mode) => {
    setShowModeMenu(false);
    
    if (mode === currentMode) {
      toast.info(`Already in ${MODE_CONFIG[mode].label} mode`);
      return;
    }
    
    setLocation(MODE_CONFIG[mode].path);
    toast.info(`Switched to ${MODE_CONFIG[mode].label} mode`);
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowModeMenu(!showModeMenu)}
        className="text-xs md:text-sm"
      >
        Mode
      </Button>
      {showModeMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowModeMenu(false)}
          />
          <div className="absolute top-full right-0 mt-2 w-48 bg-card rounded-lg shadow-2xl z-50 border border-border overflow-hidden">
            {(Object.keys(MODE_CONFIG) as Mode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => handleModeSelect(mode)}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-accent transition-colors ${
                  currentMode === mode ? 'bg-accent' : ''
                }`}
              >
                {MODE_CONFIG[mode].label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
