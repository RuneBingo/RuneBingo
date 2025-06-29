import { AnimatePresence, motion, Reorder } from 'framer-motion';
import { GripVerticalIcon, MinusIcon } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

import NumberInput from '@/design-system/components/number-input';
import { Button } from '@/design-system/ui/button';

import { useSelectItemContext } from './provider';
import type { SelectItemContextType, SelectItemValueProps } from './types';

export default function Value({ readOnly, emptyMessage }: SelectItemValueProps) {
  const t = useTranslations('common.selectItem');
  const { value, valueRef, onChange } = useSelectItemContext();

  if (readOnly) {
    if (value.length === 0) return <div className="mb-3">{emptyMessage ?? t('noItems')}</div>;

    return (
      <div className="mb-3">
        {value.map(({ item, quantity }, index) => (
          <div key={index} className="flex flex-row items-center gap-3 mb-5">
            <span>{quantity}x</span>
            <Image src={item.iconUrl} alt={item.name} width={30} height={30} />
            <div className="flex flex-col">
              <span className="text-sm">
                <b>{item.name}</b>
              </span>
              <span className="text-sm text-muted-foreground">{item.examine}</span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (value.length === 0) return null;

  const handleItemRemove = (itemId: number) => {
    onChange(value.filter((i) => i.item.id !== itemId));
  };

  const handleQuantityChange = (itemId: number, quantity: number | null) => {
    onChange(value.map((i) => (i.item.id === itemId ? { ...i, quantity } : i)));
  };

  const handleReorder = (newOrder: SelectItemContextType['value']) => {
    onChange(newOrder.map((item) => ({ ...item, index: newOrder.indexOf(item) })));
  };

  return (
    <Reorder.Group as="div" axis="y" values={value} onReorder={handleReorder} ref={valueRef} className="mb-3">
      <AnimatePresence mode="popLayout">
        {value.map((item) => (
          <Reorder.Item
            key={item.item.id}
            value={item}
            layout
            className="flex gap-3 items-center py-2 w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Button
              variant="outline"
              size="icon-xs"
              className="rounded-full"
              onClick={() => handleItemRemove(item.item.id)}
            >
              <MinusIcon />
            </Button>
            <NumberInput
              min={0}
              value={item.quantity ?? 0}
              data-id={item.item.id}
              onChange={(quantity) => handleQuantityChange(item.item.id, quantity)}
              autoSize
            />
            <Image
              src={item.item.iconUrl}
              width={32}
              height={32}
              alt={item.item.name}
              className="w-8 h-8 object-contain"
            />
            <span className="text-sm font-medium flex-1 shrink-0">{item.item.name}</span>
            <AnimatePresence>
              {value.length > 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <GripVerticalIcon className="size-4 text-muted-foreground" />
                </motion.div>
              )}
            </AnimatePresence>
          </Reorder.Item>
        ))}
      </AnimatePresence>
    </Reorder.Group>
  );
}
