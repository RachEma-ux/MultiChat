import { Button } from '@/components/ui/button';
import { Menu, Plus, Settings, Save, Paperclip, Send, Sparkles, Edit, Trash2, BarChart, MessageSquare, Archive, Download } from 'lucide-react';
import { useState, useRef } from 'react';
import { toast } from 'sonner';

interface ChatFooterProps {
  selectedModelsCount: number;
  inputMessage: string;
  onInputChange?: (value: string) => void;
  onModelsClick: () => void;
  onSettingsClick?: () => void;
  onSummarizerClick?: () => void;
  onPresetsClick?: () => void;
  onNewChat?: () => void;
  onSave?: () => void;
  onSend?: () => void;
  onAttach?: () => void;
  isLoading?: boolean;
  onClearChat?: () => void;
  onDeleteChat?: () => void;
  onRenameChat?: () => void;
  onShowAnalytics?: () => void;
  onExportData?: () => void;
  messagesCount?: number;
}

export function ChatFooter({
  selectedModelsCount,
  inputMessage,
  onInputChange,
  onModelsClick,
  onSettingsClick,
  onSummarizerClick,
  onPresetsClick,
  onNewChat,
  onSave,
  onSend,
  onAttach,
  isLoading = false,
  onClearChat,
  onDeleteChat,
  onRenameChat,
  onShowAnalytics,
  onExportData,
  messagesCount = 0
}: ChatFooterProps) {
  const [showFooterMenu, setShowFooterMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  return (
    <div className="border-t border-border p-2 md:p-3 shrink-0 space-y-2">
      {/* Control Buttons Row */}
      <div className="flex items-center gap-1 md:gap-2 justify-center flex-wrap">
          {/* Hamburger Menu */}
          <div className="relative">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowFooterMenu(!showFooterMenu)}
              className="h-7 w-7 shrink-0"
              title="Menu"
            >
              <Menu className="h-3.5 w-3.5" />
            </Button>
            
            {showFooterMenu && (
              <>
                <div 
                  className="fixed inset-0 z-[9998]"
                  onClick={() => setShowFooterMenu(false)}
                />
                <div className="absolute bottom-full left-0 mb-2 w-72 bg-card rounded-lg shadow-2xl z-[9999] border border-border overflow-hidden">
                  <button
                    onClick={() => {
                      onNewChat?.();
                      setShowFooterMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors text-left"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="text-sm">New Chat</span>
                  </button>
                  <button
                    onClick={() => {
                      onRenameChat?.();
                      setShowFooterMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors text-left"
                  >
                    <Edit className="h-4 w-4" />
                    <span className="text-sm">Rename Chat</span>
                  </button>
                  <button
                    onClick={() => {
                      onSave?.();
                      setShowFooterMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors text-left"
                  >
                    <Save className="h-4 w-4" />
                    <span className="text-sm">Save Chat</span>
                  </button>
                  <button
                    onClick={() => {
                      onClearChat?.();
                      setShowFooterMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors text-left"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="text-sm">Clear Chat</span>
                  </button>
                  <button
                    onClick={() => {
                      onShowAnalytics?.();
                      setShowFooterMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors text-left"
                  >
                    <BarChart className="h-4 w-4" />
                    <span className="text-sm">Show Analytics</span>
                  </button>
                  <button
                    onClick={() => {
                      onDeleteChat?.();
                      setShowFooterMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors text-left text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="text-sm">Delete Chat</span>
                  </button>
                </div>
              </>
            )}
          </div>
          
          {/* Plus Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => onNewChat?.()}
            className="h-7 w-7 shrink-0"
            title="New Chat"
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
          
          {/* Models Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onModelsClick}
            className="text-[10px] h-7 px-2 shrink-0"
          >
            {selectedModelsCount} Model{selectedModelsCount !== 1 ? 's' : ''}
          </Button>
          
          {/* Synthesizer Icon - Only show when models are selected */}
          {selectedModelsCount > 0 && (
            <Button
              variant="outline"
              size="icon"
              onClick={onSummarizerClick}
              className="h-7 w-7 shrink-0"
              title="Generate Synthesis"
            >
              <Sparkles className="h-3.5 w-3.5" />
            </Button>
          )}
          {/* Settings Icon */}
          <div className="relative">
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setShowSettings(!showSettings);
                onSettingsClick?.();
              }}
              className="h-7 w-7 shrink-0"
              title="Settings"
            >
              <Settings className="h-3.5 w-3.5" />
            </Button>
            
            {showSettings && (
              <>
                <div 
                  className="fixed inset-0 z-[9998]"
                  onClick={() => setShowSettings(false)}
                />
                <div className="absolute bottom-full right-0 mb-2 w-56 bg-card rounded-lg shadow-2xl z-[9999] border border-border overflow-hidden">
                  <div className="px-4 py-3 border-b border-border">
                    <h3 className="text-sm font-semibold">Settings</h3>
                  </div>
                  <button
                    onClick={() => {
                      toast.info('Theme settings coming soon');
                      setShowSettings(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors text-left"
                  >
                    <span className="text-sm">Theme</span>
                  </button>
                  <button
                    onClick={() => {
                      toast.info('Language settings coming soon');
                      setShowSettings(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors text-left"
                  >
                    <span className="text-sm">Language</span>
                  </button>
                  <button
                    onClick={() => {
                      onExportData?.();
                      setShowSettings(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors text-left"
                  >
                    <Download className="h-4 w-4" />
                    <span className="text-sm">Export Data</span>
                  </button>
                </div>
              </>
            )}
          </div>
          
          {/* Save Icon */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => onSave?.()}
            disabled={messagesCount === 0}
            title="Save Conversation"
            className="h-7 w-7 shrink-0"
          >
            <Save className="h-3.5 w-3.5" />
          </Button>
          
          {/* Presets Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onPresetsClick}
            className="text-[10px] h-7 px-2 shrink-0"
          >
            Presets
          </Button>
      </div>
      
      {/* Message Input Row */}
      <div className="flex gap-2 items-end">
        <Button
          variant="outline"
          size="icon"
          onClick={onAttach}
          title="Attach files"
          className="shrink-0 h-10 w-10"
        >
          <Paperclip className="h-4 w-4" />
        </Button>
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={inputMessage}
            onChange={(e) => onInputChange?.(e.target.value)}
            placeholder="Select at least one AI model to send a message"
            disabled={selectedModelsCount === 0}
            rows={1}
            className="w-full min-h-[40px] max-h-[200px] px-3 py-2.5 rounded-md border border-input bg-background text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            style={{ lineHeight: '1.5' }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (inputMessage.trim() && selectedModelsCount > 0 && !isLoading) {
                  onSend?.();
                }
              }
            }}
          />
        </div>
        <Button
          onClick={onSend}
          disabled={!inputMessage.trim() || selectedModelsCount === 0 || isLoading}
          size="icon"
          className="shrink-0 h-10 w-10"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
