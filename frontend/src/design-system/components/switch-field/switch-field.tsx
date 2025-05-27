import { useId } from 'react';

import { Label } from '@/design-system/ui/label';
import { Switch } from '@/design-system/ui/switch';

import type { SwitchFieldProps } from './types';

export default function SwitchField({ label, value, onChange, error, ...props }: SwitchFieldProps) {
  const id = useId();

  const handleChange = (checked: boolean) => {
    onChange?.(checked);
  };

  return (
    <div className="mb-5">
      <div className="flex items-center space-x-2">
        <Switch id={id} checked={value} onCheckedChange={handleChange} {...props} />
        {label && (
          <Label
            htmlFor={id}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
          </Label>
        )}
      </div>
      {error && <p className="mt-1 text-left text-sm text-red-500">{error}</p>}
    </div>
  );
}
