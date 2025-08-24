import { Button } from "@/components/ui/button";
import { DhikrPageLayout } from "@/layout/DhikrPageLayout";
import {
  AlertCircle,
  Bug,
  CheckCircle,
  Compass,
  RotateCw,
  Settings2,
} from "lucide-react";
import { motion } from "motion/react"; // Motion One
import { useEffect, useMemo, useRef, useState } from "react";

// ───────────────────────────────────────────────────────────────────────────────
// Constantes & Utils
// ───────────────────────────────────────────────────────────────────────────────
const KAABA_LAT = 21.422487;
const KAABA_LON = 39.826206;
const EARTH_RADIUS_KM = 6371;

const degToRad = (deg: number) => (deg * Math.PI) / 180;
const radToDeg = (rad: number) => (rad * 180) / Math.PI;

// Haversine distance (km)
function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const dLat = degToRad(lat2 - lat1);
  const dLon = degToRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(degToRad(lat1)) *
      Math.cos(degToRad(lat2)) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

// Azimut vers la Kaaba (0–360° depuis le nord)
function getQiblaBearing(lat: number, lon: number) {
  const lat1 = degToRad(lat);
  const lon1 = degToRad(lon);
  const lat2 = degToRad(KAABA_LAT);
  const lon2 = degToRad(KAABA_LON);
  const dLon = lon2 - lon1;
  const x = Math.sin(dLon);
  const y = Math.cos(lat1) * Math.tan(lat2) - Math.sin(lat1) * Math.cos(dLon);
  let brng = radToDeg(Math.atan2(x, y));
  brng = (brng + 360) % 360;
  return brng;
}

// alpha/beta/gamma -> heading (° depuis le nord)
function computeCompassHeading(alpha: number, beta: number, gamma: number) {
  const degtorad = Math.PI / 180;
  const _x = beta * degtorad;
  const _y = gamma * degtorad;
  const _z = alpha * degtorad;
  const cX = Math.cos(_x);
  const cY = Math.cos(_y);
  const cZ = Math.cos(_z);
  const sX = Math.sin(_x);
  const sY = Math.sin(_y);
  const sZ = Math.sin(_z);
  const Vx = -cZ * sY - sZ * sX * cY;
  const Vy = -sZ * sY + cZ * sX * cY;
  let heading = Math.atan(Vx / Vy);
  if (Vy < 0) heading += Math.PI;
  else if (Vx < 0) heading += 2 * Math.PI;
  return radToDeg(heading);
}

// moyenne circulaire d’un tableau d’angles (deg)
function circularMean(angles: number[]) {
  if (!angles.length) return 0;
  const sum = angles.reduce(
    (acc, a) => {
      const r = degToRad(a);
      acc.x += Math.cos(r);
      acc.y += Math.sin(r);
      return acc;
    },
    { x: 0, y: 0 },
  );
  const mean = Math.atan2(sum.y / angles.length, sum.x / angles.length);
  const deg = (radToDeg(mean) + 360) % 360;
  return deg;
}

// diff la plus courte (signed, -180..180)
function shortestDiff(a: number, b: number) {
  return ((b - a + 540) % 360) - 180;
}

function supportsVibrate() {
  return typeof navigator !== "undefined" && "vibrate" in navigator;
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = () => setReduced(!!mq.matches);
    handler();
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);
  return reduced;
}

