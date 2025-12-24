import { Zap, FolderOpen, Palette, Globe, Download } from 'lucide-react';
import { toast } from 'sonner';

interface SettingsMenuProps {
  onClose: () => void;
  onPresetsManagement?: () => void;
  onCategoriesSettings?: () => void;
  onThemesSettings?: () => void;
}

export function SettingsMenu({ 
  onClose, 
  onPresetsManagement, 
  onCategoriesSettings,
  onThemesSettings 
}: SettingsMenuProps) {
  return (
    <>
      <div 
        className="fixed inset-0 z-[199]"
        onClick={onClose}
      />
      <div className="absolute bottom-full right-0 mb-2 w-56 bg-card rounded-lg shadow-2xl z-[200] border border-border overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h3 className="text-sm font-semibold">Settings</h3>
        </div>
        {onPresetsManagement && (
          <button
            onClick={() => {
              onPresetsManagement();
              onClose();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors text-left"
          >
            <Zap className="h-4 w-4" />
            <span className="text-sm">Presets Setting</span>
          </button>
        )}
        {onCategoriesSettings && (
          <button
            onClick={() => {
              onCategoriesSettings();
              onClose();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors text-left"
          >
            <FolderOpen className="h-4 w-4" />
            <span className="text-sm">Categories Setting</span>
          </button>
        )}
        <button
          onClick={() => {
            if (onThemesSettings) {
              onThemesSettings();
              onClose();
            } else {
              toast.info('Chat theme settings coming soon');
              onClose();
            }
          }}
          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors text-left"
        >
          <Palette className="h-4 w-4" />
          <span className="text-sm">Themes</span>
        </button>
        <button
          onClick={() => {
            toast.info('Language settings coming soon');
            onClose();
          }}
          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors text-left"
        >
          <Globe className="h-4 w-4" />
          <span className="text-sm">Language</span>
        </button>
        <button
          onClick={() => {
            toast.info('Export data coming soon');
            onClose();
          }}
          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors text-left"
        >
          <Download className="h-4 w-4" />
          <span className="text-sm">Export Data</span>
        </button>
      </div>
    </>
  );
}
