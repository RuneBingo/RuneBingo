import { cn } from '@/design-system/lib/utils';

import type { ScrollbarProps } from './types';

export default function Scrollbar({ children, className, horizontal, vertical, ...props }: ScrollbarProps) {
  const classes = cn(
    'scroll-smooth flex flex-col',
    '[&::-webkit-scrollbar]:w-1.5',
    '[&::-webkit-scrollbar-track]:bg-transparent',
    '[&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full',
    '[&::-webkit-scrollbar-thumb:hover]:bg-slate-500',
    '[&::-webkit-scrollbar-button]:hidden',
    horizontal ? 'overflow-x-auto' : 'overflow-x-hidden',
    vertical ? 'overflow-y-auto' : 'overflow-y-hidden',
    className,
  );

  return (
    <div className={classes} {...props}>
      <div className="flex-1">{children}</div>
    </div>
  );
}
