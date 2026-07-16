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
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
    >
      {({ isActive }: { isActive: boolean }) => (
        <div
          className={`group relative flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
            isActive
              ? 'bg-primary/8 text-primary shadow-sm border-l-2 border-primary pl-[14px]'
              : 'text-muted hover:text-foreground hover:bg-surface-secondary hover:translate-x-0.5 hover:shadow-sm'
          }`}
        >
          <Icon
            size={20}
            className={`transition-all duration-200 ${
              isActive
                ? 'text-primary'
                : 'text-muted group-hover:text-foreground group-hover:scale-110'
            }`}
          />
          {label}
          {badge !== undefined && (
            <span className={`ml-auto text-[11px] font-semibold px-2 py-0.5 rounded-full min-w-5 text-center leading-tight ${
              isActive ? 'bg-primary/10 text-primary' : 'bg-surface-secondary text-muted'
            }`}>
              {badge}
            </span>
          )}
        </div>
      )}
    </NavLink>
  );
}
