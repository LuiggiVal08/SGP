import { Button } from '@heroui/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  current: number;
  total: number;
  onChange: (page: number) => void;
}

export function Pagination({ current, total, onChange }: PaginationProps) {
  if (total <= 1) return null;

  const pages: (number | '...')[] = [];
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - 1 && i <= current + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  return (
    <div className="flex items-center justify-center gap-1 pt-4">
      <Button
        variant="ghost"
        isDisabled={current === 1}
        onPress={() => onChange(current - 1)}
        className="min-w-0 px-2 text-muted"
      >
        <ChevronLeft size={16} />
      </Button>

      {pages.map((page, i) =>
        page === '...' ? (
          <span key={`ellipsis-${i}`} className="px-2 text-sm text-muted/60">
            …
          </span>
        ) : (
          <Button
            key={page}
            variant={page === current ? 'primary' : 'ghost'}
            onPress={() => onChange(page)}
            className={`min-w-0 w-8 h-8 p-0 text-sm font-medium ${
              page === current
                ? 'shadow-sm'
                : 'text-muted hover:text-foreground hover:bg-surface-secondary'
            }`}
          >
            {page}
          </Button>
        ),
      )}

      <Button
        variant="ghost"
        isDisabled={current === total}
        onPress={() => onChange(current + 1)}
        className="min-w-0 px-2 text-muted"
      >
        <ChevronRight size={16} />
      </Button>
    </div>
  );
}
