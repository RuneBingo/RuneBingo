import { useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';

const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export const useAboveBreakpoint = (...breakpoints: (keyof typeof BREAKPOINTS)[]) => {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);
  const [debouncedWidth] = useDebounce(width, 200);

  useEffect(function handleResize() {
    const handleResize = () => setWidth(window.innerWidth);

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return breakpoints.reduce(
    (acc, key) => ({
      ...acc,
      [key]: debouncedWidth >= BREAKPOINTS[key],
    }),
    {} as Record<(typeof breakpoints)[number], boolean>,
  );
};
