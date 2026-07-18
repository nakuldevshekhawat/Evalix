export default function SkeletonLoader({ rows = 5, cols = 4 }) {
  return (
    <div className="skeleton-wrap">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton-row" style={{ animationDelay: `${i * 0.08}s` }}>
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="skeleton-cell" style={{ flex: j === 0 ? 0.5 : 1 }} />
          ))}
        </div>
      ))}
    </div>
  );
}
