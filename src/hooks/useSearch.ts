import { useEffect, useState } from 'react';

export function useSearch(termino: string) {
  const [debouncedTermino, setDebouncedTermino] = useState(termino);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTermino(termino);
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [termino]);

  return debouncedTermino;
}
