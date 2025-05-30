import type React from 'react';

export type TextAreaFieldProps = {
  label?: string;
  onChange?: (value: string) => void;
  error?: string | React.ReactNode;
} & React.ComponentProps<'textarea'>;
