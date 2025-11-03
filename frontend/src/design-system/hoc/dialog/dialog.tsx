import { type ForwardedRef, forwardRef, type ComponentType } from 'react';

import useDialog from '@/design-system/hoc/dialog/use-dialog';
import { getDisplayName } from '@/design-system/lib/utils';

import type { DialogProps, DialogRef } from './types';

type Props<Props extends DialogProps, Ref extends DialogRef<never>> = Props & {
  open: boolean;
  forwardedRef: ForwardedRef<Ref>;
  onExited: () => void;
};

export default function dialog<R extends DialogRef<never>, P extends DialogProps>(
  Component: ComponentType<Props<P, R>>,
) {
  const Dialog = forwardRef<R, P>((props, ref) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { open } = props as any; // TODO: Fix this later
    const { mount, open: dialogOpen, handleExited } = useDialog({ initialOpen: open, onExited: props.onExited });

    if (!mount) return null;

    return <Component {...(props as P)} open={dialogOpen} forwardedRef={ref} onExited={handleExited} />;
  });

  Dialog.displayName = `dialog(${getDisplayName(Component)})`;
  return Dialog;
}
