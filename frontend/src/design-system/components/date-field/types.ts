import type React from 'react';

export type DateFieldProps = {
  locale: string;
  label?: string;
  value?: string;
  error?: string | React.ReactNode;
  modal?: boolean;
  placeholder?: string;
  onChange?: (value: string | undefined) => void;
} & Omit<React.ComponentProps<'button'>, 'value' | 'onChange'>;
