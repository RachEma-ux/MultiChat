/**
 * ThemesSettingsModal - Chat Window Template Management
 * 
 * Allows users to view, select, and manage chat window templates.
 * Accessed via Settings (wheel icon) → Themes in the chat footer.
 * 
 * FRAMEWORK COMPLIANCE:
 * - Z_INDEX_FRAMEWORK: Uses Z_CLASS.MODAL for proper layering
 * - RESPONSIVENESS_FRAMEWORK: Mobile-first design with touch targets
 */

import { useState, useEffect } from 'react';
import { X, Check, Palette, Sparkles, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Z_CLASS } from '@/lib/z-index';
import { 
  ChatWindowTemplate, 
  getAllTemplates, 
  getSelectedTemplateId, 
  setSelectedTemplateId,
  getTemplate 
} from '@/lib/chat-templates';
import { toast } from 'sonner';

interface ThemesSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTemplateChange?: (templateId: string) => void;
}

export function ThemesSettingsModal({ 
  isOpen, 
  onClose,
  onTemplateChange 
}: ThemesSettingsModalProps) {
  const [templates, setTemplates] = useState<ChatWindowTemplate[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');

  // Load templates on mount
  useEffect(() => {
    if (isOpen) {
      setTemplates(getAllTemplates());
      setSelectedId(getSelectedTemplateId());
    }
  }, [isOpen]);

  const handleSelectTemplate = (templateId: string) => {
    setSelectedId(templateId);
    setSelectedTemplateId(templateId);
    onTemplateChange?.(templateId);
    toast.success(`Template changed to "${getTemplate(templateId).name}"`);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm ${Z_CLASS.MODAL_BACKDROP}`}
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg bg-card rounded-lg shadow-2xl ${Z_CLASS.MODAL} flex flex-col max-h-[90vh]`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-cyan-500" />
            <h2 className="text-lg font-semibold">Chat Themes</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Template Grid */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">Available Themes</h3>
            
            <div className="grid gap-3">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleSelectTemplate(template.id)}
                  className={`relative p-4 rounded-lg border-2 transition-all text-left ${
                    selectedId === template.id
                      ? 'border-cyan-500 bg-cyan-500/10'
                      : 'border-border hover:border-border/80 hover:bg-accent/50'
                  }`}
                >
                  {/* Selection indicator */}
                  {selectedId === template.id && (
                    <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-cyan-500 flex items-center justify-center">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                  
                  {/* Template preview */}
                  <div className="flex items-start gap-3">
                    {/* Color preview */}
                    <div className="flex flex-col gap-1">
                      <div 
                        className="w-10 h-10 rounded-md shadow-inner"
                        style={{ backgroundColor: template.previewColors.primary }}
                      />
                      <div className="flex gap-0.5">
                        <div 
                          className="w-4 h-2 rounded-sm"
                          style={{ backgroundColor: template.previewColors.secondary }}
                        />
                        <div 
                          className="w-4 h-2 rounded-sm"
                          style={{ backgroundColor: template.previewColors.accent }}
                        />
                      </div>
                    </div>
                    
                    {/* Template info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{template.name}</span>
                        {template.id === 'modern' && (
                          <span className="px-1.5 py-0.5 text-[10px] font-medium bg-cyan-500/20 text-cyan-400 rounded">
                            NEW
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {template.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <span className="px-1.5 py-0.5 bg-muted rounded">
                          {template.footerComponent === 'ChatControlBox' ? 'Modern Controls' : 'Classic Controls'}
                        </span>
                        <span className="px-1.5 py-0.5 bg-muted rounded capitalize">
                          {template.headerStyle} header
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Customize Section (Coming Soon) */}
          <div className="pt-4 border-t border-border">
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-dashed border-border">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Custom Themes</span>
                    <Lock className="h-3 w-3 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Create your own color schemes
                  </p>
                </div>
              </div>
              <span className="text-xs font-medium text-muted-foreground px-2 py-1 bg-muted rounded">
                Coming Soon
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <Button onClick={onClose} className="w-full">
            Done
          </Button>
        </div>
      </div>
    </>
  );
}

export default ThemesSettingsModal;
