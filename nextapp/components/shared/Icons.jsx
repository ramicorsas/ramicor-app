const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round' };

export function IconBox({ size = 26, color = 'var(--samply-blue)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ color }}>
      <path {...stroke} d="M3 7.5 12 3l9 4.5-9 4.5-9-4.5Z" />
      <path {...stroke} d="M3 7.5v9L12 21l9-4.5v-9" />
      <path {...stroke} d="M12 12v9" />
    </svg>
  );
}

export function IconTruck({ size = 26, color = 'var(--samply-blue)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ color }}>
      <rect {...stroke} x="1.5" y="8" width="12.5" height="8.5" />
      <path {...stroke} d="M14 11h4l3.5 3v2.5H14Z" />
      <circle {...stroke} cx="5.5" cy="18.5" r="1.6" />
      <circle {...stroke} cx="17.5" cy="18.5" r="1.6" />
    </svg>
  );
}

export function IconBuilding({ size = 26, color = 'var(--samply-blue)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ color }}>
      <rect {...stroke} x="4" y="3" width="16" height="18" />
      <path {...stroke} d="M9 21v-4h6v4" />
      <path {...stroke} d="M8 7h1M11 7h1M14 7h1M8 11h1M11 11h1M14 11h1M8 15h1M14 15h1" />
    </svg>
  );
}

export function IconCrane({ size = 26, color = 'var(--samply-blue)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ color }}>
      <rect {...stroke} x="2" y="14" width="8" height="6" rx="1" />
      <circle {...stroke} cx="4.2" cy="21" r="1" />
      <circle {...stroke} cx="7.8" cy="21" r="1" />
      <path {...stroke} d="M10 15 16 7" />
      <path {...stroke} d="M16 7 20 9l-2 4" />
    </svg>
  );
}
