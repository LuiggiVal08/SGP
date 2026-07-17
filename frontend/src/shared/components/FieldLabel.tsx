import { Popover } from '@heroui/react';
import { HelpCircle } from 'lucide-react';
import type { ReactNode } from 'react';

interface FieldLabelProps {
  label: ReactNode;
  help?: string;
  htmlFor?: string;
  className?: string;
}

export function FieldLabel({ label, help, htmlFor, className }: FieldLabelProps) {
  return (
    <div className="flex items-center gap-1.5">
      <label htmlFor={htmlFor} className={className}>
        {label}
      </label>
      {help && (
        <Popover.Root>
          <Popover.Trigger>
            <button
              type="button"
              className="text-muted hover:text-foreground transition-colors"
              aria-label={`Ayuda`}
            >
              <HelpCircle size={14} />
            </button>
          </Popover.Trigger>
          <Popover.Content className="bg-surface border border-border rounded-lg shadow-lg p-3 max-w-60 text-xs text-muted">
            {help}
          </Popover.Content>
        </Popover.Root>
      )}
    </div>
  );
}
