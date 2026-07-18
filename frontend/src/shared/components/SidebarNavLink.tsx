import { type ComponentType, type SVGProps } from 'react';
import { NavLink } from 'react-router-dom';

interface SidebarNavLinkProps {
  to: string;
  end?: boolean;
  icon: ComponentType<SVGProps<SVGSVGElement> & { size?: number }>;
  label: string;
  badge?: number;
  onClick?: () => void;
}

export function SidebarNavLink({
  to,
  end,
  icon: Icon,
  label,
  badge,
  onClick,
}: SidebarNavLinkProps) {
  return (
    <NavLink to={to} end={end} onClick={onClick}>
      {({ isActive }: { isActive: boolean }) => (
        <div
          className={`group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
            isActive
              ? 'bg-gradient-to-r from-primary/15 to-primary/5 text-primary shadow-1 ring-1 ring-inset ring-primary/15'
              : 'text-muted hover:text-foreground hover:bg-surface-secondary hover:translate-x-0.5'
          }`}
        >
          {isActive && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-gradient-to-b from-primary to-accent" />
          )}
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-200 ${
              isActive
                ? 'bg-primary/15 text-primary'
                : 'bg-surface-secondary text-muted group-hover:text-foreground group-hover:scale-105'
            }`}
          >
            <Icon size={18} />
          </span>
          <span className="flex-1 truncate">{label}</span>
          {badge !== undefined && (
            <span
              className={`ml-auto text-[11px] font-semibold px-2 py-0.5 rounded-full min-w-5 text-center leading-tight transition-colors ${
                isActive ? 'bg-primary/15 text-primary' : 'bg-surface text-muted'
              }`}
            >
              {badge}
            </span>
          )}
        </div>
      )}
    </NavLink>
  );
}
