import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, TrendingUp, Type, Calendar, Star, GripVertical } from 'lucide-react';
import { PresetSortOption } from '@/lib/quick-presets';

interface PresetSortDropdownProps {
  currentSort: PresetSortOption;
  onSortChange: (sort: PresetSortOption) => void;
}

const SORT_OPTIONS: { value: PresetSortOption; label: string; icon: React.ReactNode }[] = [
  { value: 'manual', label: 'Manual Order', icon: <GripVertical className="h-4 w-4" /> },
  { value: 'usage', label: 'Most Used', icon: <TrendingUp className="h-4 w-4" /> },
  { value: 'name', label: 'Name (A-Z)', icon: <Type className="h-4 w-4" /> },
  { value: 'date', label: 'Date Added', icon: <Calendar className="h-4 w-4" /> },
  { value: 'favorites', label: 'Favorites First', icon: <Star className="h-4 w-4" /> },
];

/**
 * Custom dropdown for selecting preset sort order (mobile-optimized, no Radix)
 */
export function PresetSortDropdown({ currentSort, onSortChange }: PresetSortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const currentOption = SORT_OPTIONS.find(opt => opt.value === currentSort) || SORT_OPTIONS[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleSelect = (value: PresetSortOption) => {
    onSortChange(value);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="sm"
        className="h-7 px-2 text-xs gap-1"
        title="Sort presets"
        onClick={() => setIsOpen(!isOpen)}
      >
        <ArrowUpDown className="h-3 w-3" />
        <span className="hidden sm:inline">{currentOption.label}</span>
      </Button>
      
      {isOpen && (
        <div className="absolute left-0 top-full mt-1 w-40 bg-popover border border-border rounded-md shadow-lg z-[200] py-1">
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors text-left ${
                currentSort === option.value ? 'bg-primary/10' : ''
              }`}
            >
              {option.icon}
              <span>{option.label}</span>
              {currentSort === option.value && (
                <span className="ml-auto text-primary">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
