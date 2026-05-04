interface StatCardProps {
  label: string
  value: number | null
  accentColor: string
  icon?: string
}

export function StatCard({ label, value, accentColor, icon }: StatCardProps) {
  return (
    <div
      style={{
        background: 'var(--pz-surface)',
        border: '1px solid var(--pz-border)',
        borderRadius: 'var(--pz-radius-md)',
        boxShadow: 'var(--pz-shadow-sm)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        flex: 1,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          alignSelf: 'flex-start',
        }}
      >
        {icon && <span style={{ fontSize: '16px' }}>{icon}</span>}
        <span
          style={{
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--pz-fg-3)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          {label}
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <span
          style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: value !== null ? accentColor : 'var(--pz-border)',
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontSize: '40px',
            fontWeight: 700,
            color: value !== null ? 'var(--pz-fg-1)' : 'var(--pz-fg-3)',
            lineHeight: 1,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {value !== null ? value : '—'}
        </span>
        {value !== null && (
          <span style={{ fontSize: '16px', color: 'var(--pz-fg-3)', alignSelf: 'flex-end', paddingBottom: '4px' }}>
            /5
          </span>
        )}
      </div>

      <div style={{ display: 'flex', gap: '5px' }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: value !== null && i <= value ? accentColor : 'var(--pz-border)',
              transition: 'background var(--pz-dur-base)',
            }}
          />
        ))}
      </div>
    </div>
  )
}
