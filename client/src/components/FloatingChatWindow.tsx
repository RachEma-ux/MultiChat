import { useState } from 'react';
import Draggable from 'react-draggable';
import { Button } from '@/components/ui/button';
import { X, Minus, Maximize2, Minimize2, Pin, PinOff } from 'lucide-react';

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
        <div className="drag-handle flex items-center justify-between px-3 py-2 border-b border-border bg-card cursor-move">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">Chat {id}</span>
          </div>
          
          <div className="flex items-center gap-1">
            {/* Pin/Unpin Button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={togglePin}
              title={isPinned ? 'Unpin' : 'Pin'}
            >
              {isPinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
            </Button>
            
            {/* Minimize Button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={toggleMinimize}
              title={isMinimized ? 'Restore' : 'Minimize'}
            >
              <Minus className="h-4 w-4" />
            </Button>
            
            {/* Maximize/Restore Button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={toggleMaximize}
              title={isMaximized ? 'Restore' : 'Maximize'}
            >
              {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
            
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onClose}
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
            
            {/* Footer Placeholder */}
            <div className="border-t border-border p-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Select at least one AI model to send a message"
                  className="flex-1 px-3 py-2 bg-background border border-border rounded-md text-sm"
                  disabled
                />
                <Button size="sm" disabled>Send</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Draggable>
  );
}
