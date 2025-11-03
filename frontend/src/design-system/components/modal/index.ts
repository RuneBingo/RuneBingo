import { assignSubComponents } from '@/design-system/lib/utils';

import ModalBody from './body';
import ModalDescription from './description';
import ModalFooter from './footer';
import ModalHeader from './header';
import Modal from './modal';

export default assignSubComponents(Modal, {
  Body: ModalBody,
  Description: ModalDescription,
  Header: ModalHeader,
  Footer: ModalFooter,
});
