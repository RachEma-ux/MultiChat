import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Send, Plus, X, Menu, Save, Download, Star, ThumbsUp, ThumbsDown, 
  MessageSquare, Grid, List, BarChart, Zap, GitCompare, Eye, EyeOff, Trash2
} from 'lucide-react';
import { toast } from 'sonner';

const AI_PROVIDERS = {
  anthropic: {
    name: 'Anthropic',
    models: ['Claude Sonnet 4.5', 'Claude Opus 4', 'Claude Haiku 4.5'],
    color: 'bg-orange-500',
    strengths: ['reasoning', 'ethics', 'long-form']
  },
  openai: {
    name: 'OpenAI',
    models: ['GPT-4', 'GPT-4 Turbo', 'GPT-3.5 Turbo'],
    color: 'bg-green-500',
    strengths: ['creative', 'code', 'general']
  },
  google: {
    name: 'Google',
    models: ['Gemini Pro', 'Gemini Ultra'],
    color: 'bg-blue-500',
    strengths: ['multimodal', 'search', 'analysis']
  },
  deepseek: {
    name: 'DeepSeek',
    models: ['DeepSeek V3', 'DeepSeek Coder', 'DeepSeek Chat'],
    color: 'bg-purple-500',
    strengths: ['technical', 'coding', 'math']
  },
  manus: {
    name: 'Manus',
    models: ['Manus Pro', 'Manus Standard'],
    color: 'bg-pink-500',
    strengths: ['general', 'creative']
  },
  kimi: {
    name: 'Kimi',
    models: ['Kimi Chat', 'Kimi Plus'],
    color: 'bg-cyan-500',
    strengths: ['conversation', 'general']
  },
  perplexity: {
    name: 'Perplexity',
    models: ['Perplexity Pro', 'Perplexity Standard'],
    color: 'bg-indigo-500',
    strengths: ['research', 'citations', 'facts']
  }
};

const MODEL_PRESETS = {
  'Coding Team': ['openai:GPT-4', 'deepseek:DeepSeek Coder', 'anthropic:Claude Sonnet 4.5'],
  'Creative Writers': ['openai:GPT-4 Turbo', 'anthropic:Claude Opus 4', 'manus:Manus Pro'],
  'Research Squad': ['perplexity:Perplexity Pro', 'google:Gemini Pro', 'anthropic:Claude Sonnet 4.5'],
  'General Purpose': ['anthropic:Claude Sonnet 4.5', 'openai:GPT-4', 'google:Gemini Pro'],
  'Fast Responders': ['anthropic:Claude Haiku 4.5', 'openai:GPT-3.5 Turbo', 'kimi:Kimi Chat']
};

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
}

