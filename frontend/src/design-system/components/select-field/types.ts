import { type Select } from '@/design-system/ui/select';

export type Option = {
  label: string;
  value: string;
  valueLabel?: string;
};

export type OptionGroup = {
  label: string;
  options: Option[];
};

export type SelectFieldProps = {
  label?: string;
  options: (Option | OptionGroup)[];
  value: string;
  className?: string;
  containerClassName?: string;
  modal?: boolean;
  onChange: (value: string) => void;
} & React.ComponentProps<typeof Select>;
