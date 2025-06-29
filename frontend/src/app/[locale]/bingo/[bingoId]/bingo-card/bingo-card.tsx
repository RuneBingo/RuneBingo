'use client';

import { Reorder } from 'framer-motion';
import { useTranslations } from 'next-intl';

import { BingoStatus } from '@/api/types';
import Scrollbar from '@/design-system/components/scrollbar/scrollbar';
import { cn } from '@/design-system/lib/utils';

import BingoCardProvider from './provider';
import Tile from './tile';
import { type BingoCardProps } from './types';

export default function BingoCard(providerProps: BingoCardProps) {
  const t = useTranslations('bingo.bingoCard');

  return (
    <BingoCardProvider {...providerProps}>
      {({ bingo: { height, width, status }, bingoTiles, isFetching }) => {
        if (!bingoTiles) return <p>{t('unexpectedError')}</p>;

        return (
          <Scrollbar className="pb-2" horizontal>
            <Reorder.Group values={bingoTiles} onReorder={(_) => undefined}>
              {Array.from({ length: height }).map((_, verticalIndex) => (
                <div key={verticalIndex} className="relative flex w-fit">
                  {Array.from({ length: width }).map((_, horizontalIndex) => {
                    const x = horizontalIndex + 1;
                    const y = verticalIndex + 1;
                    const key = `${x}-${y}`;

                    return (
                      <div
                        data-x={x}
                        data-y={y}
                        key={key}
                        className={cn(
                          'group relative w-[125px] h-[125px] p-1.5 border-r-1 border-b-1 border-foreground',
                          {
                            'border-t-1': verticalIndex === 0,
                            'border-l-1': horizontalIndex === 0,
                            'rounded-tl-md': verticalIndex === 0 && horizontalIndex === 0,
                            'rounded-tr-md': verticalIndex === 0 && horizontalIndex === width - 1,
                            'rounded-bl-md': verticalIndex === height - 1 && horizontalIndex === 0,
                            'rounded-br-md': verticalIndex === height - 1 && horizontalIndex === width - 1,
                          },
                        )}
                      >
                        <Tile x={x} y={y} readOnly={status !== BingoStatus.Pending} />
                      </div>
                    );
                  })}
                  {isFetching && <div className="absolute inset-0 bg-background/80" />}
                </div>
              ))}
            </Reorder.Group>
          </Scrollbar>
        );
      }}
    </BingoCardProvider>
  );
}
