import { forwardRef } from 'react';

import { cn } from '@/design-system/lib/utils';

import type { TitleProps } from './types';

const Ternary = forwardRef<HTMLHeadingElement, TitleProps>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('scroll-m-20 text-2xl font-semibold tracking-tight first:mt-0 my-2 lg:my-3', className)}
    {...props}
  />
));

Ternary.displayName = 'Title.Ternary';

export { Ternary };
