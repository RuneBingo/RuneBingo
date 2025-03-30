import { forwardRef } from 'react';
import type { TitleProps } from './types';
import { cn } from '@/design-system/lib/utils';

const Primary = forwardRef<HTMLHeadingElement, TitleProps>(({ className, ...props }, ref) => (
  <h1
    ref={ref}
    className={cn('scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-6 lg:mb-8', className)}
    {...props}
  />
));

Primary.displayName = 'Title.Primary';

export { Primary };
