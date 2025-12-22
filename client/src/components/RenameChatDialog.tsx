import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';

interface RenameChatDialogProps {
  isOpen: boolean;
  currentTitle: string;
  onClose: () => void;
  onRename: (newTitle: string) => void;
}

export function RenameChatDialog({ isOpen, currentTitle, onClose, onRename }: RenameChatDialogProps) {
  const [newTitle, setNewTitle] = useState(currentTitle);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setNewTitle(currentTitle);
      setError('');
    }
  }, [isOpen, currentTitle]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmed = newTitle.trim();
    
    if (!trimmed) {
      setError('Title cannot be empty');
      return;
    }
    
    if (trimmed.length > 100) {
      setError('Title must be less than 100 characters');
      return;
    }
    
    onRename(trimmed);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className="relative bg-card border border-border rounded-lg shadow-2xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold">Rename Chat</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="chat-title" className="text-sm font-medium block mb-2">
                Chat Title
              </label>
              <Input
                id="chat-title"
                type="text"
                value={newTitle}
                onChange={(e) => {
                  setNewTitle(e.target.value);
                  setError('');
                }}
                onKeyDown={handleKeyDown}
                placeholder="Enter chat title"
                autoFocus
                className={error ? 'border-red-500' : ''}
              />
              {error && (
                <p className="text-sm text-red-500 mt-1">{error}</p>
              )}
            </div>
          </div>
          
          {/* Footer */}
          <div className="flex justify-end gap-2 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!newTitle.trim()}
            >
              Rename
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
