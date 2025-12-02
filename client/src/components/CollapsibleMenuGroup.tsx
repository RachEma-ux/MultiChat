import { ChevronRight } from 'lucide-react';

interface CollapsibleMenuGroupProps {
  title: string;
  items: string[];
  isExpanded: boolean;
  onToggle: () => void;
  isLast?: boolean;
}

export function CollapsibleMenuGroup({ title, items, isExpanded, onToggle, isLast = false }: CollapsibleMenuGroupProps) {
  return (
    <div className={!isLast ? "border-b border-border" : ""}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-accent/50 transition-colors"
      >
        <span>{title}</span>
        <ChevronRight 
          className={`h-3 w-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
        />
      </button>
      {isExpanded && (
        <div>
          {items.map(item => (
            <button 
              key={item} 
              className="w-full text-left px-4 py-2 text-sm hover:bg-accent transition-colors"
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
