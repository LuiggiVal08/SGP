import { useState, forwardRef, type ReactNode } from 'react';
import { Input } from '@heroui/react';
import { Eye, EyeOff } from 'lucide-react';
import type { InputProps } from '@heroui/react';

type PasswordInputProps = Omit<InputProps, 'type'> & { endContent?: ReactNode };

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, ...props }, ref) => {
    const [visible, setVisible] = useState(false);

    return (
      <div className="relative w-full">
        <Input
          ref={ref}
          type={visible ? 'text' : 'password'}
          className={`w-full ${className ?? ''}`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors z-10"
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          tabIndex={-1}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    );
  },
);

PasswordInput.displayName = 'PasswordInput';
