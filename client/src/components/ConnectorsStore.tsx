import { useState } from 'react';
import { Search, X, Check, ExternalLink, Globe, Database, FileText, Mail, Calendar, MessageSquare, Github, Trello, Slack, Figma } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface Connector {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'productivity' | 'development' | 'communication' | 'design' | 'data';
  connected: boolean;
}

interface ConnectorsStoreProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ConnectorsStore({ isOpen, onClose }: ConnectorsStoreProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  
  // Mock data for connectors
  const [connectors, setConnectors] = useState<Connector[]>([
    {
      id: 'web-search',
      name: 'Web Search',
      description: 'Search the internet for real-time information and news.',
      icon: <Globe className="h-6 w-6 text-blue-500" />,
      category: 'data',
      connected: false
    },
    {
      id: 'google-drive',
      name: 'Google Drive',
      description: 'Access your documents, spreadsheets, and presentations.',
      icon: <Database className="h-6 w-6 text-green-500" />,
      category: 'productivity',
      connected: false
    },
    {
      id: 'notion',
      name: 'Notion',
      description: 'Connect to your Notion workspace to read and write pages.',
      icon: <FileText className="h-6 w-6 text-black dark:text-white" />,
      category: 'productivity',
      connected: false
    },
    {
      id: 'gmail',
      name: 'Gmail',
      description: 'Read, draft, and send emails directly from chat.',
      icon: <Mail className="h-6 w-6 text-red-500" />,
      category: 'communication',
      connected: false
    },
    {
      id: 'google-calendar',
      name: 'Google Calendar',
      description: 'Manage your schedule and create events.',
      icon: <Calendar className="h-6 w-6 text-blue-400" />,
      category: 'productivity',
      connected: false
    },
    {
      id: 'github',
      name: 'GitHub',
      description: 'Access repositories, issues, and pull requests.',
      icon: <Github className="h-6 w-6 text-black dark:text-white" />,
      category: 'development',
      connected: false
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Send messages and manage channels.',
      icon: <Slack className="h-6 w-6 text-purple-500" />,
      category: 'communication',
      connected: false
    },
    {
      id: 'trello',
      name: 'Trello',
      description: 'Manage boards, lists, and cards.',
      icon: <Trello className="h-6 w-6 text-blue-600" />,
      category: 'productivity',
      connected: false
    },
    {
      id: 'figma',
      name: 'Figma',
      description: 'Access design files and comments.',
      icon: <Figma className="h-6 w-6 text-orange-500" />,
      category: 'design',
      connected: false
    },
    {
      id: 'discord',
      name: 'Discord',
      description: 'Connect to Discord servers and channels.',
      icon: <MessageSquare className="h-6 w-6 text-indigo-500" />,
      category: 'communication',
      connected: false
    }
  ]);

  const handleConnect = (id: string) => {
    setConnectors(prev => prev.map(c => {
      if (c.id === id) {
        const newStatus = !c.connected;
        toast.success(newStatus ? `Connected to ${c.name}` : `Disconnected from ${c.name}`);
        return { ...c, connected: newStatus };
      }
      return c;
    }));
  };

  const filteredConnectors = connectors.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || c.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'productivity', label: 'Productivity' },
    { id: 'development', label: 'Development' },
    { id: 'communication', label: 'Communication' },
    { id: 'design', label: 'Design' },
    { id: 'data', label: 'Data' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold">Connectors Store</h2>
            <p className="text-sm text-muted-foreground">Connect your favorite tools and services</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="px-6 py-4 border-b border-border space-y-4 bg-muted/30">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search connectors..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-background"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
                  activeCategory === cat.id 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Connectors Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredConnectors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredConnectors.map(connector => (
                <div 
                  key={connector.id} 
                  className="flex items-start gap-4 p-4 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors group"
                >
                  <div className="shrink-0 p-2 bg-muted rounded-md group-hover:bg-background transition-colors">
                    {connector.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium truncate">{connector.name}</h3>
                      {connector.connected && (
                        <span className="flex items-center gap-1 text-[10px] font-medium text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded-full">
                          <Check className="h-3 w-3" /> Connected
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                      {connector.description}
                    </p>
                    <Button 
                      variant={connector.connected ? "outline" : "default"} 
                      size="sm" 
                      className="w-full h-8 text-xs"
                      onClick={() => handleConnect(connector.id)}
                    >
                      {connector.connected ? 'Disconnect' : 'Connect'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 text-muted-foreground">
              <div className="p-4 bg-muted rounded-full mb-4">
                <Search className="h-8 w-8 opacity-50" />
              </div>
              <p>No connectors found matching "{searchQuery}"</p>
              <Button 
                variant="link" 
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                }}
              >
                Clear filters
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border bg-muted/30 flex justify-between items-center text-xs text-muted-foreground">
          <span>{connectors.filter(c => c.connected).length} active connections</span>
          <a href="#" className="flex items-center gap-1 hover:text-primary transition-colors">
            Request a connector <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
