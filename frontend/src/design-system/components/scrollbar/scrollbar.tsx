import { cn } from '@/design-system/lib/utils';

import type { ScrollbarProps } from './types';

export default function Scrollbar({ children, className, ...props }: ScrollbarProps) {
  const classes = cn(
    'overflow-y-auto overflow-x-hidden scroll-smooth flex flex-col',
    '[&::-webkit-scrollbar]:w-1.5',
    '[&::-webkit-scrollbar-track]:bg-transparent',
    '[&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full',
    '[&::-webkit-scrollbar-thumb:hover]:bg-slate-500',
    '[&::-webkit-scrollbar-button]:hidden',
    className,
  );

  return (
    <div className={classes} {...props}>
      <div className="flex-1">{children}</div>
    </div>
  );
}
