import { useMutation } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import type React from 'react';
import { useRef } from 'react';

import { moveBingoTile as moveBingoTileApi } from '@/api/bingo';
import toast from '@/common/utils/toast';
import transformApiError from '@/common/utils/transform-api-error';

import { useBingoCard } from './provider';

export type UseTileDragArgs = {
  x: number;
  y: number;
};

export default function useTileDrag({ x, y }: UseTileDragArgs) {
  const ref = useRef<HTMLDivElement>(null);
  const t = useTranslations('bingo.bingoCard');
  const {
    bingo: { bingoId },
    dropTarget,
    setDraggingTile,
    setDropTarget,
    refetch,
  } = useBingoCard();

  const { mutate: moveBingoTile } = useMutation({
    mutationKey: ['moveBingoTile', bingoId, x, y],
    mutationFn: async ({ toX, toY }: { toX: number; toY: number }) => {
      const response = await moveBingoTileApi(bingoId, x, y, toX, toY);
      if ('error' in response) {
        const { message } = transformApiError(response);
        if (message) toast.error(message);

        return;
      }

      toast.success(t('moveBingoTileSuccess'));
      refetch();
    },
  });

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!ref.current) return;
    e.preventDefault();

    setDropTarget(null);
    setDraggingTile({ x, y });
    const tile = ref.current;
    const startX = e.clientX;
    const startY = e.clientY;
    const rect = tile.getBoundingClientRect();
    const offsetX = startX - rect.left;
    const offsetY = startY - rect.top;

    const getDropTargetCoordinates = (x: number, y: number) => {
      const dropTarget = document.elementFromPoint(x, y);
      if (!dropTarget) return null;

      const toX = Number(dropTarget.getAttribute('data-x')) ?? 0;
      const toY = Number(dropTarget.getAttribute('data-y')) ?? 0;
      if (toX === 0 && toY === 0) return null;

      return { toX, toY };
    };

    const onPointerMove = (moveEvent: PointerEvent) => {
      tile.style.left = `${moveEvent.clientX - offsetX}px`;
      tile.style.top = `${moveEvent.clientY - offsetY}px`;

      const target = getDropTargetCoordinates(moveEvent.clientX, moveEvent.clientY);
      if (target === null && dropTarget !== null) {
        setDropTarget(null);
        return;
      }

      if (target !== null && (target.toX !== dropTarget?.x || target.toY !== dropTarget?.y)) {
        setDropTarget({ x: target.toX, y: target.toY });
      }
    };

    const onPointerUp = (upEvent: PointerEvent) => {
      setDraggingTile(null);

      tile.style.left = '';
      tile.style.top = '';

      const target = getDropTargetCoordinates(upEvent.clientX, upEvent.clientY);
      if (target !== null && (target.toX !== x || target.toY !== y)) {
        moveBingoTile({ toX: target.toX, toY: target.toY });
      }

      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  return { ref, handlePointerDown };
}
