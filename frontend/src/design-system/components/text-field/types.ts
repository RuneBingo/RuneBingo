import type React from 'react';

export type TextFieldProps = {
  label?: string;
  onChange?: (value: string) => void;
  error?: string | React.ReactNode;
} & React.ComponentProps<'input'>;
