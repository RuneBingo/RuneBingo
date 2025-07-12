import { cn } from '@/design-system/lib/utils';

import { type BlankStateIconProps } from './types';

export default function BlankStateIcon({ icon: Icon, className }: BlankStateIconProps) {
  return <Icon className={cn('size-9', className)} />;
}
