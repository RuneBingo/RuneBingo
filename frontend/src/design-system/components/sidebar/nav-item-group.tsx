import NavItem from './nav-item';
import { type NavItemGroupProps } from './types';

export default function NavItemGroup({ item, linkComponent }: NavItemGroupProps) {
  return (
    <div className="grid gap-1 group-data-[collapsed=true]:pt-4">
      {item.title && (
        <h2 className="group-data-[collapsed=true]:hidden pt-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {item.title}
        </h2>
      )}
      {item.items.map((subItem, subIndex) => (
        <NavItem key={subIndex} item={subItem} linkComponent={linkComponent} />
      ))}
    </div>
  );
}
