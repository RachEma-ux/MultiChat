import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CollapsibleMenuGroup } from '@/components/CollapsibleMenuGroup';
import { Menu, Download, X } from 'lucide-react';
import { useLocation } from 'wouter';
import { toast } from 'sonner';

export default function EmptyPage() {
  const [, setLocation] = useLocation();
  const [showMenu, setShowMenu] = useState(false);
  const [showModeMenu, setShowModeMenu] = useState(false);
  const [currentMode, setCurrentMode] = useState('Empty');
  const [expandedMenuGroups, setExpandedMenuGroups] = useState<Set<string>>(new Set());

  const toggleMenuGroup = (groupName: string) => {
    setExpandedMenuGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupName)) {
        newSet.delete(groupName);
      } else {
        newSet.add(groupName);
      }
      return newSet;
    });
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 md:px-4 md:py-3 border-b border-border">
        <div className="flex items-center gap-2 md:gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowMenu(!showMenu)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-base md:text-lg font-semibold">New Chat</h1>
        </div>
        
        <div className="flex items-center gap-1 md:gap-2">
          {/* Mode Selector */}
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
                  {['Agents', 'Chat', 'Conversation', 'Empty'].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => {
                        setCurrentMode(mode as any);
                        setShowModeMenu(false);
                        if (mode === 'Chat') {
                          setLocation('/chat');
                        } else if (mode === 'Conversation') {
                          setLocation('/conversation');
                        } else if (mode === 'Empty') {
                          setLocation('/empty');
                        }
                        toast.info(`Switched to ${mode} mode`);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-accent transition-colors ${
                        currentMode === mode ? 'bg-accent' : ''
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => toast.info('No conversation to export')}
            disabled={true}
            title="Export to JSON"
            className="hidden sm:inline-flex"
          >
            <Download className="h-5 w-5" />
          </Button>

        </div>
      </div>

      {/* Header Hamburger Menu */}
      {showMenu && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowMenu(false)}
          />
          <div className="fixed left-0 top-0 bottom-0 w-72 bg-background border-r border-border z-50 overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold">Menu</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowMenu(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="py-2">
              <CollapsibleMenuGroup 
                title="USER ACCOUNT" 
                items={['Profile', 'Settings', 'Preferences']} 
                isExpanded={expandedMenuGroups.has('user')}
                onToggle={() => toggleMenuGroup('user')}
              />
              <CollapsibleMenuGroup 
                title="AGENTS" 
                items={['My Agents', 'Create Agent', 'Agent Store']} 
                isExpanded={expandedMenuGroups.has('agents')}
                onToggle={() => toggleMenuGroup('agents')}
              />
              <CollapsibleMenuGroup 
                title="SKILLS" 
                items={['My Skills', 'Create Skill', 'Skill Library']} 
                isExpanded={expandedMenuGroups.has('skills')}
                onToggle={() => toggleMenuGroup('skills')}
              />
              <CollapsibleMenuGroup 
                title="HOSTING" 
                items={['Deploy Agent', 'Manage Deployments', 'API Keys']} 
                isExpanded={expandedMenuGroups.has('hosting')}
                onToggle={() => toggleMenuGroup('hosting')}
              />
              <CollapsibleMenuGroup 
                title="IDE" 
                items={['Code Editor', 'Terminal', 'File Manager']} 
                isExpanded={expandedMenuGroups.has('ide')}
                onToggle={() => toggleMenuGroup('ide')}
              />
              <CollapsibleMenuGroup 
                title="RUNNERS" 
                items={['Active Runners', 'Runner Config', 'Logs']} 
                isExpanded={expandedMenuGroups.has('runners')}
                onToggle={() => toggleMenuGroup('runners')}
              />
              <CollapsibleMenuGroup 
                title="SEARCH" 
                items={['SearchXNG', 'Item2', 'Item3']} 
                isExpanded={expandedMenuGroups.has('search')}
                onToggle={() => toggleMenuGroup('search')}
              />
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to quit? All data will be cleared.')) {
                    localStorage.clear();
                    window.location.href = 'about:blank';
                  }
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors text-left border-t border-border"
              >
                <X className="h-4 w-4" />
                <span className="text-sm font-medium">Quit</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Empty Main Content - Just blank space */}
      <div className="flex-1 bg-background">
        {/* Completely empty - no content */}
      </div>
    </div>
  );
}
