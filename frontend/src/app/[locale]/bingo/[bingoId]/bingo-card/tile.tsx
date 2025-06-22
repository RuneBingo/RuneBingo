'use client';

import { useMutation } from '@tanstack/react-query';
import { GripVerticalIcon, InfoIcon, PencilIcon, ReplaceIcon, TrashIcon } from 'lucide-react';
import { PlusIcon } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Fragment } from 'react';

import { deleteBingoTile as deleteBingoTileApi } from '@/api/bingo';
import { BingoRoles } from '@/api/types';
import { useConfirmationModal } from '@/common/confirmation-modal';
import toast from '@/common/utils/toast';
import transformApiError from '@/common/utils/transform-api-error';
import { cn } from '@/design-system/lib/utils';

import { useBingoCard } from './provider';
import useTileDrag from './use-tile-drag';

type TileProps = {
  x: number;
  y: number;
  readOnly: boolean;
};

export default function Tile({ x, y, readOnly }: TileProps) {
  const t = useTranslations('bingo.bingoCard');
  const { askConfirmation } = useConfirmationModal();
  const { role, bingo, bingoTiles, dropTarget, draggingTile, viewOrEditTile, refetch } = useBingoCard();
  const { ref, handlePointerDown } = useTileDrag({ x, y });

  const bingoTile = bingoTiles?.find((tile) => tile.x === x && tile.y === y);
  const isDropTarget = dropTarget?.x === x && dropTarget?.y === y;
  const draggingThisTile = draggingTile?.x === x && draggingTile?.y === y;
  const draggingOtherTile = draggingTile !== null && !draggingThisTile;

  const { mutate: deleteBingoTile } = useMutation({
    mutationKey: ['delete-bingo-tile', bingo.bingoId, x, y],
    mutationFn: async () => {
      const confirmed = await askConfirmation({
        title: t('deleteBingoTile.title', { x, y }),
        description: t('deleteBingoTile.description'),
      });
      if (!confirmed) return;

      const response = await deleteBingoTileApi(bingo.bingoId, x, y);
      if ('error' in response) {
        const { message } = transformApiError(response);
        if (message) toast.error(message);
        return;
      }

      toast.success(t('deleteBingoTile.success'), {
        richColors: true,
        dismissible: true,
        position: 'bottom-center',
      });

      await refetch();
    },
  });

  if (!role && !bingoTile) return null;

  const isOrganizerOrOwner = role === BingoRoles.Organizer || role === BingoRoles.Owner;

  const ViewOrEditIcon = isOrganizerOrOwner ? PencilIcon : InfoIcon;

  const mode = (() => {
    if (readOnly) return 'view';
    if (!bingoTile) return 'create';
    if (isOrganizerOrOwner) return 'edit';

    return 'view';
  })();

  return (
    <Fragment>
      {bingoTile && (
        <div className={styles.tile(draggingOtherTile)}>
          {bingoTile.media ? (
            <Image src={bingoTile.media.url} alt={bingoTile.media.originalName} width={100} height={100} />
          ) : (
            <span className={styles.title} style={{ textShadow: '1px 1px 0 #000000' }}>
              {bingoTile.title}
            </span>
          )}
        </div>
      )}
      {draggingOtherTile && (
        <div className={styles.dropTarget.container(isDropTarget)}>
          {bingoTile && <ReplaceIcon className={styles.dropTarget.icon} />}
        </div>
      )}
      {!draggingOtherTile && (
        <div ref={ref} className={styles.hover.container(draggingThisTile)}>
          {bingoTile ? (
            <Fragment>
              <div className={styles.hover.header}>
                <span className={styles.hover.value}>{bingoTile.value}</span>
                {mode === 'edit' && <GripVerticalIcon className="size-4" onPointerDown={handlePointerDown} />}
              </div>
              <span className={styles.hover.title}>{bingoTile.title}</span>
              <div className={styles.hover.actions}>
                <button className={styles.hover.actionButton} onClick={() => viewOrEditTile({ x, y })}>
                  <ViewOrEditIcon className={styles.hover.buttonIcon} />
                </button>
                {isOrganizerOrOwner && (
                  <button className={styles.hover.actionButton} onClick={() => deleteBingoTile()}>
                    <TrashIcon className={styles.hover.buttonIcon} />
                  </button>
                )}
              </div>
            </Fragment>
          ) : (
            <button className={styles.hover.createButton} onClick={() => viewOrEditTile({ x, y })}>
              <PlusIcon className={styles.hover.buttonIcon} />
            </button>
          )}
        </div>
      )}
    </Fragment>
  );
}

const styles = {
  tile: (isDraggingOtherTile: boolean) => cn({ 'pointer-events-none': isDraggingOtherTile }),
  title: 'text-2xl font-runescape text-warning break-words',
  hover: {
    container: (isDragging: boolean) =>
      cn(
        'flex flex-col justify-between gap-1 absolute p-1.5 inset-1.5 rounded-sm bg-slate-800/75 transition-opacity delay-100 duration-200 text-slate-100',
        {
          'opacity-0 group-hover:opacity-100': !isDragging,
          'w-28 h-28 z-[999] pointer-events-none fixed': isDragging,
        },
      ),
    header: 'flex justify-between items-center',
    value: 'pointer-events-none bg-slate-700 text-xs font-bold px-2.5 py-1 rounded-full w-fit select-none',
    title:
      'pointer-events-none text-slate-100 text-sm font-bold overflow-hidden text-ellipsis line-clamp-2 flex-1 select-none',
    actions: 'flex gap-1 justify-between w-full',
    actionButton:
      'flex items-center justify-center h-6 w-full text-center rounded-sm py-2 bg-slate-500 hover:bg-slate-600 transition-colors duration-200 cursor-pointer',
    createButton: 'cursor-pointer flex justify-center items-center h-full w-full',
    buttonIcon: 'size-4',
  },
  dropTarget: {
    container: (isDropTarget: boolean) =>
      cn(
        'absolute inset-1.5 rounded-sm bg-slate-800/60 transition-all delay-100 duration-200 text-slate-100 pointer-events-none flex justify-center items-center pointer-events-none',
        {
          'opacity-0 scale-90': !isDropTarget,
          'opacity-100 scale-100': isDropTarget,
        },
      ),
    icon: 'pointer-events-none size-8',
  },
};
