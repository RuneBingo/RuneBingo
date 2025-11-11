'use client';

import { useId } from 'react';

import { cn } from '@/design-system/lib/utils';
import { Label } from '@/design-system/ui/label';
import Select from '@/design-system/ui/select';

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
        <Select.Trigger className={className} id={id}>
          <Select.Value />
        </Select.Trigger>
        <Select.Content>
          {options.map((optionOrGroup) =>
            'options' in optionOrGroup ? (
              <Select.Group key={optionOrGroup.label}>
                <Select.Label>{optionOrGroup.label}</Select.Label>
                {optionOrGroup.options.map((option) => (
                  <Select.Item key={option.value} value={option.value}>
                    {option.label}
                  </Select.Item>
                ))}
              </Select.Group>
            ) : (
              <Select.Item key={optionOrGroup.value} value={optionOrGroup.value}>
                {optionOrGroup.label}
              </Select.Item>
            ),
          )}
        </Select.Content>
      </Select>
    </div>
  );
}
