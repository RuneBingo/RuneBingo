import { useEffect, useState } from 'react';

export type UseDialogArgs = {
  initialOpen: boolean;
  onExited?: () => void;
};

export default function useDialog({ initialOpen, onExited }: UseDialogArgs) {
  const [mount, setMount] = useState(initialOpen);
  const [open, setOpen] = useState(false);

  // Mount the dialog if it is initially open. Otherwise, initiate closing animation.
  useEffect(() => {
    if (initialOpen) setMount(true);
    else setOpen(false);
  }, [initialOpen]);

  // Delay the dialog opening until it's mounted to avoid visual jitter.
  useEffect(() => {
    if (mount) setOpen(true);
  }, [mount]);

  const handleExited = () => {
    setMount(false);
    onExited?.();
  };

  return { mount, open, handleExited };
}
