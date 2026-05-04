'use client'

export function AddGoalButton() {
  return (
    <button
      onClick={() => alert('Tulemas peagi')}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 18px',
        background: 'var(--pz-grad-primary)',
        color: '#fff',
        border: 'none',
        borderRadius: 'var(--pz-radius-pill)',
        fontSize: '14px',
        fontWeight: 600,
        cursor: 'pointer',
        boxShadow: 'var(--pz-shadow-sm)',
        transition: 'opacity var(--pz-dur-base)',
      }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = '0.85')}
      onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = '1')}
    >
      + Lisa eesmärk
    </button>
  )
}
