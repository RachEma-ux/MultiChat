import { Button } from '@/components/ui/button';
import { MessageSquare, Maximize2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MinimizedWindow {
  id: string;
  title: string;
  messageCount: number;
}

interface WindowDockProps {
  minimizedWindows: MinimizedWindow[];
  onRestore: (id: string) => void;
  onClose: (id: string) => void;
}

export function WindowDock({ minimizedWindows, onRestore, onClose }: WindowDockProps) {
  if (minimizedWindows.length === 0) return null;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50"
    >
      <div className="flex items-center gap-2 px-3 py-2 bg-card/95 backdrop-blur-sm border border-border rounded-full shadow-lg">
        {minimizedWindows.map((window) => (
          <motion.div
            key={window.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="relative group"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRestore(window.id)}
              className="h-10 px-3 gap-2 rounded-full hover:bg-accent"
              title={`Restore: ${window.title}`}
            >
              <MessageSquare className="h-4 w-4" />
              <span className="max-w-[100px] truncate text-xs">
                {window.title}
              </span>
              {window.messageCount > 0 && (
                <span className="px-1.5 py-0.5 bg-primary/20 text-primary rounded-full text-[10px] font-medium">
                  {window.messageCount}
                </span>
              )}
            </Button>
            
            {/* Close button on hover */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose(window.id);
              }}
              className="absolute -top-1 -right-1 h-4 w-4 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              title="Close window"
            >
              <X className="h-2.5 w-2.5" />
            </button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
