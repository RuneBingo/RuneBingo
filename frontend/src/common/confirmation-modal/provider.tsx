import { createContext, useCallback, useContext, useState } from 'react';

import ConfirmationModal from './confirmation-modal';
import type {
  AskConfirmationArgs,
  ConfirmationModalContextType,
  ConfirmationModalProviderProps,
  PropsState,
} from './types';

const ConfirmationModalContext = createContext<ConfirmationModalContextType | undefined>(undefined);

export default function ConfirmationModalProvider({ children }: ConfirmationModalProviderProps) {
  const [props, setProps] = useState<PropsState>({
    open: false,
    title: '',
    description: '',
  });

  const [resolve, setResolve] = useState<(value: boolean) => void>(() => {});

  const askConfirmation = useCallback(
    ({ title, description, confirmLabel, confirmVariant, cancelLabel }: AskConfirmationArgs) => {
      setProps((prev) => ({
        ...prev,
        open: true,
        title,
        description,
        confirmLabel,
        cancelLabel,
        confirmVariant,
      }));

      return new Promise<boolean>((resolve) => {
        setResolve(() => resolve);
      });
    },
    [],
  );

  const handleConfirm = useCallback(() => {
    setProps((prev) => ({ ...prev, open: false }));
    resolve(true);
  }, [resolve]);

  const handleCancel = useCallback(() => {
    setProps((prev) => ({ ...prev, open: false }));
    resolve(false);
  }, [resolve]);

  return (
    <ConfirmationModalContext.Provider value={{ askConfirmation }}>
      {children}
      <ConfirmationModal {...props} onConfirm={handleConfirm} onCancel={handleCancel} />
    </ConfirmationModalContext.Provider>
  );
}

export function useConfirmationModal() {
  const context = useContext(ConfirmationModalContext);
  if (!context) {
    throw new Error('useConfirmationModal must be used within a ConfirmationModalProvider');
  }
  return context;
}
