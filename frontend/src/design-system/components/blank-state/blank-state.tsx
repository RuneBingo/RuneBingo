import { cn } from '@/design-system/lib/utils';

import type { BlankStateProps } from './types';

export default function BlankState({ children, className }: BlankStateProps) {
  const classNames = cn(
    'flex flex-col gap-2 px-4 py-8 rounded-2xl text-slate-500 bg-gradient-to-b from-slate-100 to-slate-100/0 flex-1 items-center',
    className,
  );

  return <div className={classNames}>{children}</div>;
}
