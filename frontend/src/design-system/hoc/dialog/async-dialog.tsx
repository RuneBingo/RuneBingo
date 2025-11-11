import { useMemo, useRef, type ComponentType } from 'react';

import { getDisplayName } from '@/design-system/lib/utils';

import type { AsyncDialogRef, DialogProps } from './types';
import useAsyncDialog from './use-async-dialog';
import useDialog from './use-dialog';

type Props<Props extends DialogProps, Input, Output> = Props & {
  open: boolean;
  input: Input;
  cancel: () => void;
  submit: (output: Output) => void;
  onExited: () => void;
};

type InferRef<T> = T extends AsyncDialogRef<infer Input, infer Output> ? { Input: Input; Output: Output } : never;

export default function asyncDialog<
  R extends AsyncDialogRef<Input, Output>,
  P extends DialogProps = DialogProps,
  Input = InferRef<R>['Input'],
  Output = InferRef<R>['Output'],
>(Component: ComponentType<Props<P, Input, Output>>) {
  const usePrompt = () => {
    const ref = useRef<R>(null);
    const ask = async (input: Input): Promise<Output | undefined> => ref.current?.ask(input);

    const Dialog = useMemo(() => {
      const AsyncDialog = (props: P) => {
        const { open, input, cancel, submit } = useAsyncDialog(ref);
        const { mount, open: dialogOpen, handleExited } = useDialog({ initialOpen: open, onExited: props.onExited });

        if (!mount || !input) return null;

        return (
          <Component
            {...props}
            open={dialogOpen}
            input={input}
            cancel={cancel}
            submit={submit}
            onExited={handleExited}
          />
        );
      };

      AsyncDialog.displayName = `asyncDialog(${getDisplayName(Component)})`;

      return AsyncDialog;
    }, []);

    return [Dialog, ask] as const;
  };

  return { usePrompt };
}
