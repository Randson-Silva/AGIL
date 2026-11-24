/**
 * Extrai a parte de data YYYY-MM-DD de uma string ISO sem deslocar pelo fuso horário local.
 */
export function extractIsoDatePart(isoDate?: string | null): string | null {
  if (!isoDate) return null;

  const datePart = isoDate.split('T')[0];
  if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
    return datePart;
  }

  const parsed = new Date(isoDate);
  if (isNaN(parsed.getTime())) return null;

  const year = parsed.getUTCFullYear();
  const month = String(parsed.getUTCMonth() + 1).padStart(2, '0');
  const day = String(parsed.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formata uma data ISO UTC (ex: 2026-11-24T00:00:00.000Z) para DD/MM/YYYY ou DD/MM sem alteração de fuso.
 */
export function formatIsoDateToBr(
  isoDate?: string | null,
  includeYear = true,
): string {
  if (!isoDate) return '';

  const datePart = extractIsoDatePart(isoDate);
  if (!datePart) return isoDate;

  const [year, month, day] = datePart.split('-');
  return includeYear ? `${day}/${month}/${year}` : `${day}/${month}`;
}

/**
 * Retorna a data local atual no formato YYYY-MM-DD.
 */
export function getLocalTodayIso(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getExpirationStatus(expirationDateIso: string | null | undefined) {
  if (!expirationDateIso) {
    return { isExpired: false, isExpiringSoon: false, daysLeft: null };
  }

  const datePart = extractIsoDatePart(expirationDateIso);
  if (!datePart) {
    return { isExpired: false, isExpiringSoon: false, daysLeft: null };
  }

  const [year, month, day] = datePart.split('-').map(Number);
  const expiration = new Date(year, month - 1, day);
  expiration.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffTime = expiration.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return {
    isExpired: diffDays < 0,
    isExpiringSoon: diffDays >= 0 && diffDays <= 30,
    daysLeft: diffDays,
  };
}
