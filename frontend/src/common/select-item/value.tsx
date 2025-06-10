import { AnimatePresence, motion } from 'framer-motion';
import { MinusIcon } from 'lucide-react';
import Image from 'next/image';

import { Button } from '@/design-system/ui/button';

import { useSelectItemContext } from './provider';

export default function Value() {
  const { value, onChange } = useSelectItemContext();

  if (value.length === 0) return null;

  return (
    <div className="mb-3">
      <AnimatePresence mode="popLayout">
        {value.map((item) => (
          <motion.div
            key={item.id}
            layout
            className="flex gap-3 items-center py-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Button
              variant="outline"
              size="icon-xs"
              className="rounded-full"
              onClick={() => onChange(value.filter((i) => i.id !== item.id))}
            >
              <MinusIcon />
            </Button>
            <Image src={item.imageUrl} width={32} height={32} alt={item.name} className="w-8 h-8 object-contain" />
            <span className="text-sm font-medium">{item.name}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
