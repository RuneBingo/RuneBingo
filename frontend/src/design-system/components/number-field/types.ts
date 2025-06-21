import type React from 'react';

export type NumberFieldProps = Exclude<React.ComponentProps<'input'>, 'type'> & {
  label?: string;
  decimal?: boolean;
  min?: number;
  max?: number;
  value?: number | null;
  error?: string | React.ReactNode;
  onChange?: (value: number | null) => void;
};
