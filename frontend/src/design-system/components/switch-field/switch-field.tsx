import { AnimatePresence, motion } from 'framer-motion';
import { useId } from 'react';

import { Label } from '@/design-system/ui/label';
import { Switch } from '@/design-system/ui/switch';

import type { SwitchFieldProps } from './types';

export default function SwitchField({ label, value, children, onChange, error, ...props }: SwitchFieldProps) {
  const id = useId();

  return (
    <div className="mb-5">
      <div className="flex items-center space-x-2">
        <Switch id={id} checked={value} onCheckedChange={(checked) => onChange?.(checked)} {...props} />
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
      {children && (
        <AnimatePresence>
          {value && (
            <motion.div
              className="mt-3 ml-10"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
