import type { Input } from '@/design-system/ui/input';

export type SearchInputProps = {
  value: string;
  clearable?: boolean;
  debounceSeconds?: number;
  onChange: (value: string) => void;
} & Omit<React.ComponentProps<typeof Input>, 'onChange'>;
