import { useAboveBreakpoint } from '@/design-system/hooks/responsive';
import { cn } from '@/design-system/lib/utils';

import { DesktopNav } from './nav/desktop';
import { MobileNav } from './nav/mobile';
import type { NavbarProps } from './types';

export const Navbar = ({ sticky = false, items = [], ...props }: NavbarProps) => {
  const { md } = useAboveBreakpoint('md');

  return (
    <header className={styles.header(sticky)} {...props}>
      <div className={styles.container}>
        {!md && <MobileNav items={items} />}
        {/* TODO: <Brand /> */}
        {md && <DesktopNav items={items} />}
      </div>
    </header>
  );
};

const styles = {
  header: (sticky: boolean) =>
    cn('w-full', {
      'sticky top-0 z-50 backdrop-blur': sticky,
    }),
  container: 'w-full',
};
