export default function Loading() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: 'pulse 1.5s ease-in-out infinite' }}>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
      <div style={{ height: '32px', width: '160px', background: 'var(--pz-border)', borderRadius: 'var(--pz-radius-sm)' }} />
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} style={{ width: '180px', height: '100px', background: 'var(--pz-border)', borderRadius: 'var(--pz-radius-md)' }} />
        ))}
      </div>
    </div>
  )
}
