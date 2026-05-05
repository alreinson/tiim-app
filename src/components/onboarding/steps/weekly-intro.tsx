import { Button } from '@/components/ui/button'

interface WeeklyIntroProps {
  onNext: () => void
}

const CHECKIN_TOPICS = [
  {
    icon: '🎯',
    label: 'Eesmärkide edenemist',
    description: 'Mis läks plaanipäraselt? Mis on veel töös?',
  },
  {
    icon: '📅',
    label: 'Järgmise nädala plaane',
    description: 'Mida tahad järgmisel nädalal saavutada?',
  },
  {
    icon: '🌡️',
    label: 'Meeleolu, energiat ja töökoormust',
    description: 'Lühike 1–5 hinnang — juhil on ülevaade.',
  },
  {
    icon: '🚧',
    label: 'Blokkerid',
    description: 'Mis takistab sind? Juht saab aidata.',
  },
  {
    icon: '🌟',
    label: 'Kiidusõnu',
    description: 'Keda tahad tänada? Anonüümselt või avalikult.',
  },
] as const

interface CheckinTopicProps {
  icon: string
  label: string
  description: string
}

function CheckinTopic({ icon, label, description }: CheckinTopicProps) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 text-xl leading-none" aria-hidden="true">
        {icon}
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

export function WeeklyIntro({ onNext }: WeeklyIntroProps) {
  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h2
          className="text-xl font-semibold tracking-tight"
          style={{ color: 'var(--pz-fg-1)' }}
        >
          Mis toimub igal nädalal?
        </h2>
        <p className="text-sm" style={{ color: 'var(--pz-fg-3)' }}>
          Nädala kokkuvõtte tegemine võtab tavaliselt{' '}
          <strong>5–10 minutit</strong>. Saad seda teha millal tahad — AI hoiab
          selle kiire ja lihtsa.
        </p>
      </div>

      {/* What it covers */}
      <div
        className="flex flex-col gap-5 rounded-[10px] p-5"
        style={{
          background: 'var(--pz-surface)',
          border: '1px solid var(--pz-border)',
          boxShadow: 'var(--pz-shadow-sm)',
        }}
      >
        <p className="text-sm font-semibold" style={{ color: 'var(--pz-fg-1)' }}>
          Sisseregistreerimine katab:
        </p>
        <ul className="flex flex-col gap-4">
          {CHECKIN_TOPICS.map((topic) => (
            <CheckinTopic key={topic.label} {...topic} />
          ))}
        </ul>
      </div>

      {/* How it ends */}
      <div
        className="flex items-start gap-3 rounded-[10px] p-4"
        style={{
          background: '#faf5ff',
          border: '1px solid #e9d5ff',
        }}
      >
        <span className="mt-0.5 text-xl leading-none" aria-hidden="true">
          ✨
        </span>
        <p className="text-sm" style={{ color: 'var(--pz-fg-1)' }}>
          AI koostab kokkuvõtte ja esitab selle sulle ülevaatamiseks. Saad
          muuta, lisada või lihtsalt kinnitada — siis on nädala kokkuvõte
          tehtud.
        </p>
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
