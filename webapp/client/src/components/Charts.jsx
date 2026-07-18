// Pure SVG/CSS Charts — no external library

// ── Donut Chart ────────────────────────────────────────────────
export function DonutChart({ data, size = 180, thickness = 36 }) {
  // data: [{label, value, color}]
  const total = data.reduce((a, d) => a + d.value, 0);
  if (!total) return <div className="chart-empty">No data</div>;

  const r = (size - thickness) / 2;
  const circumference = 2 * Math.PI * r;
  let offset = 0;

  const segments = data.map((d, i) => {
    const pct = d.value / total;
    const dash = circumference * pct;
    const gap  = circumference - dash;
    const seg = (
      <circle
        key={i}
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke={d.color}
        strokeWidth={thickness}
        strokeDasharray={`${dash} ${gap}`}
        strokeDashoffset={-offset}
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition: 'stroke-dasharray 0.6s ease', opacity: 0.9 }}
      />
    );
    offset += dash;
    return seg;
  });

  return (
    <div className="donut-wrap">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={thickness} />
        {segments}
        <text x={size/2} y={size/2 - 6} textAnchor="middle" fill="#e8eaf0" fontSize="20" fontWeight="800" fontFamily="'Space Grotesk',sans-serif">{total}</text>
        <text x={size/2} y={size/2 + 14} textAnchor="middle" fill="#6b7280" fontSize="9" fontFamily="'Space Grotesk',sans-serif" letterSpacing="2">TOTAL</text>
      </svg>
      <div className="donut-legend">
        {data.map((d, i) => (
          <div key={i} className="legend-row">
            <span className="legend-dot" style={{ background: d.color }} />
            <span className="legend-label">{d.label}</span>
            <span className="legend-val">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Bar Chart ──────────────────────────────────────────────────
export function BarChart({ data, height = 160, color = '#818cf8' }) {
  // data: [{label, value}]
  if (!data || !data.length) return <div className="chart-empty">No data</div>;
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="bar-chart" style={{ height }}>
      {data.map((d, i) => {
        const pct = (d.value / max) * 100;
        return (
          <div key={i} className="bar-col">
            <div className="bar-val">{d.value > 0 ? d.value : ''}</div>
            <div className="bar-body" style={{ height: `${Math.max(pct, 4)}%`, background: color, animationDelay: `${i * 0.07}s` }} />
            <div className="bar-label">{d.label}</div>
          </div>
        );
      })}
    </div>
  );
}

// ── Horizontal Progress Bar ────────────────────────────────────
export function ProgressBar({ value, max = 100, color = '#818cf8', label, sublabel }) {
  const pct = max ? Math.round((value / max) * 100) : 0;
  return (
    <div className="prog-row">
      <div className="prog-info">
        <span className="prog-label">{label}</span>
        {sublabel && <span className="prog-sub">{sublabel}</span>}
      </div>
      <div className="prog-track">
        <div className="prog-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="prog-pct">{pct}%</span>
    </div>
  );
}

// ── Mini Sparkline ─────────────────────────────────────────────
export function Sparkline({ data, color = '#818cf8', height = 40, width = 100 }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const step = width / (data.length - 1);
  const points = data.map((v, i) => {
    const x = i * step;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={data.length > 1 ? (data.length-1)*step : 0}
              cy={height - ((data[data.length-1] - min) / range) * height}
              r="3" fill={color} />
    </svg>
  );
}
