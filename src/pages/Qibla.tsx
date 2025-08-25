"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { motion, useAnimation } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Navigation,
  Compass as CompassIcon,
  Loader2,
  Settings2,
  RotateCw,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

interface Location {
  latitude: number;
  longitude: number;
}
interface CompassData {
  qiblaDirection: number;
  userHeading: number;
  distance: number;
  city?: string;
}

// ───────── Utils angle (circulaire) ─────────
const toRad = (d: number) => (d * Math.PI) / 180;
const toDeg = (r: number) => (r * 180) / Math.PI;
const norm360 = (x: number) => ((x % 360) + 360) % 360;
const angDiff = (a: number, b: number) => ((b - a + 540) % 360) - 180;
const circularMean = (angles: number[]) => {
  if (!angles.length) return 0;
  let sx = 0,
    sy = 0;
  for (const a of angles) {
    const r = toRad(a);
    sx += Math.cos(r);
    sy += Math.sin(r);
  }
  return norm360(toDeg(Math.atan2(sy, sx)));
};
const circularLerp = (from: number, to: number, t: number) =>
  norm360(from + angDiff(from, to) * t);

export default function QiblaCompass() {
  // état principal
  const [location, setLocation] = useState<Location | null>(null);
  const [compassData, setCompassData] = useState<CompassData | null>(null);

  // heading capteur (filtré mais SANS offset), puis heading ajusté (AVEC offset)
  const [sensorHeading, setSensorHeading] = useState<number>(0); // 0..360
  const [headingOffset, setHeadingOffset] = useState<number>(() =>
    Number(localStorage.getItem("qbl_off") ?? 0)
  );
  const adjustedHeading = useMemo(
    () => norm360(sensorHeading + headingOffset),
    [sensorHeading, headingOffset]
  );

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);

  // réglages de stabilité
  const [tolerance, setTolerance] = useState<number>(() =>
    Number(localStorage.getItem("qbl_tol") ?? 5)
  );
  const [smoothWindow, setSmoothWindow] = useState<number>(() =>
    Number(localStorage.getItem("qbl_smooth") ?? 8)
  );
  const [deadband, setDeadband] = useState<number>(() =>
    Number(localStorage.getItem("qbl_dead") ?? 1)
  );
  const [altFormula, setAltFormula] = useState<boolean>(
    () => localStorage.getItem("qbl_alt") === "1"
  );

  // buffers / refs
  const rawBufRef = useRef<number[]>([]);
  const filteredHeadingRef = useRef<number>(0);
  const prevAlignedRef = useRef(false);

  // animations
  const needleControls = useAnimation();
  const cardControls = useAnimation();

  // constantes Kaaba
  const KAABA_LAT = 21.422487;
  const KAABA_LNG = 39.826206;

  // Bearing + distance
  const calculateBearing = (
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ) => {
    const dLng = toRad(lng2 - lng1);
    const lat1r = toRad(lat1);
    const lat2r = toRad(lat2);
    const y = Math.sin(dLng) * Math.cos(lat2r);
    const x =
      Math.cos(lat1r) * Math.sin(lat2r) -
      Math.sin(lat1r) * Math.cos(lat2r) * Math.cos(dLng);
    return norm360(toDeg(Math.atan2(y, x)));
  };
  const calculateDistance = (
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ) => {
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // orientation d’écran (0/90/180/270)
  const getScreenAngle = () => {
    const a = (window.screen?.orientation as any)?.angle;
    if (typeof a === "number") return a;
    const w = (window as any).orientation;
    if (typeof w === "number") return w;
    return 0;
  };

  // iOS: webkitCompassHeading ; Android: alpha ; altFormula permet de switcher la convention si besoin
  const computeRawHeading = (ev: DeviceOrientationEvent) => {
    const wkh = (ev as any).webkitCompassHeading;
    if (typeof wkh === "number" && !Number.isNaN(wkh)) return norm360(wkh); // iOS (souvent vrai nord)
    if (ev.alpha == null) return null;
    const scr = getScreenAngle();
    // Deux conventions qu'on rencontre dans la nature :
    //  - (A) 360 - alpha + screenAngle
    //  - (B) alpha + screenAngle
    const h = altFormula ? ev.alpha + scr : 360 - ev.alpha + scr;
    return norm360(h);
  };

  // localisation
  const getUserLocation = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!navigator.geolocation)
        throw new Error("Geolocation is not supported by this browser");
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        })
      );
      const loc = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      };
      setLocation(loc);
      const qibla = calculateBearing(
        loc.latitude,
        loc.longitude,
        KAABA_LAT,
        KAABA_LNG
      );
      const dist = calculateDistance(
        loc.latitude,
        loc.longitude,
        KAABA_LAT,
        KAABA_LNG
      );
      setCompassData({ qiblaDirection: qibla, userHeading: 0, distance: dist });
      cardControls.start({
        scale: [0.8, 1.06, 1],
        opacity: [0, 1],
        transition: { duration: 0.6, ease: "easeOut" },
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to get location");
    } finally {
      setIsLoading(false);
    }
  };

  // permission capteur
  const requestOrientationPermission = async () => {
    if (
      typeof DeviceOrientationEvent !== "undefined" &&
      "requestPermission" in DeviceOrientationEvent
    ) {
      try {
        setPermissionGranted(
          (await (DeviceOrientationEvent as any).requestPermission()) ===
            "granted"
        );
      } catch {
        setPermissionGranted(false);
      }
    } else {
      setPermissionGranted(true);
    }
  };

  // cap + lissage circulaire + deadband + passe-bas
  useEffect(() => {
    if (!permissionGranted) return;
    const onOrient = (ev: DeviceOrientationEvent) => {
      const h0 = computeRawHeading(ev);
      if (h0 == null) return;

      const win = Math.max(1, Math.min(60, smoothWindow));
      const buf = rawBufRef.current;
      buf.push(h0);
      if (buf.length > win) buf.shift();
      const mean = circularMean(buf);

      const prevF = filteredHeadingRef.current;
      if (Math.abs(angDiff(prevF, mean)) < deadband) return;

      const ALPHA = 0.15;
      const filtered = circularLerp(prevF, mean, ALPHA);
      filteredHeadingRef.current = filtered;
      setSensorHeading(filtered);
      setCompassData((prev) =>
        prev ? { ...prev, userHeading: filtered } : prev
      );
    };
    window.addEventListener("deviceorientationabsolute", onOrient as any, true);
    window.addEventListener("deviceorientation", onOrient as any, true);
    return () => {
      window.removeEventListener(
        "deviceorientationabsolute",
        onOrient as any,
        true
      );
      window.removeEventListener("deviceorientation", onOrient as any, true);
    };
  }, [permissionGranted, smoothWindow, deadband, altFormula]);

  // persistance réglages
  useEffect(() => {
    localStorage.setItem("qbl_tol", String(tolerance));
  }, [tolerance]);
  useEffect(() => {
    localStorage.setItem("qbl_smooth", String(smoothWindow));
  }, [smoothWindow]);
  useEffect(() => {
    localStorage.setItem("qbl_dead", String(deadband));
  }, [deadband]);
  useEffect(() => {
    localStorage.setItem("qbl_off", String(headingOffset));
  }, [headingOffset]);
  useEffect(() => {
    localStorage.setItem("qbl_alt", altFormula ? "1" : "0");
  }, [altFormula]);

  // angle relatif (aiguille = Qibla - cap ajusté)
  const relativeAngle = useMemo(() => {
    if (!compassData) return 0;
    return norm360(compassData.qiblaDirection - adjustedHeading);
  }, [compassData, adjustedHeading]);

  const deltaDeg = useMemo(
    () => Math.min(relativeAngle, 360 - relativeAngle),
    [relativeAngle]
  );
  const aligned = deltaDeg <= tolerance;

  // vibration à l’entrée dans l’état aligné
  useEffect(() => {
    if (aligned && !prevAlignedRef.current && "vibrate" in navigator)
      navigator.vibrate?.(20);
    prevAlignedRef.current = aligned;
  }, [aligned]);

  // aiguille : tween sans rebond
  useEffect(() => {
    const target = ((relativeAngle + 540) % 360) - 180;
    needleControls.start({
      rotate: target,
      transition: { type: "tween", ease: "easeOut", duration: 0.14 },
    });
  }, [relativeAngle, needleControls]);

  // fond dynamique si aligné
  const bgClass = aligned
    ? "bg-green-50 dark:bg-green-950"
    : "bg-gradient-to-br from-background via-muted/30 to-background";

  // motif décoratif
  const IslamicPattern = () => (
    <svg
      className="absolute inset-0 w-full h-full opacity-10"
      viewBox="0 0 200 200"
    >
      <defs>
        <pattern
          id="islamicPattern"
          x="0"
          y="0"
          width="40"
          height="40"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M20,0 L30,10 L20,20 L10,10 Z M0,20 L10,30 L0,40 L-10,30 Z M40,20 L50,30 L40,40 L30,30 Z M20,40 L30,50 L20,60 L10,50 Z"
            fill="currentColor"
            className="text-primary"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#islamicPattern)" />
    </svg>
  );

  // action: caler offset pour que l’aiguille soit pile sur la Kaaba maintenant
  const calibrateToQiblaNow = () => {
    if (!compassData) return;
    // On veut relativeAngle = 0 => adjustedHeading doit devenir qibla
    // adjustedHeading = sensorHeading + offset => offset = qibla - sensorHeading
    const needed = angDiff(0, compassData.qiblaDirection - adjustedHeading); // = -relativeAngle (signé)
    setHeadingOffset((prev) => {
      const next = prev + needed;
      // garder un offset lisible (-180..180)
      const wrapped = ((next + 180) % 360) - 180;
      return wrapped;
    });
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-500 ${bgClass}`}
    >
      {/* accessibilité */}
      <div className="sr-only" aria-live="polite">
        {aligned
          ? "Alignement parfait vers la Qibla."
          : `Écart de ${Math.round(deltaDeg)} degrés.`}
      </div>

      <div className="w-full max-w-md space-y-6">
        {/* header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <h1 className="text-3xl font-bold text-foreground">بوصلة القبلة</h1>
          <p className="text-lg text-muted-foreground">Qibla Compass</p>
          <p className="text-sm text-muted-foreground">
            Find the direction to the Holy Kaaba
          </p>
        </motion.div>

        {/* carte */}
        <Card className="relative overflow-hidden bg-card/80 backdrop-blur-sm border-2 border-primary/20">
          <CardContent className="p-8">
            {!location ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center space-y-6"
              >
                <div className="w-32 h-32 mx-auto bg-muted rounded-full flex items-center justify-center">
                  <CompassIcon className="w-16 h-16 text-muted-foreground" />
                </div>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Allow location access to find the Qibla direction
                  </p>
                  <Button
                    onClick={getUserLocation}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Getting Location...
                      </>
                    ) : (
                      <>
                        <MapPin className="w-4 h-4 mr-2" />
                        Get My Location
                      </>
                    )}
                  </Button>
                  {!permissionGranted && (
                    <Button
                      onClick={requestOrientationPermission}
                      variant="outline"
                      className="w-full"
                    >
                      <Navigation className="w-4 h-4 mr-2" /> Enable Compass
                    </Button>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div animate={cardControls} className="relative">
                {/* --- Boussole --- */}
                <div className="relative w-64 h-64 mx-auto">
                  {/* motif décoratif (statique) */}
                  <div className="absolute inset-0 rounded-full rotate-pattern pointer-events-none">
                    <IslamicPattern />
                  </div>

                  {/* anneau décoratif (statique) */}
                  <div className="absolute inset-0 rounded-full border-4 border-primary/30 bg-gradient-to-br from-card to-muted/50 compass-pulse" />

                  {/* CADRAN qui tourne avec l’appareil : cardinales + graduations + icône Kaaba */}
                  <motion.div
                    className="absolute inset-0"
                    animate={{ rotate: -adjustedHeading }}
                    transition={{
                      type: "tween",
                      ease: "linear",
                      duration: 0.12,
                    }}
                  >
                    {/* cardinales */}
                    {["N", "E", "S", "W"].map((d, i) => (
                      <div
                        key={d}
                        className="absolute text-sm font-bold text-primary select-none"
                        style={{
                          top:
                            i === 0
                              ? "8px"
                              : i === 2
                              ? "calc(100% - 24px)"
                              : "50%",
                          left:
                            i === 1
                              ? "calc(100% - 16px)"
                              : i === 3
                              ? "8px"
                              : "50%",
                          transform:
                            i % 2 === 0
                              ? "translateX(-50%)"
                              : "translateY(-50%)",
                        }}
                      >
                        {d}
                      </div>
                    ))}

                    {/* graduations */}
                    {Array.from({ length: 12 }, (_, i) => (
                      <div
                        key={i}
                        className="absolute w-0.5 h-4 bg-muted-foreground/40"
                        style={{
                          top: "8px",
                          left: "50%",
                          transformOrigin: "50% 120px",
                          transform: `translateX(-50%) rotate(${i * 30}deg)`,
                        }}
                      />
                    ))}

                    {/* icône Kaaba à l’azimut Qibla sur le bord du cadran */}
                    {compassData && (
                      <div
                        className="absolute left-1/2 top-1/2"
                        style={{
                          transform: `translate(-50%, -50%) rotate(${compassData.qiblaDirection}deg)`,
                        }}
                      >
                        {/* rayon ≈ 112px pour 256px -> -translate-y-28 */}
                        <div className="-translate-y-28 flex items-center justify-center">
                          <div className="w-6 h-6 bg-accent rounded-sm flex items-center justify-center text-xs font-bold text-accent-foreground shadow">
                            🕋
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>

                  {/* AIGUILLE qui pointe la Kaaba (rotation = Qibla - cap ajusté) */}
                  <motion.div
                    animate={needleControls}
                    className="absolute inset-0 flex items-center justify-center needle-glow"
                  >
                    <div className="relative">
                      <div className="w-2 h-32 bg-gradient-to-t from-primary to-accent rounded-full shadow-lg" />
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-6 border-l-transparent border-r-transparent border-b-primary" />
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-accent rounded-full border-2 border-primary" />
                    </div>
                  </motion.div>
                </div>

                {/* état d’alignement */}
                <div
                  className={`mt-4 flex items-center justify-center gap-2 text-sm ${
                    aligned ? "text-green-600" : "text-muted-foreground"
                  }`}
                >
                  {aligned ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <CompassIcon className="w-4 h-4" />
                  )}
                  {aligned
                    ? "Aligné vers la Qibla"
                    : `Écart : ${Math.round(deltaDeg)}°`}
                </div>

                {/* infos */}
                <div className="mt-4 space-y-3 text-center">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">
                      Azimut (Qibla):
                    </span>
                    <span className="font-bold text-primary">
                      {compassData?.qiblaDirection.toFixed(1)}°
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Distance:</span>
                    <span className="font-bold text-foreground">
                      {compassData?.distance.toFixed(0)} km
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">
                      Votre cap (ajusté):
                    </span>
                    <span className="font-bold text-accent">
                      {adjustedHeading.toFixed(1)}°
                    </span>
                  </div>
                </div>

                {/* réglages */}
                <div className="mt-4 flex flex-col items-center gap-3">
                  <div className="flex flex-wrap items-center justify-center gap-2 px-3 py-2 rounded-xl border border-border">
                    <Settings2 className="w-4 h-4 text-muted-foreground" />
                    <label className="text-xs text-muted-foreground">
                      Tolérance
                      <input
                        type="range"
                        min={1}
                        max={15}
                        value={tolerance}
                        onChange={(e) => setTolerance(Number(e.target.value))}
                        className="ml-2 align-middle"
                      />
                      <span className="ml-1">{tolerance}°</span>
                    </label>
                    <span className="mx-2 text-muted-foreground/40">•</span>
                    <label className="text-xs text-muted-foreground">
                      Lissage
                      <input
                        type="range"
                        min={1}
                        max={60}
                        value={smoothWindow}
                        onChange={(e) =>
                          setSmoothWindow(Number(e.target.value))
                        }
                        className="ml-2 align-middle"
                      />
                      <span className="ml-1">{smoothWindow}</span>
                    </label>
                    <span className="mx-2 text-muted-foreground/40">•</span>
                    <label className="text-xs text-muted-foreground">
                      Dead&nbsp;zone
                      <input
                        type="range"
                        min={0}
                        max={5}
                        value={deadband}
                        onChange={(e) => setDeadband(Number(e.target.value))}
                        className="ml-2 align-middle"
                      />
                      <span className="ml-1">{deadband}°</span>
                    </label>
                  </div>

                  {/* Offset & switches */}
                  <div className="flex flex-wrap items-center justify-center gap-2 px-3 py-2 rounded-xl border border-border">
                    <label className="text-xs text-muted-foreground">
                      Offset (calibration)
                      <input
                        type="range"
                        min={-90}
                        max={90}
                        step={1}
                        value={headingOffset}
                        onChange={(e) =>
                          setHeadingOffset(Number(e.target.value))
                        }
                        className="ml-2 align-middle w-36"
                      />
                      <span className="ml-1">{Math.round(headingOffset)}°</span>
                    </label>
                    <span className="mx-2 text-muted-foreground/40">•</span>
                    <label className="text-xs text-muted-foreground flex items-center gap-2">
                      Formule alternative
                      <input
                        type="checkbox"
                        checked={altFormula}
                        onChange={(e) => setAltFormula(e.target.checked)}
                      />
                    </label>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-2 text-muted-foreground"
                      onClick={() => {
                        rawBufRef.current = [];
                        filteredHeadingRef.current = adjustedHeading;
                      }}
                      title="Réinitialiser le lissage"
                    >
                      <RotateCw className="w-4 h-4" /> Recalibrer
                    </Button>
                  </div>

                  <Button
                    onClick={calibrateToQiblaNow}
                    className="w-full sm:w-auto"
                  >
                    Caler sur la Qibla maintenant
                  </Button>
                </div>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-center text-destructive text-sm"
              >
                <div className="flex items-center gap-2 justify-center">
                  <AlertCircle className="w-4 h-4" /> {error}
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* instructions */}
        {location && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="p-4 bg-muted/50 rounded-xl border">
              <div className="text-center space-y-2">
                <h3 className="font-semibold text-foreground">Conseils</h3>
                <p className="text-sm text-muted-foreground">
                  À Bonneuil-sur-Marne, l’azimut Qibla est ≈ <b>119°</b> (ESE).
                  Pose l’appareil à plat, éloigne-le des aimants/étuis
                  magnétiques. Si l’écart persiste, touche{" "}
                  <i>“Caler sur la Qibla maintenant”</i> puis ajuste finement
                  l’offset.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
