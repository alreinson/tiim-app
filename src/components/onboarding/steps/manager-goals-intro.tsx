import * as React from 'react'
import { Button } from '@/components/ui/button'

interface ManagerGoalsIntroProps {
  onNext: () => void
}

export function ManagerGoalsIntro({ onNext }: ManagerGoalsIntroProps) {
  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h2
          className="text-xl font-semibold tracking-tight"
          style={{ color: 'var(--pz-fg-1)' }}
        >
          Eesmärgid ja teated
        </h2>
        <p className="text-sm" style={{ color: 'var(--pz-fg-3)' }}>
          Hoia meeskond ühel lehel — kvartalieesmärkidest kuni igapäevaste
          teadeteni.
        </p>
      </div>

      {/* Goals section */}
      <SectionCard>
        <div className="flex items-center gap-3">
          <span className="text-2xl" aria-hidden="true">
            🎯
          </span>
          <p className="text-sm font-semibold" style={{ color: 'var(--pz-fg-1)' }}>
            Kvartalieesmärkide seadmine
          </p>
        </div>
        <ol className="mt-4 flex flex-col gap-3 pl-4">
          <GoalStep
            number={1}
            text="Mine eesmärkide vaatesse ja loo uus kvartalieesmärk."
          />
          <GoalStep
            number={2}
            text="Lisa eesmärgile tiimiliikmed — igaüks näeb oma rolli."
          />
          <GoalStep
            number={3}
            text="Tiimiliikmed uuendavad edenemist oma nädala sisseregistreerimisel."
          />
          <GoalStep
            number={4}
            text="Sina näed kokkuvõtet — edenemist on lihtne jälgida."
          />
        </ol>
      </SectionCard>

      {/* Team attachment */}
      <SectionCard>
        <div className="flex items-center gap-3">
          <span className="text-2xl" aria-hidden="true">
            👥
          </span>
          <p className="text-sm font-semibold" style={{ color: 'var(--pz-fg-1)' }}>
            Tiimiliikmete lisamine eesmärkidele
          </p>
        </div>
        <p className="mt-3 text-sm" style={{ color: 'var(--pz-fg-3)' }}>
          Iga eesmärgi all saad märkida, kes on kaasatud. Tiimiliikmed näevad
          oma eesmärke nädala sisseregistreerimise ajal ja saavad edenemist
          uuendada vestluse kaudu.
        </p>
      </SectionCard>

      {/* Broadcasts */}
      <SectionCard>
        <div className="flex items-center gap-3">
          <span className="text-2xl" aria-hidden="true">
            📣
          </span>
          <p className="text-sm font-semibold" style={{ color: 'var(--pz-fg-1)' }}>
            Teated tiimile (Broadcasts)
          </p>
        </div>
        <p className="mt-3 text-sm" style={{ color: 'var(--pz-fg-3)' }}>
          Saada lühikesi teadaandeid kogu tiimile või valitud inimestele.
          Teated ilmuvad tiimiliikmete armatuurlauale ja AI saab aidata
          sõnumit vormistada ning tõlkida.
        </p>
        <div
          className="mt-4 rounded-lg p-3 text-sm"
          style={{
            background: '#faf5ff',
            border: '1px solid #e9d5ff',
            color: 'var(--pz-fg-1)',
          }}
        >
          <span className="font-medium">Näide: </span>
          &quot;Sel nädalal on Q2 ülevaatekoosolek neljapäeval kell 15. Palun
          valmistage ette 3 edenemispunkti.&quot;
        </div>
      </SectionCard>

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

interface GoalStepProps {
  number: number
  text: string
}

function GoalStep({ number, text }: GoalStepProps) {
  return (
    <li className="flex items-start gap-3">
      <span
        className="flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
        style={{ background: 'var(--pz-grad-primary)' }}
        aria-hidden="true"
      >
        {number}
      </span>
      <span className="text-sm" style={{ color: 'var(--pz-fg-3)' }}>
        {text}
      </span>
    </li>
  )
}
