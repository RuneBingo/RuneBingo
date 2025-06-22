import type { ModalBodyProps } from './types';
import Scrollbar from '../scrollbar/scrollbar';

export default function ModalBody({ children }: ModalBodyProps) {
  return (
    <Scrollbar className="flex-1 px-4" vertical>
      {children}
    </Scrollbar>
  );
}
