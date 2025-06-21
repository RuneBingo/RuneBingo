import { cn } from '@/design-system/lib/utils';

export type BingoCardPreviewProps = {
  width: number | null;
  height: number | null;
};

export default function BingoCardPreview({ width, height }: BingoCardPreviewProps) {
  if (width === null || height === null) return null;

  return (
    <div className="mb-5 mx-auto w-fit">
      {Array.from({ length: height }).map((_, verticalIndex) => (
        <div key={verticalIndex} className="flex w-fit">
          {Array.from({ length: width }).map((_, horizontalIndex) => (
            <div
              id={`${horizontalIndex}-${verticalIndex}`}
              key={`${horizontalIndex}-${verticalIndex}`}
              className={cn('w-[25px] aspect-square border-r-1 border-b-1', {
                'border-t-1': verticalIndex === 0,
                'border-l-1': horizontalIndex === 0,
                'rounded-tl-md': verticalIndex === 0 && horizontalIndex === 0,
                'rounded-tr-md': verticalIndex === 0 && horizontalIndex === width - 1,
                'rounded-bl-md': verticalIndex === height - 1 && horizontalIndex === 0,
                'rounded-br-md': verticalIndex === height - 1 && horizontalIndex === width - 1,
              })}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
