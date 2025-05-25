'use client';

import { useId } from 'react';

import { cn } from '@/design-system/lib/utils';
import { Label } from '@/design-system/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/design-system/ui/select';

import type { SelectFieldProps } from './types';

export default function SelectField({
  label,
  options,
  value,
  className,
  containerClassName,
  onChange,
  ...props
}: SelectFieldProps) {
  const id = useId();
  const containerClasses = cn('mb-5', containerClassName);

  return (
    <div className={containerClasses}>
      {label && (
        <Label htmlFor={id} className="mb-2">
          {label}
        </Label>
      )}
      <Select value={value} onValueChange={onChange} {...props}>
        <SelectTrigger className={className} id={id}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((optionOrGroup) =>
            'options' in optionOrGroup ? (
              <SelectGroup key={optionOrGroup.label}>
                <SelectLabel>{optionOrGroup.label}</SelectLabel>
                {optionOrGroup.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            ) : (
              <SelectItem key={optionOrGroup.value} value={optionOrGroup.value}>
                {optionOrGroup.label}
              </SelectItem>
            ),
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
