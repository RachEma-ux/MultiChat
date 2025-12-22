import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { SavedConversation as SavedConvo } from '@/components/ChatFooter';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Pin, Minus, Maximize2, Minimize2, X, MessageSquare, GripHorizontal, Plus, Pencil, Trash2, Star, Download, Upload, Share2, BarChart2, Layout, Search, Tag, Copy, FolderOpen, CheckSquare, MoreHorizontal } from 'lucide-react';
import { ChatFooter } from '@/components/ChatFooter';
import { ModelSelector } from './ModelSelector';
import { SettingsMenu } from './SettingsMenu';
import { PresetEditorModal } from './PresetEditorModal';
import { PresetsManagementModal, CustomPreset } from './PresetsManagementModal';
import { RenameChatDialog } from './RenameChatDialog';
import { AnalyticsPanel } from './AnalyticsPanel';
import { PresetSelectionDialog } from './PresetSelectionDialog';
import { SavedConversationsModal } from './SavedConversationsModal';
import { KeyboardShortcutsHelp } from './KeyboardShortcutsHelp';
import { PresetTemplatesModal } from './PresetTemplatesModal';
import { PresetVersionHistoryModal } from './PresetVersionHistoryModal';
import { PresetRecommendations } from './PresetRecommendations';
import { PresetSortDropdown } from './PresetSortDropdown';
import { PresetStatsDashboard } from './PresetStatsDashboard';
import { CustomCategoryModal } from './CustomCategoryModal';
import { BulkOperationsBar } from './BulkOperationsBar';
import { useKeyboardShortcuts, SHORTCUT_KEYS } from '@/hooks/useKeyboardShortcuts';
import { AI_PROVIDERS, MODEL_PRESETS } from '@/lib/ai-providers';
import { 
  QuickPreset, loadQuickPresets, saveQuickPresets, addQuickPresets, 
  updateQuickPreset, removeQuickPreset, reorderQuickPresets, toggleFavorite, 
  exportPresets, importPresets, trackPresetUsage, loadUsageStats, 
  generateShareableUrl, checkUrlForSharedPreset, PresetSortOption, sortPresets, 
  restorePresetVersion, getPresetVersionHistory, searchPresets, setPresetCategory, 
  filterByCategory, getAllCategories, duplicatePreset, PresetUsageStats 
} from '@/lib/quick-presets';
import { toast } from 'sonner';

// ============================================
// TYPES & INTERFACES
// ============================================

interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  file: File;
  preview?: string;
}

interface Message {
  id: number;
  type: 'user' | 'ai' | 'typing';
  content: string;
  model?: string;
  provider?: string;
  timestamp: Date;
}

interface FloatingChatWindowProps {
  id: string;
  initialPosition?: { x: number; y: number };
  initialSize?: { width: number; height: number };
  isMinimized?: boolean;
  onClose: () => void;
  onMinimize?: () => void;
  onPositionChange?: (pos: { x: number; y: number }) => void;
  onSizeChange?: (size: { width: number; height: number }) => void;
  onTitleChange?: (title: string) => void;
  onMessageCountChange?: (count: number) => void;
  onPinnedChange?: (pinned: boolean) => void;
}

// ============================================
// CONSTANTS
// ============================================

const MIN_WINDOW_WIDTH = 320;
const MAX_WINDOW_WIDTH = 1200;
const MIN_WINDOW_HEIGHT = 300;
const MAX_WINDOW_HEIGHT = 1000;
const DEFAULT_WINDOW_WIDTH = 400;
const DEFAULT_WINDOW_HEIGHT = 500;
const SNAP_THRESHOLD = 15; // Reduced for better mobile experience
const EDGE_HANDLE_SIZE = 6;

// ============================================
// HELPER FUNCTIONS
// ============================================

const getStorageKey = (id: string, suffix: string) => `chatWindow_${id}_${suffix}`;

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const loadWindowState = (id: string) => {
  try {
    const posStr = localStorage.getItem(getStorageKey(id, 'position'));
    const sizeStr = localStorage.getItem(getStorageKey(id, 'size'));
    return {
      position: posStr ? JSON.parse(posStr) : null,
      size: sizeStr ? JSON.parse(sizeStr) : null,
    };
  } catch {
    return { position: null, size: null };
  }
};

const saveWindowState = (id: string, position: { x: number; y: number }, size: { width: number; height: number }) => {
  try {
    localStorage.setItem(getStorageKey(id, 'position'), JSON.stringify(position));
    localStorage.setItem(getStorageKey(id, 'size'), JSON.stringify(size));
  } catch (e) {
    console.error('Failed to save window state:', e);
  }
};

// ============================================
// MAIN COMPONENT
// ============================================

