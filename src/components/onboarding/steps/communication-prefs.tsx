'use client'

import * as React from 'react'
import type { Language } from '@/types'

export interface CommunicationPrefsValue {
  support_style: number
  feedback_directness: 'direct' | 'balanced' | 'gentle'
  language: Language
}

interface CommunicationPrefsProps {
  value: CommunicationPrefsValue
  onChange: (v: CommunicationPrefsValue) => void
}

const FEEDBACK_OPTIONS: Array<{
  value: CommunicationPrefsValue['feedback_directness']
  label: string
  description: string
}> = [
  {
    value: 'direct',
    label: 'Otsekohene',
    description: 'Ütle mulle otse, mida parandada.',
  },
  {
    value: 'balanced',
    label: 'Tasakaalustatud',
    description: 'Sega positiivne ja konstruktiivne.',
  },
  {
    value: 'gentle',
    label: 'Õrn',
    description: 'Kasuta pehmet ja toetavat keelt.',
  },
]

export function CommunicationPrefs({ value, onChange }: CommunicationPrefsProps) {
  function handleSupportStyle(e: React.ChangeEvent<HTMLInputElement>) {
    onChange({ ...value, support_style: Number(e.target.value) })
  }

  function handleDirectness(
    directness: CommunicationPrefsValue['feedback_directness'],
  ) {
    onChange({ ...value, feedback_directness: directness })
  }

  function handleLanguage(lang: Language) {
    onChange({ ...value, language: lang })
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h2
          className="text-xl font-semibold tracking-tight"
          style={{ color: 'var(--pz-fg-1)' }}
        >
          Suhtluseelistused
        </h2>
        <p className="text-sm" style={{ color: 'var(--pz-fg-3)' }}>
          AI kohandab oma tooni sinu eelistuste järgi. Saad neid igal ajal
          seadetes muuta.
        </p>
      </div>

      {/* Support style slider */}
      <SectionCard>
        <label
          htmlFor="support-style"
          className="block text-sm font-semibold"
          style={{ color: 'var(--pz-fg-1)' }}
        >
          Mis toetusviis sulle kõige paremini sobiks?
        </label>

        <div className="mt-4 flex flex-col gap-3">
          <input
            id="support-style"
            type="range"
            min={1}
            max={5}
            step={1}
            value={value.support_style}
            onChange={handleSupportStyle}
            className="w-full cursor-pointer accent-[--pz-violet]"
            style={{ accentColor: 'var(--pz-violet)' }}
            aria-valuemin={1}
            aria-valuemax={5}
            aria-valuenow={value.support_style}
          />
          <div className="flex justify-between">
            <span
              className="max-w-[45%] text-xs leading-snug"
              style={{ color: 'var(--pz-fg-3)' }}
            >
              Tahan lahendusi
            </span>
            <span
              className="max-w-[45%] text-right text-xs leading-snug"
              style={{ color: 'var(--pz-fg-3)' }}
            >
              Tahan esmalt olla kuuldud
            </span>
          </div>
        </div>

        {/* Visual indicator */}
        <div className="mt-2 flex justify-center">
          <StyleIndicator value={value.support_style} />
        </div>
      </SectionCard>

      {/* Feedback directness */}
      <SectionCard>
        <p
          className="text-sm font-semibold"
          style={{ color: 'var(--pz-fg-1)' }}
        >
          Tagasiside stiil
        </p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {FEEDBACK_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleDirectness(opt.value)}
              className="flex flex-col gap-1 rounded-[10px] border p-3 text-left transition-all"
              style={{
                borderColor:
                  value.feedback_directness === opt.value
                    ? 'var(--pz-violet)'
                    : 'var(--pz-border)',
                background:
                  value.feedback_directness === opt.value
                    ? '#f5f0ff'
                    : 'var(--pz-surface)',
                transitionDuration: 'var(--pz-dur-base)',
              }}
              aria-pressed={value.feedback_directness === opt.value}
            >
              <span
                className="text-sm font-semibold"
                style={{
                  color:
                    value.feedback_directness === opt.value
                      ? 'var(--pz-violet)'
                      : 'var(--pz-fg-1)',
                }}
              >
                {opt.label}
              </span>
              <span className="text-xs" style={{ color: 'var(--pz-fg-3)' }}>
                {opt.description}
              </span>
            </button>
          ))}
        </div>
      </SectionCard>

      {/* Language */}
      <SectionCard>
        <p
          className="text-sm font-semibold"
          style={{ color: 'var(--pz-fg-1)' }}
        >
          Keel
        </p>
        <div className="mt-3 flex gap-2">
          {(['et', 'en'] as Language[]).map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => handleLanguage(lang)}
              className="flex h-9 min-w-[72px] items-center justify-center rounded-[10px] border px-4 text-sm font-semibold transition-all"
              style={{
                borderColor:
                  value.language === lang
                    ? 'var(--pz-violet)'
                    : 'var(--pz-border)',
                background:
                  value.language === lang
                    ? 'var(--pz-grad-primary)'
                    : 'var(--pz-surface)',
                color: value.language === lang ? 'white' : 'var(--pz-fg-1)',
                transitionDuration: 'var(--pz-dur-base)',
              }}
              aria-pressed={value.language === lang}
            >
              {lang === 'et' ? 'ET' : 'EN'}
            </button>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-[10px] p-5"
      style={{
        background: 'var(--pz-surface)',
        border: '1px solid var(--pz-border)',
        boxShadow: 'var(--pz-shadow-sm)',
      }}
    >
      {children}
    </div>
  )
}

function StyleIndicator({ value }: { value: number }) {
  const labels = ['', 'Lahendused', 'Pigem lahendused', 'Tasakaalus', 'Pigem kuulamine', 'Kuulamine esmalt']
  return (
    <span
      className="rounded-full px-3 py-1 text-xs font-semibold"
      style={{
        background: 'var(--pz-grad-primary)',
        color: 'white',
      }}
    >
      {labels[value]}
    </span>
  )
}
