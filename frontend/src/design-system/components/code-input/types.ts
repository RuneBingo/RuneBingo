import { type InputOTP } from '@/design-system/ui/input-otp';

export type CodeInputProps = Omit<React.ComponentProps<typeof InputOTP>, 'render' | 'maxLength' | 'pattern'>;
