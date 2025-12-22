import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
 * Dropdown for selecting preset sort order
 */
export function PresetSortDropdown({ currentSort, onSortChange }: PresetSortDropdownProps) {
  const currentOption = SORT_OPTIONS.find(opt => opt.value === currentSort) || SORT_OPTIONS[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs gap-1"
          title="Sort presets"
        >
          <ArrowUpDown className="h-3 w-3" />
          <span className="hidden sm:inline">{currentOption.label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {SORT_OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => onSortChange(option.value)}
            className={`gap-2 ${currentSort === option.value ? 'bg-primary/10' : ''}`}
          >
            {option.icon}
            <span>{option.label}</span>
            {currentSort === option.value && (
              <span className="ml-auto text-primary">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
