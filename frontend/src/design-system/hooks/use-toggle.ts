import { useState } from 'react';

export default function useToggle(initialOpen = false) {
  const [open, setOpen] = useState(initialOpen);

  const toggle = () => setOpen(!open);

  return [open, toggle] as const;
}
