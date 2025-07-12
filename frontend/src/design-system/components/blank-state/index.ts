import { assignSubComponents } from '@/design-system/lib/utils';

import BlankState from './blank-state';
import BlankStateIcon from './icon';
import BlankStateText from './text';

export default assignSubComponents(BlankState, {
  Icon: BlankStateIcon,
  Text: BlankStateText,
});
