'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Sparkles, MessageSquare, X } from 'lucide-react'

export function FirstCheckinModal({ userName }: { userName: string }) {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null

  const firstName = userName.split(' ')[0]

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        background: 'rgba(16,24,40,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
      }}
      onClick={() => setDismissed(true)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(16,24,40,0.18)',
          padding: '48px 40px', maxWidth: '480px', width: '100%',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: '24px', textAlign: 'center', position: 'relative',
        }}
      >
        <button
          onClick={() => setDismissed(true)}
          style={{
            position: 'absolute', top: '16px', right: '16px',
            width: '32px', height: '32px', borderRadius: '50%',
            border: '1px solid #e5e7eb', background: '#fff',
            display: 'grid', placeItems: 'center', cursor: 'pointer',
            color: '#9ca3af',
          }}
        >
          <X style={{ width: '14px', height: '14px' }} />
        </button>

        <div style={{
          width: '72px', height: '72px', borderRadius: '50%',
          background: 'linear-gradient(168deg, #6030ff 0%, #1f4fd8 100%)',
          display: 'grid', placeItems: 'center',
        }}>
          <Sparkles style={{ width: '32px', height: '32px', color: '#fff' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h2 style={{ margin: 0, fontSize: '26px', fontWeight: 700, color: '#101828', letterSpacing: '-0.26px', lineHeight: 1.25 }}>
            Tere, {firstName}! 👋
          </h2>
          <p style={{ margin: 0, fontSize: '15px', color: '#4a5565', lineHeight: 1.6 }}>
            Tee oma esimene sissekanne ja näed kohe ka kõiki rakenduse funktsionaalsusi.
          </p>
        </div>

        <Link
          href="/chat"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '10px',
            padding: '14px 28px', borderRadius: '10px',
            background: 'linear-gradient(168deg, #6030ff 0%, #1f4fd8 100%)',
            color: '#fff', fontWeight: 600, fontSize: '15px', textDecoration: 'none',
            boxShadow: '0 4px 16px rgba(96,48,255,0.3)',
          }}
        >
          <MessageSquare style={{ width: '18px', height: '18px' }} />
          Alusta esimest sisseregistreerimist
        </Link>

        <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>
          Võtab umbes 5 minutit
        </p>
      </div>
    </div>
  )
}
