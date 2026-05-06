'use client'

import * as React from 'react'
import { useState, useCallback, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import type { User } from '@/types'
import type { CommunicationPrefsValue } from './steps/communication-prefs'
import { RoleSelect } from './steps/role-select'
import { Welcome } from './steps/welcome'
import { HowChatWorks } from './steps/how-chat-works'
import { WeeklyIntro } from './steps/weekly-intro'
import { CommunicationPrefs } from './steps/communication-prefs'
import { BelbinUpload } from './steps/belbin-upload'
import { CompanySetup } from './steps/company-setup'
import { ManagerWelcome } from './steps/manager-welcome'
import { ManagerGoalsIntro } from './steps/manager-goals-intro'
import { InviteTeam } from './steps/invite-team'
import { ConfirmConnection } from './steps/confirm-connection'

// ─── Step IDs ────────────────────────────────────────────────────────────────
type StepId =
  | 'role-select'
  | 'welcome'
  | 'how-chat-works'
  | 'weekly-intro'
  | 'manager-welcome'
  | 'manager-goals-intro'
  | 'communication-prefs'
  | 'belbin-upload'
  | 'company-setup'
  | 'invite-team'
  | 'confirm-connection'
  | 'done'

function buildSteps(isManager: boolean, hasInvite: boolean): StepId[] {
  const intro: StepId[] = isManager
    ? ['manager-welcome', 'manager-goals-intro']
    : ['welcome', 'how-chat-works', 'weekly-intro']

  const common: StepId[] = ['communication-prefs', 'belbin-upload']

  if (hasInvite) {
    return ['role-select', ...intro, ...common, 'confirm-connection', 'done']
  }
  return ['role-select', ...intro, ...common, 'company-setup', 'invite-team', 'done']
}

const SELF_NAVIGATING_STEPS = new Set<StepId>([
  'role-select',
  'welcome',
  'how-chat-works',
  'weekly-intro',
  'manager-welcome',
  'manager-goals-intro',
  'belbin-upload',
  'company-setup',
  'invite-team',
  'confirm-connection',
])

// ─── Form data ────────────────────────────────────────────────────────────────
interface OnboardingFormData {
  prefs: CommunicationPrefsValue
  belbinUploaded: boolean
  companyDone: boolean
}

const DEFAULT_PREFS: CommunicationPrefsValue = {
  support_style: 3,
  feedback_directness: 'balanced',
  language: 'et',
}

interface InviteContext {
  token: string
  inviter_name: string
  invitee_role: 'team_member' | 'manager'
}

// ─── Wizard ──────────────────────────────────────────────────────────────────
export interface OnboardingWizardProps {
  user: User
  inviteToken?: string
}

export function OnboardingWizard({ user, inviteToken: propToken }: OnboardingWizardProps) {
  const router = useRouter()

  const [selectedRole, setSelectedRole] = useState<'team_member' | 'manager'>(
    user.role === 'manager' ? 'manager' : 'team_member'
  )
  const [inviteCtx, setInviteCtx] = useState<InviteContext | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<OnboardingFormData>({
    prefs: {
      support_style: user.support_style ?? DEFAULT_PREFS.support_style,
      feedback_directness: user.feedback_directness ?? DEFAULT_PREFS.feedback_directness,
      language: user.language ?? DEFAULT_PREFS.language,
    },
    belbinUploaded: user.belbin_uploaded ?? false,
    companyDone: Boolean(user.company_id),
  })
  const [isFinishing, setIsFinishing] = useState(false)
  const [finishError, setFinishError] = useState<string | null>(null)

  // Resolve invite token from prop or localStorage, then fetch invite info
  useEffect(() => {
    const token = propToken ?? (typeof window !== 'undefined' ? localStorage.getItem('tiim_invite_token') ?? undefined : undefined)
    if (!token) return

    async function loadInvite() {
      try {
        // Use the invite (sets company + role on the user)
        const useRes = await fetch(`/api/invites/${token}/use`, { method: 'POST' })
        if (!useRes.ok) {
          localStorage.removeItem('tiim_invite_token')
          return
        }
        const useData = await useRes.json()

        // Fetch invite info for the confirm-connection step
        const infoRes = await fetch(`/api/invites/${token}`)
        if (!infoRes.ok) return
        const info = await infoRes.json()

        setInviteCtx({
          token: token!,
          inviter_name: info.inviter_name,
          invitee_role: useData.invitee_role,
        })
        setSelectedRole(useData.invitee_role)
        localStorage.removeItem('tiim_invite_token')
      } catch {
        localStorage.removeItem('tiim_invite_token')
      }
    }

    loadInvite()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const steps = useMemo(
    () => buildSteps(selectedRole === 'manager', inviteCtx !== null),
    [selectedRole, inviteCtx]
  )

  const stepId = steps[currentStep]
  const progressValue = Math.round(((currentStep + 1) / steps.length) * 100)

  const goNext = useCallback(() => {
    setCurrentStep((s) => Math.min(s + 1, steps.length - 1))
  }, [steps.length])

  const goBack = useCallback(() => {
    setCurrentStep((s) => Math.max(s - 1, 0))
  }, [])

  const updatePrefs = useCallback((v: CommunicationPrefsValue) => {
    setFormData((d) => ({ ...d, prefs: v }))
  }, [])

  function handleRoleSelected(role: 'team_member' | 'manager') {
    setSelectedRole(role)
    goNext()
  }

  async function handleFinish(destination: '/dashboard' | '/chat' | '/goals') {
    setIsFinishing(true)
    setFinishError(null)
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      const res = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: formData.prefs.language,
          support_style: formData.prefs.support_style,
          feedback_directness: formData.prefs.feedback_directness,
          timezone,
        }),
      })
      if (!res.ok) throw new Error('Salvestamine ebaõnnestus. Proovi uuesti.')
      router.push(destination)
    } catch (err) {
      setFinishError(err instanceof Error ? err.message : 'Midagi läks valesti.')
      setIsFinishing(false)
    }
  }

  const stepLabel = `Samm ${currentStep + 1} / ${steps.length}`
  const showFooter = !SELF_NAVIGATING_STEPS.has(stepId)

  return (
    <div
      className="flex min-h-screen w-full flex-col items-center justify-center px-4 py-12"
      style={{ background: 'var(--pz-grad-app-bg)' }}
    >
      <div
        className="w-full max-w-[640px] rounded-[10px]"
        style={{
          background: 'var(--pz-surface)',
          border: '1px solid var(--pz-border)',
          boxShadow: 'var(--pz-shadow-md)',
          padding: '20px',
        }}
      >
        {/* Progress header */}
        <div className="mb-8 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span
              className="text-xs font-medium tabular-nums"
              style={{ color: 'var(--pz-fg-3)' }}
              aria-live="polite"
              aria-atomic="true"
            >
              {stepLabel}
            </span>
            <span
              className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
              style={{ background: 'var(--pz-grad-primary)', color: 'white' }}
            >
              {progressValue}%
            </span>
          </div>
          <div
            className="h-2 w-full overflow-hidden rounded-full"
            style={{ background: 'var(--pz-border)' }}
            role="progressbar"
            aria-valuenow={progressValue}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full"
              style={{
                background: 'var(--pz-grad-primary)',
                width: `${progressValue}%`,
                transition: 'width var(--pz-dur-base) var(--pz-ease)',
              }}
            />
          </div>
        </div>

        <StepTransition stepKey={stepId}>
          <StepRenderer
            stepId={stepId}
            user={user}
            selectedRole={selectedRole}
            inviteCtx={inviteCtx}
            formData={formData}
            isFinishing={isFinishing}
            finishError={finishError}
            onRoleSelected={handleRoleSelected}
            onNext={goNext}
            onSkip={goNext}
            onDone={goNext}
            onPrefsChange={updatePrefs}
            onBelbinUploaded={() => {
              setFormData((d) => ({ ...d, belbinUploaded: true }))
              goNext()
            }}
            onFinish={handleFinish}
          />
        </StepTransition>

        {showFooter && (
          <WizardFooter
            currentStep={currentStep}
            isFinishing={isFinishing}
            finishError={finishError}
            onBack={goBack}
            onNext={goNext}
            onFinish={handleFinish}
          />
        )}
      </div>

      <p className="mt-8 text-xs" style={{ color: 'var(--pz-fg-3)' }}>
        tiim.space · Aus AI meeskonnatoe jaoks
      </p>
    </div>
  )
}

