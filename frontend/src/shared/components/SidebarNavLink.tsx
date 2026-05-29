import { type ComponentType, type SVGProps } from 'react';
import { NavLink } from 'react-router-dom';

interface SidebarNavLinkProps {
  to: string;
  end?: boolean;
  // many icon libraries accept a `size` prop in addition to standard SVG props
  icon: ComponentType<SVGProps<SVGSVGElement> & { size?: number }>;
  label: string;
  onClick?: () => void;
}

export function SidebarNavLink({
  to,
  end,
  icon: Icon,
  label,
  onClick,
}: SidebarNavLinkProps) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }: { isActive: boolean }) =>
        `group relative flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
          isActive
            ? 'bg-background text-primary shadow-sm before:absolute before:inset-y-2 before:left-0 before:w-1 before:rounded-r-full before:bg-linear-to-b before:from-primary before:to-primary/60'
            : 'text-muted hover:text-foreground hover:bg-surface-secondary hover:translate-x-0.5 hover:shadow-sm'
        }`
      }
      onClick={onClick}
    >
      <Icon
        size={20}
        className="text-muted group-hover:text-foreground group-hover:scale-110 group-hover:rotate-6 transition-all duration-200"
      />
      {label}
    </NavLink>
  );
}
