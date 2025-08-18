export function currentPrayerLabel(): string {
  const h = new Date().getHours()
  if (h < 7) return "Après Fajr"
  if (h < 14) return "Après Dhuhr"
  if (h < 18) return "Après ʿAsr"
  if (h < 21) return "Après Maghrib"
  return "Après ʿIshā’"
}