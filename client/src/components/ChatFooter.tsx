import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, Plus, Settings, Save } from 'lucide-react';
import { toast } from 'sonner';

interface ChatFooterProps {
  selectedModelsCount: number;
  onModelsClick: () => void;
  onNewChat?: () => void;
  onSave?: () => void;
  onSettingsClick?: () => void;
}

export function ChatFooter({
  selectedModelsCount,
  onModelsClick,
  onNewChat,
  onSave,
  onSettingsClick
}: ChatFooterProps) {
  const [showFooterMenu, setShowFooterMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="border-t border-border p-2 md:p-3 shrink-0">
      <div className="flex items-center gap-1 md:gap-2 justify-between">
        {/* Left side controls */}
        <div className="flex items-center gap-1">
          {/* Hamburger Menu */}
          <div className="relative">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowFooterMenu(!showFooterMenu)}
              className="h-7 w-7 shrink-0"
              title="Menu"
            >
              <Menu className="h-3.5 w-3.5" />
            </Button>
            
            {showFooterMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40"
                  onClick={() => setShowFooterMenu(false)}
                />
                <div className="absolute bottom-full left-0 mb-2 w-72 bg-card rounded-lg shadow-2xl z-50 border border-border overflow-hidden">
                  <button
                    onClick={() => {
                      onNewChat?.();
                      setShowFooterMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors text-left"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="text-sm">New Chat</span>
                  </button>
                  <button
                    onClick={() => {
                      onSave?.();
                      setShowFooterMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors text-left"
                  >
                    <Save className="h-4 w-4" />
                    <span className="text-sm">Save Chat</span>
                  </button>
                  <button
                    onClick={() => {
                      toast.info('Clear chat coming soon');
                      setShowFooterMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors text-left"
                  >
                    <span className="text-sm">Clear Chat</span>
                  </button>
                </div>
              </>
            )}
          </div>
          
          {/* Plus Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => onNewChat?.()}
            className="h-7 w-7 shrink-0"
            title="New Chat"
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
          
          {/* Models Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onModelsClick}
            className="text-[10px] h-7 px-2 shrink-0"
          >
            {selectedModelsCount} Model{selectedModelsCount !== 1 ? 's' : ''}
          </Button>
        </div>
        
        {/* Right side controls */}
        <div className="flex items-center gap-1">
          {/* Settings Icon */}
          <div className="relative">
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setShowSettings(!showSettings);
                onSettingsClick?.();
              }}
              className="h-7 w-7 shrink-0"
              title="Settings"
            >
              <Settings className="h-3.5 w-3.5" />
            </Button>
            
            {showSettings && (
              <>
                <div 
                  className="fixed inset-0 z-40"
                  onClick={() => setShowSettings(false)}
                />
                <div className="absolute bottom-full right-0 mb-2 w-56 bg-card rounded-lg shadow-2xl z-50 border border-border overflow-hidden">
                  <div className="px-4 py-3 border-b border-border">
                    <h3 className="text-sm font-semibold">Settings</h3>
                  </div>
                  <button
                    onClick={() => {
                      toast.info('Theme settings coming soon');
                      setShowSettings(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors text-left"
                  >
                    <span className="text-sm">Theme</span>
                  </button>
                  <button
                    onClick={() => {
                      toast.info('Export coming soon');
                      setShowSettings(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors text-left"
                  >
                    <span className="text-sm">Export Data</span>
                  </button>
                </div>
              </>
            )}
          </div>
          
          {/* Save Icon */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => onSave?.()}
            title="Save Conversation"
            className="h-7 w-7 shrink-0"
          >
            <Save className="h-3.5 w-3.5" />
          </Button>
          
          {/* Presets Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.info('Presets coming soon')}
            className="text-[10px] h-7 px-2 shrink-0"
          >
            Presets
          </Button>
        </div>
      </div>
    </div>
  );
}