// ───────────────────────────────────────────────────────────────────────────────
// Composant principal
// ───────────────────────────────────────────────────────────────────────────────
export default function Qibla() {
  // Position / capteur
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(
    null,
  );
  const [headingRaw, setHeadingRaw] = useState<number | null>(null); // brut
  const [orientationStatus, setOrientationStatus] = useState<
    "unknown" | "granted" | "denied"
  >("unknown");
  const [error, setError] = useState<string | null>(null);

  // Réglages utilisateur (persistés)
  const [tolerance, setTolerance] = useState<number>(() => {
    const v = localStorage.getItem("qbl_tol");
    return v ? Number(v) : 5; // ±5° par défaut
  });
  const [smoothWindow, setSmoothWindow] = useState<number>(() => {
    const v = localStorage.getItem("qbl_smooth");
    return v ? Number(v) : 5; // 5 dernières mesures
  });
  const [showDebug, setShowDebug] = useState<boolean>(() => {
    return localStorage.getItem("qbl_debug") === "1";
  });

  useEffect(() => {
    localStorage.setItem("qbl_tol", String(tolerance));
  }, [tolerance]);
  useEffect(() => {
    localStorage.setItem("qbl_smooth", String(smoothWindow));
  }, [smoothWindow]);
  useEffect(() => {
    localStorage.setItem("qbl_debug", showDebug ? "1" : "0");
  }, [showDebug]);

  // Géolocalisation
  useEffect(() => {
    if (
      navigator.geolocation &&
      typeof navigator.geolocation.watchPosition === "function"
    ) {
      const id = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setCoords({ lat: latitude, lon: longitude });
        },
        () => {
          setError(
            "Impossible de déterminer votre position. La direction sera approximative.",
          );
          setCoords({ lat: 48.8566, lon: 2.3522 }); // Paris fallback
        },
        { enableHighAccuracy: true, maximumAge: 30000 },
      );
      return () => {
        if (navigator.geolocation.clearWatch) {
          navigator.geolocation.clearWatch(id);
        }
      };
    } else {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setCoords({ lat: latitude, lon: longitude });
        },
        () => {
          setError(
            "Impossible de déterminer votre position. La direction sera approximative.",
          );
          setCoords({ lat: 48.8566, lon: 2.3522 });
        },
      );
    }
  }, []);

  // Capteur orientation (après permission)
  const rawBufferRef = useRef<number[]>([]);
  const reducedMotion = usePrefersReducedMotion();
  useEffect(() => {
    if (orientationStatus !== "granted") return;

    function handleOrientation(event: DeviceOrientationEvent) {
      let current: number | null = null;
      // iOS
      const iosHeading = (event as any).webkitCompassHeading;
      if (typeof iosHeading === "number") {
        current = iosHeading;
      } else if (
        event.alpha != null &&
        event.beta != null &&
        event.gamma != null
      ) {
        current = computeCompassHeading(event.alpha, event.beta, event.gamma);
      }
      if (current != null) {
        // buffer pour smoothing
        const buf = rawBufferRef.current;
        buf.push((current + 360) % 360);
        if (buf.length > Math.max(1, smoothWindow)) buf.shift();
        setHeadingRaw(circularMean(buf));
      }
    }

    window.addEventListener("deviceorientation", handleOrientation);
    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
      rawBufferRef.current = [];
    };
  }, [orientationStatus, smoothWindow]);

  // Demander permission (iOS)
  const requestOrientationPermission = () => {
    if (
      typeof DeviceOrientationEvent !== "undefined" &&
      typeof (DeviceOrientationEvent as any).requestPermission === "function"
    ) {
      (DeviceOrientationEvent as any)
        .requestPermission()
        .then((res: string) => {
          if (res === "granted") {
            setOrientationStatus("granted");
            setError(null);
          } else {
            setOrientationStatus("denied");
            setError(
              "Vous avez refusé l’accès au capteur d’orientation. L’aiguille restera fixe.",
            );
          }
        })
        .catch(() => {
          setOrientationStatus("denied");
          setError(
            "Le capteur d’orientation n’est pas disponible sur cet appareil.",
          );
        });
    } else {
      setOrientationStatus("granted"); // Android / Desktop
    }
  };

  // Calculs affichés
  const qiblaBearing = useMemo(() => {
    if (!coords) return 0;
    return getQiblaBearing(coords.lat, coords.lon);
  }, [coords]);

  const distanceKm = useMemo(() => {
    if (!coords) return null;
    return getDistanceKm(coords.lat, coords.lon, KAABA_LAT, KAABA_LON);
  }, [coords]);

  const relativeAngle =
    headingRaw != null && orientationStatus === "granted"
      ? (qiblaBearing - headingRaw + 360) % 360
      : qiblaBearing;

  const aligned = relativeAngle < tolerance || relativeAngle > 360 - tolerance;

  // Haptique : vibre quand on ENTRE dans l’état aligné
  const prevAlignedRef = useRef<boolean>(false);
  useEffect(() => {
    if (aligned && !prevAlignedRef.current && supportsVibrate()) {
      navigator.vibrate?.(20);
    }
    prevAlignedRef.current = aligned;
  }, [aligned]);

  // ────────────────────────────────────────────────────────────────────────────
  // UI
  // ────────────────────────────────────────────────────────────────────────────
  return (
    <DhikrPageLayout title="Direction de la Qibla" progressPct={0}>
      {/* Zone live pour lecteurs d'écran */}
      <div className="sr-only" aria-live="polite">
        {aligned
          ? "Alignement parfait vers la Qibla."
          : `Écart de ${Math.round(
              Math.min(relativeAngle, 360 - relativeAngle),
            )} degrés.`}
      </div>

      <div className="flex flex-col items-center gap-6 py-6">
        {/* Cadran */}
        <div className="relative w-72 h-72 rounded-full border-4 border-muted flex items-center justify-center">
          {/* Anneau + cardinal points */}
          <svg
            viewBox="0 0 100 100"
            className="absolute inset-0 w-full h-full text-muted-foreground/80"
          >
            <defs>
              {/* Arc d’écart (en dessous) */}
              <linearGradient id="delta" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="hsl(221 83% 53%)" />
                <stop offset="100%" stopColor="hsl(142 72% 45%)" />
              </linearGradient>
            </defs>
            <circle
              cx="50"
              cy="50"
              r="48"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            {/* Cardinal points visibles en dark */}
            <text x="50" y="12" textAnchor="middle" fontSize="8">
              N
            </text>
            <text x="50" y="96" textAnchor="middle" fontSize="8">
              S
            </text>
            <text x="92" y="54" textAnchor="middle" fontSize="8">
              E
            </text>
            <text x="8" y="54" textAnchor="middle" fontSize="8">
              O
            </text>

            {/* Arc d’écart (de 0 vers relativeAngle, côté le plus court) */}
            {(() => {
              const delta = Math.min(relativeAngle, 360 - relativeAngle);
              const start = -90; // haut
              const end = start + (relativeAngle <= 180 ? delta : -delta);
              const a1 = (Math.PI / 180) * start;
              const a2 = (Math.PI / 180) * end;
              const r = 42;
              const p1 = {
                x: 50 + r * Math.cos(a1),
                y: 50 + r * Math.sin(a1),
              };
              const p2 = {
                x: 50 + r * Math.cos(a2),
                y: 50 + r * Math.sin(a2),
              };
              const large = 0;
              const sweep = relativeAngle <= 180 ? 1 : 0;
              const d = `M ${p1.x} ${p1.y} A ${r} ${r} 0 ${large} ${sweep} ${p2.x} ${p2.y}`;
              return (
                <path d={d} stroke="url(#delta)" strokeWidth="6" fill="none" />
              );
            })()}
          </svg>

          {/* Halo animé si aligné */}
          <motion.div
            className="absolute w-56 h-56 rounded-full"
            style={{ boxShadow: "0 0 0 0 rgba(34,197,94,0.0)" }}
            animate={
              aligned
                ? {
                    boxShadow: [
                      "0 0 0 0 rgba(34,197,94,0.0)",
                      "0 0 0 12px rgba(34,197,94,0.20)",
                      "0 0 0 0 rgba(34,197,94,0.0)",
                    ],
                  }
                : { boxShadow: "0 0 0 0 rgba(34,197,94,0.0)" }
            }
            transition={
              aligned
                ? { duration: 1.2, repeat: Infinity, easing: "ease-in-out" }
                : { duration: 0.2 }
            }
          />

          {/* Aiguille animée */}
          <motion.div
            animate={{
              rotate: relativeAngle,
              scale: aligned ? 1.08 : 1,
            }}
            transition={
              reducedMotion
                ? { duration: 0 } // respect prefers-reduced-motion
                : { type: "spring", stiffness: 220, damping: 26 }
            }
            className="absolute top-1/2 left-1/2 origin-bottom"
            style={{ translate: "-50% -100%" }}
          >
            <div
              className={`w-1 h-32 rounded-b-full shadow-md ${
                aligned ? "bg-green-500" : "bg-primary"
              }`}
            />
            <div
              className={`w-5 h-5 rounded-full -mt-2 ${
                aligned ? "bg-green-500" : "bg-primary"
              }`}
            />
          </motion.div>
        </div>

        {/* Message alignement */}
        <div
          className={`flex items-center gap-2 text-sm ${
            aligned ? "text-green-500" : "text-muted-foreground"
          }`}
        >
          {aligned ? <CheckCircle size={16} /> : <Compass size={16} />}
          {aligned
            ? "Vous êtes bien orienté·e vers la Qibla"
            : `Écart : ${Math.round(
                Math.min(relativeAngle, 360 - relativeAngle),
              )}°`}
        </div>

        {/* Infos distance / azimut */}
        {distanceKm !== null && (
          <p className="text-sm text-muted-foreground">
            Distance : {distanceKm.toFixed(0)} km • Azimut :{" "}
            {qiblaBearing.toFixed(0)}°
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {orientationStatus === "unknown" && (
            <Button
              onClick={requestOrientationPermission}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Compass className="h-4 w-4" />
              Activer la boussole
            </Button>
          )}

          {orientationStatus === "granted" && (
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 text-muted-foreground"
              onClick={() => {
                setOrientationStatus("unknown");
                setHeadingRaw(null);
                rawBufferRef.current = [];
              }}
            >
              <RotateCw size={16} />
              Recalibrer
            </Button>
          )}

          {/* Réglages rapides */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border">
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
                max={15}
                value={smoothWindow}
                onChange={(e) => setSmoothWindow(Number(e.target.value))}
                className="ml-2 align-middle"
              />
              <span className="ml-1">{smoothWindow}</span>
            </label>
          </div>

          {/* Debug toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowDebug((v) => !v)}
            aria-pressed={showDebug}
            title="Afficher les valeurs brutes"
          >
            <Bug className="w-4 h-4" />
          </Button>
        </div>

        {/* Bloc debug optionnel */}
        {showDebug && (
          <div className="text-xs text-muted-foreground/80 border rounded-lg px-3 py-2 max-w-[22rem]">
            <div>lat/lon : {coords ? `${coords.lat.toFixed(5)}, ${coords.lon.toFixed(5)}` : "—"}</div>
            <div>heading(smooth) : {headingRaw?.toFixed(1) ?? "—"}°</div>
            <div>qiblaBearing : {qiblaBearing.toFixed(1)}°</div>
            <div>relativeAngle : {relativeAngle.toFixed(1)}°</div>
            <div>status : {orientationStatus}</div>
            {error && (
              <div className="mt-1 text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {error}
              </div>
            )}
          </div>
        )}
      </div>
    </DhikrPageLayout>
  );
}
