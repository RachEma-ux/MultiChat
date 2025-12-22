import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ModeMenu } from '@/components/ModeMenu';
import { Menu, X, Bot, Sparkles } from 'lucide-react';

export default function AgentsPage() {
  const [showMenu, setShowMenu] = useState(false);

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
          <h1 className="text-base md:text-lg font-semibold">Agents</h1>
        </div>
        
        <div className="flex items-center gap-1 md:gap-2">
          <ModeMenu currentMode="agents" />
        </div>
      </div>

      {/* Sidebar Menu */}
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
            <div className="p-4">
              <p className="text-sm text-muted-foreground">Agents menu coming soon...</p>
            </div>
          </div>
        </>
      )}

      {/* Main Content - Coming Soon */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="flex items-center gap-3 mb-4">
          <Bot className="h-16 w-16 text-muted-foreground" />
          <Sparkles className="h-8 w-8 text-yellow-500" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Agents Mode</h2>
        <p className="text-muted-foreground text-center max-w-md">
          AI Agents are coming soon! This mode will allow you to create and manage 
          autonomous AI agents that can perform complex tasks.
        </p>
      </div>
    </div>
  );
}
