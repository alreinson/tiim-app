import * as React from 'react'
import { Button } from '@/components/ui/button'

interface HowChatWorksProps {
  onNext: () => void
}

export function HowChatWorks({ onNext }: HowChatWorksProps) {
  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h2
          className="text-xl font-semibold tracking-tight"
          style={{ color: 'var(--pz-fg-1)' }}
        >
          Kuidas vestlus töötab?
        </h2>
        <p className="text-sm" style={{ color: 'var(--pz-fg-3)' }}>
          Saad rääkida või kirjutada — AI teeb ülejäänu. Sul pole vaja mõelda
          struktuuri peale.
        </p>
      </div>

      {/* Steps */}
      <ol className="flex flex-col gap-3">
        <ChatStep
          step={1}
          label="Sina rääkid"
          description="Kirjuta vabas vormis või kasuta mikrofoni. Ütle, mis sul nädalal toimus."
        />
        <ChatStep
          step={2}
          label="AI struktureerib"
          description="AI eraldab peamised teemad: eesmärgid, blokeerijad, meeleolu ja kiidusõnad."
        />
        <ChatStep
          step={3}
          label="Sina kinnitad"
          description="Näed ülevaadet, saad seda muuta ja siis kinnitad — kõik läheb salvestusse."
        />
      </ol>

      {/* Mock chat preview */}
      <div
        className="flex flex-col gap-3 rounded-[10px] p-5"
        style={{
          background: 'var(--pz-surface)',
          border: '1px solid var(--pz-border)',
          boxShadow: 'var(--pz-shadow-md)',
        }}
        aria-label="Näidisvestlus"
      >
        <p
          className="text-xs font-medium uppercase tracking-widest"
          style={{ color: 'var(--pz-fg-3)' }}
        >
          Näide
        </p>

        <ChatBubble role="user">
          Sel nädalal lõpetasin API integratsiooni. Oli natuke keeruline, aga
          sain hakkama. Energia on hea, aga dokumentatsioon jäi veel pooleli.
        </ChatBubble>

        <ChatBubble role="ai">
          Sain aru! Märkisin üles: ✅ API integratsioon valmis · ⚠️ Dokumentatsioon
          pooleli (blokeerija?) · ⚡ Energia: hea. Kas midagi on veel lisada?
        </ChatBubble>

        <ChatBubble role="user">Ei, see on täpne.</ChatBubble>

        <div
          className="rounded-lg px-3 py-2 text-xs"
          style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            color: '#15803d',
          }}
        >
          ✓ Sisseregistreerimine salvestatud
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={onNext}
          className="px-6"
          style={{
            background: 'var(--pz-grad-primary)',
            color: 'white',
            borderRadius: 'var(--pz-radius-md)',
            border: 'none',
          }}
        >
          Edasi
        </Button>
      </div>
    </div>
  )
}

interface ChatStepProps {
  step: number
  label: string
  description: string
}

function ChatStep({ step, label, description }: ChatStepProps) {
  return (
    <li className="flex items-start gap-3">
      <span
        className="flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
        style={{ background: 'var(--pz-grad-primary)' }}
        aria-hidden="true"
      >
        {step}
      </span>
      <div>
        <p className="text-sm font-medium" style={{ color: 'var(--pz-fg-1)' }}>
          {label}
        </p>
        <p className="text-sm" style={{ color: 'var(--pz-fg-3)' }}>
          {description}
        </p>
      </div>
    </li>
  )
}

interface ChatBubbleProps {
  role: 'user' | 'ai'
  children: React.ReactNode
}

function ChatBubble({ role, children }: ChatBubbleProps) {
  const isUser = role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className="max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
        style={
          isUser
            ? {
                background: 'var(--pz-grad-primary)',
                color: 'white',
                borderBottomRightRadius: '4px',
              }
            : {
                background: '#f1f5f9',
                color: 'var(--pz-fg-1)',
                borderBottomLeftRadius: '4px',
              }
        }
      >
        {children}
      </div>
    </div>
  )
}