// ─── Step renderer ────────────────────────────────────────────────────────────
interface StepRendererProps {
  stepId: StepId
  user: User
  selectedRole: 'team_member' | 'manager'
  inviteCtx: InviteContext | null
  formData: OnboardingFormData
  isFinishing: boolean
  finishError: string | null
  onRoleSelected: (role: 'team_member' | 'manager') => void
  onNext: () => void
  onSkip: () => void
  onDone: () => void
  onPrefsChange: (v: CommunicationPrefsValue) => void
  onBelbinUploaded: () => void
  onFinish: (destination: '/dashboard' | '/chat' | '/goals') => Promise<void>
}

function StepRenderer({
  stepId,
  user,
  selectedRole,
  inviteCtx,
  formData,
  isFinishing,
  finishError,
  onRoleSelected,
  onNext,
  onSkip,
  onDone,
  onPrefsChange,
  onBelbinUploaded,
  onFinish,
}: StepRendererProps) {
  switch (stepId) {
    case 'role-select':
      return (
        <RoleSelect
          initialRole={selectedRole}
          onNext={onRoleSelected}
        />
      )
    case 'welcome':
      return <Welcome onNext={onNext} />
    case 'how-chat-works':
      return <HowChatWorks onNext={onNext} />
    case 'weekly-intro':
      return <WeeklyIntro onNext={onNext} />
    case 'manager-welcome':
      return <ManagerWelcome onNext={onNext} />
    case 'manager-goals-intro':
      return <ManagerGoalsIntro onNext={onNext} />
    case 'communication-prefs':
      return <CommunicationPrefs value={formData.prefs} onChange={onPrefsChange} />
    case 'belbin-upload':
      return <BelbinUpload onSkip={onSkip} onUploaded={onBelbinUploaded} />
    case 'company-setup':
      return <CompanySetup user={user} onDone={onDone} />
    case 'invite-team':
      return <InviteTeam onNext={onNext} />
    case 'confirm-connection':
      return inviteCtx ? (
        <ConfirmConnection
          inviterName={inviteCtx.inviter_name}
          inviteToken={inviteCtx.token}
          inviteeRole={inviteCtx.invitee_role}
          onNext={onNext}
        />
      ) : null
    case 'done':
      return (
        <DoneStep
          isManager={selectedRole === 'manager'}
          isFinishing={isFinishing}
          finishError={finishError}
          onFinish={onFinish}
        />
      )
    default:
      return null
  }
}

