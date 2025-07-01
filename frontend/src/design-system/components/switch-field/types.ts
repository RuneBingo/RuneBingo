import { type PropsWithChildren } from 'react';

export type SwitchFieldProps = PropsWithChildren<{
  label?: string;
  value?: boolean;
  error?: string | React.ReactNode;
  onChange?: (value: boolean) => void;
}> &
  Omit<React.ComponentProps<'button'>, 'value' | 'onChange'>;
