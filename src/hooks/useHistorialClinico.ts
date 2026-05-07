import { useCallback, useEffect, useState } from 'react';
import { obtenerHistorialClinico } from '../native/BridgeModule';
import type { EventoSanitarioModel } from '../types/Sanitario';

export function useHistorialClinico(animalId: number) {
  const [eventos, setEventos] = useState<EventoSanitarioModel[]>([]);
  const [pagina, setPagina] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const perPage = 10;

  const cargarPagina = useCallback(
    async (p: number) => {
      if (loading) return;
      setLoading(true);
      try {
        const res = await obtenerHistorialClinico(animalId, p);
        const items = res.items || [];
        if (p === 0) {
          setEventos(items);
        } else {
          setEventos(prev => [...prev, ...items]);
        }
        const total = res.total || 0;
        const loaded = (p + 1) * perPage;
        setHasMore(loaded < total);
      } catch (e) {
        // ignore, caller can surface errors
      } finally {
        setLoading(false);
      }
    },
    [animalId, loading],
  );

  useEffect(() => {
    // load initial
    setPagina(0);
    void cargarPagina(0);
  }, [animalId]);

  const cargarMas = useCallback(() => {
    if (loading || !hasMore) return;
    const next = pagina + 1;
    setPagina(next);
    void cargarPagina(next);
  }, [pagina, loading, hasMore, cargarPagina]);

  const recargar = useCallback(() => {
    setPagina(0);
    setHasMore(true);
    void cargarPagina(0);
  }, [cargarPagina]);

  return { eventos, loading, hasMore, pagina, cargarMas, recargar };
}
