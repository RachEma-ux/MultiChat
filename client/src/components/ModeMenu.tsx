import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useBringToFront } from '@/contexts/ZIndexContext';

type Mode = 'empty' | 'chat' | 'conversation' | 'agents';

interface ModeMenuProps {
  currentMode: Mode;
  onAddChatWindow?: () => void;
}

const MODE_CONFIG: Record<Mode, { label: string; path: string }> = {
  agents: { label: 'Agents', path: '/agents' },
  chat: { label: 'Chat', path: '/' },
  conversation: { label: 'Conversation', path: '/conversation' },
  empty: { label: 'Empty', path: '/' },
};

export function ModeMenu({ currentMode, onAddChatWindow }: ModeMenuProps) {
  const [location, setLocation] = useLocation();
  const [showModeMenu, setShowModeMenu] = useState(false);
  
  // Dynamic z-index - brings menu to front when opened
  const { zIndex, bringToFront, close } = useBringToFront('mode-menu', 'dropdown');

  // Bring to front when menu opens
  useEffect(() => {
    if (showModeMenu) {
      bringToFront();
    } else {
      close();
    }
  }, [showModeMenu, bringToFront, close]);

  const handleModeSelect = (mode: Mode) => {
    setShowModeMenu(false);
    
    // Special handling for Chat mode - add a new window
    if (mode === 'chat') {
      // If not on empty page, navigate there first
      if (location !== '/') {
        setLocation('/');
        // Small delay to let navigation complete, then trigger add window
        setTimeout(() => {
          // The window will be added by EmptyPage when it detects /chat route
          toast.info('Opening new chat window...');
        }, 100);
      } else if (onAddChatWindow) {
        // Already on empty page, just add a window
        onAddChatWindow();
      } else {
        toast.info('Use the + button to add a new chat window');
      }
      return;
    }
    
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
            className="fixed inset-0"
            style={{ zIndex: zIndex - 1 }}
            onClick={() => setShowModeMenu(false)}
          />
          <div 
            className="absolute top-full right-0 mt-2 w-48 bg-card rounded-lg shadow-2xl border border-border overflow-hidden"
            style={{ zIndex }}
          >
            {(Object.keys(MODE_CONFIG) as Mode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => handleModeSelect(mode)}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-accent transition-colors ${
                  currentMode === mode ? 'bg-accent' : ''
                }`}
              >
                {MODE_CONFIG[mode].label}
                {mode === 'chat' && ' (New Window)'}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
