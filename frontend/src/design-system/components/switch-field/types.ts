import type React from 'react';

export type SwitchFieldProps = {
  label?: string;
  value?: boolean;
  onChange?: (value: boolean) => void;
  error?: string | React.ReactNode;
} & Omit<React.ComponentProps<'button'>, 'value' | 'onChange'>;
