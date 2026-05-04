import { Button } from '@/components/ui/button'

interface ManagerWelcomeProps {
  onNext: () => void
}

export function ManagerWelcome({ onNext }: ManagerWelcomeProps) {
  return (
    <div className="flex flex-col gap-8">
      {/* Hero */}
      <div className="flex flex-col items-center gap-3 text-center">
        <div
          className="flex size-16 items-center justify-center rounded-2xl text-3xl"
          style={{ background: 'var(--pz-grad-primary)' }}
          aria-hidden="true"
        >
          🧭
        </div>
        <h1
          className="text-2xl font-semibold tracking-tight"
          style={{ color: 'var(--pz-fg-1)' }}
        >
          Tere tulemast, juht!
        </h1>
        <p
          className="max-w-md text-sm leading-relaxed"
          style={{ color: 'var(--pz-fg-3)' }}
        >
          Tiim.app annab sulle nädala alguses automaatse kokkuvõtte oma
          meeskonnast — ilma pikki koosolekuid pidamata.
        </p>
      </div>

      {/* Key manager capabilities */}
      <ul className="flex flex-col gap-4">
        <ManagerPoint
          icon="📋"
          title="Meeskonna ülevaade ühes kohas"
          description="Näed, kuidas igal tiimiliikmel läheb — meeleolu, energia, töömaht ja blokeerijad kõrvuti."
        />
        <ManagerPoint
          icon="🤖"
          title="AI nädala digest"
          description="Iga nädal saad automaatse kokkuvõtte: kes vajab tähelepanu, mis on blokeeritud, mis läheb hästi."
        />
        <ManagerPoint
          icon="📡"
          title="Meeskonna pulss"
          description="Näed anonüümset meeleoludünaamikat — nii saad reageerida enne, kui väike probleem suureks kasvab."
        />
        <ManagerPoint
          icon="📣"
          title="Teated kogu tiimile"
          description="Saada lühikesi teateid kõigile või valitud inimestele — AI aitab sõnumi vormistada."
        />
      </ul>

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

interface ManagerPointProps {
  icon: string
  title: string
  description: string
}

function ManagerPoint({ icon, title, description }: ManagerPointProps) {
  return (
    <li
      className="flex gap-4 rounded-[10px] p-4"
      style={{
        background: 'var(--pz-surface)',
        border: '1px solid var(--pz-border)',
        boxShadow: 'var(--pz-shadow-sm)',
      }}
    >
      <span className="mt-0.5 text-2xl leading-none" aria-hidden="true">
        {icon}
      </span>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold" style={{ color: 'var(--pz-fg-1)' }}>
          {title}
        </p>
        <p className="text-sm" style={{ color: 'var(--pz-fg-3)' }}>
          {description}
        </p>
      </div>
    </li>
  )
}
