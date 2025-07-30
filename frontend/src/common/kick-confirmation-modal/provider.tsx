import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

import KickConfirmationModal from './kick-confirmation-modal';
import type {
  KickConfirmationModalContextType,
  KickConfirmationModalOptions,
  KickConfirmationModalProps,
} from './types';

type PropsState = Omit<KickConfirmationModalOptions, 'children'> & {
  open: boolean;
  onConfirm: (deleteCompletions?: boolean) => void;
  onCancel: () => void;
};

const KickConfirmationModalContext = createContext<KickConfirmationModalContextType | undefined>(undefined);

export function KickConfirmationModalProvider({ children }: { children: ReactNode }) {
  const [props, setProps] = useState<Partial<PropsState>>({
    open: false,
    title: '',
    description: '',
  });

  const askKickConfirmation = useCallback(
    (options: KickConfirmationModalOptions) => {
      return new Promise<{ confirmed: boolean; deleteCompletions?: boolean }>((resolve) => {
        setProps({
          ...options,
          open: true,
          onConfirm: (deleteCompletions) => {
            resolve({ confirmed: true, deleteCompletions });
            setProps({ ...props, open: false });
          },
          onCancel: () => {
            resolve({ confirmed: false });
            setProps({ ...props, open: false });
          },
        });
      });
    },
    [props],
  );

  return (
    <KickConfirmationModalContext.Provider value={{ askKickConfirmation }}>
      {children}
      <KickConfirmationModal {...(props as KickConfirmationModalProps)} />
    </KickConfirmationModalContext.Provider>
  );
}

export function useKickConfirmationModal() {
  const context = useContext(KickConfirmationModalContext);
  if (!context) {
    throw new Error('useKickConfirmationModal must be used within a KickConfirmationModalProvider');
  }
  return context;
}
