// Avatar component — colored initials-based avatars
const COLORS = [
  ['#6366f1','#4338ca'], ['#8b5cf6','#6d28d9'], ['#ec4899','#be185d'],
  ['#f59e0b','#b45309'], ['#10b981','#047857'], ['#3b82f6','#1d4ed8'],
  ['#ef4444','#b91c1c'], ['#14b8a6','#0f766e'], ['#f97316','#c2410c'],
];

function getColor(name = '') {
  const i = (name.charCodeAt(0) || 0) % COLORS.length;
  return COLORS[i];
}

function getInitials(name = '') {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

export default function Avatar({ name = '', size = 36, className = '' }) {
  const [bg, border] = getColor(name);
  return (
    <div
      className={`avatar ${className}`}
      style={{
        width: size, height: size,
        background: `linear-gradient(135deg, ${bg}, ${border})`,
        borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.36,
        fontWeight: 700,
        color: '#fff',
        flexShrink: 0,
        letterSpacing: '0.5px',
        fontFamily: "'Space Grotesk', sans-serif",
      }}
    >
      {getInitials(name)}
    </div>
  );
}
