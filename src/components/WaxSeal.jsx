import { useId } from 'react';
import logoMask from '../assets/logo/logo-mask.webp';

// A dimensional wax seal drawn in SVG.

// Wax colour: a muted wine that picks up the blossoms in the card painting.
const WAX = { light: "#a65a5e", base: "#7b333a", dark: "#4a1a20" };

const C = 100;
// Monogram size inside the seal's 124-unit impression (logo is 640×744).
const LOGO_H = 96;
const LOGO_W = LOGO_H * (640 / 744);

// Irregular, slightly lumpy outline so the wax looks poured rather than drawn.
function blobPath() {
  const n = 56;
  const pts = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    const r = 88 + 3.2 * Math.sin(3 * a + 1.1) + 2 * Math.sin(7 * a + 0.4) + 1.3 * Math.sin(13 * a + 2.3)
      + 2.6 * Math.max(0, Math.sin(5 * a - 0.8)) ** 6;
    return [C + r * Math.cos(a), C + r * Math.sin(a)];
  });
  // Catmull-Rom → cubic Bézier for a smooth closed curve.
  let d = `M${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1.map((v) => v.toFixed(2))} ${c2.map((v) => v.toFixed(2))} ${p2.map((v) => v.toFixed(2))}`;
  }
  return d + 'Z';
}

const BLOB = blobPath();

// Small laurel leaves arranged in two arcs around the impression.
const WREATH = Array.from({ length: 11 }, (_, i) => {
  const a = (100 + i * 15) * (Math.PI / 180);
  return { a, deg: (a * 180) / Math.PI };
});

function Wreath({ side }) {
  return WREATH.map(({ a, deg }, i) => {
    const ang = side === 1 ? a : Math.PI - a;
    const x = C + 74 * Math.cos(ang), y = C + 74 * Math.sin(ang);
    const rot = side === 1 ? deg + 90 + 28 : 180 - deg - 90 - 28;
    return (
      <path key={i} d="M0 0 Q3.4 -4.6 0 -10 Q-3.4 -4.6 0 0Z" transform={`translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${rot.toFixed(1)})`} />
    );
  });
}

export default function WaxSeal({ className = '' }) {
  const id = useId().replace(/:/g, '');

  return (
    <div className={`seal ${className}`} aria-hidden="true">
      <svg viewBox="-12 -12 224 224" aria-hidden="true">
        <defs>
          <radialGradient id={`${id}wax`} cx="38%" cy="32%" r="75%">
            <stop offset="0" stopColor={WAX.light} />
            <stop offset="0.55" stopColor={WAX.base} />
            <stop offset="1" stopColor={WAX.dark} />
          </radialGradient>
          <radialGradient id={`${id}well`} cx="62%" cy="66%" r="80%">
            <stop offset="0" stopColor={WAX.light} />
            <stop offset="0.7" stopColor={WAX.base} />
            <stop offset="1" stopColor={WAX.dark} />
          </radialGradient>
          <filter id={`${id}soft`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" />
          </filter>
          <filter id={`${id}grain`}>
            <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="2" seed="4" />
            <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.09 0" />
            <feComposite in2="SourceGraphic" operator="in" />
          </filter>
          <mask id={`${id}logo`} maskUnits="userSpaceOnUse" x="0" y="0" width="200" height="200">
            <image href={logoMask} x={100 - LOGO_W / 2} y={100 - LOGO_H / 2} width={LOGO_W} height={LOGO_H} />
          </mask>
        </defs>

          <g>
            <path d={BLOB} fill={`url(#${id}wax)`} />
            {/* raised rim of the impression */}
            <circle cx={C} cy={C} r="64" fill="none" stroke={WAX.dark} strokeOpacity=".55" strokeWidth="3" transform="translate(1.4 1.8)" />
            <circle cx={C} cy={C} r="64" fill="none" stroke={WAX.light} strokeOpacity=".7" strokeWidth="2" transform="translate(-1 -1.2)" />
            {/* pressed well: lit from the opposite side so it reads as recessed */}
            <circle cx={C} cy={C} r="62" fill={`url(#${id}well)`} />
            <g fill={WAX.dark} opacity=".45" transform="translate(1 1.2)"><Wreath side={1} /><Wreath side={-1} /></g>
            <g fill={WAX.light} opacity=".9"><Wreath side={1} /><Wreath side={-1} /></g>
            {/* the FE monogram pressed into the wax: shadow, highlight, then the face */}
            <g transform="translate(1.3 1.6)"><rect width="200" height="200" fill={WAX.dark} opacity=".8" mask={`url(#${id}logo)`} /></g>
            <g transform="translate(-0.8 -1)"><rect width="200" height="200" fill="#f4c7c3" opacity=".42" mask={`url(#${id}logo)`} /></g>
            <rect width="200" height="200" fill={WAX.base} mask={`url(#${id}logo)`} />
            <ellipse cx="70" cy="56" rx="30" ry="13" transform="rotate(-32 70 56)" fill="#fff" opacity=".16" filter={`url(#${id}soft)`} />
            <path d={BLOB} fill="#000" filter={`url(#${id}grain)`} />
          </g>
      </svg>
    </div>
  );
}
