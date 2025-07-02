import type React from 'react';

export type NumberInputProps = Omit<React.ComponentProps<'input'>, 'type' | 'onChange'> & {
  min?: number;
  max?: number;
  value?: number | null;
  decimal?: boolean;
  autoSize?: boolean;
  onChange?: (value: number | null) => void;
};
