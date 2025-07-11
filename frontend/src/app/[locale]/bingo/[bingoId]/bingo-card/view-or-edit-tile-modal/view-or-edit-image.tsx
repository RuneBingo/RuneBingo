import { useFormikContext } from 'formik';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Fragment } from 'react';

import ImageUploader from '@/common/image-uploader';
import SwitchField from '@/design-system/components/switch-field';

import { type FormValues } from './types';
import { useBingoCard } from '../provider';

const motionDivProps = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 10 },
  transition: { duration: 0.2 },
};

export default function ViewOrEditImage() {
  const { readOnly } = useBingoCard();
  const { values, setFieldValue } = useFormikContext<FormValues>();
  const t = useTranslations('bingo.bingoCard.viewOrEditTile.form');

  const { items, useFirstItemImage, media } = values;

  if (readOnly) {
    if (values.useFirstItemImage && values.items.length === 1) {
      const item = values.items[0].item;
      // eslint-disable-next-line @next/next/no-img-element
      return <img src={item.imageUrl} alt={item.name} className="mb-5 max-w-[125px] max-h-[125px]" />;
    }

    if (media) {
      return (
        <Image width={media.width} height={media.height} src={media.url} alt={media.originalName} className="mb-5" />
      );
    }

    return <p className="mb-5">{t('noImage')}</p>;
  }

  const handleSwitchChange = (checked: boolean) => {
    if (!checked) {
      setFieldValue('media', null);
    }

    setFieldValue('useFirstItemImage', !checked);
  };

  return (
    <div className="mb-5">
      <SwitchField
        label={t('customImage')}
        value={!useFirstItemImage}
        onChange={handleSwitchChange}
        className="!mb-0"
        disabled={items.length !== 1}
      />
      <div className="mt-3 ml-10">
        <AnimatePresence>
          <Fragment>
            {useFirstItemImage ? (
              <motion.div key="item-image" {...motionDivProps}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={items[0].item.imageUrl}
                  alt={items[0].item.name}
                  className="mb-5 max-w-[125px] max-h-[125px]"
                />
              </motion.div>
            ) : (
              <motion.div key="custom-image" {...motionDivProps}>
                <ImageUploader
                  value={media}
                  readOnly={readOnly}
                  emptyMessage={t('noImage')}
                  onChange={(value) => setFieldValue('media', value)}
                />
              </motion.div>
            )}
          </Fragment>
        </AnimatePresence>
      </div>
    </div>
  );
}
