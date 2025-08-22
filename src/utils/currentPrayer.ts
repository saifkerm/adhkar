import { PrayerTime } from "@/data/invocations";

export function currentPrayerLabel(): PrayerTime {
  const h = new Date().getHours();
  if (h < 7) return PrayerTime.FAJR;
  if (h < 14) return PrayerTime.DHUHR;
  if (h < 18) return PrayerTime.ASR;
  if (h < 21) return PrayerTime.MAGHRIB;
  return PrayerTime.ISHA;
}
