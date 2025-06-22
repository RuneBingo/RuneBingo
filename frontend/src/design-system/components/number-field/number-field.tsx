import { useId } from 'react';

import { Label } from '@/design-system/ui/label';

import type { NumberFieldProps } from './types';
import NumberInput from '../number-input';

export default function NumberField({ label, value, error, readOnly, onChange, ...props }: NumberFieldProps) {
  const id = useId();

  if (readOnly) {
    return (
      <div className="mb-5">
        <Label htmlFor={id} className="mb-2">
          {label}
        </Label>
        <p className="text-sm">{value}</p>
      </div>
    );
  }

  return (
    <div className="mb-5 w-full">
      {label && (
        <Label htmlFor={id} className="mb-2">
          {label}
        </Label>
      )}
      <NumberInput {...props} id={id} value={value} onChange={onChange} />
      {error && <p className="mt-1 text-left text-sm text-red-500">{error}</p>}
    </div>
  );
}
