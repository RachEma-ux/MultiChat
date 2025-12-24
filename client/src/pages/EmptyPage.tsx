import { useState, useEffect, useCallback } from 'react';
import { Z_CLASS } from '@/lib/z-index';
import { Button } from '@/components/ui/button';
import { CollapsibleMenuGroup } from '@/components/CollapsibleMenuGroup';
import { FloatingChatWindow } from '@/components/FloatingChatWindow';
import { WindowDock } from '@/components/WindowDock';
import { WindowLayoutPresets, WindowLayout } from '@/components/WindowLayoutPresets';
import { ModeMenu } from '@/components/ModeMenu';
import { Menu, Download, X, Layout, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { AnimatePresence } from 'framer-motion';

interface ChatWindow {
  id: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  isPinned: boolean;
  isMinimized: boolean;
  title: string;
  messageCount: number;
}

const DEFAULT_WINDOW_SIZE = { width: 400, height: 500 };
const MAX_WINDOWS = 10;

export default function EmptyPage() {
  const [showMenu, setShowMenu] = useState(false);
  const [expandedMenuGroups, setExpandedMenuGroups] = useState<Set<string>>(new Set());
  const [chatWindows, setChatWindows] = useState<ChatWindow[]>([]);
  const [showLayoutPresets, setShowLayoutPresets] = useState(false);

  // Load windows from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('floatingChatWindows');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setChatWindows(parsed);
      } catch (e) {
        console.error('Error loading chat windows:', e);
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

  const addNewChatWindow = useCallback(() => {
    const activeWindows = chatWindows.filter(w => !w.isMinimized);
    if (chatWindows.length >= MAX_WINDOWS) {
      toast.error(`Maximum ${MAX_WINDOWS} chat windows allowed`);
      return;
    }

    const offset = activeWindows.length * 30;
    // Calculate position based on viewport size
    const isMobile = window.innerWidth < 768;
    const actualWidth = Math.min(DEFAULT_WINDOW_SIZE.width, window.innerWidth * 0.9);
    const maxX = Math.max(0, window.innerWidth - actualWidth);
    
    const newWindow: ChatWindow = {
      id: `${Date.now()}`,
      position: {
        // On mobile, center horizontally; on desktop, use offset
        x: isMobile ? Math.min(0, maxX) : Math.min(100 + offset, maxX),
        y: 60 + offset // Start below header
      },
      size: { ...DEFAULT_WINDOW_SIZE },
      isPinned: false,
      isMinimized: false,
      title: `Chat ${Date.now()}`,
      messageCount: 0,
    };

    setChatWindows(prev => [...prev, newWindow]);
    toast.success('New chat window opened');
  }, [chatWindows]);

  const closeChatWindow = useCallback((id: string) => {
    setChatWindows(prev => prev.filter(w => w.id !== id));
    toast.info('Chat window closed');
  }, []);

  const minimizeWindow = useCallback((id: string) => {
    setChatWindows(prev => prev.map(w =>
      w.id === id ? { ...w, isMinimized: true } : w
    ));
  }, []);

  const restoreWindow = useCallback((id: string) => {
    setChatWindows(prev => prev.map(w =>
      w.id === id ? { ...w, isMinimized: false } : w
    ));
  }, []);

  const updateWindowPosition = useCallback((id: string, position: { x: number; y: number }) => {
    setChatWindows(prev => prev.map(w =>
      w.id === id ? { ...w, position } : w
    ));
  }, []);

  const updateWindowSize = useCallback((id: string, size: { width: number; height: number }) => {
    setChatWindows(prev => prev.map(w =>
      w.id === id ? { ...w, size } : w
    ));
  }, []);

  const updateWindowTitle = useCallback((id: string, title: string) => {
    setChatWindows(prev => prev.map(w =>
      w.id === id ? { ...w, title } : w
    ));
  }, []);

  const updateWindowMessageCount = useCallback((id: string, count: number) => {
    setChatWindows(prev => prev.map(w =>
      w.id === id ? { ...w, messageCount: count } : w
    ));
  }, []);

  const updateWindowPinned = useCallback((id: string, isPinned: boolean) => {
    setChatWindows(prev => prev.map(w =>
      w.id === id ? { ...w, isPinned } : w
    ));
  }, []);

  // Get current window layouts for preset saving
  const getCurrentWindowLayouts = useCallback((): WindowLayout[] => {
    return chatWindows.filter(w => !w.isMinimized).map(w => ({
      id: w.id,
      x: w.position.x,
      y: w.position.y,
      width: w.size.width,
      height: w.size.height,
      isPinned: w.isPinned,
    }));
  }, [chatWindows]);

  // Apply a window layout preset
  const applyLayoutPreset = useCallback((layouts: WindowLayout[]) => {
    // Close all current windows
    setChatWindows([]);
    
    // Create new windows based on the preset
    setTimeout(() => {
      const newWindows: ChatWindow[] = layouts.map((layout, index) => ({
        id: `${Date.now()}-${index}`,
        position: { x: layout.x, y: layout.y },
        size: { width: layout.width, height: layout.height },
        isPinned: layout.isPinned,
        isMinimized: false,
        title: `Chat ${index + 1}`,
        messageCount: 0,
      }));
      setChatWindows(newWindows);
    }, 100);
  }, []);

  const activeWindows = chatWindows.filter(w => !w.isMinimized);
  const minimizedWindows = chatWindows.filter(w => w.isMinimized);
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
          {/* Window Layout Presets Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowLayoutPresets(true)}
            title="Window Layouts"
            className="hidden sm:inline-flex"
          >
            <Layout className="h-5 w-5" />
          </Button>

          {/* Quick Add Window Button */}
          {chatWindows.length < MAX_WINDOWS && (
            <Button
              variant="ghost"
              size="icon"
              onClick={addNewChatWindow}
              title="Add new chat window"
              className="hidden sm:inline-flex"
            >
              <Plus className="h-5 w-5" />
            </Button>
          )}

          {/* Mode Selector */}
          <ModeMenu currentMode="empty" onAddChatWindow={addNewChatWindow} />

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
            className={`fixed inset-0 bg-black/50 ${Z_CLASS.SIDEBAR_BACKDROP}`}
            onClick={() => setShowMenu(false)}
          />
          <div className={`fixed left-0 top-0 bottom-0 w-72 bg-background border-r border-border ${Z_CLASS.SIDEBAR_MENU} overflow-y-auto`}>
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
              
              {/* Window Management Section */}
              <div className="px-4 py-3 border-t border-border">
                <h3 className="text-xs font-semibold text-muted-foreground mb-2">WINDOWS</h3>
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      setShowLayoutPresets(true);
                    }}
                    className="w-full flex items-center gap-3 px-2 py-2 hover:bg-accent rounded-md transition-colors text-left"
                  >
                    <Layout className="h-4 w-4" />
                    <span className="text-sm">Window Layouts</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      addNewChatWindow();
                    }}
                    disabled={chatWindows.length >= MAX_WINDOWS}
                    className="w-full flex items-center gap-3 px-2 py-2 hover:bg-accent rounded-md transition-colors text-left disabled:opacity-50"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="text-sm">New Chat Window</span>
                  </button>
                </div>
              </div>

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
        <AnimatePresence>
          {activeWindows.map((window) => (
            <FloatingChatWindow
              key={window.id}
              id={window.id}
              initialPosition={window.position}
              onClose={() => closeChatWindow(window.id)}
              onMinimize={() => minimizeWindow(window.id)}
              onPositionChange={(pos) => updateWindowPosition(window.id, pos)}
              onSizeChange={(size) => updateWindowSize(window.id, size)}
              onTitleChange={(title) => updateWindowTitle(window.id, title)}
              onMessageCountChange={(count) => updateWindowMessageCount(window.id, count)}
              onPinnedChange={(pinned) => updateWindowPinned(window.id, pinned)}
            />
          ))}
        </AnimatePresence>

        {/* Minimized Windows Dock */}
        <AnimatePresence>
          {minimizedWindows.length > 0 && (
            <WindowDock
              minimizedWindows={minimizedWindows.map(w => ({
                id: w.id,
                title: w.title,
                messageCount: w.messageCount,
              }))}
              onRestore={restoreWindow}
              onClose={closeChatWindow}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Window Layout Presets Modal */}
      <WindowLayoutPresets
        isOpen={showLayoutPresets}
        onClose={() => setShowLayoutPresets(false)}
        currentWindows={getCurrentWindowLayouts()}
        onApplyPreset={applyLayoutPreset}
      />
    </div>
  );
}
