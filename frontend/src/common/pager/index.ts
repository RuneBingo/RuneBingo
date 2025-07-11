import { assignSubComponents } from '@/design-system/lib/utils';

import Pager from './pager';
import PagerWithoutTotal from './pager-without-total';

export default assignSubComponents(Pager, {
  WithoutTotal: PagerWithoutTotal,
});
