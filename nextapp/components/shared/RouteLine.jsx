export function RouteLine({ height = 60 }) {
  return (
    <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" style={{ width: '100%', height, display: 'block' }} aria-hidden="true">
      <line
        x1="0" y1={height / 2} x2="100" y2={height / 2}
        stroke="var(--samply-blue)" strokeWidth="0.6" strokeDasharray="3 3"
        className="ramicor-route-line"
      />
    </svg>
  );
}

export function RouteDot({ color = 'var(--samply-blue)' }) {
  return (
    <span style={{
      display: 'inline-block', width: 10, height: 10, borderRadius: '50%',
      background: color, boxShadow: `0 0 0 4px ${color === 'var(--samply-blue)' ? 'var(--samply-blue-50)' : 'rgba(255,255,255,0.15)'}`,
      flex: 'none',
    }} />
  );
}
