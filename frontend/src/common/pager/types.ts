type BaseProps = {
  page: number;
  limit: number;
  className?: string;
  disabled?: boolean;
  onPageChange: (page: number) => void;
};

export type PagerProps = BaseProps & {
  total: number;
  /** Only required if the pager is inside a popover */
  pagerOpen?: boolean;
  /** Only required if the pager is inside a popover */
  onPagerOpenChange?: (isOpen: boolean) => void;
};

export type PagerWithoutTotalProps = BaseProps & {
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};
