'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { User } from '@/types'

interface CompanySetupProps {
  user: User
  onDone: () => void
}

type Tab = 'create' | 'join'
type SubmitState = 'idle' | 'submitting' | 'success' | 'error'

export function CompanySetup({ user, onDone }: CompanySetupProps) {
  const hasCompany = Boolean(user.company_id)

  const [activeTab, setActiveTab] = useState<Tab>('create')
  const [companyName, setCompanyName] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [submitState, setSubmitState] = useState<SubmitState>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  if (hasCompany) {
    return (
      <div className="flex flex-col gap-8">
        <Header />
        <div
          className="flex items-center gap-4 rounded-[10px] p-5"
          style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
          }}
        >
          <span className="text-2xl" aria-hidden="true">
            🏢
          </span>
          <div>
            <p className="text-sm font-semibold" style={{ color: '#15803d' }}>
              Sa oled juba ettevõttega liitunud
            </p>
            <p className="text-xs" style={{ color: '#166534' }}>
              Sinu ettevõte on seadistatud ja valmis.
            </p>
          </div>
        </div>
        <div className="flex justify-end">
          <ContinueButton onClick={onDone} />
        </div>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrorMessage(null)
    setSubmitState('submitting')

    const body =
      activeTab === 'create'
        ? { name: companyName.trim(), mode: 'create' as const }
        : { name: joinCode.trim(), mode: 'join' as const, join_code: joinCode.trim() }

    if (!body.name) {
      setErrorMessage(
        activeTab === 'create'
          ? 'Palun sisesta ettevõtte nimi.'
          : 'Palun sisesta liitumiskood.',
      )
      setSubmitState('idle')
      return
    }

    try {
      const res = await fetch('/api/onboarding/company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(data.error ?? 'Viga ettevõtte seadistamisel.')
      }

      setSubmitState('success')
      setSuccessMessage(
        activeTab === 'create'
          ? 'Ettevõte loodud!'
          : 'Liitumistaotlus saadetud — admin kinnitab peagi.',
      )
      onDone()
    } catch (err) {
      setSubmitState('error')
      setErrorMessage(err instanceof Error ? err.message : 'Midagi läks valesti.')
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <Header />

      {/* Tab switcher */}
      <div
        className="flex rounded-[10px] p-1"
        style={{
          background: '#f1f5f9',
          border: '1px solid var(--pz-border)',
        }}
        role="tablist"
        aria-label="Ettevõtte seadistuse viis"
      >
        {(['create', 'join'] as Tab[]).map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={activeTab === tab}
            onClick={() => {
              setActiveTab(tab)
              setErrorMessage(null)
            }}
            className="flex-1 rounded-lg py-2 text-sm font-medium transition-all"
            style={{
              background:
                activeTab === tab ? 'var(--pz-surface)' : 'transparent',
              color:
                activeTab === tab ? 'var(--pz-fg-1)' : 'var(--pz-fg-3)',
              boxShadow:
                activeTab === tab ? 'var(--pz-shadow-sm)' : 'none',
              transitionDuration: 'var(--pz-dur-base)',
            }}
          >
            {tab === 'create' ? 'Loo uus ettevõte' : 'Liitu olemasolevaga'}
          </button>
        ))}
      </div>

      {/* Form */}
      <form
        onSubmit={(e) => void handleSubmit(e)}
        className="flex flex-col gap-4"
      >
        {activeTab === 'create' ? (
          <div className="flex flex-col gap-2">
            <label
              htmlFor="company-name"
              className="text-sm font-medium"
              style={{ color: 'var(--pz-fg-1)' }}
            >
              Ettevõtte nimi
            </label>
            <Input
              id="company-name"
              type="text"
              placeholder="nt. Acme OÜ"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              disabled={submitState === 'submitting'}
              autoComplete="organization"
            />
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <label
              htmlFor="join-code"
              className="text-sm font-medium"
              style={{ color: 'var(--pz-fg-1)' }}
            >
              Liitumiskood
            </label>
            <Input
              id="join-code"
              type="text"
              placeholder="Küsi oma adminilt"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              disabled={submitState === 'submitting'}
            />
            <p className="text-xs" style={{ color: 'var(--pz-fg-3)' }}>
              Liitumiskoodi saad oma ettevõtte adminilt. Peale taotluse
              saatmist kinnitab admin sinu liitumise.
            </p>
          </div>
        )}

        {errorMessage && (
          <p className="text-xs font-medium" style={{ color: 'var(--pz-danger)' }}>
            {errorMessage}
          </p>
        )}

        {successMessage && (
          <p className="text-xs font-medium" style={{ color: 'var(--pz-success)' }}>
            {successMessage}
          </p>
        )}

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={submitState === 'submitting'}
            style={{
              background: 'var(--pz-grad-primary)',
              color: 'white',
              borderRadius: 'var(--pz-radius-md)',
              border: 'none',
            }}
          >
            {submitState === 'submitting'
              ? 'Palun oota...'
              : activeTab === 'create'
                ? 'Loo ettevõte'
                : 'Saada taotlus'}
          </Button>
        </div>
      </form>
    </div>
  )
}

function Header() {
  return (
    <div className="flex flex-col gap-2">
      <h2
        className="text-xl font-semibold tracking-tight"
        style={{ color: 'var(--pz-fg-1)' }}
      >
        Ettevõtte seadistus
      </h2>
      <p className="text-sm" style={{ color: 'var(--pz-fg-3)' }}>
        Loo uus ettevõte või liitu olemasolevaga kasutades liitumiskoodi.
      </p>
    </div>
  )
}

function ContinueButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      type="button"
      onClick={onClick}
      style={{
        background: 'var(--pz-grad-primary)',
        color: 'white',
        borderRadius: 'var(--pz-radius-md)',
        border: 'none',
      }}
    >
      Edasi
    </Button>
  )
}
