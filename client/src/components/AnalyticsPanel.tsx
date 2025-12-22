import { useEffect, useRef, useMemo } from 'react';
import { X, MessageSquare, Bot, Clock, TrendingUp, BarChart3, PieChart, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Chart from 'chart.js/auto';

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
  allConversations?: { messages: Message[]; timestamp: string }[];
}

export function AnalyticsPanel({ 
  isOpen, 
  onClose, 
  messages, 
  conversationTitle,
  allConversations = []
}: AnalyticsPanelProps) {
  const modelUsageChartRef = useRef<HTMLCanvasElement>(null);
  const dailyActivityChartRef = useRef<HTMLCanvasElement>(null);
  const messageTypeChartRef = useRef<HTMLCanvasElement>(null);
  const modelUsageChartInstance = useRef<Chart | null>(null);
  const dailyActivityChartInstance = useRef<Chart | null>(null);
  const messageTypeChartInstance = useRef<Chart | null>(null);

  // Calculate statistics
  const stats = useMemo(() => {
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
    
    // Calculate daily message volume from all conversations
    const dailyVolume: Record<string, { user: number; ai: number }> = {};
    const allMessages = allConversations.length > 0 
      ? allConversations.flatMap(c => c.messages || [])
      : messages;
    
    allMessages.forEach(msg => {
      if (msg.timestamp) {
        const date = new Date(msg.timestamp).toLocaleDateString();
        if (!dailyVolume[date]) {
          dailyVolume[date] = { user: 0, ai: 0 };
        }
        if (msg.type === 'user') {
          dailyVolume[date].user++;
        } else if (msg.type === 'ai') {
          dailyVolume[date].ai++;
        }
      }
    });

    // Calculate global model usage from all conversations
    const globalModelUsage: Record<string, number> = {};
    allMessages.forEach(msg => {
      if (msg.type === 'ai' && msg.provider && msg.model) {
        const key = `${msg.provider}:${msg.model}`;
        globalModelUsage[key] = (globalModelUsage[key] || 0) + 1;
      }
    });

    // Calculate average response time (estimate based on message pairs)
    let totalResponseTime = 0;
    let responseCount = 0;
    for (let i = 1; i < messages.length; i++) {
      if (messages[i].type === 'ai' && messages[i - 1].type === 'user') {
        const timeDiff = new Date(messages[i].timestamp).getTime() - new Date(messages[i - 1].timestamp).getTime();
        if (timeDiff > 0 && timeDiff < 60000) { // Only count if less than 1 minute
          totalResponseTime += timeDiff;
          responseCount++;
        }
      }
    }
    const avgResponseTime = responseCount > 0 
      ? (totalResponseTime / responseCount / 1000).toFixed(1) + 's'
      : 'N/A';

    return {
      userMessages,
      aiMessages,
      totalMessages,
      modelUsage,
      globalModelUsage,
      duration,
      dailyVolume,
      avgResponseTime,
    };
  }, [messages, allConversations]);

  // Initialize charts
  useEffect(() => {
    if (!isOpen) return;

    // Destroy existing charts
    if (modelUsageChartInstance.current) {
      modelUsageChartInstance.current.destroy();
    }
    if (dailyActivityChartInstance.current) {
      dailyActivityChartInstance.current.destroy();
    }
    if (messageTypeChartInstance.current) {
      messageTypeChartInstance.current.destroy();
    }

    // Model Usage Pie Chart
    if (modelUsageChartRef.current && Object.keys(stats.globalModelUsage).length > 0) {
      const ctx = modelUsageChartRef.current.getContext('2d');
      if (ctx) {
        const labels = Object.keys(stats.globalModelUsage).map(k => k.split(':')[1] || k);
        const data = Object.values(stats.globalModelUsage);
        const colors = [
          'rgba(99, 102, 241, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(234, 179, 8, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(249, 115, 22, 0.8)',
        ];

        modelUsageChartInstance.current = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels,
            datasets: [{
              data,
              backgroundColor: colors.slice(0, data.length),
              borderWidth: 0,
            }],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  color: 'rgba(255, 255, 255, 0.7)',
                  padding: 12,
                  font: { size: 11 },
                },
              },
            },
          },
        });
      }
    }

    // Daily Activity Bar Chart
    if (dailyActivityChartRef.current && Object.keys(stats.dailyVolume).length > 0) {
      const ctx = dailyActivityChartRef.current.getContext('2d');
      if (ctx) {
        const sortedDates = Object.keys(stats.dailyVolume).sort((a, b) => 
          new Date(a).getTime() - new Date(b).getTime()
        ).slice(-7); // Last 7 days
        
        const userCounts = sortedDates.map(d => stats.dailyVolume[d]?.user || 0);
        const aiCounts = sortedDates.map(d => stats.dailyVolume[d]?.ai || 0);
        const labels = sortedDates.map(d => {
          const date = new Date(d);
          return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        });

        dailyActivityChartInstance.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels,
            datasets: [
              {
                label: 'User Messages',
                data: userCounts,
                backgroundColor: 'rgba(99, 102, 241, 0.7)',
                borderRadius: 4,
              },
              {
                label: 'AI Responses',
                data: aiCounts,
                backgroundColor: 'rgba(168, 85, 247, 0.7)',
                borderRadius: 4,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                grid: { display: false },
                ticks: { color: 'rgba(255, 255, 255, 0.5)', font: { size: 10 } },
              },
              y: {
                beginAtZero: true,
                grid: { color: 'rgba(255, 255, 255, 0.1)' },
                ticks: { color: 'rgba(255, 255, 255, 0.5)', font: { size: 10 } },
              },
            },
            plugins: {
              legend: {
                position: 'top',
                labels: {
                  color: 'rgba(255, 255, 255, 0.7)',
                  padding: 12,
                  font: { size: 11 },
                },
              },
            },
          },
        });
      }
    }

    // Message Type Distribution Chart
    if (messageTypeChartRef.current && stats.totalMessages > 0) {
      const ctx = messageTypeChartRef.current.getContext('2d');
      if (ctx) {
        messageTypeChartInstance.current = new Chart(ctx, {
          type: 'pie',
          data: {
            labels: ['User Messages', 'AI Responses'],
            datasets: [{
              data: [stats.userMessages.length, stats.aiMessages.length],
              backgroundColor: [
                'rgba(99, 102, 241, 0.8)',
                'rgba(168, 85, 247, 0.8)',
              ],
              borderWidth: 0,
            }],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  color: 'rgba(255, 255, 255, 0.7)',
                  padding: 12,
                  font: { size: 11 },
                },
              },
            },
          },
        });
      }
    }

    return () => {
      if (modelUsageChartInstance.current) {
        modelUsageChartInstance.current.destroy();
      }
      if (dailyActivityChartInstance.current) {
        dailyActivityChartInstance.current.destroy();
      }
      if (messageTypeChartInstance.current) {
        messageTypeChartInstance.current.destroy();
      }
    };
  }, [isOpen, stats]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="relative bg-card border border-border rounded-xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="sticky top-0 bg-card/95 backdrop-blur-sm border-b border-border px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Advanced Analytics
            </h2>
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
        <div className="p-6 space-y-8">
          {/* Overview Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-4 w-4 text-indigo-400" />
                <span className="text-sm text-muted-foreground">Total Messages</span>
              </div>
              <div className="text-3xl font-bold text-indigo-400">{stats.totalMessages}</div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Bot className="h-4 w-4 text-purple-400" />
                <span className="text-sm text-muted-foreground">AI Responses</span>
              </div>
              <div className="text-3xl font-bold text-purple-400">{stats.aiMessages.length}</div>
            </div>
            
            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-green-400" />
                <span className="text-sm text-muted-foreground">Duration</span>
              </div>
              <div className="text-3xl font-bold text-green-400">{stats.duration}m</div>
            </div>
            
            <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-4 w-4 text-amber-400" />
                <span className="text-sm text-muted-foreground">Avg Response</span>
              </div>
              <div className="text-3xl font-bold text-amber-400">{stats.avgResponseTime}</div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Model Usage Chart */}
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <PieChart className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Model Usage Distribution</h3>
              </div>
              <div className="h-[250px] flex items-center justify-center">
                {Object.keys(stats.globalModelUsage).length > 0 ? (
                  <canvas ref={modelUsageChartRef} />
                ) : (
                  <p className="text-sm text-muted-foreground">No model data available</p>
                )}
              </div>
            </div>

            {/* Message Type Distribution */}
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Message Distribution</h3>
              </div>
              <div className="h-[250px] flex items-center justify-center">
                {stats.totalMessages > 0 ? (
                  <canvas ref={messageTypeChartRef} />
                ) : (
                  <p className="text-sm text-muted-foreground">No messages yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Daily Activity Chart */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Daily Message Volume (Last 7 Days)</h3>
            </div>
            <div className="h-[200px]">
              {Object.keys(stats.dailyVolume).length > 0 ? (
                <canvas ref={dailyActivityChartRef} />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">No activity data available</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Model Usage List */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Bot className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Model Performance</h3>
            </div>
            
            {Object.keys(stats.modelUsage).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(stats.modelUsage)
                  .sort(([, a], [, b]) => b - a)
                  .map(([modelKey, count]) => {
                    const [provider, model] = modelKey.split(':');
                    const percentage = (count / stats.aiMessages.length) * 100;
                    
                    return (
                      <div key={modelKey} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{model}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                              {provider}
                            </span>
                          </div>
                          <span className="text-muted-foreground">
                            {count} ({percentage.toFixed(0)}%)
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
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
          
          {/* Conversation Timeline */}
          {messages.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="font-semibold mb-4">Session Timeline</h3>
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
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Total Duration</span>
                  <span className="font-medium">{stats.duration} minutes</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Models Used</span>
                  <span className="font-medium">{Object.keys(stats.modelUsage).length}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
