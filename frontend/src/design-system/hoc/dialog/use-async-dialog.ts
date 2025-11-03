import { type ForwardedRef, useCallback, useImperativeHandle, useState } from 'react';

import type { AsyncDialogRef } from './types';

type State<Input, Output> = {
  open: boolean;
  input?: Input;
  resolve?: (output: Output | undefined) => void;
};

export default function useAsyncDialog<Input, Output>(ref: ForwardedRef<AsyncDialogRef<Input, Output>>) {
  const [{ open, input }, setState] = useState<State<Input, Output>>({ open: false });

  useImperativeHandle(
    ref,
    () => ({
      ask: async (input: Input) =>
        new Promise<Output | undefined>((resolve) => {
          setState((prev) => {
            prev.resolve?.(undefined);
            return { open: true, input, resolve };
          });
        }),
    }),
    [],
  );

  const submit = useCallback((output: Output | undefined) => {
    setState(({ input, resolve }) => {
      resolve?.(output);
      return { open: false, input };
    });
  }, []);

  const cancel = useCallback(() => submit(undefined), [submit]);

  return { open, input, submit, cancel };
}
