import type { RefObject, HTMLAttributes } from 'react';

export type ScrollbarProps = HTMLAttributes<HTMLDivElement> & {
  ref?: RefObject<HTMLDivElement>;
  horizontal?: boolean;
  vertical?: boolean;
};
