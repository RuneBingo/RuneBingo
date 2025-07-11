import { type LucideIcon } from 'lucide-react';
import { type PropsWithChildren } from 'react';

export type BlankStateProps = PropsWithChildren<{
  className?: string;
}>;

export type BlankStateIconProps = {
  icon: LucideIcon;
  className?: string;
};

export type BlankStateTextProps = PropsWithChildren<{
  className?: string;
}>;
