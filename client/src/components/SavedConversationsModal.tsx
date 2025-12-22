import { useState, useEffect } from 'react';
import { useCloudSync } from '@/hooks/useCloudSync';
import { useAuth } from '@/_core/hooks/useAuth';
import { X, Search, Download, Upload, Trash2, MessageSquare, Archive, Tag, Plus, Cloud, CloudOff, RefreshCw, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SavedConversation } from './ChatFooter';
import { toast } from 'sonner';

interface SavedConversationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedConversations: SavedConversation[];
  archivedConversations: SavedConversation[];
  onLoadConversation: (convo: SavedConversation) => void;
  onDeleteConversation: (id: string, isArchived: boolean) => void;
  onUpdateConversation: (updatedConvo: SavedConversation, isArchived: boolean) => void;
  onImport: (saved: SavedConversation[], archived: SavedConversation[]) => void;
}

export function SavedConversationsModal({
  isOpen,
  onClose,
  savedConversations,
  archivedConversations,
  onLoadConversation,
  onDeleteConversation,
  onUpdateConversation,
  onImport
}: SavedConversationsModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'saved' | 'archived'>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  
  const { user, isAuthenticated } = useAuth();
  const loginUrl = '/login'; // Default login URL
  const {
    isSyncing,
    cloudRecentConversations,
    cloudArchivedConversations,
    syncAllToCloud,
    refreshFromCloud,
  } = useCloudSync({
    onSyncComplete: () => toast.success('Synced with cloud'),
    onSyncError: (error) => toast.error(`Sync failed: ${error.message}`),
  });

  // Extract all unique tags from conversations
  useEffect(() => {
    const allConvos = [...savedConversations, ...archivedConversations];
    const tags = new Set<string>();
    allConvos.forEach(convo => {
      if ((convo as any).tags && Array.isArray((convo as any).tags)) {
        (convo as any).tags.forEach((tag: string) => tags.add(tag));
      }
    });
    setAvailableTags(Array.from(tags).sort());
  }, [savedConversations, archivedConversations]);

  if (!isOpen) return null;

  // Filter conversations based on search query, tab, and tags
  const filterConversations = (convos: SavedConversation[]) => {
    return convos.filter(convo => {
      // Search filter
      const matchesSearch = 
        convo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (convo.messages && convo.messages.some(m => 
          typeof m.content === 'string' && m.content.toLowerCase().includes(searchQuery.toLowerCase())
        ));
      
      // Tag filter
      const convoTags = (convo as any).tags || [];
      const matchesTags = selectedTags.length === 0 || 
        selectedTags.every(tag => convoTags.includes(tag));
        
      return matchesSearch && matchesTags;
    });
  };

  const filteredSaved = filterConversations(savedConversations);
  const filteredArchived = filterConversations(archivedConversations);
  
  const displayedConversations = activeTab === 'saved' 
    ? filteredSaved 
    : activeTab === 'archived' 
      ? filteredArchived 
      : [...filteredSaved, ...filteredArchived].sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

  const handleExportAll = () => {
    const data = {
      saved: savedConversations,
      archived: archivedConversations,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `multi-ai-chat-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('All conversations exported successfully');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const data = JSON.parse(content);
        
        if (!data.saved && !data.archived) {
          toast.error('Invalid backup file format');
          return;
        }

        // Merge imported conversations with existing ones, avoiding duplicates by ID
        const mergeConversations = (existing: SavedConversation[], imported: SavedConversation[]) => {
          const existingIds = new Set(existing.map(c => c.id));
          const newConvos = imported.filter(c => !existingIds.has(c.id));
          return [...existing, ...newConvos];
        };

        const newSaved = mergeConversations(savedConversations, data.saved || []);
        const newArchived = mergeConversations(archivedConversations, data.archived || []);

        // Update parent state via callback if we had one, but here we need to update localStorage directly
        // and trigger a reload or use a prop callback to update parent state
        // Since we don't have a direct "setAllConversations" prop, we'll use the onUpdateConversation for each new one
        // But that's inefficient. Let's add a onImport prop to the component.
        
        // For now, let's just call onUpdateConversation for the first one to trigger a refresh if possible,
        // but really we should update the interface to support bulk import.
        // Let's modify the component props to support bulk import.
        
        onImport(newSaved, newArchived);
        toast.success(`Imported ${newSaved.length - savedConversations.length + newArchived.length - archivedConversations.length} conversations`);
      } catch (error) {
        console.error('Import error:', error);
        toast.error('Failed to parse backup file');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  const handleAddTag = (convo: SavedConversation, isArchived: boolean) => {
    const tag = prompt('Enter a tag name:');
    if (!tag) return;
    
    const cleanTag = tag.trim();
    if (!cleanTag) return;
    
    const currentTags = (convo as any).tags || [];
    if (currentTags.includes(cleanTag)) {
      toast.error('Tag already exists');
      return;
    }
    
    const updatedConvo = {
      ...convo,
      tags: [...currentTags, cleanTag]
    };
    
    onUpdateConversation(updatedConvo, isArchived);
    toast.success(`Tag "${cleanTag}" added`);
  };

  const handleRemoveTag = (convo: SavedConversation, tagToRemove: string, isArchived: boolean) => {
    const currentTags = (convo as any).tags || [];
    const updatedConvo = {
      ...convo,
      tags: currentTags.filter((t: string) => t !== tagToRemove)
    };
    
    onUpdateConversation(updatedConvo, isArchived);
    toast.success(`Tag "${tagToRemove}" removed`);
  };

  const toggleTagFilter = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  return (
    <div 
      className="fixed inset-0 z-[400] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => {
        // Close when clicking the backdrop (outside the modal)
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-background border border-border rounded-lg shadow-xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
          <div className="flex items-center gap-3">
            <Archive className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Saved Conversations</h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="absolute inset-0 opacity-0 cursor-pointer"
                title="Import Backup"
              />
              <Button variant="outline" size="sm" className="gap-2">
                <Upload className="h-4 w-4" />
                Import
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={handleExportAll} className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
            
            {/* Cloud Sync Button */}
            {isAuthenticated ? (
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refreshFromCloud()}
                  disabled={isSyncing}
                  className="gap-2"
                  title="Refresh from cloud"
                >
                  <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => {
                    const localRecent = savedConversations.map(c => ({
                      id: c.id,
                      title: c.title,
                      messages: c.messages || [],
                      models: c.models || [],
                      tags: (c as any).tags,
                      timestamp: c.timestamp,
                    }));
                    const localArchived = archivedConversations.map(c => ({
                      id: c.id,
                      title: c.title,
                      messages: c.messages || [],
                      models: c.models || [],
                      tags: (c as any).tags,
                      timestamp: c.timestamp,
                    }));
                    syncAllToCloud(localRecent, localArchived);
                  }}
                  disabled={isSyncing}
                  className="gap-2"
                >
                  <Cloud className={`h-4 w-4 ${isSyncing ? 'animate-pulse' : ''}`} />
                  {isSyncing ? 'Syncing...' : 'Sync to Cloud'}
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = loginUrl}
                className="gap-2"
              >
                <LogIn className="h-4 w-4" />
                Login to Sync
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="ml-2 hover:bg-destructive/20 hover:text-destructive"
              title="Close"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="p-4 border-b border-border space-y-4 bg-muted/30">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex bg-muted rounded-lg p-1 shrink-0">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'all' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveTab('saved')}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'saved' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Recent ({savedConversations.length})
              </button>
              <button
                onClick={() => setActiveTab('archived')}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'archived' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Archived ({archivedConversations.length})
              </button>
            </div>
          </div>

          {/* Tags Filter */}
          {availableTags.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs text-muted-foreground mr-1">Filter by tags:</span>
              {availableTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTagFilter(tag)}
                  className={`px-2 py-1 rounded-full text-xs border transition-colors flex items-center gap-1 ${
                    selectedTags.includes(tag)
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'bg-background border-border text-muted-foreground hover:border-primary/50'
                  }`}
                >
                  <Tag className="h-3 w-3" />
                  {tag}
                </button>
              ))}
              {selectedTags.length > 0 && (
                <button
                  onClick={() => setSelectedTags([])}
                  className="text-xs text-muted-foreground hover:text-foreground underline ml-2"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {displayedConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-12">
              <Search className="h-12 w-12 mb-4 opacity-20" />
              <p>No conversations found</p>
            </div>
          ) : (
            displayedConversations.map((convo) => {
              const isArchived = archivedConversations.some(c => c.id === convo.id);
              const tags = (convo as any).tags || [];
              
              return (
                <div
                  key={convo.id}
                  className="group flex flex-col bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div 
                      className="flex-1 cursor-pointer"
                      onClick={() => {
                        onLoadConversation(convo);
                        onClose();
                      }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                          {convo.title}
                        </h3>
                        {isArchived && (
                          <span className="px-1.5 py-0.5 rounded bg-muted text-[10px] text-muted-foreground uppercase tracking-wider">
                            Archived
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mb-2">
                        {new Date(convo.timestamp).toLocaleString()} • {convo.models?.length || 0} models • {convo.messages?.length || 0} messages
                      </div>
                      
                      {/* Tags Display */}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {tags.map((tag: string) => (
                          <span 
                            key={tag} 
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/5 text-primary text-xs border border-primary/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleTagFilter(tag);
                            }}
                          >
                            {tag}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveTag(convo, tag, isArchived);
                              }}
                              className="hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddTag(convo, isArchived);
                          }}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs hover:bg-muted/80 transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                          Add Tag
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Are you sure you want to delete this conversation?')) {
                            onDeleteConversation(convo.id, isArchived);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        
        {/* Footer with Close Button */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-border bg-card">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
