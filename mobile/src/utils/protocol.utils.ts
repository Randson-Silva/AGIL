export type ProtocolPrefix = 'R' | 'S' | 'A';

/**
 * Gera um identificador curto e amigável usando os 4 últimos caracteres alfanuméricos do ID do banco.
 */
export function formatProtocolCode(
  id: string | number | null | undefined,
  prefix: ProtocolPrefix,
): string {
  if (!id) return `${prefix}-0000`;
  const clean = String(id).replace(/[^a-zA-Z0-9]/g, '');
  if (!clean) return `${prefix}-0000`;
  const suffix = clean.slice(-4).toUpperCase().padStart(4, '0');
  return `${prefix}-${suffix}`;
}

export function formatReservationProtocol(
  id: string | number | null | undefined,
): string {
  return formatProtocolCode(id, 'R');
}

export function formatMaterialProtocol(
  id: string | number | null | undefined,
): string {
  return formatProtocolCode(id, 'S');
}