export default function Home() {
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
  const [showPresets, setShowPresets] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleModel = (provider: string, model: string) => {
    const modelKey = `${provider}:${model}`;
    setSelectedModels(prev => 
      prev.includes(modelKey)
        ? prev.filter(m => m !== modelKey)
        : [...prev, modelKey]
    );
  };

  const applyPreset = (presetName: string) => {
    setSelectedModels(MODEL_PRESETS[presetName as keyof typeof MODEL_PRESETS]);
    setShowPresets(false);
    toast.success(`Applied preset: ${presetName}`);
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
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    const currentInput = inputMessage;
    setInputMessage('');
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
    if (!lastUserMessage) return;

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
    const convoData = {
      id: convoId,
      messages,
      selectedModels,
      timestamp: new Date().toISOString(),
      title: currentConversationTitle || `Chat ${new Date().toLocaleString()}`
    };
    
    try {
      localStorage.setItem(convoId, JSON.stringify(convoData));
      toast.success('Conversation saved successfully!');
    } catch (error) {
      toast.error('Failed to save conversation');
    }
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
      
      toast.success('Conversation exported!');
    } catch (error) {
      toast.error('Export failed');
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

  return (
    <div className="flex h-screen bg-background text-foreground relative">
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost"
              size="icon"
              onClick={() => setShowMenu(!showMenu)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold">{currentConversationTitle}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowAnalytics(!showAnalytics)}
              title="Toggle Analytics"
            >
              <BarChart className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={saveConversation}
              disabled={messages.length === 0}
              title="Save Conversation"
            >
              <Save className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={exportConversation}
              disabled={messages.length === 0}
              title="Export to JSON"
            >
              <Download className="h-5 w-5" />
            </Button>
            <Button
              onClick={() => setShowModelSelector(!showModelSelector)}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Model
            </Button>
          </div>
        </div>

        {/* Menu Dropdown */}
        {showMenu && (
          <>
            <div 
              className="fixed inset-0 z-40"
              onClick={() => setShowMenu(false)}
            />
            <div className="absolute top-16 left-4 w-72 bg-card rounded-lg shadow-2xl z-50 border border-border">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Menu</h2>
                  <Button 
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowMenu(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      setCurrentConversationTitle('New Chat');
                      setMessages([]);
                      setShowMenu(false);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Chat
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      setMessages([]);
                      setCurrentConversationTitle('New Chat');
                      setShowMenu(false);
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear Chat
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Analytics Bar */}
        {showAnalytics && (
          <div className="p-3 bg-muted border-b border-border flex gap-6 text-sm">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-blue-400" />
              <span>{analytics.totalMessages} messages</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-400" />
              <span>Avg Rating: {analytics.avgRating.toFixed(1)}/5</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-green-400" />
              <span>Avg Time: {analytics.avgResponseTime.toFixed(1)}s</span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart className="h-4 w-4 text-purple-400" />
              <span>Confidence: {(analytics.avgConfidence * 100).toFixed(0)}%</span>
            </div>
          </div>
        )}

        {/* Model Selector Section */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={() => setShowModelSelector(!showModelSelector)}
                className="text-sm"
              >
                <span>{selectedModels.length} Active AI Model{selectedModels.length !== 1 ? 's' : ''}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPresets(!showPresets)}
              >
                Presets
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'chat' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('chat')}
                title="Chat View"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'comparison' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('comparison')}
                title="Comparison View"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={generateSynthesis}
                title="Generate Synthesis"
              >
                <GitCompare className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Presets */}
          {showPresets && (
            <div className="mb-3 p-3 bg-muted rounded-lg">
              <h3 className="text-sm font-medium mb-2">Quick Presets</h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.keys(MODEL_PRESETS).map((preset) => (
                  <Button
                    key={preset}
                    variant="outline"
                    size="sm"
                    onClick={() => applyPreset(preset)}
                    className="justify-start"
                  >
                    {preset}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Selected Models */}
          {showModelSelector && selectedModels.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedModels.map(modelKey => {
                const [provider, model] = modelKey.split(':');
                return (
                  <div
                    key={modelKey}
                    className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full text-sm"
                  >
                    <div className={`w-2 h-2 rounded-full ${getProviderColor(provider)}`} />
                    <span>{model}</span>
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

          {/* Model Selector */}
          {showModelSelector && (
            <div className="mt-3 p-3 bg-muted rounded-lg max-h-96 overflow-y-auto">
              {Object.entries(AI_PROVIDERS).map(([key, provider]) => (
                <div key={key} className="mb-3 last:mb-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-3 h-3 rounded-full ${provider.color}`} />
                    <span className="font-medium text-sm">{provider.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {provider.strengths.join(', ')}
                    </span>
                  </div>
                  <div className="pl-5 space-y-1">
                    {provider.models.map(model => (
                      <label
                        key={model}
                        className="flex items-center gap-2 p-2 hover:bg-accent rounded cursor-pointer"
                      >
                        <Checkbox
                          checked={selectedModels.includes(`${key}:${model}`)}
                          onCheckedChange={() => toggleModel(key, model)}
                        />
                        <span className="text-sm">{model}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4">
          {viewMode === 'chat' && (
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <div className="text-6xl mb-4">💬</div>
                  <p className="text-lg">Start a conversation with multiple AIs</p>
                  <p className="text-sm mt-2">Select models and send a message</p>
                </div>
              ) : (
                messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        msg.type === 'user' ? 'bg-primary text-primary-foreground' :
                        msg.type === 'synthesis' ? 'bg-purple-700 text-white' :
                        'bg-muted'
                      }`}
                    >
                      {msg.type === 'ai' && (
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 text-xs">
                            <div className={`w-2 h-2 rounded-full ${getProviderColor(msg.provider)}`} />
                            <span className="font-medium">{msg.model}</span>
                            {msg.confidence && (
                              <span className="text-muted-foreground">
                                {(msg.confidence * 100).toFixed(0)}% confident
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
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
                      {!collapsedResponses.has(msg.id) && (
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
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
            <div className="grid grid-cols-2 gap-4">
              {messages.filter(m => m.type === 'ai').slice(-4).map(msg => (
                <div key={msg.id} className="bg-muted rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-3 h-3 rounded-full ${getProviderColor(msg.provider)}`} />
                    <span className="font-medium text-sm">{msg.model}</span>
                  </div>
                  <p className="text-sm">{msg.content}</p>
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{msg.confidence ? (msg.confidence * 100).toFixed(0) : 0}% confident</span>
                    <span>{msg.responseTime?.toFixed(1)}s</span>
                  </div>
                </div>
              ))}
              {messages.filter(m => m.type === 'ai').length === 0 && (
                <div className="col-span-2 flex items-center justify-center text-muted-foreground py-8">
                  No responses to compare yet
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-border">
          {selectedModels.length === 0 && (
            <p className="text-xs text-muted-foreground mb-2 text-center">
              Select at least one AI model to send a message
            </p>
          )}
          <div className="flex gap-2">
            <Input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your message..."
              disabled={selectedModels.length === 0}
              className="flex-1"
            />
            <Button
              onClick={handleSend}
              disabled={!inputMessage.trim() || selectedModels.length === 0 || isLoading}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
