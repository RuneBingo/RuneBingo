import { forwardRef } from 'react';
import type { TitleProps } from './types';
import { cn } from '@/design-system/lib/utils';

const Secondary = forwardRef<HTMLHeadingElement, TitleProps>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn('scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0 my-3 lg:my-4', className)}
    {...props}
  />
));

Secondary.displayName = 'Title.Secondary';

export { Secondary };
