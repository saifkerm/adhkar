import { PrayerTime, DhikrMoment } from "@/data/invocations";

/**
 * Normalise une chaîne en clé sans accents ni espaces.
 */
export const slug = (s: string): string =>
  s
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-");

/**
 * Construit la clé d’une invocation optionnellement associée à un moment.
 * @param id Identifiant de l’invocation
 * @param moment Période de prière ou moment de dhikr
 */
export const makeKey = (
  id: string,
  moment?: PrayerTime | DhikrMoment | string
): string => (moment ? `${id}::${slug(String(moment))}` : id);
