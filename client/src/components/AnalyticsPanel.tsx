import { X, MessageSquare, Bot, Clock, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Message {
  id: string | number;
  type: 'user' | 'ai' | 'typing';
  provider?: string;
  model?: string;
  content?: string;
  timestamp: Date;
}

interface AnalyticsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  messages: Message[];
  conversationTitle: string;
}

export function AnalyticsPanel({ isOpen, onClose, messages, conversationTitle }: AnalyticsPanelProps) {
  if (!isOpen) return null;

  // Calculate statistics
  const userMessages = messages.filter(m => m.type === 'user');
  const aiMessages = messages.filter(m => m.type === 'ai');
  const totalMessages = userMessages.length + aiMessages.length;
  
  // Calculate model usage
  const modelUsage: Record<string, number> = {};
  aiMessages.forEach(msg => {
    if (msg.provider && msg.model) {
      const key = `${msg.provider}:${msg.model}`;
      modelUsage[key] = (modelUsage[key] || 0) + 1;
    }
  });
  
  // Calculate conversation duration
  const firstMessage = messages[0];
  const lastMessage = messages[messages.length - 1];
  const duration = firstMessage && lastMessage 
    ? Math.floor((new Date(lastMessage.timestamp).getTime() - new Date(firstMessage.timestamp).getTime()) / 1000 / 60)
    : 0;
  
  // Calculate average response time (mock calculation)
  const avgResponseTime = aiMessages.length > 0 ? '2.3s' : 'N/A';
  
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="relative bg-card border border-border rounded-lg shadow-2xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-auto">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Conversation Analytics</h2>
            <p className="text-sm text-muted-foreground">{conversationTitle}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-accent/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Total Messages</span>
              </div>
              <div className="text-2xl font-bold">{totalMessages}</div>
            </div>
            
            <div className="bg-accent/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">User Messages</span>
              </div>
              <div className="text-2xl font-bold">{userMessages.length}</div>
            </div>
            
            <div className="bg-accent/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Bot className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">AI Responses</span>
              </div>
              <div className="text-2xl font-bold">{aiMessages.length}</div>
            </div>
            
            <div className="bg-accent/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Duration</span>
              </div>
              <div className="text-2xl font-bold">{duration}m</div>
            </div>
          </div>
          
          {/* Model Usage */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Model Usage</h3>
            </div>
            
            {Object.keys(modelUsage).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(modelUsage)
                  .sort(([, a], [, b]) => b - a)
                  .map(([modelKey, count]) => {
                    const [provider, model] = modelKey.split(':');
                    const percentage = (count / aiMessages.length) * 100;
                    
                    return (
                      <div key={modelKey} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{model}</span>
                            <span className="text-muted-foreground">({provider})</span>
                          </div>
                          <span className="text-muted-foreground">{count} responses</span>
                        </div>
                        <div className="h-2 bg-accent rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No AI responses yet. Send a message to see model usage statistics.
              </p>
            )}
          </div>
          
          {/* Performance Metrics */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-border rounded-lg p-4">
                <div className="text-sm text-muted-foreground mb-1">Avg Response Time</div>
                <div className="text-xl font-semibold">{avgResponseTime}</div>
              </div>
              <div className="border border-border rounded-lg p-4">
                <div className="text-sm text-muted-foreground mb-1">Models Used</div>
                <div className="text-xl font-semibold">{Object.keys(modelUsage).length}</div>
              </div>
            </div>
          </div>
          
          {/* Conversation Timeline */}
          {messages.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Timeline</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Started</span>
                  <span className="font-medium">
                    {new Date(messages[0].timestamp).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Last Activity</span>
                  <span className="font-medium">
                    {new Date(messages[messages.length - 1].timestamp).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Total Duration</span>
                  <span className="font-medium">{duration} minutes</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
