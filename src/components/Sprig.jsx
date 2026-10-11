// The recurring botanical motif: a fine gold sprig with a single blossom,
// echoing the cherry branch on the printed card. Every stroke uses
// pathLength=1 so CSS can "draw" it in (see .sprig rules in styles.css).

const STEM = [[6, 34], [38, 36], [74, 22], [112, 8]];

function bezier(t) {
  const [p0, p1, p2, p3] = STEM;
  const u = 1 - t;
  const pt = (i) => u ** 3 * p0[i] + 3 * u * u * t * p1[i] + 3 * u * t * t * p2[i] + t ** 3 * p3[i];
  const d = (i) => 3 * u * u * (p1[i] - p0[i]) + 6 * u * t * (p2[i] - p1[i]) + 3 * t * t * (p3[i] - p2[i]);
  return { x: pt(0), y: pt(1), angle: (Math.atan2(d(1), d(0)) * 180) / Math.PI };
}

function leafPath(len, width) {
  return `M0 0 Q${len * 0.45} ${-width} ${len} 0 Q${len * 0.55} ${width} 0 0 M0 0 L${len * 0.72} 0`;
}

// [position along stem, side (+1 above / -1 below), length]
const LEAVES = [
  [0.16, -1, 15], [0.27, 1, 17], [0.42, -1, 17], [0.55, 1, 15], [0.68, -1, 13], [0.8, 1, 11],
];

const PETALS = Array.from({ length: 5 }, (_, i) => i * 72);

export default function Sprig({ className = "", mirrored = false, title, ...rest }) {
  return (
    <svg
      className={`sprig ${className}`}
      viewBox="0 0 124 44"
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      style={mirrored ? { transform: 'scaleX(-1)' } : undefined}
      {...rest}
    >
      <path
        style={{ '--i': 0 }}
        d={`M${STEM[0]} C${STEM[1]} ${STEM[2]} ${STEM[3]}`}
        pathLength="1"
      />
      {LEAVES.map(([t, side, len], i) => {
        const { x, y, angle } = bezier(t);
        return (
          <path
            key={i}
            style={{ '--i': i + 1 }}
            d={leafPath(len, len * 0.3)}
            transform={`translate(${x} ${y}) rotate(${angle - side * 42})`}
            pathLength="1"
          />
        );
      })}
      <g transform="translate(113 8)">
        {PETALS.map((r, i) => (
          <path
            key={r}
            style={{ '--i': 7 + i * 0.4 }}
            d="M0 0 C-3.2 -3 -2.4 -7.4 0 -8 C2.4 -7.4 3.2 -3 0 0"
            transform={`rotate(${r + 18})`}
            pathLength="1"
          />
        ))}
        <circle className="sprig__heart" r="1.1" />
      </g>
    </svg>
  );
}
