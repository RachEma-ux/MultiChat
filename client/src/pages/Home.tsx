import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Z_CLASS } from '@/lib/z-index';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLocation } from 'wouter';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CollapsibleMenuGroup } from '@/components/CollapsibleMenuGroup';
import { PresetsManagementModal } from '@/components/PresetsManagementModal';
import { ThemesSettingsModal } from '@/components/ThemesSettingsModal';
import {
  Send, Plus, X, Menu, Save, Download, Star, ThumbsUp, ThumbsDown,
  MessageSquare, Grid, List, BarChart, Zap, GitCompare, Eye, EyeOff, Trash2, Paperclip, Image as ImageIcon, Sparkles, ChevronRight, Settings, Archive, Edit, Palette, Sun, Moon
} from 'lucide-react';
import { toast } from 'sonner';
import { AI_PROVIDERS, MODEL_PRESETS } from '@/lib/ai-providers';

interface Attachment {
  name: string;
  type: string;
  size: number;
  url: string;
}

interface CustomPreset {
  id: string;
  name: string;
  description: string;
  models: string[];
  type: 'custom';
  color?: string;
  icon?: string;
}

interface Message {
  id: number;
  type: 'user' | 'ai' | 'synthesis';
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

interface SavedConversation {
  id: string;
  messages: Message[];
  selectedModels: string[];
  timestamp: string;
  title: string;
}

export default function Home() {
  // The userAuth hooks provides authentication state
  // To implement login/logout functionality, simply call logout() or redirect to getLoginUrl()
  let { user, loading, error, isAuthenticated, logout } = useAuth();

  // Theme context
  const { theme, toggleTheme } = useTheme();

  const [, setLocation] = useLocation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [viewMode, setViewMode] = useState<'chat' | 'comparison'>('chat');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [collapsedResponses, setCollapsedResponses] = useState(new Set<number>());
  const [currentConversationTitle, setCurrentConversationTitle] = useState('New Chat');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitleValue, setEditTitleValue] = useState('');
  const [showPresets, setShowPresets] = useState(false);
  const [savedConversations, setSavedConversations] = useState<SavedConversation[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [expandedProviders, setExpandedProviders] = useState<Set<string>>(new Set());
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [archivedConversations, setArchivedConversations] = useState<SavedConversation[]>([]);
  const [currentMode, setCurrentMode] = useState<'Agents' | 'Chat' | 'Conversation' | 'Empty'>('Chat');
  const [showModeMenu, setShowModeMenu] = useState(false);
  const [showHeaderMenu, setShowHeaderMenu] = useState(false);
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [expandedMenuGroups, setExpandedMenuGroups] = useState<Set<string>>(new Set());
  const [showFooterMenu, setShowFooterMenu] = useState(false);
  const [customPresets, setCustomPresets] = useState<CustomPreset[]>([]);
  const [showPresetEditor, setShowPresetEditor] = useState(false);
  const [editingPreset, setEditingPreset] = useState<CustomPreset | null>(null);
  const [presetEditorName, setPresetEditorName] = useState('');
  const [presetEditorDescription, setPresetEditorDescription] = useState('');
  const [presetEditorModels, setPresetEditorModels] = useState<string[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [showPresetsManagement, setShowPresetsManagement] = useState(false);
  const [showThemesSettings, setShowThemesSettings] = useState(false);
  const [defaultModels, setDefaultModels] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadConversations();
    loadCustomPresets();
  }, []);

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  // Auto-generate title based on first user message
  useEffect(() => {
    if (messages.length > 0 && currentConversationTitle === 'New Chat') {
      const firstUserMessage = messages.find(m => m.type === 'user');
      if (firstUserMessage) {
        // Generate title from first message (max 50 chars)
        const title = firstUserMessage.content.slice(0, 50).trim() + 
                     (firstUserMessage.content.length > 50 ? '...' : '');
        setCurrentConversationTitle(title);
      }
    }
  }, [messages, currentConversationTitle]);

  const loadCustomPresets = () => {
    try {
      const stored = localStorage.getItem('customPresets');
      if (stored) {
        const parsed = JSON.parse(stored);
        setCustomPresets(parsed);
      }
    } catch (error) {
      console.error('Error loading custom presets:', error);
    }
  };

  const saveCustomPresets = (presets: CustomPreset[]) => {
    try {
      localStorage.setItem('customPresets', JSON.stringify(presets));
      setCustomPresets(presets);
    } catch (error) {
      console.error('Error saving custom presets:', error);
    }
  };

  const openPresetEditor = (preset?: CustomPreset) => {
    if (preset) {
      setEditingPreset(preset);
      setPresetEditorName(preset.name);
      setPresetEditorDescription(preset.description);
      setPresetEditorModels(preset.models);
    } else {
      setEditingPreset(null);
      setPresetEditorName('');
      setPresetEditorDescription('');
      setPresetEditorModels([]);
    }
    setShowPresetEditor(true);
  };

