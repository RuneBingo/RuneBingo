import { useId } from 'react';

import { Label } from '@/design-system/ui/label';
import { Textarea } from '@/design-system/ui/textarea';

import type { TextAreaFieldProps } from './types';

export default function TextAreaField({ label, onChange, error, ...props }: TextAreaFieldProps) {
  const id = useId();

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange?.(event.target.value);
  };

  return (
    <div className="mb-5">
      {label && (
        <Label htmlFor={id} className="mb-2">
          {label}
        </Label>
      )}
      <Textarea id={id} {...props} onChange={handleChange} />
      {error && <p className="mt-1 text-left text-sm text-red-500">{error}</p>}
    </div>
  );
}
