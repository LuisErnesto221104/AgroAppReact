export function formatMXN(monto: number): string {
  const abs = Math.abs(monto);
  const formatted = abs.toLocaleString('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const sign = monto < 0 ? '-' : '';
  return `${sign}$${formatted} MXN`;
}
