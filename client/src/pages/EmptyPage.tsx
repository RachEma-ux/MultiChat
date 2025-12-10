import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CollapsibleMenuGroup } from '@/components/CollapsibleMenuGroup';
import { FloatingChatWindow } from '@/components/FloatingChatWindow';
import { Menu, Download, X } from 'lucide-react';
import { useLocation } from 'wouter';
import { toast } from 'sonner';

interface ChatWindow {
  id: string;
  position: { x: number; y: number };
}

export default function EmptyPage() {
  const [, setLocation] = useLocation();
  const [showMenu, setShowMenu] = useState(false);
  const [showModeMenu, setShowModeMenu] = useState(false);
  const [expandedMenuGroups, setExpandedMenuGroups] = useState<Set<string>>(new Set());
  const [chatWindows, setChatWindows] = useState<ChatWindow[]>([]);

  // Load saved windows from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('floatingChatWindows');
    if (saved) {
      try {
        setChatWindows(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load chat windows:', e);
      }
    }
  }, []);

  // Save windows to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('floatingChatWindows', JSON.stringify(chatWindows));
  }, [chatWindows]);

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

  const addNewChatWindow = () => {
    if (chatWindows.length >= 3) {
      toast.error('Maximum 3 chat windows allowed');
      return;
    }

    const newWindow: ChatWindow = {
      id: `${Date.now()}`,
      position: {
        x: 100 + (chatWindows.length * 30),
        y: 100 + (chatWindows.length * 30)
      }
    };

    setChatWindows([...chatWindows, newWindow]);
    toast.success('New chat window opened');
  };

  const closeChatWindow = (id: string) => {
    setChatWindows(chatWindows.filter(w => w.id !== id));
    toast.info('Chat window closed');
  };

  const updateWindowPosition = (id: string, position: { x: number; y: number }) => {
    setChatWindows(chatWindows.map(w =>
      w.id === id ? { ...w, position } : w
    ));
  };

  // Determine what to show in Mode selector
  const chatModeLabel = chatWindows.length > 0 ? 'Add New Chat Window' : 'Chat';

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
          <h1 className="text-base md:text-lg font-semibold">Multi-AI Chat</h1>
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
                <div className="absolute top-full right-0 mt-2 w-56 bg-card rounded-lg shadow-2xl z-50 border border-border overflow-hidden">
                  <button
                    onClick={() => {
                      setShowModeMenu(false);
                      // Agents mode - not implemented yet
                      toast.info('Agents mode coming soon');
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-accent transition-colors"
                  >
                    Agents
                  </button>
                  <button
                    onClick={() => {
                      setShowModeMenu(false);
                      addNewChatWindow();
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-accent transition-colors"
                    disabled={chatWindows.length >= 3}
                  >
                    {chatModeLabel}
                  </button>
                  <button
                    onClick={() => {
                      setShowModeMenu(false);
                      setLocation('/conversation');
                      toast.info('Switched to Conversation mode');
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-accent transition-colors"
                  >
                    Conversation
                  </button>
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

      {/* Empty Main Content - Background for floating windows */}
      <div className="flex-1 bg-background relative">
        {/* Floating Chat Windows */}
        {chatWindows.map((window) => (
          <FloatingChatWindow
            key={window.id}
            id={window.id}
            initialPosition={window.position}
            onClose={() => closeChatWindow(window.id)}
            onPositionChange={(pos) => updateWindowPosition(window.id, pos)}
          />
        ))}
      </div>
    </div>
  );
}
