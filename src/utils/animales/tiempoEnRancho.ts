const parseIsoDate = (value: string): Date | null => {
  const normalized = value.trim();
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(normalized);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const parsed = new Date(year, month, day);

  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month ||
    parsed.getDate() !== day
  ) {
    return null;
  }

  parsed.setHours(0, 0, 0, 0);
  return parsed;
};

export const calcularTiempoEnRancho = (fechaIngreso: string | null | undefined): string => {
  if (!fechaIngreso || fechaIngreso.trim().length === 0) {
    return 'Sin dato';
  }

  const ingreso = parseIsoDate(fechaIngreso);
  if (!ingreso) {
    return 'Sin dato';
  }

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  if (ingreso.getTime() > hoy.getTime()) {
    return 'Sin dato';
  }

  let años = hoy.getFullYear() - ingreso.getFullYear();
  let meses = hoy.getMonth() - ingreso.getMonth();
  let dias = hoy.getDate() - ingreso.getDate();

  if (dias < 0) {
    meses -= 1;
    const diasDelMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth(), 0).getDate();
    dias += diasDelMesAnterior;
  }

  if (meses < 0) {
    años -= 1;
    meses += 12;
  }

  if (años > 0) {
    return meses > 0
      ? `${años} año${años > 1 ? 's' : ''}, ${meses} mes${meses > 1 ? 'es' : ''}`
      : `${años} año${años > 1 ? 's' : ''}`;
  }

  if (meses > 0) {
    return `${meses} mes${meses > 1 ? 'es' : ''}`;
  }

  return `${dias} día${dias !== 1 ? 's' : ''}`;
};
