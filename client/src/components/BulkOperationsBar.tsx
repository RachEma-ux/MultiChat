import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { 
  X, Trash2, Copy, Star, StarOff, Tag, Download, CheckSquare, Square
} from 'lucide-react';
import { 
  QuickPreset, 
  getAllCategories,
  bulkDeletePresets,
  bulkSetCategory,
  bulkToggleFavorite,
  bulkDuplicatePresets,
  bulkExportPresets 
} from '@/lib/quick-presets';
import { toast } from 'sonner';

interface BulkOperationsBarProps {
  selectedIds: Set<string>;
  presets: QuickPreset[];
  onSelectionChange: (ids: Set<string>) => void;
  onPresetsChange: (presets: QuickPreset[]) => void;
  onExitBulkMode: () => void;
}

export function BulkOperationsBar({
  selectedIds,
  presets,
  onSelectionChange,
  onPresetsChange,
  onExitBulkMode,
}: BulkOperationsBarProps) {
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  
  const selectedCount = selectedIds.size;
  const categories = useMemo(() => getAllCategories(), []);
  
  const handleSelectAll = () => {
    onSelectionChange(new Set(presets.map(p => p.id)));
  };
  
  const handleDeselectAll = () => {
    onSelectionChange(new Set());
  };
  
  const handleBulkDelete = () => {
    if (selectedCount === 0) return;
    
    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedCount} preset${selectedCount > 1 ? 's' : ''}?`
    );
    
    if (confirmed) {
      const updated = bulkDeletePresets(presets, Array.from(selectedIds));
      onPresetsChange(updated);
      onSelectionChange(new Set());
      toast.success(`Deleted ${selectedCount} preset${selectedCount > 1 ? 's' : ''}`);
    }
  };
  
  const handleBulkDuplicate = () => {
    if (selectedCount === 0) return;
    
    const updated = bulkDuplicatePresets(presets, Array.from(selectedIds));
    onPresetsChange(updated);
    toast.success(`Duplicated ${selectedCount} preset${selectedCount > 1 ? 's' : ''}`);
  };
  
  const handleBulkFavorite = (isFavorite: boolean) => {
    if (selectedCount === 0) return;
    
    const updated = bulkToggleFavorite(presets, Array.from(selectedIds), isFavorite);
    onPresetsChange(updated);
    toast.success(
      isFavorite 
        ? `Added ${selectedCount} preset${selectedCount > 1 ? 's' : ''} to favorites`
        : `Removed ${selectedCount} preset${selectedCount > 1 ? 's' : ''} from favorites`
    );
  };
  
  const handleBulkSetCategory = (category: string | undefined) => {
    if (selectedCount === 0) return;
    
    const updated = bulkSetCategory(presets, Array.from(selectedIds), category);
    onPresetsChange(updated);
    setShowCategoryMenu(false);
    toast.success(
      category 
        ? `Set category to "${category}" for ${selectedCount} preset${selectedCount > 1 ? 's' : ''}`
        : `Removed category from ${selectedCount} preset${selectedCount > 1 ? 's' : ''}`
    );
  };
  
  const handleBulkExport = () => {
    if (selectedCount === 0) return;
    
    const json = bulkExportPresets(presets, Array.from(selectedIds));
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `presets-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${selectedCount} preset${selectedCount > 1 ? 's' : ''}`);
  };
  
  return (
    <div className="bg-primary/10 border border-primary/20 rounded-lg p-2 mb-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        {/* Selection info */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2"
            onClick={onExitBulkMode}
          >
            <X className="h-3 w-3 mr-1" />
            Exit
          </Button>
          <span className="text-sm font-medium">
            {selectedCount} selected
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={handleSelectAll}
            >
              <CheckSquare className="h-3 w-3 mr-1" />
              All
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={handleDeselectAll}
            >
              <Square className="h-3 w-3 mr-1" />
              None
            </Button>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-1 flex-wrap">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2"
            onClick={handleBulkDuplicate}
            disabled={selectedCount === 0}
            title="Duplicate selected"
          >
            <Copy className="h-3 w-3 mr-1" />
            Duplicate
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2"
            onClick={() => handleBulkFavorite(true)}
            disabled={selectedCount === 0}
            title="Add to favorites"
          >
            <Star className="h-3 w-3 mr-1" />
            Favorite
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2"
            onClick={() => handleBulkFavorite(false)}
            disabled={selectedCount === 0}
            title="Remove from favorites"
          >
            <StarOff className="h-3 w-3 mr-1" />
            Unfavorite
          </Button>
          
          {/* Category dropdown */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2"
              onClick={() => setShowCategoryMenu(!showCategoryMenu)}
              disabled={selectedCount === 0}
              title="Set category"
            >
              <Tag className="h-3 w-3 mr-1" />
              Category
            </Button>
            
            {showCategoryMenu && (
              <div className="absolute top-full left-0 mt-1 bg-popover border border-border rounded-md shadow-lg z-50 min-w-[150px] py-1">
                <button
                  className="w-full px-3 py-1.5 text-left text-sm hover:bg-accent transition-colors"
                  onClick={() => handleBulkSetCategory(undefined)}
                >
                  <span className="text-muted-foreground">No Category</span>
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    className="w-full px-3 py-1.5 text-left text-sm hover:bg-accent transition-colors"
                    onClick={() => handleBulkSetCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2"
            onClick={handleBulkExport}
            disabled={selectedCount === 0}
            title="Export selected"
          >
            <Download className="h-3 w-3 mr-1" />
            Export
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-destructive hover:text-destructive"
            onClick={handleBulkDelete}
            disabled={selectedCount === 0}
            title="Delete selected"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