  const savePreset = () => {
    if (!presetEditorName.trim()) {
      toast.error('Please enter a preset name');
      return;
    }
    if (presetEditorModels.length === 0) {
      toast.error('Please select at least one model');
      return;
    }

    let updatedPresets;
    
    if (editingPreset) {
      // Check if this is an existing custom preset or a built-in preset being edited
      const existingCustomPreset = customPresets.find(p => p.id === editingPreset.id);
      
      if (existingCustomPreset) {
        // Update existing custom preset
        const newPreset: CustomPreset = {
          id: editingPreset.id,
          name: presetEditorName,
          description: presetEditorDescription,
          models: [...presetEditorModels],
          type: 'custom'
        };
        updatedPresets = customPresets.map(p => p.id === editingPreset.id ? newPreset : p);
        toast.success('Preset updated successfully');
      } else {
        // Editing a built-in preset or creating a custom version with same name
        // Check if a custom preset with this name already exists
        const existingByName = customPresets.find(p => p.name === presetEditorName);
        
        if (existingByName) {
          // Update the existing custom preset with the same name
          const newPreset: CustomPreset = {
            id: existingByName.id,
            name: presetEditorName,
            description: presetEditorDescription,
            models: [...presetEditorModels],
            type: 'custom'
          };
          updatedPresets = customPresets.map(p => p.id === existingByName.id ? newPreset : p);
          toast.success('Preset updated successfully');
        } else {
          // Create new custom preset (overriding built-in)
          const newPreset: CustomPreset = {
            id: `custom-${Date.now()}`,
            name: presetEditorName,
            description: presetEditorDescription,
            models: [...presetEditorModels],
            type: 'custom'
          };
          updatedPresets = [...customPresets, newPreset];
          toast.success('Custom preset created');
        }
      }
    } else {
      // Creating a brand new preset
      const newPreset: CustomPreset = {
        id: `custom-${Date.now()}`,
        name: presetEditorName,
        description: presetEditorDescription,
        models: [...presetEditorModels],
        type: 'custom'
      };
      updatedPresets = [...customPresets, newPreset];
      toast.success('Preset created successfully');
    }

    console.log('Saving presets to localStorage:', updatedPresets);
    saveCustomPresets(updatedPresets);
    setShowPresetEditor(false);
    // Reset editor state
    setEditingPreset(null);
    setPresetEditorName('');
    setPresetEditorDescription('');
    setPresetEditorModels([]);
  };

  const deletePreset = (presetId: string) => {
    const updatedPresets = customPresets.filter(p => p.id !== presetId);
    saveCustomPresets(updatedPresets);
    toast.success('Preset deleted successfully');
  };

  const getAllPresets = (): CustomPreset[] => {
    // Convert built-in presets to CustomPreset format
    const builtInPresets: CustomPreset[] = Object.entries(MODEL_PRESETS).map(([key, preset]) => ({
      id: `built-in-${key}`,
      name: preset.name,
      description: '',
      models: preset.models,
      type: 'custom' as const // Mark as custom since interface only allows 'custom'
    }));
    
    // Get names of custom presets
    const customPresetNames = new Set(customPresets.map(p => p.name));
    
    // Filter out built-in presets that have been customized
    const filteredBuiltIns = builtInPresets.filter(p => !customPresetNames.has(p.name));
    
    // Return custom presets first (they override built-ins), then remaining built-ins
    return [...customPresets, ...filteredBuiltIns];
  };

