import { useEffect, useState, useCallback } from 'react';
import { obtenerEventosMes } from '../native/BridgeModule';
import type { EventoSanitarioModel } from '../types/Sanitario';

type EventsByDate = Record<string, EventoSanitarioModel[]>;

export function useCalendarioSanitario(year: number, month: number) {
  const [eventsByDate, setEventsByDate] = useState<EventsByDate>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const eventos = await obtenerEventosMes(year, month);
      const map: EventsByDate = {};

      eventos.forEach((ev: EventoSanitarioModel) => {
        if (ev.fechaEvento) {
          const k = ev.fechaEvento.slice(0, 10);
          map[k] = map[k] ? map[k].concat(ev) : [ev];
        }
        if (ev.fechaProximoEvento) {
          const k2 = ev.fechaProximoEvento.slice(0, 10);
          map[k2] = map[k2] ? map[k2].concat(ev) : [ev];
        }
      });

      setEventsByDate(map);
    } catch (e: any) {
      setError(e?.message || String(e));
      setEventsByDate({});
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    void load();
  }, [load]);

  return { eventsByDate, loading, error, reload: load } as const;
}
