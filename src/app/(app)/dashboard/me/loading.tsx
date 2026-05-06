export default function Loading() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', animation: 'pulse 1.5s ease-in-out infinite' }}>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
      {/* Header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ height: '32px', width: '220px', background: 'var(--pz-border)', borderRadius: 'var(--pz-radius-sm)' }} />
        <div style={{ height: '16px', width: '140px', background: 'var(--pz-border)', borderRadius: 'var(--pz-radius-sm)' }} />
      </div>
      {/* Stat cards */}
      <div style={{ display: 'flex', gap: '16px' }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ flex: 1, height: '96px', background: 'var(--pz-border)', borderRadius: 'var(--pz-radius-md)' }} />
        ))}
      </div>
      {/* Content blocks */}
      {[180, 140, 120].map((h, i) => (
        <div key={i} style={{ height: `${h}px`, background: 'var(--pz-border)', borderRadius: 'var(--pz-radius-md)' }} />
      ))}
    </div>
  )
}
