import { cn } from '@/design-system/lib/utils';

import type { BlankStateTextProps } from './types';

export default function BlankStateText({ children, className }: BlankStateTextProps) {
  const classNames = cn('text-center text-xl font-bold', className);

  return <p className={classNames}>{children}</p>;
}
