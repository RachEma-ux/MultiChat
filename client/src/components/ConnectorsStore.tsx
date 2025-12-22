import { useState, useEffect } from 'react';
import { Globe, Database, FileText, Mail, Calendar, Github, ChevronRight, Plus, Settings2, Chrome, X, Key, Sparkles, Search, Plug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Connector {
  id: string;
  name: string;
  icon: React.ReactNode;
  connected: boolean;
  description?: string;
}

interface ConnectorsStoreProps {
  isOpen: boolean;
  onClose: () => void;
}

type View = 'list' | 'add' | 'manage';
type Tab = 'apps' | 'api' | 'mcp';

export function ConnectorsStore({ isOpen, onClose }: ConnectorsStoreProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [currentView, setCurrentView] = useState<View>('list');
  const [activeTab, setActiveTab] = useState<Tab>('apps');

  // Handle animation states
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Small delay to allow DOM render before animating in
      requestAnimationFrame(() => setIsAnimating(true));
    } else {
      setIsAnimating(false);
      // Wait for animation to finish before hiding from DOM
      const timer = setTimeout(() => {
        setIsVisible(false);
        setCurrentView('list'); // Reset view on close
        setActiveTab('apps');
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Mock data for main list
  const [connectors, setConnectors] = useState<Connector[]>([
    {
      id: 'my-browser',
      name: 'My Browser',
      icon: <Chrome className="h-5 w-5" />,
      connected: false
    },
    {
      id: 'gmail',
      name: 'Gmail',
      icon: <Mail className="h-5 w-5 text-red-500" />,
      connected: false
    },
    {
      id: 'google-calendar',
      name: 'Google Calendar',
      icon: <Calendar className="h-5 w-5 text-blue-500" />,
      connected: false
    },
    {
      id: 'google-drive',
      name: 'Google Drive',
      icon: <Database className="h-5 w-5 text-green-500" />,
      connected: false
    },
    {
      id: 'outlook-mail',
      name: 'Outlook Mail',
      icon: <Mail className="h-5 w-5 text-blue-600" />,
      connected: false
    },
    {
      id: 'outlook-calendar',
      name: 'Outlook Calendar',
      icon: <Calendar className="h-5 w-5 text-blue-400" />,
      connected: false
    },
    {
      id: 'github',
      name: 'GitHub',
      icon: <Github className="h-5 w-5" />,
      connected: false
    }
  ]);

  // Mock data for "Add Connectors" -> Apps tab
  const appConnectors: Connector[] = [
    {
      id: 'my-browser-add',
      name: 'My Browser',
      description: 'Access the web on your own browser',
      icon: <Chrome className="h-6 w-6" />,
      connected: false
    },
    {
      id: 'gmail-add',
      name: 'Gmail',
      description: 'Draft replies, search your inbox, and summarize email threads instantly',
      icon: <Mail className="h-6 w-6 text-red-500" />,
      connected: false
    },
    {
      id: 'google-calendar-add',
      name: 'Google Calendar',
      description: 'Understand your schedule, manage events, and optimize your time effective...',
      icon: <Calendar className="h-6 w-6 text-blue-500" />,
      connected: false
    },
    {
      id: 'google-drive-add',
      name: 'Google Drive',
      description: 'Access your files, search instantly, and let Manus help you manage documents ...',
      icon: <Database className="h-6 w-6 text-green-500" />,
      connected: false
    },
    {
      id: 'outlook-mail-add',
      name: 'Outlook Mail',
      description: 'Write, search, and manage your Outlook emails seamlessly within Manus',
      icon: <Mail className="h-6 w-6 text-blue-600" />,
      connected: false
    },
    {
      id: 'outlook-calendar-add',
      name: 'Outlook Calendar',
      description: 'Schedule, view, and manage your Outlook events just with a prompt',
      icon: <Calendar className="h-6 w-6 text-blue-400" />,
      connected: false
    },
    {
      id: 'github-add',
      name: 'GitHub',
      description: 'Manage repositories, issues, and pull requests directly from chat',
      icon: <Github className="h-6 w-6" />,
      connected: false
    }
  ];

  // Mock data for "Add Connectors" -> Custom API tab
  const apiConnectors = [
    {
      id: 'openai',
      name: 'OpenAI',
      description: 'Leverage GPT model series for intelligent text generation and processing',
      icon: <Sparkles className="h-6 w-6 text-green-400" />
    },
    {
      id: 'anthropic',
      name: 'Anthropic',
      description: 'Access reliable AI assistant services with safe and intelligent conversations',
      icon: <div className="h-6 w-6 bg-white text-black rounded flex items-center justify-center font-bold text-[10px]">AI</div>
    },
    {
      id: 'google-gemini',
      name: 'Google Gemini',
      description: 'Process multimodal content including text, images, and code seamlessly',
      icon: <Sparkles className="h-6 w-6 text-blue-400" />
    },
    {
      id: 'perplexity',
      name: 'Perplexity',
      description: 'Search real-time information and get accurate answers with reliable citations',
      icon: <Search className="h-6 w-6 text-teal-400" />
    },
    {
      id: 'cohere',
      name: 'Cohere',
      description: 'Build enterprise AI applications and optimize text processing workflows',
      icon: <div className="h-6 w-6 bg-purple-500/20 text-purple-400 rounded flex items-center justify-center">Co</div>
    },
    {
      id: 'elevenlabs',
      name: 'ElevenLabs',
      description: 'Generate realistic speech and audio from text using advanced AI models',
      icon: <div className="h-6 w-6 bg-orange-500/20 text-orange-400 rounded flex items-center justify-center">11</div>
    }
  ];

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

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[400] flex flex-col justify-end pointer-events-none">
      {/* Backdrop */}
      <div 
        className={cn(
          "absolute inset-0 bg-black/60 transition-opacity duration-300 pointer-events-auto",
          isAnimating ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div 
        className={cn(
          "relative w-full bg-[#1C1C1E] rounded-t-[20px] overflow-hidden transition-transform duration-300 ease-out pointer-events-auto pb-safe flex flex-col",
          isAnimating ? "translate-y-0" : "translate-y-full",
          (currentView === 'add' || currentView === 'manage') ? "h-[85vh]" : "max-h-[85vh]"
        )}
      >
        {currentView === 'list' && (
          // === MAIN LIST VIEW ===
          <>
            {/* Drag Handle */}
            <div className="w-full flex justify-center pt-3 pb-2" onClick={onClose}>
              <div className="w-10 h-1 bg-zinc-600 rounded-full" />
            </div>

            {/* Header */}
            <div className="px-4 pb-4">
              <h2 className="text-lg font-semibold text-white">Connectors</h2>
            </div>

            {/* Connectors List */}
            <div className="px-4 space-y-0.5 max-h-[50vh] overflow-y-auto">
              {connectors.map(connector => (
                <div 
                  key={connector.id}
                  className="flex items-center justify-between py-2.5 px-2 hover:bg-white/5 rounded-lg transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-zinc-300 group-hover:text-white transition-colors">
                      {connector.icon}
                    </div>
                    <span className="text-[15px] font-medium text-zinc-200 group-hover:text-white transition-colors">
                      {connector.name}
                    </span>
                  </div>
                  <button
                    onClick={() => handleConnect(connector.id)}
                    className={cn(
                      "text-[15px] font-medium transition-colors",
                      connector.connected 
                        ? "text-primary" 
                        : "text-zinc-500 hover:text-zinc-300"
                    )}
                  >
                    {connector.connected ? 'Connected' : 'Connect'}
                  </button>
                </div>
              ))}
            </div>

            {/* Footer Actions */}
            <div className="mt-2 px-4 pb-8 pt-2">
              <div className="bg-white/5 rounded-xl overflow-hidden">
                <button 
                  onClick={() => setCurrentView('add')}
                  className="w-full flex items-center justify-between py-3.5 px-4 hover:bg-white/5 transition-colors group border-b border-white/5"
                >
                  <div className="flex items-center gap-3">
                    <Plus className="h-5 w-5 text-zinc-400 group-hover:text-zinc-300" />
                    <span className="text-[15px] font-medium text-zinc-300 group-hover:text-white">Add connectors</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-zinc-600 group-hover:text-zinc-500" />
                </button>
                
                <button 
                  onClick={() => setCurrentView('manage')}
                  className="w-full flex items-center justify-between py-3.5 px-4 hover:bg-white/5 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Settings2 className="h-5 w-5 text-zinc-400 group-hover:text-zinc-300" />
                    <span className="text-[15px] font-medium text-zinc-300 group-hover:text-white">Manage connectors</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-zinc-600 group-hover:text-zinc-500" />
                </button>
              </div>
            </div>
          </>
        )}

        {currentView === 'add' && (
          // === ADD CONNECTORS VIEW ===
          <div className="flex flex-col h-full">
            {/* Header with Close Button */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-white/5">
              <button 
                onClick={() => setCurrentView('list')}
                className="p-1 -ml-1 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
              <h2 className="text-lg font-semibold text-white absolute left-1/2 -translate-x-1/2">Connectors</h2>
              <div className="w-6" /> {/* Spacer for centering */}
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 px-4 py-4">
              {(['apps', 'api', 'mcp'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
                    activeTab === tab 
                      ? "bg-white text-black" 
                      : "bg-transparent text-zinc-400 border border-zinc-700 hover:border-zinc-500"
                  )}
                >
                  {tab === 'apps' ? 'Apps' : tab === 'api' ? 'Custom API' : 'Custom MCP'}
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto px-4 pb-8">
              {activeTab === 'apps' && (
                <div className="space-y-2">
                  {appConnectors.map(app => (
                    <div key={app.id} className="bg-white/5 rounded-xl p-4 flex items-start gap-4 hover:bg-white/10 transition-colors">
                      <div className="shrink-0 p-2 bg-zinc-800 rounded-lg">
                        {app.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-white text-[15px] mb-0.5">{app.name}</h3>
                        <p className="text-sm text-zinc-400 leading-snug line-clamp-2">{app.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'api' && (
                <div className="space-y-4">
                  <div className="bg-white/5 rounded-xl p-4 flex items-start gap-3">
                    <Key className="h-5 w-5 text-zinc-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-zinc-300 leading-snug">
                      Connect Manus programmatically to any third-party service using your own API keys.
                    </p>
                  </div>

                  <div className="space-y-2">
                    {apiConnectors.map(api => (
                      <div key={api.id} className="bg-white/5 rounded-xl p-4 flex items-start gap-4 hover:bg-white/10 transition-colors">
                        <div className="shrink-0 p-2 bg-zinc-800 rounded-lg">
                          {api.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-white text-[15px] mb-0.5">{api.name}</h3>
                          <p className="text-sm text-zinc-400 leading-snug line-clamp-2">{api.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'mcp' && (
                <div className="flex flex-col items-center justify-center h-[50vh] text-center px-8">
                  <div className="mb-6 text-zinc-600">
                    <Plug className="h-12 w-12 opacity-50" />
                  </div>
                  <h3 className="text-zinc-400 font-medium mb-2">No custom MCP added yet.</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">
                    Adding custom MCP is not supported on mobile; please visit our website.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {currentView === 'manage' && (
          // === MANAGE CONNECTORS VIEW ===
          <div className="flex flex-col h-full">
            {/* Header with Close Button and Add Icon */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-white/5">
              <button 
                onClick={() => setCurrentView('list')}
                className="p-1 -ml-1 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
              <h2 className="text-lg font-semibold text-white absolute left-1/2 -translate-x-1/2">Connected Apps</h2>
              <button 
                onClick={() => setCurrentView('add')}
                className="p-1 -mr-1 text-zinc-400 hover:text-white transition-colors"
              >
                <Plus className="h-6 w-6" />
              </button>
            </div>

            {/* Empty State Content */}
            <div className="flex flex-col items-center justify-center flex-1 text-center px-8 pb-20">
              <div className="mb-6 text-zinc-600">
                <Plug className="h-12 w-12 opacity-50" />
              </div>
              <p className="text-sm text-zinc-500 leading-relaxed mb-8 max-w-[280px]">
                Connect Manus with your everyday apps, APIs and MCPs
              </p>
              <Button 
                onClick={() => setCurrentView('add')}
                className="bg-white/10 hover:bg-white/20 text-white border-0 h-12 px-6 rounded-xl font-medium"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add connectors
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
