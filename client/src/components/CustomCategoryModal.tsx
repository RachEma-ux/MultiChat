import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Plus, Trash2, Edit2, Check, Tag } from 'lucide-react';
import { 
  DEFAULT_CATEGORIES, 
  loadCustomCategories, 
  addCustomCategory, 
  removeCustomCategory,
  isDefaultCategory 
} from '@/lib/quick-presets';
import { toast } from 'sonner';

interface CustomCategoryModalProps {
  onClose: () => void;
  onCategoriesChange: () => void;
}

export function CustomCategoryModal({
  onClose,
  onCategoriesChange,
}: CustomCategoryModalProps) {
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  
  useEffect(() => {
    setCustomCategories(loadCustomCategories());
  }, []);
  
  const handleAddCategory = () => {
    const trimmed = newCategory.trim();
    if (!trimmed) {
      toast.error('Category name cannot be empty');
      return;
    }
    
    if (isDefaultCategory(trimmed)) {
      toast.error('This is a default category');
      return;
    }
    
    if (customCategories.includes(trimmed)) {
      toast.error('Category already exists');
      return;
    }
    
    addCustomCategory(trimmed);
    setCustomCategories(loadCustomCategories());
    setNewCategory('');
    onCategoriesChange();
    toast.success(`Category "${trimmed}" added`);
  };
  
  const handleRemoveCategory = (category: string) => {
    removeCustomCategory(category);
    setCustomCategories(loadCustomCategories());
    onCategoriesChange();
    toast.success(`Category "${category}" removed`);
  };
  
  const handleStartEdit = (category: string) => {
    setEditingCategory(category);
    setEditValue(category);
  };
  
  const handleSaveEdit = () => {
    if (!editingCategory) return;
    
    const trimmed = editValue.trim();
    if (!trimmed) {
      toast.error('Category name cannot be empty');
      return;
    }
    
    if (trimmed !== editingCategory) {
      // Remove old and add new
      removeCustomCategory(editingCategory);
      addCustomCategory(trimmed);
      setCustomCategories(loadCustomCategories());
      onCategoriesChange();
      toast.success(`Category renamed to "${trimmed}"`);
    }
    
    setEditingCategory(null);
    setEditValue('');
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 z-[400] flex items-center justify-center p-4">
      <div className="bg-background border border-border rounded-lg shadow-xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
          <div className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Manage Categories</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Add new category */}
          <div className="flex gap-2">
            <Input
              placeholder="New category name..."
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAddCategory();
                }
              }}
            />
            <Button onClick={handleAddCategory} size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Default categories */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Default Categories
            </h3>
            <div className="space-y-1">
              {DEFAULT_CATEGORIES.map((category) => (
                <div
                  key={category}
                  className="flex items-center justify-between px-3 py-2 bg-muted/50 rounded-md"
                >
                  <span>{category}</span>
                  <span className="text-xs text-muted-foreground">Built-in</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Custom categories */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Custom Categories ({customCategories.length})
            </h3>
            {customCategories.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No custom categories yet. Add one above!
              </p>
            ) : (
              <div className="space-y-1">
                {customCategories.map((category) => (
                  <div
                    key={category}
                    className="flex items-center justify-between px-3 py-2 bg-muted/50 rounded-md group"
                  >
                    {editingCategory === category ? (
                      <div className="flex items-center gap-2 flex-1">
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleSaveEdit();
                            } else if (e.key === 'Escape') {
                              setEditingCategory(null);
                            }
                          }}
                          autoFocus
                          className="h-7"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={handleSaveEdit}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <span>{category}</span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleStartEdit(category)}
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => handleRemoveCategory(category)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Footer */}
        <div className="px-4 py-3 border-t border-border bg-card">
          <Button variant="outline" className="w-full" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
