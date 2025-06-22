import { useId } from 'react';

import { Input } from '@/design-system/ui/input';
import { Label } from '@/design-system/ui/label';

import type { TextFieldProps } from './types';

export default function TextField({ label, error, readOnly, onChange, ...props }: TextFieldProps) {
  const id = useId();

  if (readOnly) {
    return (
      <div className="mb-5">
        {label && <Label className="mb-2">{label}</Label>}
        <p className="text-sm">{props.value}</p>
      </div>
    );
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(event.target.value);
  };

  return (
    <div className="mb-5">
      {label && (
        <Label htmlFor={id} className="mb-2">
          {label}
        </Label>
      )}
      <Input id={id} {...props} onChange={handleChange} />
      {error && <p className="mt-1 text-left text-sm text-red-500">{error}</p>}
    </div>
  );
}
