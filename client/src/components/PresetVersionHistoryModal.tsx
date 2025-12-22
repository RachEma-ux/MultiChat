import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { History, RotateCcw, Clock, Edit3, Plus, RefreshCw } from 'lucide-react';
import { PresetVersion, getPresetVersionHistory } from '@/lib/quick-presets';

interface PresetVersionHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  presetId: string;
  presetName: string;
  onRestore: (version: PresetVersion) => void;
}

/**
 * Modal for viewing and restoring preset version history
 */
export function PresetVersionHistoryModal({
  open,
  onOpenChange,
  presetId,
  presetName,
  onRestore,
}: PresetVersionHistoryModalProps) {
  const [selectedVersion, setSelectedVersion] = useState<PresetVersion | null>(null);

  const versions = useMemo(() => {
    return getPresetVersionHistory(presetId);
  }, [presetId, open]);

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  const getChangeTypeIcon = (changeType: PresetVersion['changeType']) => {
    switch (changeType) {
      case 'created':
        return <Plus className="h-3 w-3 text-green-500" />;
      case 'renamed':
        return <Edit3 className="h-3 w-3 text-blue-500" />;
      case 'models_changed':
        return <RefreshCw className="h-3 w-3 text-orange-500" />;
      case 'restored':
        return <RotateCcw className="h-3 w-3 text-purple-500" />;
      default:
        return <History className="h-3 w-3" />;
    }
  };

  const getChangeTypeLabel = (changeType: PresetVersion['changeType']) => {
    switch (changeType) {
      case 'created':
        return 'Created';
      case 'renamed':
        return 'Renamed';
      case 'models_changed':
        return 'Models changed';
      case 'restored':
        return 'Restored';
      default:
        return 'Modified';
    }
  };

  const handleRestore = () => {
    if (selectedVersion) {
      onRestore(selectedVersion);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Version History: {presetName}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          {versions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <History className="h-12 w-12 mb-3 opacity-50" />
              <p className="text-sm">No version history available</p>
              <p className="text-xs mt-1">Changes will be tracked automatically</p>
            </div>
          ) : (
            <>
              {/* Version List */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-2 min-h-[200px]">
                {versions.map((version, index) => (
                  <button
                    key={version.id}
                    onClick={() => setSelectedVersion(version)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedVersion?.id === version.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {getChangeTypeIcon(version.changeType)}
                          <span className="text-xs font-medium text-muted-foreground">
                            {getChangeTypeLabel(version.changeType)}
                          </span>
                          {index === 0 && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded">
                              Current
                            </span>
                          )}
                        </div>
                        <p className="font-medium text-sm truncate">{version.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {version.models.length} model{version.models.length !== 1 ? 's' : ''}
                          {version.models.length > 0 && (
                            <span className="ml-1">
                              ({version.models.slice(0, 2).join(', ')}
                              {version.models.length > 2 && `, +${version.models.length - 2}`})
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                        <Clock className="h-3 w-3" />
                        {formatDate(version.timestamp)}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Selected Version Details */}
              {selectedVersion && (
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium mb-2">Selected Version Details</h4>
                  <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                    <div>
                      <span className="text-xs text-muted-foreground">Name:</span>
                      <p className="text-sm font-medium">{selectedVersion.name}</p>
                    </div>
                    {selectedVersion.description && (
                      <div>
                        <span className="text-xs text-muted-foreground">Description:</span>
                        <p className="text-sm">{selectedVersion.description}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-xs text-muted-foreground">Models:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedVersion.models.map((model, i) => (
                          <span
                            key={i}
                            className="text-xs px-2 py-0.5 bg-background rounded border"
                          >
                            {model}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {selectedVersion && versions.indexOf(selectedVersion) !== 0 && (
            <Button onClick={handleRestore} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Restore This Version
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
