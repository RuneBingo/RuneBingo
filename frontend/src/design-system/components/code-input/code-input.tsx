import { REGEXP_ONLY_DIGITS_AND_CHARS } from 'input-otp';

import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/design-system/ui/input-otp';

import { type CodeInputProps } from './types';

export default function CodeInput({ ...props }: CodeInputProps) {
  // TODO: in the future, support length and groups
  return (
    <div className="flex justify-center mb-5">
      <InputOTP pattern={REGEXP_ONLY_DIGITS_AND_CHARS} maxLength={6} {...props}>
        <InputOTPGroup>
          {Array.from({ length: 6 }).map((_, index) => (
            <InputOTPSlot key={index} index={index} />
          ))}
        </InputOTPGroup>
      </InputOTP>
    </div>
  );
}
