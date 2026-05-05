'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

interface Props {
  open: boolean
  onClose: () => void
}

const SUPPORT_OPTIONS = [
  { value: 'feel_heard', label: 'Tahan, et mind kuulataks' },
  { value: 'want_solution', label: 'Tahan lahendust' },
  { value: 'think_through', label: 'Tahan läbi mõelda' },
] as const

const selectStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 'var(--pz-radius-md)',
  border: '1px solid var(--pz-border)',
  fontSize: '14px',
  color: 'var(--pz-fg-1)',
  background: 'var(--pz-surface)',
  outline: 'none',
  fontFamily: 'inherit',
}

const labelStyle: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 600,
  color: 'var(--pz-fg-2)',
  display: 'block',
  marginBottom: '6px',
}

export function CreateBlockerModal({ open, onClose }: Props) {
  const router = useRouter()
  const [summary, setSummary] = useState('')
  const [supportType, setSupportType] = useState<'feel_heard' | 'want_solution' | 'think_through'>(
    'want_solution'
  )
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function reset() {
    setSummary('')
    setSupportType('want_solution')
    setError(null)
  }

  function handleClose() {
    reset()
    onClose()
  }

  async function save() {
    if (!summary.trim()) return
    setIsSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/blockers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summary, support_type: supportType }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      handleClose()
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Salvestamine ebaõnnestus')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Lisa takistus</DialogTitle>
        </DialogHeader>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '4px 0' }}>
          <div>
            <label style={labelStyle}>Mis sind takistab? *</label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Kirjelda lühidalt, mis on keeruline..."
              rows={3}
              style={{
                ...selectStyle,
                resize: 'vertical',
                lineHeight: 1.6,
              }}
              autoFocus
            />
          </div>

          <div>
            <label style={labelStyle}>Mida vajad?</label>
            <select
              value={supportType}
              onChange={(e) =>
                setSupportType(
                  e.target.value as 'feel_heard' | 'want_solution' | 'think_through'
                )
              }
              style={selectStyle}
            >
              {SUPPORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--pz-danger)' }}>{error}</p>
          )}
        </div>

        <DialogFooter>
          <button
            onClick={handleClose}
            disabled={isSaving}
            style={{
              padding: '8px 18px',
              borderRadius: 'var(--pz-radius-pill)',
              border: '1px solid var(--pz-border)',
              background: 'var(--pz-surface)',
              color: 'var(--pz-fg-2)',
              fontSize: '14px',
              fontWeight: 500,
              cursor: isSaving ? 'not-allowed' : 'pointer',
              opacity: isSaving ? 0.5 : 1,
            }}
          >
            Tühista
          </button>
          <button
            onClick={save}
            disabled={!summary.trim() || isSaving}
            style={{
              padding: '8px 20px',
              borderRadius: 'var(--pz-radius-pill)',
              border: 'none',
              background:
                !summary.trim() || isSaving ? 'var(--pz-border)' : 'var(--pz-grad-primary)',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 600,
              cursor: !summary.trim() || isSaving ? 'not-allowed' : 'pointer',
            }}
          >
            {isSaving ? 'Salvestan...' : 'Lisa takistus'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
