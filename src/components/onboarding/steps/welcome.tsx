import { Button } from '@/components/ui/button'

interface WelcomeProps {
  onNext: () => void
}

export function Welcome({ onNext }: WelcomeProps) {
  return (
    <div className="flex flex-col gap-8">
      {/* Hero */}
      <div className="flex flex-col items-center gap-3 text-center">
        <div
          className="flex size-16 items-center justify-center rounded-2xl text-3xl"
          style={{
            background: 'var(--pz-grad-primary)',
          }}
          aria-hidden="true"
        >
          👋
        </div>
        <h1
          className="text-2xl font-semibold tracking-tight"
          style={{ color: 'var(--pz-fg-1)' }}
        >
          Tere tulemast Tiim.app&#39;i!
        </h1>
        <p
          className="max-w-md text-sm leading-relaxed"
          style={{ color: 'var(--pz-fg-3)' }}
        >
          Tiim.app aitab sul ja sinu meeskonnal hoida ühist rütmi — iganädalaste
          sisseregistreerimiste, eesmärkide ja AI-tugise tagasiside kaudu.
        </p>
      </div>

      {/* Key points */}
      <ul className="flex flex-col gap-4">
        <WelcomePoint
          icon="💬"
          title="Räägi või kirjuta"
          description="Kõik algab vestlusest. Räägi oma nädalast vabalt — AI struktureerib selle sinust."
        />
        <WelcomePoint
          icon="📊"
          title="Nädalane ülevaade"
          description="Iga nädal saad kiire kokkuvõtte: meeleolu, energia, töömaht, blokeerijad ja kiidusõnad."
        />
        <WelcomePoint
          icon="🎯"
          title="Eesmärgid ja kasv"
          description="Seo oma igapäevatöö suurema pildiga — kvartalieesmärke on lihtne jälgida ja uuendada."
        />
      </ul>

      {/* CTA */}
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

interface WelcomePointProps {
  icon: string
  title: string
  description: string
}

function WelcomePoint({ icon, title, description }: WelcomePointProps) {
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
