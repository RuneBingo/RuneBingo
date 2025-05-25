import { forwardRef } from 'react';

import { cn } from '@/design-system/lib/utils';

import type { TitleProps } from './types';

const Quaternary = forwardRef<HTMLHeadingElement, TitleProps>(({ className, ...props }, ref) => (
  <h4 ref={ref} className={cn('scroll-m-20 text-xl font-semibold tracking-tight my-1 lg:my-2', className)} {...props} />
));

Quaternary.displayName = 'Title.Quaternary';

export { Quaternary };
