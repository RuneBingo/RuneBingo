import { assignSubComponents } from '@/design-system/lib/utils';

import ModalBody from './body';
import ModalFooter from './footer';
import ModalHeader from './header';
import Modal from './modal';

export default assignSubComponents(Modal, {
  Body: ModalBody,
  Header: ModalHeader,
  Footer: ModalFooter,
});