// ─── Done step ────────────────────────────────────────────────────────────────
function DoneStep({
  isManager,
  isFinishing,
  finishError,
  onFinish,
}: {
  isManager: boolean
  isFinishing: boolean
  finishError: string | null
  onFinish: (destination: '/dashboard' | '/chat' | '/goals') => Promise<void>
}) {
  return (
    <div className="flex flex-col items-center gap-6 py-4 text-center">
      <div
        className="flex size-20 items-center justify-center rounded-full text-4xl"
        style={{ background: 'var(--pz-grad-primary)' }}
      >
        🎉
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--pz-fg-1)' }}>
          Oled valmis!
        </h2>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--pz-fg-3)' }}>
          {isManager
            ? 'Sinu tiim ootab. Alusta esimese eesmärgi seadmisest.'
            : 'Onboarding on lõpetatud. Alusta esimese nädala sisseregistreerimisega.'}
        </p>
      </div>

      {finishError && (
        <p className="text-xs font-medium" style={{ color: 'var(--pz-danger)' }}>
          {finishError}
        </p>
      )}

      {isManager ? (
        <div className="flex flex-col gap-3 sm:flex-row">
          <DoneButton label="Sea esimene eesmärk" primary disabled={isFinishing} onClick={() => void onFinish('/goals')} />
          <DoneButton label="Mine armatuurlauale" primary={false} disabled={isFinishing} onClick={() => void onFinish('/dashboard')} />
        </div>
      ) : (
        <div className="flex flex-col gap-3 sm:flex-row">
          <DoneButton label="Alusta sisseregistreerimist" primary disabled={isFinishing} onClick={() => void onFinish('/chat')} />
          <DoneButton label="Sea eesmärgid" primary={false} disabled={isFinishing} onClick={() => void onFinish('/goals')} />
        </div>
      )}

      {isFinishing && (
        <p className="text-xs" style={{ color: 'var(--pz-fg-3)' }}>Salvestamine...</p>
      )}
    </div>
  )
}

function DoneButton({ label, primary, disabled, onClick }: { label: string; primary: boolean; disabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center justify-center rounded-[10px] px-5 py-2.5 text-sm font-semibold transition-all disabled:opacity-50"
      style={
        primary
          ? { background: 'var(--pz-grad-primary)', color: 'white', border: 'none' }
          : { background: 'var(--pz-surface)', color: 'var(--pz-fg-1)', border: '1px solid var(--pz-border)' }
      }
    >
      {label}
    </button>
  )
}

// ─── Shared footer nav ────────────────────────────────────────────────────────
function WizardFooter({
  currentStep,
  isFinishing,
  onBack,
  onNext,
}: {
  currentStep: number
  isFinishing: boolean
  finishError: string | null
  onBack: () => void
  onNext: () => void
  onFinish: (destination: '/dashboard' | '/chat' | '/goals') => Promise<void>
}) {
  return (
    <div
      className="mt-6 flex items-center justify-between border-t pt-4"
      style={{ borderColor: 'var(--pz-border)' }}
    >
      <Button
        variant="ghost"
        onClick={onBack}
        disabled={currentStep === 0}
        style={{ color: 'var(--pz-fg-3)' }}
      >
        ← Tagasi
      </Button>
      <Button
        onClick={onNext}
        disabled={isFinishing}
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
  )
}

// ─── Step transition ──────────────────────────────────────────────────────────
function StepTransition({ stepKey, children }: { stepKey: string; children: React.ReactNode }) {
  return (
    <div key={stepKey} style={{ animation: 'stepFadeIn var(--pz-dur-base) var(--pz-ease) both' }}>
      <style>{`
        @keyframes stepFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      {children}
    </div>
  )
}
