import { useState } from 'react';
import Draggable from 'react-draggable';
import { Button } from '@/components/ui/button';
import { X, Minus, Maximize2, Minimize2, Pin, PinOff, Menu, Plus, Settings, Save } from 'lucide-react';
import { toast } from 'sonner';

interface FloatingChatWindowProps {
  id: string;
  onClose: () => void;
  initialPosition?: { x: number; y: number };
  onPositionChange?: (position: { x: number; y: number }) => void;
}

export function FloatingChatWindow({ 
  id, 
  onClose, 
  initialPosition = { x: 100, y: 100 },
  onPositionChange 
}: FloatingChatWindowProps) {
  const [isPinned, setIsPinned] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [position, setPosition] = useState(initialPosition);

  const handleDrag = (_e: any, data: any) => {
    const newPosition = { x: data.x, y: data.y };
    setPosition(newPosition);
    onPositionChange?.(newPosition);
  };

  const togglePin = () => {
    setIsPinned(!isPinned);
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  return (
    <Draggable
      disabled={isPinned || isMaximized}
      position={position}
      onDrag={handleDrag}
      handle=".drag-handle"
      bounds="parent"
    >
      <div
        className={`fixed bg-background border border-border rounded-lg shadow-2xl overflow-hidden ${
          isMaximized ? 'inset-4' : isMinimized ? 'w-80 h-12' : 'w-[600px] h-[700px]'
        }`}
        style={{
          zIndex: 1000,
          ...(isMaximized ? {} : { maxWidth: '90vw', maxHeight: '90vh' })
        }}
      >
        {/* Window Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-card">
          <div className="drag-handle flex items-center gap-2 cursor-move flex-1">
            <span className="text-sm font-semibold">Chat {id}</span>
          </div>
          
          <div className="flex items-center gap-1" style={{ pointerEvents: 'auto' }}>
            {/* Pin/Unpin Button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                togglePin();
              }}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => {
                e.stopPropagation();
                e.preventDefault();
                togglePin();
              }}
              title={isPinned ? 'Unpin' : 'Pin'}
            >
              {isPinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
            </Button>
            
            {/* Minimize Button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                toggleMinimize();
              }}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => {
                e.stopPropagation();
                e.preventDefault();
                toggleMinimize();
              }}
              title={isMinimized ? 'Restore' : 'Minimize'}
            >
              <Minus className="h-4 w-4" />
            </Button>
            
            {/* Maximize/Restore Button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                toggleMaximize();
              }}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => {
                e.stopPropagation();
                e.preventDefault();
                toggleMaximize();
              }}
              title={isMaximized ? 'Restore' : 'Maximize'}
            >
              {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
            
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onClose();
              }}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onClose();
              }}
              title="Close"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Window Content */}
        {!isMinimized && (
          <div className="h-full flex flex-col">
            <div className="flex-1 p-4 overflow-auto">
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="text-6xl mb-4">💬</div>
                <h2 className="text-xl font-semibold mb-2">Start a conversation with multiple AIs</h2>
                <p className="text-sm text-muted-foreground">Select models and send a message</p>
              </div>
            </div>
            
            {/* Footer Control Panel */}
            <div className="border-t border-border p-2 md:p-3">
              <div className="flex items-center gap-1 md:gap-2 justify-between">
                {/* Left side controls */}
                <div className="flex items-center gap-1">
                  {/* Hamburger Menu */}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => toast.info('Menu coming soon')}
                    className="h-7 w-7 shrink-0"
                    title="Menu"
                  >
                    <Menu className="h-3.5 w-3.5" />
                  </Button>
                  
                  {/* Plus Button */}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => toast.info('New chat coming soon')}
                    className="h-7 w-7 shrink-0"
                    title="New Chat"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                  
                  {/* Models Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toast.info('Model selection coming soon')}
                    className="text-[10px] h-7 px-2 shrink-0"
                  >
                    0 Models
                  </Button>
                </div>
                
                {/* Right side controls */}
                <div className="flex items-center gap-1">
                  {/* Settings Icon */}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => toast.info('Settings coming soon')}
                    className="h-7 w-7 shrink-0"
                    title="Settings"
                  >
                    <Settings className="h-3.5 w-3.5" />
                  </Button>
                  
                  {/* Save Icon */}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => toast.info('Save coming soon')}
                    disabled={true}
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
          </div>
        )}
      </div>
    </Draggable>
  );
}
