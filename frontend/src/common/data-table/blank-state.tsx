import BlankState from '@/design-system/components/blank-state';

import { type DataTableBlankStateProps } from './types';

export default function DataTableBlankState({ blankStateText, blankStateIcon }: DataTableBlankStateProps) {
  return (
    <BlankState>
      {blankStateIcon && <BlankState.Icon icon={blankStateIcon} />}
      {blankStateText && <BlankState.Text>{blankStateText}</BlankState.Text>}
    </BlankState>
  );
}
