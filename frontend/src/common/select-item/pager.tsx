import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

import { Button } from '@/design-system/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/design-system/ui/select';

import { ITEMS_PER_PAGE } from './constants';
import { useSelectItemContext } from './provider';

export default function Pager() {
  const { totalCount, page, pagerOpen, setPage, setPagerOpen } = useSelectItemContext();

  if (totalCount <= ITEMS_PER_PAGE) return null;

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const handlePreviousPage = () => {
    setPage(Math.max(page - 1, 0));
  };

  const handleNextPage = () => {
    setPage(Math.min(page + 1, Math.ceil(totalCount / ITEMS_PER_PAGE) - 1));
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-5" onClick={(e) => e.stopPropagation()}>
      <Button variant="ghost" size="icon" onClick={handlePreviousPage} disabled={page === 0}>
        <ChevronLeftIcon className="h-4 w-4" />
      </Button>
      <span className="text-sm">Page</span>
      <Select
        value={(page + 1).toString()}
        open={pagerOpen}
        onOpenChange={setPagerOpen}
        onValueChange={(value) => setPage(Number(value) - 1)}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: totalPages }).map((_, index) => (
            <SelectItem key={index} value={(index + 1).toString()}>
              {index + 1}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button variant="ghost" size="icon" onClick={handleNextPage} disabled={page === totalPages - 1}>
        <ChevronRightIcon className="h-4 w-4" />
      </Button>
    </div>
  );
}