  const loadConversations = () => {
    try {
      const saved: SavedConversation[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('conversation:')) {
          const data = localStorage.getItem(key);
          if (data) {
            const parsed = JSON.parse(data);
            // Convert timestamp strings back to Date objects
            parsed.messages = parsed.messages.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            }));
            saved.push(parsed);
          }
        }
      }
      // Sort by timestamp, newest first
      saved.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setSavedConversations(saved);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const toggleModel = (providerKey: string, model: string) => {
    const modelKey = `${providerKey}:${model}`;
    setSelectedModels(prev => 
      prev.includes(modelKey) 
        ? prev.filter(m => m !== modelKey)
        : [...prev, modelKey]
    );
  };

  const addModelFromDropdown = () => {
    if (selectedProvider && selectedModel) {
      const modelKey = `${selectedProvider}:${selectedModel}`;
      if (!selectedModels.includes(modelKey)) {
        setSelectedModels(prev => [...prev, modelKey]);
        toast.success(`Added ${selectedModel}`);
      } else {
        toast.info('Model already added');
      }
      // Reset selections
      setSelectedProvider('');
      setSelectedModel('');
    }
  };

  const toggleMenuGroup = (group: string) => {
    const newExpanded = new Set(expandedMenuGroups);
    if (newExpanded.has(group)) {
      newExpanded.delete(group);
    } else {
      newExpanded.add(group);
    }
    setExpandedMenuGroups(newExpanded);
  };

  const toggleProvider = (provider: string) => {
    setExpandedProviders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(provider)) {
        newSet.delete(provider);
      } else {
        newSet.add(provider);
      }
      return newSet;
    });
  };

  const getProviderSelectionCount = (provider: string) => {
    const providerModels = AI_PROVIDERS[provider as keyof typeof AI_PROVIDERS].models;
    const selectedCount = selectedModels.filter(m => m.startsWith(`${provider}:`)).length;
    return `${selectedCount}/${providerModels.length}`;
  };

  useEffect(() => {
    const olderConvos = getOlderConversations();
    olderConvos.forEach(convo => {
      if (!archivedConversations.some(a => a.id === convo.id)) {
        setArchivedConversations(prev => [...prev, convo]);
      }
    });
  }, [savedConversations]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height to recalculate
      textarea.style.height = '40px';
      // Calculate new height based on content
      const scrollHeight = textarea.scrollHeight;
      const maxHeight = 200; // max height in pixels
      const newHeight = Math.min(scrollHeight, maxHeight);
      textarea.style.height = `${newHeight}px`;
      // Enable scrolling if content exceeds max height
      textarea.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden';
    }
  }, [inputMessage]);

  const applyPreset = (preset: CustomPreset) => {
    setSelectedModels(preset.models);
    setShowPresets(false);
    setShowModelSelector(false);
    toast.success(`Applied preset: ${preset.name}`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newAttachments: Attachment[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // Create a local URL for the file
      const url = URL.createObjectURL(file);
      newAttachments.push({
        name: file.name,
        type: file.type,
        size: file.size,
        url
      });
    }
    setAttachments(prev => [...prev, ...newAttachments]);
    toast.success(`${newAttachments.length} file(s) attached`);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => {
      const newAttachments = [...prev];
      // Revoke the URL to free memory
      URL.revokeObjectURL(newAttachments[index].url);
      newAttachments.splice(index, 1);
      return newAttachments;
    });
  };

  const handleTitleClick = () => {
    setIsEditingTitle(true);
    setEditTitleValue(currentConversationTitle);
  };

  const handleTitleSave = () => {
    if (editTitleValue.trim()) {
      setCurrentConversationTitle(editTitleValue.trim());
      toast.success('Chat renamed');
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      setIsEditingTitle(false);
    }
  };

  const simulateAIResponse = async (provider: string, model: string, userMessage: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    const responses: Record<string, string[]> = {
      anthropic: [
        "I'd be happy to help with that. Based on your question, here's what I think...",
        "That's an interesting point. Let me break this down for you...",
        "I understand your concern. Here's my perspective on this..."
      ],
      openai: [
        "Great question! Here's how I would approach this...",
        "I can help you with that. Let me explain...",
        "That's a fascinating topic. Here's what you should know..."
      ],
      google: [
        "I've analyzed your query. Here's what I found...",
        "Based on my understanding, here's what I can share...",
        "That's an excellent question. Let me provide some insights..."
      ],
      deepseek: [
        "Let me dive deep into this topic for you...",
        "I've processed your request. Here's my analysis...",
        "That's a complex question. Here's what I've discovered..."
      ],
      manus: [
        "I'm here to assist you. Here's what I think about this...",
        "Let me help you understand this better...",
        "That's an interesting inquiry. Here's my take..."
      ],
      kimi: [
        "I understand what you're asking. Here's my response...",
        "Let me share my thoughts on this with you...",
        "That's a good question! Here's what I can tell you..."
      ],
      perplexity: [
        "I've searched through relevant information. Here's what I found...",
        "Based on available knowledge, here's the answer...",
        "Let me provide you with a comprehensive response..."
      ]
    };
    
    const providerResponses = responses[provider] || responses.anthropic;
    const baseResponse = providerResponses[Math.floor(Math.random() * providerResponses.length)];
    
    return {
      content: `${baseResponse} (Response from ${model})`,
      confidence: 0.7 + Math.random() * 0.3,
      responseTime: Math.random() * 3 + 1
    };
  };

  const handleSend = async () => {
    if (!inputMessage.trim() || selectedModels.length === 0) return;

    const userMsg: Message = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
      attachments: attachments.length > 0 ? [...attachments] : undefined
    };

    setMessages(prev => [...prev, userMsg]);
    const currentInput = inputMessage;
    setInputMessage('');
    setAttachments([]);
    setIsLoading(true);

    const aiResponses: Message[] = [];
    for (const modelKey of selectedModels) {
      const [provider, model] = modelKey.split(':');
      
      try {
        const response = await simulateAIResponse(provider, model, currentInput);
        
        const aiMsg: Message = {
          id: Date.now() + Math.random(),
          type: 'ai',
          provider,
          model,
          content: response.content,
          timestamp: new Date(),
          rating: null,
          confidence: response.confidence,
          responseTime: response.responseTime,
          visible: true
        };
        
        aiResponses.push(aiMsg);
      } catch (error) {
        console.error('Error getting AI response:', error);
      }
    }

    setMessages(prev => [...prev, ...aiResponses]);
    setIsLoading(false);
  };

  const rateResponse = (messageId: number, rating: number) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, rating } : msg
    ));
  };

  const toggleCollapse = (messageId: number) => {
    setCollapsedResponses(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  const generateSynthesis = () => {
    const lastUserMessage = [...messages].reverse().find(m => m.type === 'user');
    if (!lastUserMessage) {
      toast.error('No messages to synthesize');
      return;
    }

    const aiResponses = messages.filter(m => 
      m.type === 'ai' && m.timestamp > lastUserMessage.timestamp
    );

    if (aiResponses.length === 0) {
      toast.error('No AI responses to synthesize');
      return;
    }

    const synthesis: Message = {
      id: Date.now(),
      type: 'synthesis',
      content: `Synthesized Response (combining insights from ${aiResponses.length} models): Based on the collective analysis, here are the key points from all models.`,
      timestamp: new Date(),
      sources: aiResponses.length
    };

    setMessages(prev => [...prev, synthesis]);
    toast.success('Synthesis generated!');
  };

  const getProviderColor = (provider?: string) => {
    if (!provider) return 'bg-gray-500';
    return AI_PROVIDERS[provider as keyof typeof AI_PROVIDERS]?.color || 'bg-gray-500';
  };

  const saveConversation = () => {
    if (messages.length === 0) {
      toast.error('No messages to save. Start a conversation first!');
      return;
    }

    const convoId = `conversation:${Date.now()}`;
    const convoData: SavedConversation = {
      id: convoId,
      messages: messages.map(msg => ({
        ...msg,
        timestamp: msg.timestamp.toISOString() as any // Store as ISO string
      })) as any,
      selectedModels,
      timestamp: new Date().toISOString(),
      title: currentConversationTitle || `Chat ${new Date().toLocaleString()}`
    };
    
    try {
      localStorage.setItem(convoId, JSON.stringify(convoData));
      loadConversations(); // Reload the list
      toast.success('✅ Conversation saved successfully!');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('❌ Failed to save conversation');
    }
  };

  const loadConversation = (convo: SavedConversation) => {
    setMessages(convo.messages);
    setSelectedModels(convo.selectedModels);
    setCurrentConversationTitle(convo.title);
    setShowMenu(false);
    toast.success('Conversation loaded');
  };

  const deleteConversation = (convoId: string) => {
    try {
      localStorage.removeItem(convoId);
      loadConversations();
      toast.success('Conversation deleted');
    } catch (error) {
      toast.error('Failed to delete conversation');
    }
  };

  const archiveConversation = (convo: SavedConversation) => {
    setArchivedConversations(prev => [...prev, convo]);
    deleteConversation(convo.id);
    toast.success('Conversation archived');
  };

  const getRecentConversations = () => {
    return savedConversations.slice(0, 3);
  };

  const getOlderConversations = () => {
    return savedConversations.slice(3);
  };

  const exportConversation = () => {
    if (messages.length === 0) {
      toast.error('No messages to export. Start a conversation first!');
      return;
    }

    const exportData = {
      title: currentConversationTitle || 'Chat Export',
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
      a.download = `multi-ai-chat-${Date.now()}.json`;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      
      toast.success('✅ Conversation exported!');
    } catch (error) {
      toast.error('❌ Export failed');
    }
  };

  const getAnalytics = () => {
    const aiMessages = messages.filter(m => m.type === 'ai');
    const avgConfidence = aiMessages.reduce((sum, m) => sum + (m.confidence || 0), 0) / (aiMessages.length || 1);
    const avgResponseTime = aiMessages.reduce((sum, m) => sum + (m.responseTime || 0), 0) / (aiMessages.length || 1);
    const ratedMessages = aiMessages.filter(m => m.rating !== null);
    const avgRating = ratedMessages.reduce((sum, m) => sum + (m.rating === 1 ? 5 : 1), 0) / (ratedMessages.length || 1);

    return { avgConfidence, avgResponseTime, avgRating, totalMessages: messages.length };
  };

  const analytics = getAnalytics();

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="flex h-screen bg-background text-foreground relative">
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-3 md:p-4 border-b border-border">
          <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
            <Button 
              variant="ghost"
              size="icon"
              onClick={() => setShowMenu(!showMenu)}
              className="shrink-0"
            >
              <Menu className="h-5 w-5" />
            </Button>
            {isEditingTitle ? (
              <Input
                ref={titleInputRef}
                value={editTitleValue}
                onChange={(e) => setEditTitleValue(e.target.value)}
                onBlur={handleTitleSave}
                onKeyDown={handleTitleKeyDown}
                className="text-base md:text-xl font-semibold h-8 px-2"
              />
            ) : (
              <h1 
                className="text-base md:text-xl font-semibold truncate cursor-pointer hover:text-primary transition-colors"
                onClick={handleTitleClick}
                title="Click to rename"
              >
                {currentConversationTitle}
              </h1>
            )}
          </div>
          <div className="flex items-center gap-1 md:gap-2 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowAnalytics(!showAnalytics)}
              title="Toggle Analytics"
              className="hidden md:inline-flex"
            >
              <BarChart className="h-5 w-5" />
            </Button>
            {/* Theme Toggle Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              className="shrink-0"
            >
              {theme === 'light' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            {/* Mode Button with Dropdown */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowModeMenu(!showModeMenu)}
                title="Mode"
                className="text-xs"
              >
                Mode
              </Button>
              {showModeMenu && (
                <>
                  <div 
                    className={`fixed inset-0 ${Z_CLASS.FLOATING}`}
                    onClick={() => setShowModeMenu(false)}
                  />
                  <div className={`absolute top-full right-0 mt-2 w-48 bg-card rounded-lg shadow-2xl ${Z_CLASS.DROPDOWN} border border-border overflow-hidden`}>
                    {['Agents', 'Chat', 'Conversation', 'Empty'].map((mode) => (
                      <button
                        key={mode}
                        onClick={() => {
                          setCurrentMode(mode as any);
                          setShowModeMenu(false);
                          if (mode === 'Chat') {
                            setLocation('/chat');
                          } else if (mode === 'Conversation') {
                            setLocation('/conversation');
                          } else if (mode === 'Empty') {
                            setLocation('/empty');
                          }
                          toast.info(`Switched to ${mode} mode`);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-accent transition-colors ${
                          currentMode === mode ? 'bg-accent' : ''
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={exportConversation}
              disabled={messages.length === 0}
              title="Export to JSON"
              className="hidden sm:inline-flex"
            >
              <Download className="h-5 w-5" />
            </Button>

          </div>
        </div>

        {/* Header Hamburger Menu with Menu Groups */}
        {showMenu && (
          <>
            <div 
              className={`fixed inset-0 ${Z_CLASS.SIDEBAR_BACKDROP}`}
              onClick={() => setShowMenu(false)}
            />
            <div className={`absolute top-14 md:top-16 left-2 md:left-4 w-72 max-w-[calc(100vw-2rem)] bg-card rounded-lg shadow-2xl ${Z_CLASS.SIDEBAR_MENU} border border-border max-h-[80vh] overflow-y-auto`}>
              <CollapsibleMenuGroup 
                title="USER ACCOUNT" 
                items={['Item1', 'Item2', 'Item3']} 
                isExpanded={expandedMenuGroups.has('user')}
                onToggle={() => toggleMenuGroup('user')}
              />
              <CollapsibleMenuGroup 
                title="AGENTS" 
                items={['Item1', 'Item2', 'Item3']} 
                isExpanded={expandedMenuGroups.has('agents')}
                onToggle={() => toggleMenuGroup('agents')}
              />
              <CollapsibleMenuGroup 
                title="SKILLS" 
                items={['Item1', 'Item2', 'Item3']} 
                isExpanded={expandedMenuGroups.has('skills')}
                onToggle={() => toggleMenuGroup('skills')}
              />
              <CollapsibleMenuGroup 
                title="HOSTING" 
                items={['Item1', 'Item2', 'Item3']} 
                isExpanded={expandedMenuGroups.has('hosting')}
                onToggle={() => toggleMenuGroup('hosting')}
              />
              <CollapsibleMenuGroup 
                title="IDE" 
                items={['AnythingLLM', 'Item2', 'Item3']} 
                isExpanded={expandedMenuGroups.has('ide')}
                onToggle={() => toggleMenuGroup('ide')}
              />
              <CollapsibleMenuGroup 
                title="RUNNERS" 
                items={['Ollama', 'vLLM', 'LM Studio']} 
                isExpanded={expandedMenuGroups.has('runners')}
                onToggle={() => toggleMenuGroup('runners')}
              />
              <CollapsibleMenuGroup 
                title="HUBS" 
                items={['Hugging Face', 'Item2', 'Item3']} 
                isExpanded={expandedMenuGroups.has('hubs')}
                onToggle={() => toggleMenuGroup('hubs')}
              />
              <CollapsibleMenuGroup
                title="SETTINGS"
                items={['API Server', 'Item2', 'Item3']}
                isExpanded={expandedMenuGroups.has('settings')}
                onToggle={() => toggleMenuGroup('settings')}
              />
              <CollapsibleMenuGroup
                title="THEME"
                items={['Light Mode', 'Dark Mode', 'Auto']}
                isExpanded={expandedMenuGroups.has('theme')}
                onToggle={() => toggleMenuGroup('theme')}
              />
              <CollapsibleMenuGroup
                title="WINDOWS"
                items={['Window 1', 'Window 2', 'Layout Presets']}
                isExpanded={expandedMenuGroups.has('windows')}
                onToggle={() => toggleMenuGroup('windows')}
              />
              <CollapsibleMenuGroup
                title="DATABASE"
                items={['Item1', 'Item2', 'Item3']}
                isExpanded={expandedMenuGroups.has('database')}
                onToggle={() => toggleMenuGroup('database')}
              />
              <CollapsibleMenuGroup
                title="SEARCH"
                items={['SearchXNG', 'Item2', 'Item3']}
                isExpanded={expandedMenuGroups.has('search')}
                onToggle={() => toggleMenuGroup('search')}
              />
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to quit? All data will be cleared.')) {
                    // Clear all data and navigate to blank page
                    localStorage.clear();
                    window.location.href = 'about:blank';
                  }
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors text-left border-t border-border"
              >
                <X className="h-4 w-4" />
                <span className="text-sm font-medium">Quit</span>
              </button>
            </div>
          </>
        )}

        {/* Analytics Bar */}
        {showAnalytics && (
          <div className="p-2 md:p-3 bg-muted border-b border-border flex flex-wrap gap-3 md:gap-6 text-xs md:text-sm">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-3 w-3 md:h-4 md:w-4 text-blue-400" />
              <span>{analytics.totalMessages} msgs</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-3 w-3 md:h-4 md:w-4 text-yellow-400" />
              <span>{analytics.avgRating.toFixed(1)}/5</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-3 w-3 md:h-4 md:w-4 text-green-400" />
              <span>{analytics.avgResponseTime.toFixed(1)}s</span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart className="h-3 w-3 md:h-4 md:w-4 text-purple-400" />
              <span>{(analytics.avgConfidence * 100).toFixed(0)}%</span>
            </div>
          </div>
        )}



        {/* Model Selector Panel */}
        {showModelSelector && (
          <div className="p-3 md:p-4 border-b border-border bg-muted/50">
            {/* Presets - Only show Quick Presets */}
            {showPresets && (
              <div className="mb-3 p-3 bg-background rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium">Quick Presets</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openPresetEditor()}
                    className="text-xs h-7"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    New
                  </Button>
                </div>
                <div className="space-y-2">
                  {getAllPresets().map((preset) => (
                    <div key={preset.id} className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => applyPreset(preset)}
                        className="flex-1 justify-start text-xs"
                      >
                        {preset.name}
                        {preset.type === 'custom' && (
                          <span className="ml-auto text-[10px] text-muted-foreground">Custom</span>
                        )}
                      </Button>
                      {preset.type === 'custom' && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openPresetEditor(preset)}
                            className="h-8 w-8 shrink-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deletePreset(preset.id)}
                            className="h-8 w-8 shrink-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Selected Models */}
            {selectedModels.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedModels.map(modelKey => {
                  const [provider, model] = modelKey.split(':');
                  return (
                    <div
                      key={modelKey}
                      className="flex items-center gap-2 px-2 md:px-3 py-1 md:py-1.5 bg-background rounded-full text-xs md:text-sm"
                    >
                      <div className={`w-2 h-2 rounded-full ${getProviderColor(provider)}`} />
                      <span className="truncate max-w-[120px]">{model}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 p-0"
                        onClick={() => toggleModel(provider, model)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Model Selection Dropdowns - Hide when showing Presets */}
            {!showPresets && (
            <div className="space-y-3">
              <h3 className="text-xs font-medium text-muted-foreground uppercase px-3 mb-3">Add Models</h3>
              
              {/* Provider Dropdown */}
              <div className="px-3">
                <label className="text-xs font-medium mb-2 block">Select Provider</label>
                <Select value={selectedProvider} onValueChange={(value) => {
                  setSelectedProvider(value);
                  setSelectedModel(''); // Reset model when provider changes
                }}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(AI_PROVIDERS).map(([key, provider]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${provider.color}`} />
                          {provider.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Model Dropdown */}
              {selectedProvider && (
                <div className="px-3">
                  <label className="text-xs font-medium mb-2 block">Select Model</label>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose a model" />
                    </SelectTrigger>
                    <SelectContent>
                      {AI_PROVIDERS[selectedProvider as keyof typeof AI_PROVIDERS]?.models.map((model) => (
                        <SelectItem key={model} value={model}>
                          {model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Add Button */}
              {selectedProvider && selectedModel && (
                <div className="px-3">
                  <Button
                    onClick={addModelFromDropdown}
                    className="w-full"
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add {selectedModel}
                  </Button>
                </div>
              )}
            </div>
            )}
          </div>
        )}

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-3 md:p-4">
          {viewMode === 'chat' && (
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <div className="text-4xl md:text-6xl mb-4">💬</div>
                  <p className="text-base md:text-lg text-center">Start a conversation with multiple AIs</p>
                  <p className="text-xs md:text-sm mt-2 text-center">Select models and send a message</p>
                </div>
              ) : (
                messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] md:max-w-[80%] rounded-lg p-3 ${
                        msg.type === 'user' ? 'bg-primary text-primary-foreground' :
                        msg.type === 'synthesis' ? 'bg-purple-700 text-white' :
                        'bg-muted'
                      }`}
                    >
                      {msg.type === 'ai' && (
                        <div className="flex items-center justify-between mb-2 gap-2">
                          <div className="flex items-center gap-2 text-xs min-w-0">
                            <div className={`w-2 h-2 rounded-full shrink-0 ${getProviderColor(msg.provider)}`} />
                            <span className="font-medium truncate">{msg.model}</span>
                            {msg.confidence && (
                              <span className="text-muted-foreground hidden sm:inline">
                                {(msg.confidence * 100).toFixed(0)}%
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => rateResponse(msg.id, 1)}
                            >
                              <ThumbsUp className={`h-3 w-3 ${msg.rating === 1 ? 'text-green-400' : ''}`} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => rateResponse(msg.id, -1)}
                            >
                              <ThumbsDown className={`h-3 w-3 ${msg.rating === -1 ? 'text-red-400' : ''}`} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => toggleCollapse(msg.id)}
                            >
                              {collapsedResponses.has(msg.id) ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                            </Button>
                          </div>
                        </div>
                      )}
                      {msg.type === 'synthesis' && (
                        <div className="flex items-center gap-2 mb-2 text-xs">
                          <GitCompare className="h-3 w-3" />
                          <span className="font-medium">Synthesized from {msg.sources} responses</span>
                        </div>
                      )}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="mb-2 space-y-1">
                          {msg.attachments.map((att, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs bg-background/20 rounded p-2">
                              {att.type.startsWith('image/') ? <ImageIcon className="h-3 w-3" /> : <Paperclip className="h-3 w-3" />}
                              <span className="truncate flex-1">{att.name}</span>
                              <span className="text-muted-foreground">{formatFileSize(att.size)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {!collapsedResponses.has(msg.id) && (
                        <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                      )}
                      {collapsedResponses.has(msg.id) && (
                        <p className="text-sm text-muted-foreground italic">Response collapsed</p>
                      )}
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg p-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.1s'}} />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.2s'}} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
          {viewMode === 'comparison' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {messages.filter(m => m.type === 'ai').slice(-4).map(msg => (
                <div key={msg.id} className="bg-muted rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-3 h-3 rounded-full ${getProviderColor(msg.provider)}`} />
                    <span className="font-medium text-sm">{msg.model}</span>
                  </div>
                  <p className="text-sm">{msg.content}</p>
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{msg.confidence ? (msg.confidence * 100).toFixed(0) : 0}%</span>
                    <span>{msg.responseTime?.toFixed(1)}s</span>
                  </div>
                </div>
              ))}
              {messages.filter(m => m.type === 'ai').length === 0 && (
                <div className="col-span-1 md:col-span-2 flex items-center justify-center text-muted-foreground py-8">
                  No responses to compare yet
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input Area - Footer with reorganized buttons */}
        <div className="p-3 md:p-4 border-t border-border">
          {/* Attachments Preview */}
          {attachments.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
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
          
          {/* Footer Controls Row - Single Line */}
          <div className="flex items-center justify-center gap-1.5 mb-2 relative">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileUpload}
            />
            

            
            {/* Footer Hamburger Menu */}
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
                    className={`fixed inset-0 ${Z_CLASS.FLOATING}`}
                    onClick={() => setShowFooterMenu(false)}
                  />
                  <div className={`absolute bottom-full left-0 mb-2 w-72 bg-card rounded-lg shadow-2xl ${Z_CLASS.DROPDOWN} border border-border overflow-hidden`}>
                    {/* Action Buttons */}
                    <button
                      onClick={() => {
                        setCurrentConversationTitle('New Chat');
                        setMessages([]);
                        setShowFooterMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors text-left"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span className="text-sm">New Chat</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingTitle(true);
                        setEditTitleValue(currentConversationTitle);
                        setShowFooterMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors text-left"
                    >
                      <Edit className="h-4 w-4" />
                      <span className="text-sm">Rename Chat</span>
                    </button>
                    <button
                      onClick={() => {
                        saveConversation();
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
                          setMessages([]);
                          setCurrentConversationTitle('New Chat');
                          setShowFooterMenu(false);
                        }
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors text-left"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="text-sm">Clear Chat</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowAnalytics(!showAnalytics);
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
                          setMessages([]);
                          setCurrentConversationTitle('New Chat');
                          setShowFooterMenu(false);
                        }
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
                              loadConversation(convo);
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
                            setShowMenu(true);
                            setShowFooterMenu(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors text-left"
                        >
                          <MessageSquare className="h-4 w-4" />
                          <span className="text-sm">View All Saved</span>
                        </button>
                        <button
                          onClick={() => {
                            toast.info(`Archive (${archivedConversations.length})`);
                            setShowFooterMenu(false);
                          }}
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
            
            {/* New Chat Button (+) */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setCurrentConversationTitle('New Chat');
                setMessages([]);
              }}
              className="h-7 w-7 shrink-0"
              title="New Chat"
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
            
            {/* Models Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowPresets(false);
                setShowModelSelector(!showModelSelector);
              }}
              className="text-[10px] h-7 px-2 shrink-0"
            >
              {selectedModels.length} Model{selectedModels.length !== 1 ? 's' : ''}
            </Button>
            
            {/* Synthesizer Button - Only show when models are selected */}
            {selectedModels.length > 0 && (
              <Button
                variant="outline"
                size="icon"
                onClick={generateSynthesis}
                title="Generate Synthesis"
                className="h-7 w-7 shrink-0"
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
                className="h-7 w-7 shrink-0"
                title="Settings"
              >
                <Settings className="h-3.5 w-3.5" />
              </Button>
              
              {showSettings && (
                <>
                  <div 
                    className={`fixed inset-0 ${Z_CLASS.FLOATING}`}
                    onClick={() => setShowSettings(false)}
                  />
                  <div className={`absolute bottom-full right-0 mb-2 w-56 bg-card rounded-lg shadow-2xl ${Z_CLASS.DROPDOWN} border border-border overflow-hidden`}>
                    <div className="px-4 py-3 border-b border-border">
                      <h3 className="text-sm font-semibold">Settings</h3>
                    </div>
                    <button
                      onClick={() => {
                        setShowPresetsManagement(true);
                        setShowSettings(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors text-left"
                    >
                      <Zap className="h-4 w-4" />
                      <span className="text-sm">Presets Setting</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowThemesSettings(true);
                        setShowSettings(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors text-left"
                    >
                      <Palette className="h-4 w-4" />
                      <span className="text-sm">Chat Theme</span>
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
                        exportConversation();
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
              onClick={saveConversation}
              disabled={messages.length === 0}
              title="Save Conversation"
              className="h-7 w-7 shrink-0"
            >
              <Save className="h-3.5 w-3.5" />
            </Button>
            
            {/* Presets Button */}
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowPresets(true);
                  setShowModelSelector(true);
                }}
                className="text-[10px] h-7 px-2 shrink-0"
              >
                Presets
              </Button>
            </div>
          </div>
          
          {/* Input Row */}
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
                onChange={(e) => setInputMessage(e.target.value)}

                placeholder="Select at least one AI model to send a message"
                disabled={selectedModels.length === 0}
                rows={1}
                className="w-full min-h-[40px] max-h-[200px] px-3 py-2.5 rounded-md border border-input bg-background text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                style={{ lineHeight: '1.5' }}
              />
            </div>
            <Button
              onClick={handleSend}
              disabled={!inputMessage.trim() || selectedModels.length === 0 || isLoading}
              size="icon"
              className="shrink-0 h-10 w-10"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Preset Editor Modal */}
      {showPresetEditor && (
        <>
          <div 
            className={`fixed inset-0 bg-black/50 ${Z_CLASS.MODAL_BACKDROP}`}
            onClick={() => setShowPresetEditor(false)}
          />
          <div className={`fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl bg-card rounded-lg shadow-2xl ${Z_CLASS.MODAL} flex flex-col max-h-[90vh]`}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold">
                {editingPreset ? 'Edit Preset' : 'Create New Preset'}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowPresetEditor(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Preset Name */}
              <div>
                <label className="text-sm font-medium mb-2 block">Preset Name</label>
                <Input
                  value={presetEditorName}
                  onChange={(e) => setPresetEditorName(e.target.value)}
                  placeholder="e.g., My Research Team"
                  className="w-full"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium mb-2 block">Description (Optional)</label>
                <Input
                  value={presetEditorDescription}
                  onChange={(e) => setPresetEditorDescription(e.target.value)}
                  placeholder="Brief description of this preset's purpose"
                  className="w-full"
                />
              </div>

              {/* Model Selection */}
              <div>
                <label className="text-sm font-medium mb-2 block">Select Models</label>
                <div className="space-y-3">
                  {Object.entries(AI_PROVIDERS).map(([providerId, provider]) => (
                    <div key={providerId} className="border border-border rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`h-2 w-2 rounded-full ${provider.color}`} />
                        <span className="text-sm font-medium">{provider.name}</span>
                      </div>
                      <div className="space-y-2 ml-4">
                        {provider.models.map((model) => {
                          const modelKey = `${providerId}:${model}`;
                          return (
                            <label key={modelKey} className="flex items-center gap-2 cursor-pointer">
                              <Checkbox
                                checked={presetEditorModels.includes(modelKey)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setPresetEditorModels([...presetEditorModels, modelKey]);
                                  } else {
                                    setPresetEditorModels(presetEditorModels.filter(m => m !== modelKey));
                                  }
                                }}
                              />
                              <span className="text-sm">{model}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-4 border-t border-border">
              <Button
                variant="outline"
                onClick={() => {
                  if (window.confirm('Reset this preset to default settings?')) {
                    // Find the original built-in preset
                    const builtInPreset = Object.values(MODEL_PRESETS).find(p => p.name === presetEditorName);
                    if (builtInPreset) {
                      setPresetEditorModels([...builtInPreset.models]);
                      setPresetEditorDescription('');
                      toast.success('Preset reset to default');
                    } else {
                      toast.error('No default preset found with this name');
                    }
                  }
                }}
                disabled={!editingPreset}
              >
                Reset
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowPresetEditor(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={savePreset}
                  disabled={!presetEditorName.trim() || presetEditorModels.length === 0}
                >
                  {editingPreset ? 'Update Preset' : 'Create Preset'}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Presets Management Modal */}
      {showPresetsManagement && (
        <PresetsManagementModal
          AI_PROVIDERS={AI_PROVIDERS}
          customPresets={customPresets}
          builtInPresets={MODEL_PRESETS}
          defaultModels={defaultModels}
          onSaveCustomPresets={saveCustomPresets}
          onSaveDefaultModels={(models) => {
            setDefaultModels(models);
            localStorage.setItem('defaultModels', JSON.stringify(models));
          }}
          onClose={() => setShowPresetsManagement(false)}
        />
      )}

      {/* Themes Settings Modal */}
      <ThemesSettingsModal
        isOpen={showThemesSettings}
        onClose={() => setShowThemesSettings(false)}
      />
    </div>
  );
}
