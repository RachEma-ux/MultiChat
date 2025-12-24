import React from 'react';

/**
 * ChatControlBox - Reusable Chat Control Component
 * =================================================
 * 
 * A self-contained chat control component with all built-in behaviors.
 * Drop this component anywhere to get a fully functional chat control interface.
 * 
 * DESIGN: Ultra-compact dark mode with:
 * - Unified rectangular container with rounded corners and subtle gray border
 * - NO horizontal separator between rows
 * - Top row: tiny icons (menu, plus, blue pill "0 Models", AI head, gear, floppy disk, Presets)
 * - Bottom row: slim light-gray rounded input field with paperclip, placeholder, microphone
 * - Extremely tight vertical spacing
 * 
 * FRAMEWORK COMPLIANCE:
 * - Z_INDEX_FRAMEWORK: Uses Z_CLASS constants for all layering
 * - RESPONSIVENESS_FRAMEWORK: Mobile-first touch event handling
 * - TECHNICAL_FRAMEWORK: Component design patterns (Section 16)
 * 
 * @example
 * <ChatControlBox
 *   messages={messages}
 *   selectedModels={models}
 *   onSendMessage={handleSend}
 *   onModelsChange={setModels}
 * />
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Menu, Plus, Settings, Save, Paperclip, Send, Bot,
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
  // TEXTAREA AUTO-GROW
  // =========================================================================
  
  const adjustTextareaHeight = useCallback(() => {
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
  }, []);

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
  
  // Auto-grow textarea - call adjustTextareaHeight whenever inputMessage changes
  useEffect(() => {
    adjustTextareaHeight();
  }, [inputMessage, adjustTextareaHeight]);

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
  // HANDLERS
  // =========================================================================
  
  const handleSend = useCallback(() => {
    if (!inputMessage.trim() || selectedModels.length === 0 || isLoading) return;
    onSendMessage(inputMessage.trim(), attachments);
    setInputMessage('');
    setAttachments([]);
  }, [inputMessage, selectedModels, isLoading, attachments, onSendMessage]);
  
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    const newAttachments: Attachment[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      newAttachments.push({
        name: file.name,
        type: file.type,
        size: file.size,
        file
      });
    }
    setAttachments(prev => [...prev, ...newAttachments]);
    toast.success(`${newAttachments.length} file(s) attached`);
    e.target.value = '';
  }, []);
  
  const removeAttachment = useCallback((index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  }, []);
  
  const handleNewChat = useCallback(() => {
    if (onNewChat) {
      onNewChat();
    } else {
      onMessagesChange([]);
      onTitleChange?.('New Chat');
    }
    setShowFooterMenu(false);
  }, [onNewChat, onMessagesChange, onTitleChange]);
  
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
      messages: messages.map(m => ({
        ...m,
        timestamp: m.timestamp instanceof Date ? m.timestamp : new Date(m.timestamp)
      })),
      models: selectedModels
    };
    
    try {
      localStorage.setItem(convoId, JSON.stringify(convoData));
      loadConversationsFromStorage();
      toast.success('Conversation saved');
    } catch (error) {
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
  
  const handleExportData = useCallback(() => {
    if (messages.length === 0) {
      toast.error('No messages to export');
      return;
    }
    
    const exportData = {
      title: conversationTitle,
      messages,
      selectedModels,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Data exported');
  }, [messages, conversationTitle, selectedModels]);
  
  const handleToggleModel = useCallback((providerKey: string, model: string) => {
    const modelKey = `${providerKey}:${model}`;
    const newModels = selectedModels.includes(modelKey)
      ? selectedModels.filter(m => m !== modelKey)
      : [...selectedModels, modelKey];
    onModelsChange(newModels);
  }, [selectedModels, onModelsChange]);
  
  const handleApplyPreset = useCallback((models: string[]) => {
    onModelsChange(models);
    setShowPresetsPanel(false);
    toast.success('Preset applied');
  }, [onModelsChange]);
  
  const handleEditQuickPreset = useCallback((presetId: string) => {
    const preset = quickPresets.find(p => p.id === presetId);
    if (preset) {
      setEditingPreset(preset);
      setShowPresetEditor(true);
    }
  }, [quickPresets]);
  
  const handleDeleteQuickPreset = useCallback((presetId: string) => {
    const updated = quickPresets.filter(p => p.id !== presetId);
    setQuickPresets(updated);
    saveQuickPresets(updated);
    toast.success('Preset removed from Quick Presets');
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
  
  const handleVoiceInput = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Speech recognition not supported in this browser');
      return;
    }
    
    if (isListening) {
      setIsListening(false);
      return;
    }
    
    // Request microphone permission first
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        
        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = (e: any) => {
          setIsListening(false);
          toast.error(`Speech recognition error: ${e.error}`);
        };
        recognition.onresult = (e: any) => {
          const transcript = e.results[0][0].transcript;
          setInputMessage(prev => prev + (prev ? ' ' : '') + transcript);
        };
        
        recognition.start();
      })
      .catch(() => {
        toast.error('Microphone access denied');
      });
  }, [isListening]);

  // =========================================================================
  // RENDER
  // =========================================================================
  
  const defaultPlaceholder = selectedModels.length === 0 
    ? 'Select at least one AI model to send a message' 
    : 'Type your message...';

  return (
    <div className="bg-zinc-800 rounded-2xl border border-zinc-700/50 mx-2 mb-2">
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
      
      {/* Main Content - No separator between rows */}
      <div className="p-3 space-y-2">
        {/* Attachments Preview */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {attachments.map((att, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-zinc-700 rounded px-2 py-1 text-xs text-zinc-300">
                {att.type.startsWith('image/') ? <ImageIcon className="h-3 w-3" /> : <Paperclip className="h-3 w-3" />}
                <span className="truncate max-w-[100px]">{att.name}</span>
                <button
                  className="h-4 w-4 p-0 hover:text-white"
                  onClick={() => removeAttachment(idx)}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        
        {/* Control Buttons Row - Tiny minimalist icons */}
        <div className="flex items-center gap-1.5 justify-center">
          {/* Hamburger Menu */}
          <div className="relative">
            <button
              onClick={() => setShowFooterMenu(!showFooterMenu)}
              className="h-8 w-8 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
              title="Menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            
            {showFooterMenu && (
              <>
                <div 
                  className="fixed inset-0"
                  style={{ zIndex: Z_VALUES.DROPDOWN - 1 }}
                  onClick={() => setShowFooterMenu(false)}
                />
                <div 
                  className={`absolute bottom-full left-0 mb-2 w-72 bg-zinc-800 rounded-lg shadow-2xl border border-zinc-700 overflow-hidden ${Z_CLASS.DROPDOWN}`}
                >
                  <button
                    onClick={handleNewChat}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-700 transition-colors text-left text-zinc-300"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="text-sm">New Chat</span>
                  </button>
                  <button
                    onClick={() => { setShowRenameDialog(true); setShowFooterMenu(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-700 transition-colors text-left text-zinc-300"
                  >
                    <Edit className="h-4 w-4" />
                    <span className="text-sm">Rename Chat</span>
                  </button>
                  <button
                    onClick={() => { handleSaveConversation(); setShowFooterMenu(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-700 transition-colors text-left text-zinc-300"
                  >
                    <Save className="h-4 w-4" />
                    <span className="text-sm">Save Chat</span>
                  </button>
                  <button
                    onClick={() => { handleClearChat(); setShowFooterMenu(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-700 transition-colors text-left text-zinc-300"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="text-sm">Clear Chat</span>
                  </button>
                  <button
                    onClick={() => { setShowAnalytics(true); setShowFooterMenu(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-700 transition-colors text-left text-zinc-300"
                  >
                    <BarChart className="h-4 w-4" />
                    <span className="text-sm">Show Analytics</span>
                  </button>
                  <button
                    onClick={() => { handleDeleteChat(); setShowFooterMenu(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-700 transition-colors text-left text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="text-sm">Delete Chat</span>
                  </button>
                  
                  {/* Recent Conversations */}
                  {savedConversations.length > 0 && (
                    <div className="border-t border-zinc-700">
                      <div className="px-4 py-2 text-xs font-semibold text-zinc-500">RECENT CONVERSATIONS</div>
                      {savedConversations.slice(0, 3).map((convo) => (
                        <button
                          key={convo.id}
                          onClick={() => handleLoadConversation(convo)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-700 transition-colors text-left text-zinc-300"
                        >
                          <MessageSquare className="h-4 w-4" />
                          <span className="text-sm truncate">{convo.title}</span>
                        </button>
                      ))}
                      <button
                        onClick={() => { setShowSavedConversations(true); setShowFooterMenu(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-700 transition-colors text-left text-zinc-300"
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span className="text-sm">View All Saved</span>
                      </button>
                      <button
                        onClick={() => { toast.info(`Archive (${archivedConversations.length})`); setShowFooterMenu(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-700 transition-colors text-left text-zinc-300"
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
          <button
            onClick={handleNewChat}
            className="h-8 w-8 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
            title="New Chat"
          >
            <Plus className="h-5 w-5" />
          </button>
          
          {/* Models Button - Blue Pill with solid fill */}
          <button
            onClick={() => { setShowModelsPanel(!showModelsPanel); setShowPresetsPanel(false); }}
            className="h-8 px-4 bg-blue-500 hover:bg-blue-400 text-white text-sm font-medium rounded-full transition-colors"
          >
            {selectedModels.length} Model{selectedModels.length !== 1 ? 's' : ''}
          </button>
          
          {/* AI Head Icon (Synthesizer) - Sci-fi humanoid with glowing blue eyes */}
          {!hideSynthesizer && (
            <button
              onClick={onSynthesize}
              className={`h-8 w-8 flex items-center justify-center transition-colors ${
                selectedModels.length > 0 
                  ? 'text-blue-400 hover:text-blue-300' 
                  : 'text-zinc-500'
              }`}
              title="Generate Synthesis"
              disabled={selectedModels.length === 0}
            >
              <Bot className="h-5 w-5" />
            </button>
          )}
          
          {/* Settings Icon (Gear) */}
          <div className="relative">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="h-8 w-8 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
              title="Settings"
            >
              <Settings className="h-5 w-5" />
            </button>
            
            {showSettings && (
              <>
                <div 
                  className="fixed inset-0"
                  style={{ zIndex: Z_VALUES.DROPDOWN - 1 }}
                  onClick={() => setShowSettings(false)}
                />
                <div 
                  className={`absolute bottom-full right-0 mb-2 w-56 bg-zinc-800 rounded-lg shadow-2xl border border-zinc-700 overflow-hidden ${Z_CLASS.DROPDOWN}`}
                >
                  <div className="px-4 py-3 border-b border-zinc-700">
                    <h3 className="text-sm font-semibold text-zinc-200">Settings</h3>
                  </div>
                  <button
                    onClick={() => { setShowPresetsManagement(true); setShowSettings(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-700 transition-colors text-left text-zinc-300"
                  >
                    <Zap className="h-4 w-4" />
                    <span className="text-sm">Presets Setting</span>
                  </button>
                  <button
                    onClick={() => { setShowCategoriesSettings(true); setShowSettings(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-700 transition-colors text-left text-zinc-300"
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
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-700 transition-colors text-left text-zinc-300"
                  >
                    <Palette className="h-4 w-4" />
                    <span className="text-sm">Chat Theme</span>
                  </button>
                  <button
                    onClick={() => { toast.info('Language settings coming soon'); setShowSettings(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-700 transition-colors text-left text-zinc-300"
                  >
                    <Globe className="h-4 w-4" />
                    <span className="text-sm">Language</span>
                  </button>
                  <button
                    onClick={() => { handleExportData(); setShowSettings(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-700 transition-colors text-left text-zinc-300"
                  >
                    <Download className="h-4 w-4" />
                    <span className="text-sm">Export Data</span>
                  </button>
                </div>
              </>
            )}
          </div>
          
          {/* Save Icon (Floppy Disk) */}
          <button
            onClick={handleSaveConversation}
            disabled={messages.length === 0}
            className={`h-8 w-8 flex items-center justify-center transition-colors ${
              messages.length === 0 
                ? 'text-zinc-600 cursor-not-allowed' 
                : 'text-zinc-400 hover:text-white'
            }`}
            title="Save Conversation"
          >
            <Save className="h-5 w-5" />
          </button>
          
          {/* Presets Button - Light background pill */}
          <button
            onClick={() => { setShowPresetsPanel(!showPresetsPanel); setShowModelsPanel(false); }}
            className="h-8 px-4 bg-zinc-600 hover:bg-zinc-500 text-zinc-200 text-sm font-medium rounded-full transition-colors"
          >
            Presets
          </button>
        </div>
        
        {/* Message Input Row - Slim light-gray rounded input field */}
        <div className="flex items-center gap-2">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileUpload}
          />
          
          {/* Paperclip Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-600 transition-colors"
            title="Attach files"
          >
            <Paperclip className="h-4 w-4" />
          </button>
          
          {/* Input Container */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={placeholder || defaultPlaceholder}
              disabled={selectedModels.length === 0}
              rows={1}
              className="w-full pl-3 pr-16 py-2.5 rounded-md bg-zinc-200 text-zinc-800 placeholder:text-zinc-500 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
              style={{ lineHeight: '1.5', height: '40px', minHeight: '40px', maxHeight: '200px', overflowY: 'hidden' }}
            />
            <div className="absolute right-2 bottom-2 flex items-center gap-1">
              {/* Microphone Icon */}
              {!hideVoiceInput && (
                <button
                  onClick={handleVoiceInput}
                  className={`h-7 w-7 flex items-center justify-center rounded-full transition-colors ${
                    isListening 
                      ? 'text-red-500 animate-pulse' 
                      : 'text-zinc-500 hover:text-zinc-700'
                  }`}
                  title="Voice Input"
                >
                  <Mic className="h-4 w-4" />
                </button>
              )}
              
              {/* Connectors Icon */}
              {!hideConnectors && (
                <button
                  onClick={() => setShowConnectorsStore(true)}
                  className={`h-7 w-7 flex items-center justify-center rounded-full transition-colors ${
                    showConnectorsStore ? 'text-blue-500' : 'text-zinc-500 hover:text-zinc-700'
                  }`}
                  title="Connectors Store"
                >
                  <Plug className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          
          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={!inputMessage.trim() || selectedModels.length === 0 || isLoading}
            className="shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-blue-500 text-white hover:bg-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Send message"
          >
            <Send className="h-4 w-4" />
          </button>
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
