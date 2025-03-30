import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function assignSubComponents<Component extends React.FC, SubComponents extends Record<string, React.FC>>(
  component: Component,
  subComponents: SubComponents,
) {
  const ComponentWithSubComponents = component as Component & SubComponents;

  Object.assign(ComponentWithSubComponents, subComponents);

  return ComponentWithSubComponents;
}
