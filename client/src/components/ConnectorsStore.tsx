import { useState, useEffect } from 'react';
import { Globe, Database, FileText, Mail, Calendar, Github, ChevronRight, Plus, Settings2, Chrome } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Connector {
  id: string;
  name: string;
  icon: React.ReactNode;
  connected: boolean;
}

interface ConnectorsStoreProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ConnectorsStore({ isOpen, onClose }: ConnectorsStoreProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Handle animation states
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Small delay to allow DOM render before animating in
      requestAnimationFrame(() => setIsAnimating(true));
    } else {
      setIsAnimating(false);
      // Wait for animation to finish before hiding from DOM
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Mock data matching the screenshot
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
    <div className="fixed inset-0 z-[1200] flex flex-col justify-end pointer-events-none">
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
          "relative w-full bg-[#1C1C1E] rounded-t-[20px] overflow-hidden transition-transform duration-300 ease-out pointer-events-auto pb-safe",
          isAnimating ? "translate-y-0" : "translate-y-full"
        )}
      >
        {/* Drag Handle */}
        <div className="w-full flex justify-center pt-3 pb-2" onClick={onClose}>
          <div className="w-10 h-1 bg-zinc-600 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-4 pb-4">
          <h2 className="text-lg font-semibold text-white">Connectors</h2>
        </div>

        {/* Connectors List */}
        <div className="px-4 space-y-1 max-h-[60vh] overflow-y-auto">
          {connectors.map(connector => (
            <div 
              key={connector.id}
              className="flex items-center justify-between py-3 px-2 hover:bg-white/5 rounded-lg transition-colors group"
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
        <div className="mt-2 px-4 pb-8 pt-2 space-y-1">
          <button className="w-full flex items-center justify-between py-3 px-2 hover:bg-white/5 rounded-lg transition-colors group">
            <div className="flex items-center gap-3">
              <Plus className="h-5 w-5 text-zinc-400 group-hover:text-zinc-300" />
              <span className="text-[15px] font-medium text-zinc-400 group-hover:text-zinc-300">Add connectors</span>
            </div>
            <ChevronRight className="h-5 w-5 text-zinc-600 group-hover:text-zinc-500" />
          </button>
          
          <button className="w-full flex items-center justify-between py-3 px-2 hover:bg-white/5 rounded-lg transition-colors group">
            <div className="flex items-center gap-3">
              <Settings2 className="h-5 w-5 text-zinc-400 group-hover:text-zinc-300" />
              <span className="text-[15px] font-medium text-zinc-400 group-hover:text-zinc-300">Manage connectors</span>
            </div>
            <ChevronRight className="h-5 w-5 text-zinc-600 group-hover:text-zinc-500" />
          </button>
        </div>
      </div>
    </div>
  );
}