export function FloatingChatWindow({ 
  id, 
  initialPosition = { x: 50, y: 50 },
  initialSize = { width: DEFAULT_WINDOW_WIDTH, height: DEFAULT_WINDOW_HEIGHT },
  isMinimized: externalIsMinimized,
  onClose,
  onMinimize,
  onPositionChange,
  onSizeChange,
  onTitleChange,
  onMessageCountChange,
  onPinnedChange,
}: FloatingChatWindowProps) {
  
  // ============================================
  // STATE - Window Management
  // ============================================
  
  const [position, setPosition] = useState(() => {
    const saved = loadWindowState(id);
    // Calculate actual rendered width (min of window width and 90vw)
    const actualWidth = Math.min(DEFAULT_WINDOW_WIDTH, window.innerWidth * 0.9);
    const isMobile = window.innerWidth < 768;
    
    if (saved.position) {
      // On mobile, allow more flexible positioning
      const maxX = isMobile ? Math.max(0, window.innerWidth - actualWidth) : window.innerWidth - MIN_WINDOW_WIDTH;
      return {
        x: clamp(saved.position.x, 0, maxX),
        y: clamp(saved.position.y, 0, window.innerHeight - 100),
      };
    }
    return initialPosition;
  });
  
  const [windowSize, setWindowSize] = useState(() => {
    const saved = loadWindowState(id);
    if (saved.size) {
      return {
        width: clamp(saved.size.width, MIN_WINDOW_WIDTH, MAX_WINDOW_WIDTH),
        height: clamp(saved.size.height, MIN_WINDOW_HEIGHT, MAX_WINDOW_HEIGHT),
      };
    }
    return initialSize;
  });
  
  const [isPinned, setIsPinned] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  
  // ============================================
  // STATE - Chat
  // ============================================
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationTitle, setConversationTitle] = useState(`Chat ${id}`);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  
  // ============================================
  // STATE - UI Panels
  // ============================================
  
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showPresetEditor, setShowPresetEditor] = useState(false);
  const [showPresetsManagement, setShowPresetsManagement] = useState(false);
  const [showPresetSelection, setShowPresetSelection] = useState(false);
  const [showSavedConversationsModal, setShowSavedConversationsModal] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showStatsDashboard, setShowStatsDashboard] = useState(false);
  const [showCustomCategoryModal, setShowCustomCategoryModal] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  
  // ============================================
  // STATE - Presets
  // ============================================
  
  const [quickPresets, setQuickPresets] = useState<QuickPreset[]>(() => loadQuickPresets());
  const [customPresets, setCustomPresets] = useState<CustomPreset[]>([]);
  const [editingPreset, setEditingPreset] = useState<CustomPreset | null>(null);
  const [editingQuickPresetId, setEditingQuickPresetId] = useState<string | null>(null);
  const [usageStats, setUsageStats] = useState<PresetUsageStats>(() => loadUsageStats());
  const [presetSortOption, setPresetSortOption] = useState<PresetSortOption>('manual');
  const [presetSearchQuery, setPresetSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>(() => getAllCategories());
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedPresetIds, setSelectedPresetIds] = useState<Set<string>>(new Set());
  const [showRecommendations, setShowRecommendations] = useState(false); // Disabled by default for mobile performance
  const [versionHistoryPresetId, setVersionHistoryPresetId] = useState<string>('');
  const [versionHistoryPresetName, setVersionHistoryPresetName] = useState<string>('');
  const [draggedPresetIndex, setDraggedPresetIndex] = useState<number | null>(null);
  
  // ============================================
  // STATE - Conversations
  // ============================================
  
  const [savedConversations, setSavedConversations] = useState<any[]>([]);
  const [archivedConversations, setArchivedConversations] = useState<any[]>([]);
  
  // ============================================
  // STATE - Title Editing
  // ============================================
  
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitleValue, setEditTitleValue] = useState('');
  const lastTapRef = useRef<number>(0);
  
  // ============================================
  // REFS
  // ============================================
  
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0, posX: 0, posY: 0 });
  const resizeStartRef = useRef({ x: 0, y: 0, width: 0, height: 0, posX: 0, posY: 0, edge: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // ============================================
  // COMPUTED VALUES
  // ============================================
  
  const isMinimized = externalIsMinimized ?? false;
  
  const filteredPresets = useMemo(() => {
    let result = quickPresets;
    if (presetSearchQuery) {
      result = searchPresets(result, presetSearchQuery);
    }
    if (selectedCategory) {
      result = filterByCategory(result, selectedCategory);
    }
    return sortPresets(result, presetSortOption, usageStats);
  }, [quickPresets, presetSearchQuery, selectedCategory, presetSortOption, usageStats]);
  
  // Map filtered indices to original indices for drag-and-drop
  const filteredToOriginalIndex = useMemo(() => {
    const map = new Map<number, number>();
    filteredPresets.forEach((preset, filteredIdx) => {
      const originalIdx = quickPresets.findIndex(p => p.id === preset.id);
      map.set(filteredIdx, originalIdx);
    });
    return map;
  }, [filteredPresets, quickPresets]);
  
  const canDragPresets = !presetSearchQuery && !selectedCategory && presetSortOption === 'manual';
  
  // ============================================
  // EFFECTS - Initialization
  // ============================================
  
  useEffect(() => {
    // Load saved data on mount
    const saved = JSON.parse(localStorage.getItem('savedConversations') || '[]');
    setSavedConversations(saved);
    const archived = JSON.parse(localStorage.getItem('archivedConversations') || '[]');
    setArchivedConversations(archived);
    const presets = JSON.parse(localStorage.getItem('customPresets') || '[]');
    setCustomPresets(presets);
    
    // Check URL for shared preset
    const sharedPreset = checkUrlForSharedPreset();
    if (sharedPreset) {
      const confirmImport = window.confirm(
        `Import shared preset "${sharedPreset.name}" with ${sharedPreset.models.length} models?`
      );
      if (confirmImport) {
        const newPreset = {
          sourceId: `shared-${Date.now()}`,
          sourceType: 'custom' as const,
          name: sharedPreset.name,
          description: sharedPreset.description,
          models: sharedPreset.models,
        };
        const updated = addQuickPresets(quickPresets, [newPreset]);
        setQuickPresets(updated);
        saveQuickPresets(updated);
        toast.success(`Imported preset: ${sharedPreset.name}`);
      }
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);
  
  // ============================================
  // EFFECTS - Parent Notifications
  // ============================================
  
  // Notify parent of title changes - use ref to avoid infinite loops
  const prevTitleRef = useRef(conversationTitle);
  useEffect(() => {
    if (prevTitleRef.current !== conversationTitle) {
      prevTitleRef.current = conversationTitle;
      onTitleChange?.(conversationTitle);
    }
  }, [conversationTitle]); // Remove onTitleChange from deps to avoid infinite loop
  
  // Notify parent of message count changes
  const prevMessageCountRef = useRef(messages.length);
  useEffect(() => {
    if (prevMessageCountRef.current !== messages.length) {
      prevMessageCountRef.current = messages.length;
      onMessageCountChange?.(messages.length);
    }
  }, [messages.length]); // Remove onMessageCountChange from deps
  
  // Notify parent of size changes
  const prevSizeRef = useRef(windowSize);
  useEffect(() => {
    if (prevSizeRef.current.width !== windowSize.width || prevSizeRef.current.height !== windowSize.height) {
      prevSizeRef.current = windowSize;
      onSizeChange?.(windowSize);
    }
  }, [windowSize]); // Remove onSizeChange from deps
  
  // ============================================
  // DRAG HANDLERS
  // ============================================
  
  const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (isPinned || isMaximized) return;
    e.preventDefault();
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    dragStartRef.current = {
      x: clientX,
      y: clientY,
      posX: position.x,
      posY: position.y,
    };
    
    setIsDragging(true);
    
    const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
      if (moveEvent.cancelable) moveEvent.preventDefault();
      
      const moveX = 'touches' in moveEvent ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const moveY = 'touches' in moveEvent ? moveEvent.touches[0].clientY : moveEvent.clientY;
      
      const deltaX = moveX - dragStartRef.current.x;
      const deltaY = moveY - dragStartRef.current.y;
      
      // Calculate actual rendered width for proper clamping
      const actualWidth = Math.min(windowSize.width, window.innerWidth * 0.9);
      const maxX = Math.max(0, window.innerWidth - actualWidth);
      
      const newX = clamp(dragStartRef.current.posX + deltaX, 0, maxX);
      const newY = clamp(dragStartRef.current.posY + deltaY, 0, window.innerHeight - 50);
      
      setPosition({ x: newX, y: newY });
    };
    
    const handleEnd = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleEnd);
      
      // Snap to edges
      setPosition(currentPos => {
        let finalX = currentPos.x;
        let finalY = currentPos.y;
        
        // Calculate actual rendered width for proper snapping
        const actualWidth = Math.min(windowSize.width, window.innerWidth * 0.9);
        const actualHeight = Math.min(windowSize.height, window.innerHeight * 0.9);
        
        // Only snap to right edge, not left (better for mobile)
        if (currentPos.x > window.innerWidth - actualWidth - SNAP_THRESHOLD) {
          finalX = Math.max(0, window.innerWidth - actualWidth);
        }
        
        if (currentPos.y < SNAP_THRESHOLD) finalY = 0;
        else if (currentPos.y > window.innerHeight - actualHeight - SNAP_THRESHOLD) {
          finalY = Math.max(0, window.innerHeight - actualHeight);
        }
        
        saveWindowState(id, { x: finalX, y: finalY }, windowSize);
        onPositionChange?.({ x: finalX, y: finalY });
        
        return { x: finalX, y: finalY };
      });
    };
    
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleMove, { passive: false });
    document.addEventListener('touchend', handleEnd);
  }, [isPinned, isMaximized, position, windowSize, id, onPositionChange]);
  
  // ============================================
  // RESIZE HANDLERS
  // ============================================
  
  const handleResizeStart = useCallback((e: React.MouseEvent | React.TouchEvent, edge: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    resizeStartRef.current = {
      x: clientX,
      y: clientY,
      width: windowSize.width,
      height: windowSize.height,
      posX: position.x,
      posY: position.y,
      edge,
    };
    
    setIsResizing(true);
    
    const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
      if (moveEvent.cancelable) moveEvent.preventDefault();
      
      const moveX = 'touches' in moveEvent ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const moveY = 'touches' in moveEvent ? moveEvent.touches[0].clientY : moveEvent.clientY;
      
      const deltaX = moveX - resizeStartRef.current.x;
      const deltaY = moveY - resizeStartRef.current.y;
      const { edge, width, height, posX, posY } = resizeStartRef.current;
      
      let newWidth = width;
      let newHeight = height;
      let newPosX = posX;
      let newPosY = posY;
      
      // East edge
      if (edge.includes('e')) {
        newWidth = clamp(width + deltaX, MIN_WINDOW_WIDTH, MAX_WINDOW_WIDTH);
      }
      // West edge
      if (edge.includes('w')) {
        const widthDelta = clamp(width - deltaX, MIN_WINDOW_WIDTH, MAX_WINDOW_WIDTH) - width;
        newWidth = width + widthDelta;
        newPosX = Math.max(0, posX - widthDelta);
      }
      // South edge
      if (edge.includes('s')) {
        newHeight = clamp(height + deltaY, MIN_WINDOW_HEIGHT, MAX_WINDOW_HEIGHT);
      }
      // North edge
      if (edge.includes('n')) {
        const heightDelta = clamp(height - deltaY, MIN_WINDOW_HEIGHT, MAX_WINDOW_HEIGHT) - height;
        newHeight = height + heightDelta;
        newPosY = Math.max(0, posY - heightDelta);
      }
      
      setWindowSize({ width: newWidth, height: newHeight });
      setPosition({ x: newPosX, y: newPosY });
    };
    
    const handleEnd = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleEnd);
      
      // Save final state
      saveWindowState(id, position, windowSize);
    };
    
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleMove, { passive: false });
    document.addEventListener('touchend', handleEnd);
  }, [windowSize, position, id]);
  
  // ============================================
  // WINDOW CONTROL HANDLERS
  // ============================================
  
  const togglePin = useCallback(() => {
    const newPinned = !isPinned;
    setIsPinned(newPinned);
    onPinnedChange?.(newPinned);
    toast.info(newPinned ? 'Window pinned' : 'Window unpinned');
  }, [isPinned, onPinnedChange]);
  
  const toggleMaximize = useCallback(() => {
    setIsMaximized(prev => {
      if (!prev) toast.info('Window maximized');
      return !prev;
    });
  }, []);
  
  const handleMinimize = useCallback(() => {
    onMinimize?.();
  }, [onMinimize]);
  
  // ============================================
  // CHAT HANDLERS
  // ============================================
  
  const handleSend = useCallback(async () => {
    if (!inputMessage.trim()) return;
    
    if (selectedModels.length === 0) {
      toast.error('Please select at least one AI model');
      return;
    }
    
    const userMessage: Message = {
      id: Date.now(),
      type: 'user' as const,
      content: inputMessage,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    
    // Simulate AI responses (replace with real API calls)
    setTimeout(() => {
      const aiResponses: Message[] = selectedModels.map((modelKey, index) => {
        const [provider, model] = modelKey.split(':');
        return {
          id: Date.now() + index + 1,
          type: 'ai' as const,
          content: `This is a simulated response from ${model}. In a real implementation, this would connect to the ${provider} API.`,
          model,
          provider,
          timestamp: new Date(),
        };
      });
      
      setMessages(prev => [...prev, ...aiResponses]);
      setIsLoading(false);
    }, 1000);
  }, [inputMessage, selectedModels]);
  
  const clearChat = useCallback(() => {
    setMessages([]);
    setConversationTitle(`Chat ${id}`);
    toast.info('Chat cleared');
  }, [id]);
  
  const newChat = useCallback(() => {
    setMessages([]);
    setConversationTitle(`Chat ${Date.now()}`);
    toast.info('New chat started');
  }, []);
  
  const saveConversation = useCallback(() => {
    if (messages.length === 0) {
      toast.error('No messages to save');
      return;
    }
    
    const newConvo: SavedConvo = {
      id: `convo-${Date.now()}`,
      title: conversationTitle,
      messages: messages,
      models: selectedModels,
      timestamp: new Date().toISOString(),
    };
    
    let updatedSaved = [...savedConversations];
    let updatedArchived = [...archivedConversations];
    
    if (updatedSaved.length >= 3) {
      const oldest = updatedSaved[updatedSaved.length - 1];
      updatedArchived = [oldest, ...updatedArchived];
      updatedSaved = updatedSaved.slice(0, 2);
    }
    
    updatedSaved = [newConvo, ...updatedSaved];
    
    setSavedConversations(updatedSaved);
    setArchivedConversations(updatedArchived);
    localStorage.setItem('savedConversations', JSON.stringify(updatedSaved));
    localStorage.setItem('archivedConversations', JSON.stringify(updatedArchived));
    toast.success('Conversation saved');
  }, [messages, conversationTitle, selectedModels, savedConversations, archivedConversations]);
  
  const deleteChat = useCallback(() => {
    setMessages([]);
    setConversationTitle(`Chat ${id}`);
    toast.success('Chat deleted');
  }, [id]);
  
  const exportConversation = useCallback(() => {
    if (messages.length === 0) {
      toast.error('No messages to export');
      return;
    }
    
    const exportData = {
      title: conversationTitle,
      messages,
      models: selectedModels,
      exportedAt: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${conversationTitle.replace(/[^a-z0-9]/gi, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Conversation exported');
  }, [messages, conversationTitle, selectedModels]);
  
  // ============================================
  // ATTACHMENT HANDLERS
  // ============================================
  
  const handleAttach = useCallback(() => {
    fileInputRef.current?.click();
  }, []);
  
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    const newAttachments: Attachment[] = files.map(file => ({
      id: `${Date.now()}-${Math.random()}`,
      name: file.name,
      type: file.type,
      size: file.size,
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
    }));
    
    setAttachments(prev => [...prev, ...newAttachments]);
    toast.success(`${files.length} file(s) attached`);
    e.target.value = '';
  }, []);
  
  const removeAttachment = useCallback((index: number) => {
    setAttachments(prev => {
      const att = prev[index];
      if (att.preview) URL.revokeObjectURL(att.preview);
      return prev.filter((_, i) => i !== index);
    });
  }, []);
  
  // ============================================
  // TITLE HANDLERS
  // ============================================
  
  const handleRename = useCallback((newTitle: string) => {
    if (newTitle.trim()) {
      setConversationTitle(newTitle.trim());
      toast.success('Chat renamed');
    }
    setShowRenameDialog(false);
  }, []);
  
  const renameChat = useCallback(() => {
    setEditTitleValue(conversationTitle);
    setIsEditingTitle(true);
  }, [conversationTitle]);
  
  const handleTitleDoubleClick = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
    renameChat();
  }, [renameChat]);
  
  const handleTitleTap = useCallback((e: React.MouseEvent) => {
    const now = Date.now();
    if (lastTapRef.current && (now - lastTapRef.current < 300)) {
      e.preventDefault();
      e.stopPropagation();
      renameChat();
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
    }
  }, [renameChat]);
  
  // ============================================
  // MODEL HANDLERS
  // ============================================
  
  const toggleModel = useCallback((providerKey: string, model: string) => {
    const modelKey = `${providerKey}:${model}`;
    setSelectedModels(prev => 
      prev.includes(modelKey) 
        ? prev.filter(m => m !== modelKey)
        : [...prev, modelKey]
    );
  }, []);
  
  const applyPreset = useCallback((preset: { name: string; models: string[]; id?: string }) => {
    setSelectedModels(preset.models);
    setShowPresets(false);
    if (preset.id) {
      const newStats = trackPresetUsage(preset.id);
      setUsageStats(newStats);
    }
    toast.success(`Applied preset: ${preset.name}`);
  }, []);
  
  const handleSummarizer = useCallback(() => {
    if (selectedModels.length === 0) {
      toast.error('Please select at least one AI model');
      return;
    }
    
    const aiResponses = messages.filter(m => m.type === 'ai');
    if (aiResponses.length === 0) {
      toast.error('No AI responses to synthesize');
      return;
    }
    
    const synthesis: Message = {
      id: Date.now(),
      type: 'ai' as const,
      content: `**Synthesis of ${aiResponses.length} responses:**\n\n${aiResponses.map(r => r.content).join('\n\n---\n\n')}`,
      model: 'Synthesis',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, synthesis]);
    toast.success('Synthesis generated');
  }, [selectedModels, messages]);
  
  // ============================================
  // PRESET HANDLERS
  // ============================================
  
  const handleAddQuickPresets = useCallback((presets: Array<{ sourceId: string; sourceType: 'built-in' | 'custom'; name: string; models: string[] }>) => {
    const updated = addQuickPresets(quickPresets, presets);
    setQuickPresets(updated);
    saveQuickPresets(updated);
    toast.success(`Added ${presets.length} preset${presets.length > 1 ? 's' : ''} to Quick Presets`);
  }, [quickPresets]);
  
  const handleEditQuickPreset = useCallback((presetId: string) => {
    const preset = quickPresets.find(p => p.id === presetId);
    if (!preset) return;
    
    setEditingQuickPresetId(presetId);
    setEditingPreset({
      id: preset.id,
      name: preset.name,
      description: preset.description || '',
      models: preset.models,
      type: 'custom',
    });
    setShowPresetEditor(true);
  }, [quickPresets]);
  
  const handleRemoveQuickPreset = useCallback((presetId: string) => {
    const updated = removeQuickPreset(quickPresets, presetId);
    setQuickPresets(updated);
    saveQuickPresets(updated);
    toast.success('Preset removed from Quick Presets');
  }, [quickPresets]);
  
  const savePreset = useCallback((preset: CustomPreset) => {
    const updated = editingPreset
      ? customPresets.map(p => p.id === preset.id ? preset : p)
      : [...customPresets, preset];
    
    setCustomPresets(updated);
    localStorage.setItem('customPresets', JSON.stringify(updated));
    
    if (editingQuickPresetId) {
      const updatedQuick = updateQuickPreset(quickPresets, editingQuickPresetId, {
        name: preset.name,
        models: preset.models,
      });
      setQuickPresets(updatedQuick);
      saveQuickPresets(updatedQuick);
      setEditingQuickPresetId(null);
    }
    
    setShowPresetEditor(false);
    setEditingPreset(null);
  }, [editingPreset, customPresets, editingQuickPresetId, quickPresets]);
  
  // ============================================
  // CONVERSATION HANDLERS
  // ============================================
  
  const loadConversation = useCallback((convo: SavedConvo) => {
    setMessages(convo.messages || []);
    setConversationTitle(convo.title);
    setSelectedModels(convo.models || []);
    toast.success(`Loaded: ${convo.title}`);
  }, []);
  
  const handleDeleteSavedConversation = useCallback((convoId: string, isArchived: boolean) => {
    if (isArchived) {
      const updated = archivedConversations.filter(c => c.id !== convoId);
      setArchivedConversations(updated);
      localStorage.setItem('archivedConversations', JSON.stringify(updated));
    } else {
      const updated = savedConversations.filter(c => c.id !== convoId);
      setSavedConversations(updated);
      localStorage.setItem('savedConversations', JSON.stringify(updated));
    }
    toast.success('Conversation deleted');
  }, [archivedConversations, savedConversations]);
  
  const handleUpdateSavedConversation = useCallback((updatedConvo: SavedConvo, isArchived: boolean) => {
    if (isArchived) {
      const updated = archivedConversations.map(c => c.id === updatedConvo.id ? updatedConvo : c);
      setArchivedConversations(updated);
      localStorage.setItem('archivedConversations', JSON.stringify(updated));
    } else {
      const updated = savedConversations.map(c => c.id === updatedConvo.id ? updatedConvo : c);
      setSavedConversations(updated);
      localStorage.setItem('savedConversations', JSON.stringify(updated));
    }
  }, [archivedConversations, savedConversations]);
  
  // ============================================
  // KEYBOARD SHORTCUTS
  // ============================================
  
  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);
  
  useKeyboardShortcuts({
    enabled: true,
    shortcuts: [
      { ...SHORTCUT_KEYS.NEW_CHAT, action: newChat },
      { ...SHORTCUT_KEYS.SAVE_CHAT, action: saveConversation },
      { ...SHORTCUT_KEYS.SEARCH, action: () => setShowSavedConversationsModal(true) },
      { ...SHORTCUT_KEYS.SETTINGS, action: () => setShowSettings(true) },
      { ...SHORTCUT_KEYS.CLEAR_CHAT, action: clearChat },
      { ...SHORTCUT_KEYS.FOCUS_INPUT, action: focusInput },
      { key: '?', action: () => setShowKeyboardHelp(prev => !prev), description: 'Toggle Keyboard Help' },
      { ...SHORTCUT_KEYS.CLOSE, action: () => {
        if (showKeyboardHelp) setShowKeyboardHelp(false);
        else if (showSavedConversationsModal) setShowSavedConversationsModal(false);
        else if (showAnalytics) setShowAnalytics(false);
        else if (showSettings) setShowSettings(false);
        else if (showModelSelector) setShowModelSelector(false);
        else if (showPresets) setShowPresets(false);
      }},
    ],
  });
  
  // ============================================
  // WINDOW STYLES
  // ============================================
  
  const windowStyle: React.CSSProperties = isMaximized
    ? { top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%', borderRadius: 0 }
    : { top: position.y, left: position.x, width: `min(${windowSize.width}px, 90vw)`, height: isMinimized ? 'auto' : `min(${windowSize.height}px, 90vh)` };
  
  if (isMinimized) return null;
  
  // ============================================
  // RENDER
  // ============================================
  
  return (
    <>
      {/* Hidden file input for attachments */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`fixed bg-background border border-border rounded-lg shadow-2xl overflow-hidden flex flex-col z-[200] ${isDragging ? 'cursor-grabbing' : ''} ${isResizing ? 'select-none' : ''}`}
        style={windowStyle}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between px-3 py-2 border-b border-border bg-card shrink-0"
          onDoubleClick={(e) => {
            const target = e.target as HTMLElement;
            if (target.tagName !== 'INPUT' && !target.closest('.no-drag')) {
              toggleMaximize();
            }
          }}
        >
          <div 
            className="drag-handle flex items-center gap-2 cursor-grab flex-1 min-w-0 mr-4 select-none"
            style={{ touchAction: 'none' }}
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
          >
            <div className="flex items-center justify-center text-muted-foreground/50 hover:text-foreground transition-colors">
              <GripHorizontal className="h-4 w-4" />
            </div>
            
            <MessageSquare className="h-4 w-4 text-primary shrink-0" />
            
            {isEditingTitle ? (
              <input
                autoFocus
                type="text"
                value={editTitleValue}
                onChange={(e) => setEditTitleValue(e.target.value)}
                onBlur={() => {
                  handleRename(editTitleValue);
                  setIsEditingTitle(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleRename(editTitleValue);
                    setIsEditingTitle(false);
                  } else if (e.key === 'Escape') {
                    setIsEditingTitle(false);
                    setEditTitleValue(conversationTitle);
                  }
                }}
                className="bg-background border border-primary/50 rounded px-1.5 py-0.5 text-sm w-full outline-none h-6 no-drag"
                onClick={(e) => e.stopPropagation()}
                onDoubleClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
              />
            ) : (
              <span 
                onClick={handleTitleTap}
                onDoubleClick={handleTitleDoubleClick}
                onPointerDown={(e) => e.stopPropagation()}
                className="font-medium text-sm truncate cursor-text hover:text-primary transition-colors select-none no-drag"
                title="Double click to rename"
              >
                {conversationTitle}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-1 shrink-0">
            <Button variant="ghost" size="icon" onClick={togglePin} className="h-7 w-7" title={isPinned ? 'Unpin' : 'Pin'}>
              <Pin className={`h-3.5 w-3.5 ${isPinned ? 'fill-current' : ''}`} />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleMinimize} className="h-7 w-7" title="Minimize">
              <Minus className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleMaximize} className="h-7 w-7" title={isMaximized ? 'Restore' : 'Maximize'}>
              {isMaximized ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7 text-destructive hover:text-destructive" title="Close">
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Model Selector Panel */}
        {showModelSelector && (
          <ModelSelector
            selectedModels={selectedModels}
            showPresets={showPresets}
            onToggleModel={toggleModel}
            onTogglePresets={() => setShowPresets(!showPresets)}
            onApplyPreset={applyPreset}
            onCreatePreset={() => {
              setEditingPreset(null);
              setShowPresetEditor(true);
            }}
            customPresets={customPresets}
            onEditPreset={(preset) => {
              setEditingPreset(preset);
              setShowPresetEditor(true);
            }}
            onDeletePreset={(presetId) => {
              const updated = customPresets.filter(p => p.id !== presetId);
              setCustomPresets(updated);
              localStorage.setItem('customPresets', JSON.stringify(updated));
              toast.success('Preset deleted');
            }}
          />
        )}

        {/* Presets Panel (standalone) */}
        {showPresets && !showModelSelector && (
          <div className="p-3 md:p-4 border-b border-border bg-muted/50 max-h-[50vh] overflow-y-auto">
            <div className="mb-3 p-3 bg-background rounded-lg">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <h3 className="text-sm font-medium shrink-0">Quick Presets</h3>
                <div className="flex items-center gap-1 flex-wrap">
                  <PresetSortDropdown currentSort={presetSortOption} onSortChange={setPresetSortOption} />
                  <Button variant="ghost" size="sm" onClick={() => setShowTemplates(true)} className="h-7 w-7 p-0" title="Browse templates">
                    <Layout className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = '.json';
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            const imported = importPresets(ev.target?.result as string);
                            if (imported) {
                              const updated = [...quickPresets, ...imported];
                              setQuickPresets(updated);
                              saveQuickPresets(updated);
                              toast.success(`Imported ${imported.length} preset(s)`);
                            } else {
                              toast.error('Invalid preset file');
                            }
                          };
                          reader.readAsText(file);
                        }
                      };
                      input.click();
                    }}
                    className="h-7 w-7 p-0"
                    title="Import presets"
                  >
                    <Upload className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const json = exportPresets(quickPresets);
                      const blob = new Blob([json], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `presets-${new Date().toISOString().split('T')[0]}.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                      toast.success('Presets exported');
                    }}
                    className="h-7 w-7 p-0"
                    title="Export presets"
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setShowStatsDashboard(true)} className="h-7 w-7 p-0" title="View statistics">
                    <BarChart2 className="h-3 w-3" />
                  </Button>
                  <Button
                    variant={bulkMode ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => {
                      setBulkMode(!bulkMode);
                      if (bulkMode) setSelectedPresetIds(new Set());
                    }}
                    className="h-7 w-7 p-0"
                    title={bulkMode ? "Exit bulk mode" : "Bulk operations"}
                  >
                    <CheckSquare className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setShowCustomCategoryModal(true)} className="h-7 w-7 p-0" title="Manage categories">
                    <FolderOpen className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setShowPresetSelection(true)} className="h-7 px-2 text-xs gap-1">
                    <Plus className="h-3 w-3" />
                    New
                  </Button>
                </div>
              </div>
              
              {/* Search bar */}
              <div className="relative mb-2">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search presets..."
                  value={presetSearchQuery}
                  onChange={(e) => setPresetSearchQuery(e.target.value)}
                  className="w-full h-7 pl-7 pr-2 text-xs bg-muted/50 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              
              {/* Category filter */}
              <div className="flex items-center gap-1 mb-3 overflow-x-auto pb-1">
                <Button
                  variant={selectedCategory === null ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedCategory(null)}
                  className="h-6 px-2 text-xs shrink-0"
                >
                  All
                </Button>
                {categories.map((cat) => (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setSelectedCategory(cat)}
                    className="h-6 px-2 text-xs shrink-0"
                  >
                    {cat}
                  </Button>
                ))}
              </div>
              
              {/* Bulk operations bar */}
              {bulkMode && (
                <BulkOperationsBar
                  selectedIds={selectedPresetIds}
                  presets={quickPresets}
                  onSelectionChange={setSelectedPresetIds}
                  onPresetsChange={(updated) => {
                    setQuickPresets(updated);
                    saveQuickPresets(updated);
                  }}
                  onExitBulkMode={() => {
                    setBulkMode(false);
                    setSelectedPresetIds(new Set());
                  }}
                />
              )}
              
              {/* Recommendations */}
              {showRecommendations && quickPresets.length > 0 && !presetSearchQuery && !selectedCategory && !bulkMode && (
                <PresetRecommendations
                  presets={quickPresets}
                  usageStats={usageStats}
                  currentModels={selectedModels}
                  onApplyPreset={(preset) => applyPreset({ id: preset.id, name: preset.name, models: preset.models })}
                  onDismiss={() => setShowRecommendations(false)}
                  className="mb-3"
                />
              )}
              
              {/* Preset list - Simplified for better mobile performance */}
              <div className="space-y-1">
                {filteredPresets.map((preset, index) => {
                  const originalIndex = filteredToOriginalIndex.get(index) ?? index;
                  const isDragging = draggedPresetIndex === originalIndex;
                  
                  return (
                    <div
                      key={preset.id}
                      draggable={canDragPresets && !bulkMode}
                      onDragStart={() => {
                        if (!canDragPresets || bulkMode) return;
                        setDraggedPresetIndex(originalIndex);
                      }}
                      onDragOver={(e) => {
                        if (!canDragPresets || bulkMode) return;
                        e.preventDefault();
                      }}
                      onDrop={() => {
                        if (!canDragPresets || bulkMode || draggedPresetIndex === null) return;
                        if (draggedPresetIndex !== originalIndex) {
                          const reordered = reorderQuickPresets(quickPresets, draggedPresetIndex, originalIndex);
                          setQuickPresets(reordered);
                          saveQuickPresets(reordered);
                        }
                        setDraggedPresetIndex(null);
                      }}
                      onDragEnd={() => setDraggedPresetIndex(null)}
                      className={`flex items-center gap-1 ${isDragging ? 'opacity-50' : ''}`}
                    >
                      {bulkMode && (
                        <input
                          type="checkbox"
                          checked={selectedPresetIds.has(preset.id)}
                          onChange={(e) => {
                            const newSet = new Set(selectedPresetIds);
                            if (e.target.checked) newSet.add(preset.id);
                            else newSet.delete(preset.id);
                            setSelectedPresetIds(newSet);
                          }}
                          className="h-4 w-4 rounded border-border shrink-0"
                        />
                      )}
                      
                      {/* Main preset button */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => applyPreset({ id: preset.id, name: preset.name, models: preset.models })}
                        className="flex-1 justify-between text-xs h-8 min-w-0"
                      >
                        <span className="flex items-center gap-1 flex-1 text-left truncate min-w-0">
                          {preset.isFavorite && <Star className="h-3 w-3 fill-yellow-500 text-yellow-500 shrink-0" />}
                          <span className="truncate">{preset.name}</span>
                          {preset.isModified && <span className="text-[8px] text-muted-foreground shrink-0">(modified)</span>}
                        </span>
                        <span className="ml-2 px-2 py-0.5 bg-primary/10 text-primary rounded-full text-[10px] font-medium shrink-0">
                          {preset.models.length}
                        </span>
                      </Button>
                      
                      {/* Single action menu for all preset operations - reduces DOM complexity */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 shrink-0"
                            title="Actions"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem
                            onClick={() => {
                              const updated = toggleFavorite(quickPresets, preset.id);
                              setQuickPresets(updated);
                              saveQuickPresets(updated);
                            }}
                          >
                            <Star className={`h-4 w-4 mr-2 ${preset.isFavorite ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                            {preset.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem onClick={() => handleEditQuickPreset(preset.id)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit preset
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem
                            onClick={() => {
                              const updated = duplicatePreset(quickPresets, preset.id);
                              setQuickPresets(updated);
                              saveQuickPresets(updated);
                              toast.success('Preset duplicated');
                            }}
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem
                            onClick={() => {
                              const shareUrl = generateShareableUrl(preset);
                              navigator.clipboard.writeText(shareUrl);
                              toast.success('Share link copied to clipboard!');
                            }}
                          >
                            <Share2 className="h-4 w-4 mr-2" />
                            Copy share link
                          </DropdownMenuItem>
                          
                          <DropdownMenuSeparator />
                          
                          <DropdownMenuItem
                            onClick={() => handleRemoveQuickPreset(preset.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove preset
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  );
                })}
                {quickPresets.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-2">
                    No quick presets. Click "+ New" to add presets.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-center">
              <MessageSquare className="h-12 w-12 mb-3 opacity-50" />
              <p className="text-sm">No messages yet</p>
              <p className="text-xs mt-1">Select models and start chatting</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${msg.type === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  {msg.type === 'ai' && msg.model && (
                    <div className="text-xs text-muted-foreground mb-1 font-medium">{msg.model}</div>
                  )}
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg px-3 py-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <ChatFooter
          selectedModelsCount={selectedModels.length}
          inputMessage={inputMessage}
          onInputChange={setInputMessage}
          onModelsClick={() => {
            setShowPresets(false);
            setShowModelSelector(!showModelSelector);
          }}
          onSettingsClick={() => setShowSettings(!showSettings)}
          onSummarizerClick={handleSummarizer}
          onPresetsClick={() => {
            setShowPresets(!showPresets);
            setShowModelSelector(false);
          }}
          onNewChat={clearChat}
          onSave={saveConversation}
          onSend={handleSend}
          onAttach={handleAttach}
          isLoading={isLoading}
          onClearChat={clearChat}
          onDeleteChat={deleteChat}
          onRenameChat={renameChat}
          onShowAnalytics={() => setShowAnalytics(true)}
          onExportData={exportConversation}
          onPresetsSettings={() => setShowPresetsManagement(true)}
          messagesCount={messages.length}
          attachments={attachments}
          onRemoveAttachment={removeAttachment}
          savedConversations={savedConversations}
          onLoadConversation={loadConversation}
          onViewAllSaved={() => setShowSavedConversationsModal(true)}
          archivedCount={archivedConversations.length}
        />
        
        {/* Resize Handles */}
        {!isMaximized && (
          <>
            {/* Edge handles */}
            <div className="absolute top-0 left-3 right-3 h-1.5 cursor-n-resize hover:bg-primary/20 transition-colors" onMouseDown={(e) => handleResizeStart(e, 'n')} onTouchStart={(e) => handleResizeStart(e, 'n')} />
            <div className="absolute bottom-0 left-3 right-3 h-1.5 cursor-s-resize hover:bg-primary/20 transition-colors" onMouseDown={(e) => handleResizeStart(e, 's')} onTouchStart={(e) => handleResizeStart(e, 's')} />
            <div className="absolute left-0 top-3 bottom-3 w-1.5 cursor-w-resize hover:bg-primary/20 transition-colors" onMouseDown={(e) => handleResizeStart(e, 'w')} onTouchStart={(e) => handleResizeStart(e, 'w')} />
            <div className="absolute right-0 top-3 bottom-3 w-1.5 cursor-e-resize hover:bg-primary/20 transition-colors" onMouseDown={(e) => handleResizeStart(e, 'e')} onTouchStart={(e) => handleResizeStart(e, 'e')} />
            
            {/* Corner handles */}
            <div className="absolute top-0 left-0 w-3 h-3 cursor-nw-resize hover:bg-primary/20 transition-colors" onMouseDown={(e) => handleResizeStart(e, 'nw')} onTouchStart={(e) => handleResizeStart(e, 'nw')} />
            <div className="absolute top-0 right-0 w-3 h-3 cursor-ne-resize hover:bg-primary/20 transition-colors" onMouseDown={(e) => handleResizeStart(e, 'ne')} onTouchStart={(e) => handleResizeStart(e, 'ne')} />
            <div className="absolute bottom-0 left-0 w-3 h-3 cursor-sw-resize hover:bg-primary/20 transition-colors" onMouseDown={(e) => handleResizeStart(e, 'sw')} onTouchStart={(e) => handleResizeStart(e, 'sw')} />
            <div className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize hover:bg-primary/20 transition-colors" onMouseDown={(e) => handleResizeStart(e, 'se')} onTouchStart={(e) => handleResizeStart(e, 'se')} />
          </>
        )}
      </motion.div>

      {/* Modals */}
      {showSettings && <SettingsMenu onClose={() => setShowSettings(false)} onPresetsManagement={() => setShowPresetsManagement(true)} />}
      
      {showAnalytics && (
        <AnalyticsPanel 
          isOpen={showAnalytics}
          onClose={() => setShowAnalytics(false)} 
          messages={messages} 
          conversationTitle={conversationTitle}
        />
      )}
      
      {showPresetEditor && (
        <PresetEditorModal
          isOpen={showPresetEditor}
          editingPreset={editingPreset}
          onSave={savePreset}
          onClose={() => {
            setShowPresetEditor(false);
            setEditingPreset(null);
            setEditingQuickPresetId(null);
          }}
        />
      )}
      
      {showPresetsManagement && (
        <PresetsManagementModal
          AI_PROVIDERS={AI_PROVIDERS}
          customPresets={customPresets}
          builtInPresets={MODEL_PRESETS}
          defaultModels={selectedModels}
          onClose={() => setShowPresetsManagement(false)}
          onSaveCustomPresets={(presets) => {
            setCustomPresets(presets);
            localStorage.setItem('customPresets', JSON.stringify(presets));
          }}
          onSaveDefaultModels={(models) => setSelectedModels(models)}
        />
      )}
      
      {showPresetSelection && (
        <PresetSelectionDialog
          open={showPresetSelection}
          onOpenChange={(open) => setShowPresetSelection(open)}
          customPresets={customPresets}
          quickPresets={quickPresets}
          onAdd={handleAddQuickPresets}
        />
      )}
      
      {showSavedConversationsModal && (
        <SavedConversationsModal
          isOpen={showSavedConversationsModal}
          onClose={() => setShowSavedConversationsModal(false)}
          savedConversations={savedConversations}
          archivedConversations={archivedConversations}
          onLoadConversation={loadConversation}
          onDeleteConversation={handleDeleteSavedConversation}
          onUpdateConversation={handleUpdateSavedConversation}
          onImport={(saved, archived) => {
            setSavedConversations(saved);
            setArchivedConversations(archived);
            localStorage.setItem('savedConversations', JSON.stringify(saved));
            localStorage.setItem('archivedConversations', JSON.stringify(archived));
          }}
        />
      )}
      
      {showKeyboardHelp && <KeyboardShortcutsHelp isOpen={showKeyboardHelp} onClose={() => setShowKeyboardHelp(false)} />}
      
      {showTemplates && (
        <PresetTemplatesModal
          open={showTemplates}
          onOpenChange={(open) => setShowTemplates(open)}
          existingPresetNames={quickPresets.map(p => p.name)}
          onAddPreset={(preset) => {
            const updated = [...quickPresets, preset];
            setQuickPresets(updated);
            saveQuickPresets(updated);
            toast.success(`Added template: ${preset.name}`);
          }}
        />
      )}
      
      {showVersionHistory && (
        <PresetVersionHistoryModal
          open={showVersionHistory}
          onOpenChange={(open) => setShowVersionHistory(open)}
          presetId={versionHistoryPresetId}
          presetName={versionHistoryPresetName}
          onRestore={(version) => {
            const updated = restorePresetVersion(quickPresets, versionHistoryPresetId, version);
            setQuickPresets(updated);
            saveQuickPresets(updated);
            toast.success('Preset restored to previous version');
          }}
        />
      )}
      
      {showStatsDashboard && (
        <PresetStatsDashboard
          presets={quickPresets}
          usageStats={usageStats}
          onClose={() => setShowStatsDashboard(false)}
        />
      )}
      
      {showCustomCategoryModal && (
        <CustomCategoryModal
          onClose={() => setShowCustomCategoryModal(false)}
          onCategoriesChange={() => {
            setCategories(getAllCategories());
          }}
        />
      )}
      
      {showRenameDialog && (
        <RenameChatDialog
          isOpen={showRenameDialog}
          currentTitle={conversationTitle}
          onRename={handleRename}
          onClose={() => setShowRenameDialog(false)}
        />
      )}
    </>
  );
}
