import { useEffect, useId, useState } from 'react';

import { Input } from '@/design-system/ui/input';

import type { NumberInputProps } from './types';

// Matches numbers followed by , or . and then more numbers
const DECIMAL_NUMBER_REGEX = /^\d+(,\d+)?(\.\d+)?$/;

// Matches only numbers
const INTEGER_NUMBER_REGEX = /^\d+$/;

export default function NumberInput({ decimal, value, autoSize, onChange, ...props }: NumberInputProps) {
  const id = useId();
  const [innerValue, setInnerValue] = useState<string | null>(value?.toString() ?? null);
  useEffect(() => {
    setInnerValue(value?.toString() ?? '');
  }, [value]);

  const style = (() => {
    if (!autoSize) return undefined;

    const strValue = innerValue?.toString() ?? '';
    const widthCh = Math.max(strValue.length, 1) + 6;

    return { width: `${widthCh}ch` };
  })();

  const formatValue = (value: string) => {
    if (decimal) {
      const match = value.match(DECIMAL_NUMBER_REGEX);
      if (match) return match[0];
    }

    const match = value.match(INTEGER_NUMBER_REGEX);
    if (match) return match[0];

    return value;
  };

  const clampValue = (value: number) => {
    if (props.min !== undefined && value < props.min) {
      return props.min;
    }

    if (props.max !== undefined && value > props.max) {
      return props.max;
    }

    return value;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value === '') {
      onChange?.(null);
      return;
    }

    const formattedValue = formatValue(e.target.value);
    const numValue = clampValue(decimal ? parseFloat(formattedValue) : parseInt(formattedValue));
    onChange?.(numValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === '.' && !decimal) {
      e.preventDefault();
    }
  };

  const handleBlur = () => {
    if (innerValue === value?.toString()) return;

    if (innerValue === '' || innerValue === null) {
      onChange?.(null);
      return;
    }

    const numValue = decimal ? parseFloat(innerValue) : parseInt(innerValue);
    setInnerValue(numValue.toString());
    onChange?.(numValue);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData('text');
    if (isNaN(Number(pastedText)) || (!decimal && pastedText.includes('.'))) {
      e.preventDefault();
      return;
    }
  };

  return (
    <Input
      {...props}
      id={id}
      style={style}
      type="number"
      value={innerValue ?? ''}
      onKeyDown={handleKeyDown}
      onChange={handleChange}
      onBlur={handleBlur}
      onPaste={handlePaste}
    />
  );
}
