import React from 'react';

/**
 * ChatControlBox - Reusable Chat Control Component
 * =================================================
 * 
 * A self-contained chat control component with all built-in behaviors.
 * Drop this component anywhere to get a fully functional chat control interface.
 * 
 * FRAMEWORK COMPLIANCE:
 * - Z_INDEX_FRAMEWORK: Uses Z_CLASS constants for all layering
 * - RESPONSIVENESS_FRAMEWORK: Mobile-first touch event handling
 * - TECHNICAL_FRAMEWORK: Component design patterns (Section 16)
 * 
 * FEATURES:
 * - Control buttons: Menu, New Chat, Models, Synthesizer, Settings, Save, Presets
 * - Message input: Paperclip, Connector, Auto-growing textarea, Voice input
 * - Built-in modals: ModelSelector, PresetsPanel, SettingsMenu, ConnectorsStore
 * - localStorage persistence for conversations and presets
 * 
 * @example
 * // Basic usage
 * <ChatControlBox
 *   messages={messages}
 *   selectedModels={models}
 *   onSendMessage={handleSend}
 *   onModelsChange={setModels}
 * />
 * 
 * // With customization
 * <ChatControlBox
 *   messages={messages}
 *   selectedModels={models}
 *   onSendMessage={handleSend}
 *   onModelsChange={setModels}
 *   hideConnectors={true}
 *   hideSynthesizer={true}
 * />
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Menu, Plus, Settings, Save, Paperclip, Send, Sparkles, 
  Edit, Trash2, BarChart, MessageSquare, Archive, Download, 
  X, Image as ImageIcon, Zap, Mic, Plug, FolderOpen, Sun, Moon, Globe, Palette 
} from 'lucide-react';
import { toast } from 'sonner';
import { Z_CLASS, Z_VALUES } from '@/lib/z-index';
import { ConnectorsStore } from '../ConnectorsStore';
import { ModelSelector } from '../ModelSelector';
import { PresetsPanel } from '../PresetsPanel';
import { PresetEditorModal } from '../PresetEditorModal';
import { CustomPreset } from '../PresetsManagementModal';
import { PresetSelectionDialog } from '../PresetSelectionDialog';
import { PresetsManagementModal } from '../PresetsManagementModal';
import CategoriesSettingsModal from '../CategoriesSettingsModal';
import { AnalyticsPanel } from '../AnalyticsPanel';
import { RenameChatDialog } from '../RenameChatDialog';
import { SavedConversationsModal } from '../SavedConversationsModal';
import { SavedConversation as ChatFooterSavedConversation } from '../ChatFooter';
import { QuickPreset, loadQuickPresets, saveQuickPresets } from '@/lib/quick-presets';
import { MODEL_PRESETS, AI_PROVIDERS } from '@/lib/ai-providers';
import { useTheme } from '@/contexts/ThemeContext';
import { ChatWindowTemplate, getAccentClasses, getButtonClasses } from '@/lib/chat-templates';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface Attachment {
  name: string;
  type: string;
  size: number;
  file: File;
}

export interface Message {
  id: number | string;
  type: 'user' | 'ai' | 'synthesis' | 'typing';
  content: string;
  timestamp: Date;
  provider?: string;
  model?: string;
  rating?: number | null;
  confidence?: number;
  responseTime?: number;
  visible?: boolean;
  sources?: number;
  attachments?: Attachment[];
}

export interface SavedConversation {
  id: string;
  title: string;
  timestamp: string;
  messages: Message[];
  models: string[];
  tags?: string[];
}

// Helper to convert between SavedConversation types
const toFooterConversation = (c: SavedConversation): ChatFooterSavedConversation => ({
  id: c.id,
  title: c.title,
  timestamp: c.timestamp,
  messages: c.messages,
  models: c.models
});

const fromFooterConversation = (c: ChatFooterSavedConversation): SavedConversation => ({
  id: c.id,
  title: c.title,
  timestamp: c.timestamp,
  messages: (c.messages || []).map(m => ({
    id: typeof m.id === 'string' ? parseInt(m.id) || 0 : m.id,
    type: m.type as 'user' | 'ai' | 'synthesis',
    content: m.content || '',
    timestamp: m.timestamp instanceof Date ? m.timestamp : new Date(m.timestamp),
    provider: m.provider,
    model: m.model,
    rating: m.rating,
    confidence: m.confidence,
    responseTime: m.responseTime,
    visible: m.visible,
    sources: m.sources
  })),
  models: c.models || [],
  tags: (c as any).tags
});

export interface ChatControlBoxProps {
  /** Current conversation messages */
  messages: Message[];
  /** Callback when messages change */
  onMessagesChange: (messages: Message[]) => void;
  /** Currently selected AI models */
  selectedModels: string[];
  /** Callback when model selection changes */
  onModelsChange: (models: string[]) => void;
  /** Callback when user sends a message */
  onSendMessage: (text: string, attachments: Attachment[]) => void;
  /** Current conversation title */
  conversationTitle?: string;
  /** Callback when title changes */
  onTitleChange?: (title: string) => void;
  /** Whether AI is currently generating a response */
  isLoading?: boolean;
  /** Hide the connector/plugins button */
  hideConnectors?: boolean;
  /** Hide the synthesizer button */
  hideSynthesizer?: boolean;
  /** Hide the voice input button */
  hideVoiceInput?: boolean;
  /** Custom placeholder text */
  placeholder?: string;
  /** Callback when new chat is requested */
  onNewChat?: () => void;
  /** Callback when synthesis is requested */
  onSynthesize?: () => void;
  /** Callback when themes settings is requested */
  onThemesSettings?: () => void;
  /** Current template for styling */
  template?: ChatWindowTemplate;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function ChatControlBox({
  messages,
  onMessagesChange,
  selectedModels,
  onModelsChange,
  onSendMessage,
  conversationTitle = 'New Chat',
  onTitleChange,
  isLoading = false,
  hideConnectors = false,
  hideSynthesizer = false,
  hideVoiceInput = false,
  placeholder,
  onNewChat,
  onSynthesize,
  onThemesSettings,
  template,
}: ChatControlBoxProps) {
  // Determine if using modern (cyan) styling
  const isModernTemplate = template?.accentColor === 'cyan';
  // =========================================================================
  // STATE MANAGEMENT
  // =========================================================================
  
  // Input state
  const [inputMessage, setInputMessage] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isListening, setIsListening] = useState(false);
  
  // Panel visibility state
  const [showFooterMenu, setShowFooterMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showModelsPanel, setShowModelsPanel] = useState(false);
  const [showPresetsPanel, setShowPresetsPanel] = useState(false);
  const [showConnectorsStore, setShowConnectorsStore] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  
  // Modal visibility state
  const [showPresetEditor, setShowPresetEditor] = useState(false);
  const [showPresetSelection, setShowPresetSelection] = useState(false);
  const [showPresetsManagement, setShowPresetsManagement] = useState(false);
  const [showCategoriesSettings, setShowCategoriesSettings] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [showSavedConversations, setShowSavedConversations] = useState(false);
  
  // Preset state
  const [quickPresets, setQuickPresets] = useState<QuickPreset[]>([]);
  const [customPresets, setCustomPresets] = useState<CustomPreset[]>([]);
  const [editingPreset, setEditingPreset] = useState<QuickPreset | null>(null);
  
  // Conversation state
  const [savedConversations, setSavedConversations] = useState<SavedConversation[]>([]);
  const [archivedConversations, setArchivedConversations] = useState<SavedConversation[]>([]);
  
  // Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputMessageRef = useRef(inputMessage);

  // =========================================================================
  // EFFECTS
  // =========================================================================
  
  // Keep inputMessageRef updated for voice input
  useEffect(() => {
    inputMessageRef.current = inputMessage;
  }, [inputMessage]);
  
  // Load presets and conversations on mount
  useEffect(() => {
    loadQuickPresetsFromStorage();
    loadCustomPresetsFromStorage();
    loadConversationsFromStorage();
  }, []);
  
  // Auto-grow textarea
  useEffect(() => {
    adjustTextareaHeight();
  }, [inputMessage]);

  // =========================================================================
  // STORAGE FUNCTIONS
  // =========================================================================
  
  const loadQuickPresetsFromStorage = useCallback(() => {
    const loaded = loadQuickPresets();
    setQuickPresets(loaded);
  }, []);
  
  const loadCustomPresetsFromStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem('customPresets');
      if (stored) {
        setCustomPresets(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading custom presets:', error);
    }
  }, []);
  
  const loadConversationsFromStorage = useCallback(() => {
    try {
      const saved: SavedConversation[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('conversation:')) {
          const data = localStorage.getItem(key);
          if (data) {
            const parsed = JSON.parse(data);
            parsed.messages = parsed.messages?.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            })) || [];
            saved.push(parsed);
          }
        }
      }
      saved.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setSavedConversations(saved);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  }, []);

  // =========================================================================
  // TEXTAREA HANDLING
  // =========================================================================
  
  const adjustTextareaHeight = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '40px';
      requestAnimationFrame(() => {
        if (textareaRef.current) {
          const scrollHeight = textareaRef.current.scrollHeight;
          textareaRef.current.style.height = `${Math.min(scrollHeight, 200)}px`;
          textareaRef.current.style.overflowY = scrollHeight > 200 ? 'auto' : 'hidden';
        }
      });
    }
  }, []);

  // =========================================================================
  // MESSAGE HANDLING
  // =========================================================================
  
  const handleSend = useCallback(() => {
    if (!inputMessage.trim() || selectedModels.length === 0) return;
    onSendMessage(inputMessage.trim(), attachments);
    setInputMessage('');
    setAttachments([]);
  }, [inputMessage, selectedModels, attachments, onSendMessage]);

  // =========================================================================
  // FILE HANDLING
  // =========================================================================
  
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newAttachments: Attachment[] = files.map(file => ({
        name: file.name,
        type: file.type,
        size: file.size,
        file
      }));
      setAttachments(prev => [...prev, ...newAttachments]);
      toast.success(`${files.length} file(s) attached`);
    }
    e.target.value = '';
  }, []);
  
  const removeAttachment = useCallback((index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  }, []);

  // =========================================================================
  // VOICE INPUT HANDLING
  // =========================================================================
  
  const handleVoiceInput = useCallback(() => {
    if (isListening) {
      setIsListening(false);
      if ((window as any).recognition) {
        (window as any).recognition.stop();
      }
      return;
    }
    
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
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
            setInputMessage(currentInput + (currentInput ? ' ' : '') + transcript);
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
  }, [isListening]);

  // =========================================================================
  // CONVERSATION HANDLING
  // =========================================================================
  
  const handleSaveConversation = useCallback(() => {
    if (messages.length === 0) {
      toast.error('No messages to save');
      return;
    }
    
    const convoId = `conversation:${Date.now()}`;
    const convoData: SavedConversation = {
      id: convoId,
      title: conversationTitle,
      timestamp: new Date().toISOString(),
      messages: messages.map(msg => ({
        ...msg,
        timestamp: msg.timestamp
      })),
      models: selectedModels
    };
    
    try {
      localStorage.setItem(convoId, JSON.stringify(convoData));
      loadConversationsFromStorage();
      toast.success('Conversation saved!');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save conversation');
    }
  }, [messages, conversationTitle, selectedModels, loadConversationsFromStorage]);
  
  const handleLoadConversation = useCallback((convo: SavedConversation) => {
    onMessagesChange(convo.messages);
    onModelsChange(convo.models);
    onTitleChange?.(convo.title);
    setShowFooterMenu(false);
    toast.success('Conversation loaded');
  }, [onMessagesChange, onModelsChange, onTitleChange]);
  
  const handleClearChat = useCallback(() => {
    if (confirm('Are you sure you want to clear this chat?')) {
      onMessagesChange([]);
      toast.success('Chat cleared');
    }
  }, [onMessagesChange]);
  
  const handleDeleteChat = useCallback(() => {
    if (confirm('Are you sure you want to delete this chat?')) {
      onMessagesChange([]);
      onTitleChange?.('New Chat');
      toast.success('Chat deleted');
    }
  }, [onMessagesChange, onTitleChange]);
  
  const handleNewChat = useCallback(() => {
    onMessagesChange([]);
    onTitleChange?.('New Chat');
    setAttachments([]);
    setInputMessage('');
    onNewChat?.();
    setShowFooterMenu(false);
  }, [onMessagesChange, onTitleChange, onNewChat]);

  // =========================================================================
  // PRESET HANDLING
  // =========================================================================
  
  const handleApplyPreset = useCallback((models: string[]) => {
    onModelsChange(models);
    setShowPresetsPanel(false);
    toast.success('Preset applied');
  }, [onModelsChange]);
  
  const handleToggleModel = useCallback((provider: string, model: string) => {
    const modelKey = `${provider}:${model}`;
    if (selectedModels.includes(modelKey)) {
      onModelsChange(selectedModels.filter(m => m !== modelKey));
    } else {
      onModelsChange([...selectedModels, modelKey]);
    }
  }, [selectedModels, onModelsChange]);
  
  const handleEditQuickPreset = useCallback((id: string) => {
    const preset = quickPresets.find(p => p.id === id);
    if (preset) {
      setEditingPreset(preset);
      setShowPresetEditor(true);
    }
  }, [quickPresets]);
  
  const handleDeleteQuickPreset = useCallback((id: string) => {
    if (confirm('Are you sure you want to delete this preset?')) {
      const updated = quickPresets.filter(p => p.id !== id);
      setQuickPresets(updated);
      saveQuickPresets(updated);
      toast.success('Preset deleted');
    }
  }, [quickPresets]);
  
  const handleSavePreset = useCallback((preset: QuickPreset) => {
    let updated: QuickPreset[];
    if (editingPreset) {
      updated = quickPresets.map(p => p.id === editingPreset.id ? preset : p);
    } else {
      updated = [...quickPresets, preset];
    }
    setQuickPresets(updated);
    saveQuickPresets(updated);
    setShowPresetEditor(false);
    setEditingPreset(null);
    toast.success(editingPreset ? 'Preset updated' : 'Preset created');
  }, [quickPresets, editingPreset]);

  // =========================================================================
  // EXPORT HANDLING
  // =========================================================================
  
  const handleExportData = useCallback(() => {
    if (messages.length === 0) {
      toast.error('No messages to export');
      return;
    }
    
    const exportData = {
      title: conversationTitle,
      messages,
      selectedModels,
      timestamp: new Date().toISOString(),
      totalMessages: messages.length
    };
    
    try {
      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `chat-export-${Date.now()}.json`;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      
      toast.success('Conversation exported!');
    } catch (error) {
      toast.error('Export failed');
    }
  }, [messages, conversationTitle, selectedModels]);

  // =========================================================================
  // ANALYTICS
  // =========================================================================
  
  const getAnalytics = useCallback(() => {
    const aiMessages = messages.filter(m => m.type === 'ai');
    const avgConfidence = aiMessages.reduce((sum, m) => sum + (m.confidence || 0), 0) / (aiMessages.length || 1);
    const avgResponseTime = aiMessages.reduce((sum, m) => sum + (m.responseTime || 0), 0) / (aiMessages.length || 1);
    const ratedMessages = aiMessages.filter(m => m.rating !== null);
    const avgRating = ratedMessages.reduce((sum, m) => sum + (m.rating === 1 ? 5 : 1), 0) / (ratedMessages.length || 1);
    return { avgConfidence, avgResponseTime, avgRating, totalMessages: messages.length };
  }, [messages]);

  // =========================================================================
  // RENDER
  // =========================================================================
  
  const defaultPlaceholder = selectedModels.length === 0 
    ? 'Select at least one AI model to send a message' 
    : 'Type your message...';

  // Container classes based on template
  const containerClasses = isModernTemplate
    ? 'border-t border-cyan-700/50 bg-gradient-to-r from-cyan-950/80 to-slate-900/90 rounded-b-lg'
    : 'border-t border-border bg-card rounded-b-lg';

  // Button classes based on template
  const buttonClasses = isModernTemplate
    ? 'border-cyan-700/50 hover:bg-cyan-900/50 text-cyan-300'
    : '';

  // Send button classes based on template
  const sendButtonClasses = isModernTemplate
    ? 'bg-cyan-600 hover:bg-cyan-500 text-white'
    : 'bg-primary hover:bg-primary/90 text-primary-foreground';

  return (
    <div className={containerClasses}>
      {/* Analytics Panel */}
      {showAnalytics && (
        <AnalyticsPanel 
          isOpen={showAnalytics}
          messages={messages.map(m => ({
            ...m,
            type: m.type === 'synthesis' ? 'ai' : m.type
          })) as any}
          conversationTitle={conversationTitle}
          onClose={() => setShowAnalytics(false)} 
        />
      )}
      
      {/* Models Panel */}
      {showModelsPanel && (
        <ModelSelector
          selectedModels={selectedModels}
          onToggleModel={handleToggleModel}
        />
      )}
      
      {/* Presets Panel */}
      {showPresetsPanel && (
        <PresetsPanel
          quickPresets={quickPresets}
          onApplyPreset={handleApplyPreset}
          onNewPreset={() => setShowPresetSelection(true)}
          onEditPreset={handleEditQuickPreset}
          onDeletePreset={handleDeleteQuickPreset}
        />
      )}
      
      <div className="p-2 md:p-3 space-y-2">
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
                  onClick={() => removeAttachment(idx)}
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
              className={`h-7 w-7 shrink-0 ${buttonClasses}`}
              title="Menu"
            >
              <Menu className="h-3.5 w-3.5" />
            </Button>
            
            {showFooterMenu && (
              <>
                <div 
                  className={`fixed inset-0 ${Z_CLASS.DROPDOWN}`}
                  style={{ zIndex: Z_VALUES.DROPDOWN - 1 }}
                  onClick={() => setShowFooterMenu(false)}
                />
                <div 
                  className={`absolute bottom-full left-0 mb-2 w-72 bg-card rounded-lg shadow-2xl border border-border overflow-hidden ${Z_CLASS.DROPDOWN}`}
                >
                  <button
                    onClick={handleNewChat}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors text-left"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="text-sm">New Chat</span>
                  </button>
                  <button
                    onClick={() => { setShowRenameDialog(true); setShowFooterMenu(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors text-left"
                  >
                    <Edit className="h-4 w-4" />
                    <span className="text-sm">Rename Chat</span>
                  </button>
                  <button
                    onClick={() => { handleSaveConversation(); setShowFooterMenu(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors text-left"
                  >
                    <Save className="h-4 w-4" />
                    <span className="text-sm">Save Chat</span>
                  </button>
                  <button
                    onClick={() => { handleClearChat(); setShowFooterMenu(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors text-left"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="text-sm">Clear Chat</span>
                  </button>
                  <button
                    onClick={() => { setShowAnalytics(true); setShowFooterMenu(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors text-left"
                  >
                    <BarChart className="h-4 w-4" />
                    <span className="text-sm">Show Analytics</span>
                  </button>
                  <button
                    onClick={() => { handleDeleteChat(); setShowFooterMenu(false); }}
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
                          onClick={() => handleLoadConversation(convo)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors text-left"
                        >
                          <MessageSquare className="h-4 w-4" />
                          <span className="text-sm truncate">{convo.title}</span>
                        </button>
                      ))}
                      <button
                        onClick={() => { setShowSavedConversations(true); setShowFooterMenu(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors text-left"
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span className="text-sm">View All Saved</span>
                      </button>
                      <button
                        onClick={() => { toast.info(`Archive (${archivedConversations.length})`); setShowFooterMenu(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors text-left"
                      >
                        <Archive className="h-4 w-4" />
                        <span className="text-sm">Archive ({archivedConversations.length})</span>
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
            onClick={handleNewChat}
            className={`h-7 w-7 shrink-0 ${buttonClasses}`}
            title="New Chat"
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
          
          {/* Models Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setShowModelsPanel(!showModelsPanel); setShowPresetsPanel(false); }}
            className={`text-[10px] h-7 px-2 shrink-0 ${buttonClasses}`}
          >
            {selectedModels.length} Model{selectedModels.length !== 1 ? 's' : ''}
          </Button>
          
          {/* Synthesizer Icon */}
          {!hideSynthesizer && selectedModels.length > 0 && (
            <Button
              variant="outline"
              size="icon"
              onClick={onSynthesize}
              className={`h-7 w-7 shrink-0 ${buttonClasses}`}
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
              onClick={() => setShowSettings(!showSettings)}
              className={`h-7 w-7 shrink-0 ${buttonClasses}`}
              title="Settings"
            >
              <Settings className="h-3.5 w-3.5" />
            </Button>
            
            {showSettings && (
              <>
                <div 
                  className="fixed inset-0"
                  style={{ zIndex: Z_VALUES.DROPDOWN - 1 }}
                  onClick={() => setShowSettings(false)}
                />
                <div 
                  className={`absolute bottom-full right-0 mb-2 w-56 bg-card rounded-lg shadow-2xl border border-border overflow-hidden ${Z_CLASS.DROPDOWN}`}
                >
                  <div className="px-4 py-3 border-b border-border">
                    <h3 className="text-sm font-semibold">Settings</h3>
                  </div>
                  <button
                    onClick={() => { setShowPresetsManagement(true); setShowSettings(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors text-left"
                  >
                    <Zap className="h-4 w-4" />
                    <span className="text-sm">Presets Setting</span>
                  </button>
                  <button
                    onClick={() => { setShowCategoriesSettings(true); setShowSettings(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors text-left"
                  >
                    <FolderOpen className="h-4 w-4" />
                    <span className="text-sm">Categories Setting</span>
                  </button>
                  <button
                    onClick={() => { 
                      if (onThemesSettings) {
                        onThemesSettings();
                      } else {
                        toast.info('Chat theme settings coming soon');
                      }
                      setShowSettings(false); 
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors text-left"
                  >
                    <Palette className="h-4 w-4" />
                    <span className="text-sm">Chat Theme</span>
                  </button>
                  <button
                    onClick={() => { toast.info('Language settings coming soon'); setShowSettings(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors text-left"
                  >
                    <Globe className="h-4 w-4" />
                    <span className="text-sm">Language</span>
                  </button>
                  <button
                    onClick={() => { handleExportData(); setShowSettings(false); }}
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
            onClick={handleSaveConversation}
            disabled={messages.length === 0}
            title="Save Conversation"
            className={`h-7 w-7 shrink-0 ${buttonClasses}`}
          >
            <Save className="h-3.5 w-3.5" />
          </Button>
          
          {/* Presets Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setShowPresetsPanel(!showPresetsPanel); setShowModelsPanel(false); }}
            className={`text-[10px] h-7 px-2 shrink-0 ${buttonClasses}`}
          >
            Presets
          </Button>
        </div>
        
        {/* Message Input Row */}
        <div className="flex gap-2 items-end">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileUpload}
          />
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            title="Attach files"
            className={`shrink-0 h-10 w-10 ${buttonClasses}`}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={placeholder || defaultPlaceholder}
              disabled={selectedModels.length === 0}
              rows={1}
              className={`w-full pl-3 pr-16 py-2.5 rounded-md border text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                isModernTemplate 
                  ? 'border-cyan-700/50 bg-slate-900/80 text-cyan-100 placeholder:text-cyan-400/50 focus-visible:ring-cyan-500' 
                  : 'border-input bg-background focus-visible:ring-ring'
              }`}
              style={{ lineHeight: '1.5', height: '40px', minHeight: '40px', maxHeight: '200px', overflowY: 'hidden' }}
            />
            
            <div className="absolute right-2 bottom-1.5 flex items-center gap-1">
              {/* Voice Input */}
              {!hideVoiceInput && (
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-7 w-7 ${isListening ? 'text-red-500 animate-pulse' : 'text-muted-foreground hover:text-foreground'}`}
                  onClick={handleVoiceInput}
                  title="Voice Input"
                >
                  <Mic className="h-4 w-4" />
                </Button>
              )}
              
              {/* Connectors */}
              {!hideConnectors && (
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-7 w-7 ${showConnectorsStore ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                  onClick={() => setShowConnectorsStore(true)}
                  title="Connectors Store"
                >
                  <Plug className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          
          <Button
            onClick={handleSend}
            disabled={!inputMessage.trim() || selectedModels.length === 0 || isLoading}
            size="icon"
            className={`shrink-0 h-10 w-10 ${sendButtonClasses}`}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Modals */}
      {!hideConnectors && (
        <ConnectorsStore 
          isOpen={showConnectorsStore} 
          onClose={() => setShowConnectorsStore(false)} 
        />
      )}
      
      {showRenameDialog && (
        <RenameChatDialog
          isOpen={showRenameDialog}
          currentTitle={conversationTitle}
          onRename={(newTitle) => { onTitleChange?.(newTitle); setShowRenameDialog(false); }}
          onClose={() => setShowRenameDialog(false)}
        />
      )}
      
      {showPresetEditor && (
        <PresetEditorModal
          isOpen={showPresetEditor}
          editingPreset={editingPreset ? {
            id: editingPreset.id,
            name: editingPreset.name,
            description: editingPreset.description || '',
            models: editingPreset.models,
            type: 'custom'
          } : null}
          onSave={(preset) => handleSavePreset({
            id: preset.id || `preset-${Date.now()}`,
            name: preset.name,
            models: preset.models,
            description: preset.description,
            sourceId: editingPreset?.sourceId || preset.id || `preset-${Date.now()}`,
            sourceType: 'custom' as const,
            isModified: false
          })}
          onClose={() => { setShowPresetEditor(false); setEditingPreset(null); }}
        />
      )}
      
      {showPresetSelection && (
        <PresetSelectionDialog
          open={showPresetSelection}
          onOpenChange={setShowPresetSelection}
          customPresets={customPresets}
          quickPresets={quickPresets}
          onAdd={(presets) => {
            const newPresets: QuickPreset[] = presets.map(p => ({
              id: `quick-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              name: p.name,
              models: p.models,
              description: p.description,
              sourceId: p.sourceId,
              sourceType: p.sourceType,
              isModified: false
            }));
            const updated = [...quickPresets, ...newPresets];
            setQuickPresets(updated);
            saveQuickPresets(updated);
            setShowPresetSelection(false);
            toast.success('Preset(s) added to Quick Presets');
          }}
          onCreateNew={() => {
            setShowPresetSelection(false);
            setEditingPreset(null);
            setShowPresetEditor(true);
          }}
        />
      )}
      
      {showPresetsManagement && (
        <PresetsManagementModal
          AI_PROVIDERS={AI_PROVIDERS}
          customPresets={customPresets}
          builtInPresets={MODEL_PRESETS}
          defaultModels={selectedModels}
          onSaveCustomPresets={(presets) => {
            setCustomPresets(presets);
            localStorage.setItem('customPresets', JSON.stringify(presets));
          }}
          onSaveDefaultModels={(models) => onModelsChange(models)}
          onClose={() => setShowPresetsManagement(false)}
        />
      )}
      
      {showCategoriesSettings && (
        <CategoriesSettingsModal
          isOpen={showCategoriesSettings}
          onClose={() => setShowCategoriesSettings(false)}
        />
      )}
      
      {showSavedConversations && (
        <SavedConversationsModal
          isOpen={showSavedConversations}
          savedConversations={savedConversations.map(toFooterConversation)}
          archivedConversations={archivedConversations.map(toFooterConversation)}
          onLoadConversation={(convo) => handleLoadConversation(fromFooterConversation(convo))}
          onDeleteConversation={(id: string, isArchived: boolean) => {
            localStorage.removeItem(id);
            loadConversationsFromStorage();
            toast.success('Conversation deleted');
          }}
          onUpdateConversation={(convo: ChatFooterSavedConversation, isArchived: boolean) => {
            // Update conversation in localStorage
            localStorage.setItem(convo.id, JSON.stringify(convo));
            loadConversationsFromStorage();
          }}
          onImport={(saved: ChatFooterSavedConversation[], archived: ChatFooterSavedConversation[]) => {
            // Save imported conversations to localStorage
            saved.forEach(c => localStorage.setItem(c.id, JSON.stringify(c)));
            loadConversationsFromStorage();
            toast.success('Conversations imported');
          }}
          onClose={() => setShowSavedConversations(false)}
        />
      )}
    </div>
  );
}

export default ChatControlBox;
