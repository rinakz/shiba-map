/**
 * Публичный URL приложения для шаринга (приглашения, ссылки).
 * Задаётся в `VITE_SITE_URL` (без зависимости от того, с какого origin открыта админка/локалхост).
 */
export function getSiteAuthUrl(): string {
  const raw = (import.meta.env.VITE_SITE_URL as string | undefined)?.trim();
  if (raw) {
    const base = raw.replace(/\/$/, "");
    return `${base}/#/auth`;
  }
  return `${window.location.origin}${window.location.pathname}#/auth`;
}
