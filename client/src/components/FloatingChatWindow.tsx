import { useState } from 'react';
import Draggable from 'react-draggable';
import { Button } from '@/components/ui/button';
import { Pin, Minus, Maximize2, Minimize2, X } from 'lucide-react';
import { ChatFooter } from '@/components/ChatFooter';
import { toast } from 'sonner';

interface FloatingChatWindowProps {
  id: string;
  initialPosition?: { x: number; y: number };
  onClose: () => void;
  onPositionChange?: (pos: { x: number; y: number }) => void;
}

export function FloatingChatWindow({ 
  id, 
  initialPosition = { x: 50, y: 50 },
  onClose,
  onPositionChange 
}: FloatingChatWindowProps) {
  const [position, setPosition] = useState(initialPosition);
  const [isPinned, setIsPinned] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleDrag = (_e: any, data: { x: number; y: number }) => {
    const newPos = { x: data.x, y: data.y };
    setPosition(newPos);
    onPositionChange?.(newPos);
  };

  const togglePin = () => {
    setIsPinned(!isPinned);
    toast.info(isPinned ? 'Window unpinned' : 'Window pinned');
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  const handleSend = () => {
    if (!inputMessage.trim()) return;
    toast.info('Sending message: ' + inputMessage);
    // TODO: Implement actual message sending
    setInputMessage('');
  };

  const handleAttach = () => {
    toast.info('Attach files coming soon');
  };

  // Calculate window dimensions
  const windowStyle: React.CSSProperties = {
    zIndex: 1000,
  };

  if (isMaximized) {
    windowStyle.width = 'calc(100vw - 32px)';
    windowStyle.height = 'calc(100vh - 32px)';
    windowStyle.left = '16px';
    windowStyle.top = '16px';
  } else if (isMinimized) {
    windowStyle.width = '320px';
    windowStyle.height = 'auto';
  } else {
    windowStyle.width = 'min(600px, 90vw)';
    windowStyle.height = 'min(500px, 70vh)';
  }

  return (
    <Draggable
      disabled={isPinned || isMaximized}
      position={isPinned || isMaximized ? { x: 0, y: 0 } : position}
      onDrag={handleDrag}
      handle=".drag-handle"
      bounds="parent"
    >
      <div
        className="fixed bg-background border border-border rounded-lg shadow-2xl overflow-hidden flex flex-col"
        style={windowStyle}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-card shrink-0">
          <div className="drag-handle flex items-center gap-2 cursor-move flex-1 min-w-0">
            <span className="text-sm font-medium truncate">Chat {id}</span>
          </div>
          
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePin}
              className="h-7 w-7"
              title={isPinned ? 'Unpin' : 'Pin'}
            >
              <Pin className={`h-3.5 w-3.5 ${isPinned ? 'fill-current' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMinimize}
              className="h-7 w-7"
              title={isMinimized ? 'Restore' : 'Minimize'}
            >
              <Minus className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMaximize}
              className="h-7 w-7"
              title={isMaximized ? 'Restore' : 'Maximize'}
            >
              {isMaximized ? (
                <Minimize2 className="h-3.5 w-3.5" />
              ) : (
                <Maximize2 className="h-3.5 w-3.5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-7 w-7"
              title="Close"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Content - Only show if not minimized */}
        {!isMinimized && (
          <>
            <div className="flex-1 p-4 overflow-auto min-h-0">
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="text-6xl mb-4">💬</div>
                <h2 className="text-xl font-semibold mb-2">Start a conversation with multiple AIs</h2>
                <p className="text-sm text-muted-foreground">Select models and send a message</p>
              </div>
            </div>
            
            {/* Footer */}
            <ChatFooter
              selectedModelsCount={0}
              onModelsClick={() => toast.info('Models selection coming soon')}
              onNewChat={() => toast.info('New chat coming soon')}
              onSave={() => toast.info('Copy/Save conversation coming soon')}
              onSettingsClick={() => toast.info('Settings coming soon')}
              onSummarizerClick={() => toast.info('Summarizer coming soon')}
              onPresetsClick={() => toast.info('Presets coming soon')}
              inputMessage={inputMessage}
              onInputChange={setInputMessage}
              onSend={handleSend}
              onAttach={handleAttach}
              isLoading={isLoading}
            />
          </>
        )}
      </div>
    </Draggable>
  );
}
