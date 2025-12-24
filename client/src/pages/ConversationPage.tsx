import { useState } from 'react';
import { Z_CLASS } from '@/lib/z-index';
import { Button } from '@/components/ui/button';
import { ModeMenu } from '@/components/ModeMenu';
import { Menu, X, MessageSquare } from 'lucide-react';

export default function ConversationPage() {
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
          <h1 className="text-base md:text-lg font-semibold">Conversation</h1>
        </div>
        
        <div className="flex items-center gap-1 md:gap-2">
          <ModeMenu currentMode="conversation" />
        </div>
      </div>

      {/* Sidebar Menu */}
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
            <div className="p-4">
              <p className="text-sm text-muted-foreground">Conversation menu coming soon...</p>
            </div>
          </div>
        </>
      )}

      {/* Main Content - Coming Soon */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Conversation Mode</h2>
        <p className="text-muted-foreground text-center max-w-md">
          Conversation mode is coming soon! This mode will provide a streamlined 
          single-thread conversation experience with multiple AI models.
        </p>
      </div>
    </div>
  );
}
