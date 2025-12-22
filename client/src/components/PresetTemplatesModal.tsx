import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  PRESET_TEMPLATES, 
  getTemplateCategories, 
  getTemplatesByCategory,
  createPresetFromTemplate,
  PresetTemplate,
  QuickPreset
} from '@/lib/quick-presets';
import { Search, ChevronDown, ChevronRight, Headphones, FileText, Lightbulb, BarChart, Code, Plus, Check, X } from 'lucide-react';

interface PresetTemplatesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddPreset: (preset: QuickPreset) => void;
  existingPresetNames: string[];
}

const categoryIcons: Record<string, React.ReactNode> = {
  support: <Headphones className="h-4 w-4" />,
  writing: <FileText className="h-4 w-4" />,
  brainstorm: <Lightbulb className="h-4 w-4" />,
  analysis: <BarChart className="h-4 w-4" />,
  development: <Code className="h-4 w-4" />,
};

export function PresetTemplatesModal({ 
  open, 
  onOpenChange, 
  onAddPreset,
  existingPresetNames 
}: PresetTemplatesModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['support', 'writing', 'brainstorm']));
  const [addedTemplates, setAddedTemplates] = useState<Set<string>>(new Set());
  
  const categories = getTemplateCategories();
  
  const toggleCategory = useCallback((categoryId: string) => {
    setExpandedCategories(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(categoryId)) {
        newExpanded.delete(categoryId);
      } else {
        newExpanded.add(categoryId);
      }
      return newExpanded;
    });
  }, []);
  
  const handleAddTemplate = useCallback((template: PresetTemplate) => {
    const preset = createPresetFromTemplate(template);
    onAddPreset(preset);
    setAddedTemplates(prev => new Set([...prev, template.id]));
  }, [onAddPreset]);
  
  const isTemplateAdded = useCallback((template: PresetTemplate) => {
    return addedTemplates.has(template.id) || existingPresetNames.includes(template.name);
  }, [addedTemplates, existingPresetNames]);
  
  const filteredTemplates = searchQuery
    ? PRESET_TEMPLATES.filter(t => 
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : null;

  const handleClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/50" onClick={handleClose}>
      <div 
        className="bg-background border border-border rounded-lg shadow-lg w-full max-w-lg max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Preset Templates</h2>
          <Button variant="ghost" size="sm" onClick={handleClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex flex-col gap-3 p-4 flex-1 min-h-0">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          
          {/* Templates List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[200px] max-h-[400px]">
            {filteredTemplates ? (
              // Search results
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Found {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''}
                </p>
                {filteredTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    isAdded={isTemplateAdded(template)}
                    onAdd={() => handleAddTemplate(template)}
                  />
                ))}
                {filteredTemplates.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    No templates match your search
                  </p>
                )}
              </div>
            ) : (
              // Categories view
              categories.map((category) => {
                const templates = getTemplatesByCategory(category.id);
                const isExpanded = expandedCategories.has(category.id);
                
                return (
                  <div key={category.id} className="border rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleCategory(category.id)}
                      className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        {categoryIcons[category.id]}
                        <span className="font-medium">{category.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({category.count} templates)
                        </span>
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                    
                    {isExpanded && (
                      <div className="border-t p-2 space-y-2">
                        {templates.map((template) => (
                          <TemplateCard
                            key={template.id}
                            template={template}
                            isAdded={isTemplateAdded(template)}
                            onAdd={() => handleAddTemplate(template)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
        
        {/* Footer */}
        <div className="flex justify-end p-4 border-t">
          <Button variant="outline" size="sm" onClick={handleClose}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}

function TemplateCard({ 
  template, 
  isAdded, 
  onAdd 
}: { 
  template: PresetTemplate; 
  isAdded: boolean; 
  onAdd: () => void;
}) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-sm truncate">{template.name}</h4>
          <span className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded">
            {template.suggestedModels.length} models
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
          {template.description}
        </p>
        <div className="flex flex-wrap gap-1 mt-2">
          {template.suggestedModels.slice(0, 3).map((model) => (
            <span 
              key={model} 
              className="text-[10px] px-1.5 py-0.5 bg-background rounded border"
            >
              {model.split('/').pop()?.split('-').slice(0, 2).join('-') || model}
            </span>
          ))}
          {template.suggestedModels.length > 3 && (
            <span className="text-[10px] px-1.5 py-0.5 text-muted-foreground">
              +{template.suggestedModels.length - 3} more
            </span>
          )}
        </div>
      </div>
      <Button
        size="sm"
        variant={isAdded ? "secondary" : "default"}
        onClick={onAdd}
        disabled={isAdded}
        className="shrink-0"
      >
        {isAdded ? (
          <>
            <Check className="h-3 w-3 mr-1" />
            Added
          </>
        ) : (
          <>
            <Plus className="h-3 w-3 mr-1" />
            Add
          </>
        )}
      </Button>
    </div>
  );
}
