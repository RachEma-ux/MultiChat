import { useState, useEffect } from 'react';
import Draggable from 'react-draggable';
import { Button } from '@/components/ui/button';
import { Pin, Minus, Maximize2, Minimize2, X } from 'lucide-react';
import { ChatFooter, SavedConversation as SavedConvo } from '@/components/ChatFooter';
import { ModelSelector } from './ModelSelector';
import { PresetsPanel } from './PresetsPanel';
import { SettingsMenu } from './SettingsMenu';
import { PresetEditorModal } from './PresetEditorModal';
import { PresetsManagementModal, CustomPreset } from './PresetsManagementModal';
import { RenameChatDialog } from './RenameChatDialog';
import { AnalyticsPanel } from './AnalyticsPanel';
import { PresetSelectionDialog } from './PresetSelectionDialog';
import { AI_PROVIDERS, MODEL_PRESETS } from '@/lib/ai-providers';
import { QuickPreset, loadQuickPresets, saveQuickPresets, addQuickPresets, updateQuickPreset, removeQuickPreset } from '@/lib/quick-presets';
import { toast } from 'sonner';

interface Attachment {
  name: string;
  type: string;
  size: number;
  file: File;
}

// Using SavedConvo from ChatFooter to avoid type conflicts
// Using CustomPreset from PresetsManagementModal to avoid type conflicts

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
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [conversationTitle, setConversationTitle] = useState(`Chat ${id}`);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [savedConversations, setSavedConversations] = useState<SavedConvo[]>([]);
  const [archivedConversations, setArchivedConversations] = useState<SavedConvo[]>([]);
  const [showPresetEditor, setShowPresetEditor] = useState(false);
  const [editingPreset, setEditingPreset] = useState<CustomPreset | null>(null);
  const [customPresets, setCustomPresets] = useState<CustomPreset[]>([]);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitleValue, setEditTitleValue] = useState('');
  const [showPresetsManagement, setShowPresetsManagement] = useState(false);
  const [defaultModels, setDefaultModels] = useState<string[]>([]);
  const [quickPresets, setQuickPresets] = useState<QuickPreset[]>([]);
  const [showPresetSelection, setShowPresetSelection] = useState(false);
  const [editingQuickPresetId, setEditingQuickPresetId] = useState<string | null>(null);

  // Load saved conversations and custom presets from localStorage on mount
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('savedConversations') || '[]');
    setSavedConversations(saved);
    const archived = JSON.parse(localStorage.getItem('archivedConversations') || '[]');
    setArchivedConversations(archived);
    const presets = JSON.parse(localStorage.getItem('customPresets') || '[]');
    setCustomPresets(presets);
    const quick = loadQuickPresets();
    setQuickPresets(quick);
  }, []);

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

  const handleSend = async () => {
    if (!inputMessage.trim() || selectedModels.length === 0 || isLoading) return;
    
    setIsLoading(true);
    
    // Create user message
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
      attachments: attachments.length > 0 ? attachments : undefined
    };
    
    setMessages(prev => [...prev, userMessage]);
    const userMessageContent = inputMessage;
    setInputMessage('');
    setAttachments([]);
    
    // Simulate AI responses from each selected model
    for (let i = 0; i < selectedModels.length; i++) {
      const modelKey = selectedModels[i];
      const [provider, model] = modelKey.split(':');
      
      // Add typing indicator
      const typingId = `typing-${Date.now()}-${i}`;
      setMessages(prev => [...prev, {
        id: typingId,
        type: 'typing',
        provider,
        model,
        timestamp: new Date()
      }]);
      
      // Simulate API delay (1-3 seconds)
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      // Remove typing indicator and add AI response
      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== typingId);
        return [...filtered, {
          id: Date.now() + i,
          type: 'ai',
          provider,
          model,
          content: `This is a simulated response from ${model} (${provider}). In a real implementation, this would be the actual AI response to: "${userMessageContent}"`,
          timestamp: new Date()
        }];
      });
    }
    
    setIsLoading(false);
    toast.success(`Received ${selectedModels.length} response(s)`);
  };

  const handleFileUpload = (files: File[]) => {
    const newAttachments = files.map(file => ({
      name: file.name,
      type: file.type,
      size: file.size,
      file
    }));
    setAttachments([...attachments, ...newAttachments]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
    toast.info('Attachment removed');
  };

  const toggleModel = (provider: string, model: string) => {
    const modelKey = `${provider}:${model}`;
    setSelectedModels(prev => 
      prev.includes(modelKey) 
        ? prev.filter(m => m !== modelKey)
        : [...prev, modelKey]
    );
  };

  const addModelFromDropdown = () => {
    if (selectedProvider && selectedModel) {
      toggleModel(selectedProvider, selectedModel);
      setSelectedProvider('');
      setSelectedModel('');
    }
  };

  const getProviderColor = (provider?: string) => {
    if (!provider) return 'bg-gray-500';
    return AI_PROVIDERS[provider as keyof typeof AI_PROVIDERS]?.color || 'bg-gray-500';
  };

  const applyPreset = (models: string[]) => {
    setSelectedModels(models);
    setShowPresets(false);
    setShowModelSelector(false);
    toast.success('Preset applied!');
  };

  const saveConversation = () => {
    if (messages.length === 0) {
      toast.error('No messages to save');
      return;
    }
    
    const conversation = {
      id: Date.now().toString(),
      title: conversationTitle,
      messages: messages,
      timestamp: new Date().toISOString(),
      models: selectedModels
    };
    
    // Save to localStorage
    const saved = JSON.parse(localStorage.getItem('savedConversations') || '[]');
    saved.push(conversation);
    localStorage.setItem('savedConversations', JSON.stringify(saved));
    
    // Update state to show in Recent Conversations immediately
    setSavedConversations(saved);
    
    toast.success('Conversation saved!');
  };

  const clearChat = () => {
    setMessages([]);
    setConversationTitle(`Chat ${id}`);
    toast.success('Chat cleared');
  };

  const deleteChat = () => {
    setMessages([]);
    setConversationTitle(`Chat ${id}`);
    toast.success('Chat deleted');
  };

  const renameChat = () => {
    setIsEditingTitle(true);
    setEditTitleValue(conversationTitle);
  };

  const handleRename = (newTitle: string) => {
    setConversationTitle(newTitle);
    toast.success('Chat renamed');
  };

  const exportConversation = () => {
    if (messages.length === 0) {
      toast.error('No messages to export');
      return;
    }
    
    const data = {
      title: conversationTitle,
      messages: messages,
      models: selectedModels,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${conversationTitle.replace(/\s+/g, '_')}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Conversation exported!');
  };

  const generateSynthesis = () => {
    if (messages.length === 0) {
      toast.error('No messages to synthesize');
      return;
    }
    
    const aiResponses = messages.filter(m => m.type === 'assistant');
    if (aiResponses.length < 2) {
      toast.error('Need at least 2 AI responses to synthesize');
      return;
    }
    
    const synthesis = {
      id: Date.now(),
      type: 'assistant',
      content: `**Synthesis of ${aiResponses.length} responses:**\n\n${aiResponses.map(r => r.content).join('\n\n---\n\n')}`,
      model: 'Synthesis',
      timestamp: new Date()
    };
    
    setMessages([...messages, synthesis]);
    toast.success('Synthesis generated');
  };

  const loadConversation = (convo: SavedConvo) => {
    setMessages(convo.messages || []);
    setConversationTitle(convo.title);
    setSelectedModels(convo.models || []);
    toast.success(`Loaded: ${convo.title}`);
  };

  const viewAllSaved = () => {
    toast.info('View All Saved coming soon');
  };

  const openPresetsSettings = () => {
    setShowPresetsManagement(true);
  };

  const savePreset = (preset: CustomPreset) => {
    const updated = editingPreset
      ? customPresets.map(p => p.id === preset.id ? preset : p)
      : [...customPresets, preset];
    
    setCustomPresets(updated);
    localStorage.setItem('customPresets', JSON.stringify(updated));
    
    // If editing a Quick Preset, update it too
    if (editingQuickPresetId) {
      const updatedQuick = updateQuickPreset(quickPresets, editingQuickPresetId, {
        name: preset.name,
        models: preset.models
      });
      setQuickPresets(updatedQuick);
      saveQuickPresets(updatedQuick);
      setEditingQuickPresetId(null);
    }
    
    setShowPresetEditor(false);
    setEditingPreset(null);
  };

  // Quick Presets handlers
  const handleAddQuickPresets = (presets: Array<{ sourceId: string; sourceType: 'built-in' | 'custom'; name: string; models: string[] }>) => {
    const updated = addQuickPresets(quickPresets, presets);
    setQuickPresets(updated);
    saveQuickPresets(updated);
    toast.success(`Added ${presets.length} preset${presets.length > 1 ? 's' : ''} to Quick Presets`);
  };

  const handleEditQuickPreset = (id: string) => {
    const preset = quickPresets.find(p => p.id === id);
    if (!preset) return;
    
    // Open PresetEditorModal with the Quick Preset data
    setEditingQuickPresetId(id);
    setEditingPreset({
      id: preset.id,
      name: preset.name,
      description: '',
      models: preset.models,
      type: 'custom'
    });
    setShowPresetEditor(true);
  };

  const handleDeleteQuickPreset = (id: string) => {
    if (!confirm('Are you sure you want to remove this preset from Quick Presets?')) return;
    
    const updated = removeQuickPreset(quickPresets, id);
    setQuickPresets(updated);
    saveQuickPresets(updated);
    toast.success('Preset removed from Quick Presets');
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
    <>
    <Draggable
      disabled={isPinned || isMaximized}
      position={isPinned || isMaximized ? { x: 0, y: 0 } : position}
      onDrag={handleDrag}
      handle=".drag-handle"
      bounds="parent"
    >
      <div
        className="fixed bg-background border border-border rounded-lg shadow-2xl overflow-hidden flex flex-col z-[900]"
        style={windowStyle}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-card shrink-0">
          <div className="drag-handle flex items-center gap-2 cursor-move flex-1 min-w-0">
            {isEditingTitle ? (
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="text"
                  value={editTitleValue}
                  onChange={(e) => setEditTitleValue(e.target.value)}
                  className="flex-1 px-2 py-1 text-sm border border-border rounded bg-background"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setConversationTitle(editTitleValue);
                      setIsEditingTitle(false);
                      toast.success('Title updated');
                    } else if (e.key === 'Escape') {
                      setIsEditingTitle(false);
                    }
                  }}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setConversationTitle(editTitleValue);
                    setIsEditingTitle(false);
                    toast.success('Title updated');
                  }}
                  className="h-6 px-2 text-xs"
                >
                  Save
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditingTitle(false)}
                  className="h-6 px-2 text-xs"
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <span className="text-sm font-medium truncate">{conversationTitle}</span>
            )}
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
            {/* Model Selector Panel */}
            {showModelSelector && (
              <ModelSelector
                selectedModels={selectedModels}
                selectedProvider={selectedProvider}
                selectedModel={selectedModel}
                onProviderChange={setSelectedProvider}
                onModelChange={setSelectedModel}
                onToggleModel={toggleModel}
                onAddModel={addModelFromDropdown}
                getProviderColor={getProviderColor}
              />
            )}

            {/* Presets Panel */}
            {showPresets && (
              <PresetsPanel
                onApplyPreset={applyPreset}
                quickPresets={quickPresets}
                onNewPreset={() => setShowPresetSelection(true)}
                onEditPreset={handleEditQuickPreset}
                onDeletePreset={handleDeleteQuickPreset}
              />
            )}

            <div className="flex-1 p-4 overflow-auto min-h-0">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="text-6xl mb-4">💬</div>
                  <h2 className="text-xl font-semibold mb-2">Start a conversation with multiple AIs</h2>
                  <p className="text-sm text-muted-foreground">Select models and send a message</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className="flex flex-col gap-2">
                      {message.type === 'user' && (
                        <div className="flex justify-end">
                          <div className="max-w-[80%] bg-primary text-primary-foreground rounded-lg px-4 py-2">
                            <div className="text-sm">{message.content}</div>
                            {message.attachments && message.attachments.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {message.attachments.map((att: any, idx: number) => (
                                  <div key={idx} className="text-xs opacity-80">📎 {att.name}</div>
                                ))}
                              </div>
                            )}
                            <div className="text-xs opacity-70 mt-1">
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      )}
                      {message.type === 'ai' && (
                        <div className="flex justify-start">
                          <div className="max-w-[80%] bg-card border border-border rounded-lg px-4 py-2">
                            <div className="flex items-center gap-2 mb-1">
                              <div className={`w-2 h-2 rounded-full ${getProviderColor(message.provider)}`} />
                              <span className="text-xs font-semibold">{message.model}</span>
                            </div>
                            <div className="text-sm">{message.content}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      )}
                      {message.type === 'typing' && (
                        <div className="flex justify-start">
                          <div className="max-w-[80%] bg-card border border-border rounded-lg px-4 py-2">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${getProviderColor(message.provider)}`} />
                              <span className="text-xs font-semibold">{message.model}</span>
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0ms'}} />
                              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '150ms'}} />
                              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '300ms'}} />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Footer */}
            <ChatFooter
              selectedModelsCount={selectedModels.length}
              onModelsClick={() => setShowModelSelector(!showModelSelector)}
              onNewChat={() => {
                setMessages([]);
                setInputMessage('');
                setConversationTitle(`Chat ${id}`);
                toast.success('New chat started');
              }}
              onSave={saveConversation}
              onClearChat={clearChat}
              onDeleteChat={deleteChat}
              onRenameChat={renameChat}
              onShowAnalytics={() => {
                setShowAnalytics(!showAnalytics);
              }}
              onExportData={exportConversation}
              onPresetsSettings={openPresetsSettings}
              onSettingsClick={() => setShowSettings(!showSettings)}
              onSummarizerClick={generateSynthesis}
              messagesCount={messages.length}
              onPresetsClick={() => {
                setShowPresets(!showPresets);
                setShowModelSelector(false);
              }}
              inputMessage={inputMessage}
              onInputChange={setInputMessage}
              onSend={handleSend}
              onAttach={() => {}}
              isLoading={isLoading}
              attachments={attachments}
              onRemoveAttachment={removeAttachment}
              savedConversations={savedConversations}
              onLoadConversation={loadConversation}
              onViewAllSaved={viewAllSaved}
              archivedCount={archivedConversations.length}
            />
          </>
        )}
      </div>
    </Draggable>
    
    {/* Preset Editor Modal */}
    <PresetEditorModal
      isOpen={showPresetEditor}
      onClose={() => {
        setShowPresetEditor(false);
        setEditingPreset(null);
      }}
      editingPreset={editingPreset}
      onSave={savePreset}
    />
    
    {/* Presets Management Modal */}
    {showPresetsManagement && (
      <PresetsManagementModal
        AI_PROVIDERS={AI_PROVIDERS}
        customPresets={customPresets}
        builtInPresets={MODEL_PRESETS}
        defaultModels={defaultModels}
        onSaveCustomPresets={(presets) => {
          setCustomPresets(presets);
          localStorage.setItem('customPresets', JSON.stringify(presets));
        }}
        onSaveDefaultModels={(models) => {
          setDefaultModels(models);
          localStorage.setItem('defaultModels', JSON.stringify(models));
        }}
        onClose={() => setShowPresetsManagement(false)}
      />
    )}
    
    {/* Rename Chat Dialog */}
    <RenameChatDialog
      isOpen={showRenameDialog}
      currentTitle={conversationTitle}
      onClose={() => setShowRenameDialog(false)}
      onRename={handleRename}
    />
    
    {/* Analytics Panel */}
    <AnalyticsPanel
      isOpen={showAnalytics}
      onClose={() => setShowAnalytics(false)}
      messages={messages}
      conversationTitle={conversationTitle}
    />

    {/* Preset Selection Dialog */}
    <PresetSelectionDialog
      open={showPresetSelection}
      onOpenChange={setShowPresetSelection}
      customPresets={customPresets}
      quickPresets={quickPresets}
      onAdd={handleAddQuickPresets}
    />
    </>
  );
}
