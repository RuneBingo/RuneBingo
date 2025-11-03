import { type ComponentRef, type ElementType } from 'react';

export type AsyncDialogRef<Input, Output> = {
  ask: (input: Input) => Promise<Output | undefined>;
};

export type DialogRef<T extends ElementType> = ComponentRef<T>;

export type DialogProps = {
  onExited?: () => void;
};
