import { useCallback, useState } from 'react';

import {
  obtenerEventosSanitarios,
  registrarEventoSanitario,
} from '../native/BridgeModule';
import type {
  EventoSanitarioModel,
  InsertEventoPayload,
  InsertEventoResult,
} from '../types/Sanitario';

type UseEventoSanitarioResult = {
  loading: boolean;
  error: string | null;
  eventos: EventoSanitarioModel[];
  registrar: (payload: InsertEventoPayload) => Promise<InsertEventoResult>;
  listar: (animalId: number) => Promise<EventoSanitarioModel[]>;
};

export function useEventoSanitario(): UseEventoSanitarioResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [eventos, setEventos] = useState<EventoSanitarioModel[]>([]);

  const registrar = useCallback(async (payload: InsertEventoPayload) => {
    setLoading(true);
    setError(null);

    try {
      const result = await registrarEventoSanitario(payload);
      return result;
    } catch (registrationError) {
      const message =
        registrationError instanceof Error
          ? registrationError.message
          : 'No se pudo registrar el evento sanitario.';
      setError(message);
      throw registrationError;
    } finally {
      setLoading(false);
    }
  }, []);

  const listar = useCallback(async (animalId: number) => {
    setLoading(true);
    setError(null);

    try {
      const rows = await obtenerEventosSanitarios(animalId);
      setEventos(rows);
      return rows;
    } catch (listError) {
      const message =
        listError instanceof Error ? listError.message : 'No se pudieron obtener los eventos.';
      setError(message);
      throw listError;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    eventos,
    registrar,
    listar,
  };
}