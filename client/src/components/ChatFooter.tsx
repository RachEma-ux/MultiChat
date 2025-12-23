import { Button } from '@/components/ui/button';
import { Menu, Plus, Settings, Save, Paperclip, Send, Sparkles, Edit, Trash2, BarChart, MessageSquare, Archive, Download, X, Image as ImageIcon, Zap, Mic, Plug, FolderOpen, Palette, Globe } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { ConnectorsStore } from './ConnectorsStore';
import { Z_INDEX } from '@/lib/z-index';
import { useBringToFront } from '@/contexts/ZIndexContext';

interface Attachment {
  name: string;
  type: string;
  size: number;
  file: File;
}

export interface SavedConversation {
  id: string;
  title: string;
  timestamp: string;
  messages?: any[];
  models?: string[];
}

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
  onPresetsSettings?: () => void;
  onCategoriesSettings?: () => void;
  messagesCount?: number;
  attachments?: Attachment[];
  onRemoveAttachment?: (index: number) => void;
  savedConversations: SavedConversation[];
  onLoadConversation: (convo: SavedConversation) => void;
  onViewAllSaved: () => void;
  archivedCount?: number;
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
  onPresetsSettings,
  onCategoriesSettings,
  messagesCount = 0,
  attachments = [],
  onRemoveAttachment,
  savedConversations = [],
  onLoadConversation,
  onViewAllSaved,
  archivedCount = 0
}: ChatFooterProps) {
  const [showFooterMenu, setShowFooterMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showConnectorsStore, setShowConnectorsStore] = useState(false);
  
  // Dynamic z-index for menus
  const footerMenuZ = useBringToFront('chat-footer-menu', 'dropdown');
  const settingsMenuZ = useBringToFront('chat-footer-settings', 'dropdown');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputMessageRef = useRef(inputMessage);

  // Keep inputMessageRef updated
  useEffect(() => {
    inputMessageRef.current = inputMessage;
  }, [inputMessage]);

  // Auto-grow textarea
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onInputChange?.(e.target.value);
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      // Reset height to allow shrinking
      textareaRef.current.style.height = '40px';
      
      // Use requestAnimationFrame to ensure DOM has updated
      requestAnimationFrame(() => {
        if (textareaRef.current) {
          const scrollHeight = textareaRef.current.scrollHeight;
          textareaRef.current.style.height = `${Math.min(scrollHeight, 200)}px`;
          
          // Enable scrolling when max height reached
          if (scrollHeight > 200) {
            textareaRef.current.style.overflowY = 'auto';
          } else {
            textareaRef.current.style.overflowY = 'hidden';
          }
        }
      });
    }
  };

  // Auto-adjust height when inputMessage changes
  useEffect(() => {
    adjustTextareaHeight();
  }, [inputMessage]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="border-t border-border p-2 md:p-3 shrink-0 space-y-2">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          if (onAttach && files.length > 0) {
            onAttach();
          }
          toast.success(`${files.length} file(s) attached`);
          e.target.value = '';
        }}
      />
      
      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {attachments.map((att, idx) => (
            <div key={idx} className="flex items-center gap-2 bg-muted rounded px-2 py-1 text-xs">
              {att.type.startsWith('image/') ? <ImageIcon className="h-3 w-3" /> : <Paperclip className="h-3 w-3" />}
              <span className="truncate max-w-[100px]">{att.name}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0"
                onClick={() => onRemoveAttachment?.(idx)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
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
                  className="fixed inset-0"
                  style={{ zIndex: footerMenuZ.zIndex - 1 }}
                  onClick={() => { setShowFooterMenu(false); footerMenuZ.close(); }}
                />
                <div 
                  className="absolute bottom-full left-0 mb-2 w-72 bg-card rounded-lg shadow-2xl border border-border overflow-hidden"
                  style={{ zIndex: footerMenuZ.zIndex }}
                  onMouseEnter={() => footerMenuZ.bringToFront()}
                >
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
                      if (confirm('Are you sure you want to clear this chat?')) {
                        onClearChat?.();
                      }
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
                      if (confirm('Are you sure you want to delete this chat?')) {
                        onDeleteChat?.();
                      }
                      setShowFooterMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors text-left text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="text-sm">Delete Chat</span>
                  </button>
                  
                  {/* Recent Conversations */}
                  {savedConversations.length > 0 && (
                    <div className="border-t border-border">
                      <div className="px-4 py-2 text-xs font-semibold text-muted-foreground">RECENT CONVERSATIONS</div>
                      {savedConversations.slice(0, 3).map((convo) => (
                        <button
                          key={convo.id}
                          onClick={() => {
                            onLoadConversation?.(convo);
                            setShowFooterMenu(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors text-left"
                        >
                          <MessageSquare className="h-4 w-4" />
                          <span className="text-sm truncate">{convo.title}</span>
                        </button>
                      ))}
                      <button
                        onClick={() => {
                          onViewAllSaved?.();
                          setShowFooterMenu(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors text-left"
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span className="text-sm">View All Saved</span>
                      </button>
                      <button
                        onClick={() => {
                          toast.info(`Archive (${archivedCount})`);
                          setShowFooterMenu(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors text-left"
                      >
                        <Archive className="h-4 w-4" />
                        <span className="text-sm">Archive ({archivedCount})</span>
                      </button>
                    </div>
                  )}
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
                  className="fixed inset-0"
                  style={{ zIndex: settingsMenuZ.zIndex - 1 }}
                  onClick={() => { setShowSettings(false); settingsMenuZ.close(); }}
                />
                <div 
                  className="absolute bottom-full right-0 mb-2 w-56 bg-card rounded-lg shadow-2xl border border-border overflow-hidden"
                  style={{ zIndex: settingsMenuZ.zIndex }}
                  onMouseEnter={() => settingsMenuZ.bringToFront()}
                >
                  <div className="px-4 py-3 border-b border-border">
                    <h3 className="text-sm font-semibold">Settings</h3>
                  </div>
                  <button
                    onClick={() => {
                      onPresetsSettings?.();
                      setShowSettings(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors text-left"
                  >
                    <Zap className="h-4 w-4" />
                    <span className="text-sm">Presets Setting</span>
                  </button>
                  <button
                    onClick={() => {
                      onCategoriesSettings?.();
                      setShowSettings(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors text-left"
                  >
                    <FolderOpen className="h-4 w-4" />
                    <span className="text-sm">Categories Setting</span>
                  </button>
                  <button
                    onClick={() => {
                      toast.info('Theme settings coming soon');
                      setShowSettings(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors text-left"
                  >
                    <Palette className="h-4 w-4" />
                    <span className="text-sm">Theme</span>
                  </button>
                  <button
                    onClick={() => {
                      toast.info('Language settings coming soon');
                      setShowSettings(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors text-left"
                  >
                    <Globe className="h-4 w-4" />
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
          onClick={() => fileInputRef.current?.click()}
          title="Attach files"
          className="shrink-0 h-10 w-10"
        >
          <Paperclip className="h-4 w-4" />
        </Button>
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={inputMessage}
            onChange={handleTextareaChange}
            placeholder="Select at least one AI model to send a message"
            disabled={selectedModelsCount === 0}
            rows={1}
            className="w-full pl-3 pr-16 py-2.5 rounded-md border border-input bg-background text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            style={{ lineHeight: '1.5', height: '40px', minHeight: '40px', maxHeight: '200px', overflowY: 'hidden' }}
          />
          <div className="absolute right-2 bottom-1.5 flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className={`h-7 w-7 ${isListening ? 'text-red-500 animate-pulse' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => {
                if (isListening) {
                  // Stop listening
                  setIsListening(false);
                  if ((window as any).recognition) {
                    (window as any).recognition.stop();
                  }
                } else {
                  // Start listening
                  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
                    // Explicitly request permission first
                    navigator.mediaDevices.getUserMedia({ audio: true })
                      .then(() => {
                        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
                        const recognition = new SpeechRecognition();
                        (window as any).recognition = recognition;
                        
                        recognition.continuous = false;
                        recognition.interimResults = false;
                        recognition.lang = navigator.language || 'en-US';
                        
                        recognition.onstart = () => {
                          setIsListening(true);
                          toast.info('Listening...');
                        };
                        
                        recognition.onresult = (event: any) => {
                          const transcript = event.results[0][0].transcript;
                          const currentInput = inputMessageRef.current;
                          onInputChange?.(currentInput + (currentInput ? ' ' : '') + transcript);
                          setIsListening(false);
                        };
                        
                        recognition.onerror = (event: any) => {
                          console.error('Speech recognition error', event.error);
                          setIsListening(false);
                          if (event.error === 'not-allowed') {
                            toast.error('Microphone access denied. Please check browser settings.');
                          } else if (event.error === 'no-speech') {
                            toast.info('No speech detected');
                          } else {
                            toast.error(`Voice input failed: ${event.error}`);
                          }
                        };
                        
                        recognition.onend = () => {
                          setIsListening(false);
                        };
                        
                        try {
                          recognition.start();
                        } catch (e) {
                          console.error(e);
                          toast.error('Failed to start voice input');
                        }
                      })
                      .catch((err) => {
                        console.error('Microphone permission denied:', err);
                        toast.error('Microphone permission denied. Please allow access in browser settings.');
                      });
                  } else {
                    toast.error('Speech recognition not supported in this browser');
                  }
                }
              }}
              title="Voice Input"
            >
              <Mic className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className={`h-7 w-7 ${showConnectorsStore ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setShowConnectorsStore(true)}
              title="Connectors Store"
            >
              <Plug className="h-4 w-4" />
            </Button>

            <ConnectorsStore 
              isOpen={showConnectorsStore} 
              onClose={() => setShowConnectorsStore(false)} 
            />
          </div>
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
