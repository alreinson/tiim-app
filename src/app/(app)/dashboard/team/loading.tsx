export default function Loading() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', animation: 'pulse 1.5s ease-in-out infinite' }}>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
      <div style={{ height: '32px', width: '200px', background: 'var(--pz-border)', borderRadius: 'var(--pz-radius-sm)' }} />
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{ width: '200px', height: '120px', background: 'var(--pz-border)', borderRadius: 'var(--pz-radius-md)' }} />
        ))}
      </div>
      {[160, 140].map((h, i) => (
        <div key={i} style={{ height: `${h}px`, background: 'var(--pz-border)', borderRadius: 'var(--pz-radius-md)' }} />
      ))}
    </div>
  )
}
