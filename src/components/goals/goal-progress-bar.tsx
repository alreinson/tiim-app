interface GoalProgressBarProps {
  progress: number
  height?: number
}

export function GoalProgressBar({ progress, height = 6 }: GoalProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, progress))
  return (
    <div
      style={{
        background: 'var(--pz-border)',
        borderRadius: 'var(--pz-radius-pill)',
        height: `${height}px`,
        overflow: 'hidden',
        width: '100%',
      }}
    >
      <div
        style={{
          background: 'var(--pz-grad-primary)',
          borderRadius: 'var(--pz-radius-pill)',
          height: '100%',
          width: `${clamped}%`,
          transition: `width var(--pz-dur-base) ease`,
        }}
      />
    </div>
  )
}
