import NavItem from './nav-item';
import { type NavItemGroupProps } from './types';

export default function NavItemGroup({ item, collapsed, linkComponent, pathname }: NavItemGroupProps) {
  return (
    <div className="grid gap-1 group-data-[collapsed=true]:pt-4">
      {item.title && (
        <h2 className="group-data-[collapsed=true]:hidden pt-4 text-sm font-semibold text-muted-foreground uppercase ml-2">
          {item.title}
        </h2>
      )}
      {item.items.map((subItem, subIndex) => (
        <NavItem
          key={subIndex}
          item={subItem}
          collapsed={collapsed}
          linkComponent={linkComponent}
          pathname={pathname}
        />
      ))}
    </div>
  );
}
