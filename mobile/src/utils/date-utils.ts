export function getExpirationStatus(expirationDateIso: string | null | undefined) {
  if (!expirationDateIso) {
    return { isExpired: false, isExpiringSoon: false, daysLeft: null };
  }

  const expiration = new Date(expirationDateIso);
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