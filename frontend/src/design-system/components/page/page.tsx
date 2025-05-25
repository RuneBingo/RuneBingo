import { cn } from '@/design-system/lib/utils';

import { type PageProps } from './types';

export default function Page({ children, className, ...props }: PageProps) {
  const classes = cn('px-6 py-4', className);
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}
