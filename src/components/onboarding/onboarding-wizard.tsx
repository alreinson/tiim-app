'use client'

import * as React from 'react'
import { useState, useCallback, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowRight, Check, Sparkles, Target, Users,
  UserPlus, Building2, Mail, X, Flame,
  MessageSquare, Send, Mic,
} from 'lucide-react'
import type { User } from '@/types'
import type { CommunicationPrefsValue } from './steps/communication-prefs'
import { CommunicationPrefs } from './steps/communication-prefs'

// ─── Step types ───────────────────────────────────────────────────────────────

type StepId =
  | 'role'
  | 'welcome'
  | 'workspace'
  | 'confirm'
  | 'info-1'
  | 'info-2'
  | 'info-3'
  | 'comm-prefs'
  | 'done'

function buildSteps(isManager: boolean, hasInvite: boolean): StepId[] {
  const workspaceOrConfirm: StepId = hasInvite ? 'confirm' : 'workspace'
  if (isManager) return ['role', 'welcome', workspaceOrConfirm, 'done']
  return ['role', 'welcome', workspaceOrConfirm, 'info-1', 'info-2', 'info-3', 'comm-prefs']
}

const INFO_SLIDES = [
  {
    id: 'info-1' as const,
    badge: 'Chat-first',
    title: 'Kuidas vestlus töötab',
    body: 'Räägi või kirjuta vabalt — tiim.space struktureerib selle sinu eest. Vormi täita pole kunagi vaja.',
  },
  {
    id: 'info-2' as const,
    badge: 'Nädalane rütm',
    title: 'Nädalane sisselogimine',
    body: '5 minutit kord nädalas. Progress, plaanid, probleemid — eraldatakse vestlusest automaatselt.',
  },
  {
    id: 'info-3' as const,
    badge: 'Alati nähtaval',
    title: 'Eesmärgid ja kvartal',
    body: 'Eesmärgid on kõigile nähtavad. Uuenda inline või vestlusest — tiim.space pakub muudatusi ise välja.',
  },
]

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

export interface OnboardingWizardProps {
  user: User
  inviteToken?: string
}

// ─── Wizard ──────────────────────────────────────────────────────────────────

export function OnboardingWizard({ user, inviteToken: propToken }: OnboardingWizardProps) {
  const router = useRouter()

  const [selectedRole, setSelectedRole] = useState<'team_member' | 'manager'>(
    user.role === 'manager' ? 'manager' : 'team_member'
  )
  const [inviteCtx, setInviteCtx] = useState<InviteContext | null>(null)
  const [currentStep, setCurrentStep] = useState(0)

  // Workspace state
  const [inviteMode, setInviteMode] = useState<'join' | 'create' | null>(null)
  const [companyName, setCompanyName] = useState('')
  const [orgCode, setOrgCode] = useState('')
  const [inviteEmails, setInviteEmails] = useState<string[]>([])
  const [emailInput, setEmailInput] = useState('')
  const [workspaceLoading, setWorkspaceLoading] = useState(false)
  const [workspaceError, setWorkspaceError] = useState<string | null>(null)

  // Prefs
  const [prefs, setPrefs] = useState<CommunicationPrefsValue>({
    support_style: user.support_style ?? DEFAULT_PREFS.support_style,
    feedback_directness: user.feedback_directness ?? DEFAULT_PREFS.feedback_directness,
    language: user.language ?? DEFAULT_PREFS.language,
  })
  const [isFinishing, setIsFinishing] = useState(false)
  const [finishError, setFinishError] = useState<string | null>(null)

  const isManager = selectedRole === 'manager'

  // Resolve invite token at startup
  useEffect(() => {
    const token =
      propToken ??
      (typeof window !== 'undefined'
        ? (localStorage.getItem('tiim_invite_token') ?? undefined)
        : undefined)
    if (!token) return

    async function loadInvite() {
      try {
        const useRes = await fetch(`/api/invites/${token}/use`, { method: 'POST' })
        if (!useRes.ok) { localStorage.removeItem('tiim_invite_token'); return }
        const useData = (await useRes.json()) as { invitee_role: 'team_member' | 'manager' }
        const infoRes = await fetch(`/api/invites/${token}`)
        if (!infoRes.ok) return
        const info = (await infoRes.json()) as { inviter_name: string }
        setInviteCtx({ token: token!, inviter_name: info.inviter_name, invitee_role: useData.invitee_role })
        setSelectedRole(useData.invitee_role)
        localStorage.removeItem('tiim_invite_token')
      } catch {
        localStorage.removeItem('tiim_invite_token')
      }
    }
    void loadInvite()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const steps = useMemo(
    () => buildSteps(isManager, inviteCtx !== null),
    [isManager, inviteCtx]
  )
  const stepId = steps[currentStep]
  const progressValue = Math.round(((currentStep + 1) / steps.length) * 100)

  const goNext = useCallback(
    () => setCurrentStep((s) => Math.min(s + 1, steps.length - 1)),
    [steps.length]
  )
  const goBack = useCallback(() => setCurrentStep((s) => Math.max(s - 1, 0)), [])

  // ─── Handlers ──────────────────────────────────────────────────────────────

  async function handleWorkspaceSubmit() {
    setWorkspaceLoading(true)
    setWorkspaceError(null)
    try {
      if (!isManager && inviteMode === 'join') {
        const res = await fetch(`/api/invites/${orgCode.trim()}/use`, { method: 'POST' })
        if (!res.ok) {
          const d = (await res.json().catch(() => ({}))) as { error?: string }
          throw new Error(d.error ?? 'Vigane liitumiskood. Küsi juhilt uus kood.')
        }
      } else {
        const res = await fetch('/api/onboarding/company', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: companyName.trim(), mode: 'create' }),
        })
        if (!res.ok) {
          const d = (await res.json().catch(() => ({}))) as { error?: string }
          throw new Error(d.error ?? 'Viga ettevõtte loomisel.')
        }
        if (inviteEmails.length > 0) {
          await Promise.allSettled(
            inviteEmails.map((email) =>
              fetch('/api/invites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
              })
            )
          )
        }
      }
      goNext()
    } catch (err) {
      setWorkspaceError(err instanceof Error ? err.message : 'Midagi läks valesti.')
    } finally {
      setWorkspaceLoading(false)
    }
  }

  async function handleFinish() {
    setIsFinishing(true)
    setFinishError(null)
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      const res = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: prefs.language,
          support_style: prefs.support_style,
          feedback_directness: prefs.feedback_directness,
          timezone,
        }),
      })
      if (!res.ok) throw new Error('Salvestamine ebaõnnestus. Proovi uuesti.')
      router.push(isManager ? '/dashboard' : '/chat')
    } catch (err) {
      setFinishError(err instanceof Error ? err.message : 'Midagi läks valesti.')
      setIsFinishing(false)
    }
  }

  async function handleContinue() {
    if (stepId === 'role') {
      try {
        await fetch('/api/user/me', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: selectedRole }),
        })
      } catch { /* non-critical */ }
      goNext()
      return
    }
    if (stepId === 'workspace') {
      await handleWorkspaceSubmit()
      return
    }
    if (stepId === 'confirm' && inviteCtx) {
      try {
        await fetch(`/api/invites/${inviteCtx.token}/connect`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ connected: true }),
        })
      } catch { /* non-critical */ }
      goNext()
      return
    }
    if (stepId === 'comm-prefs' || stepId === 'done') {
      await handleFinish()
      return
    }
    goNext()
  }

  // ─── Disabled / label ──────────────────────────────────────────────────────

  const isContinueDisabled =
    (stepId === 'role' && !selectedRole) ||
    (stepId === 'workspace' && !isManager && !inviteMode) ||
    (stepId === 'workspace' && !isManager && inviteMode === 'join' && !orgCode.trim()) ||
    (stepId === 'workspace' && (isManager || inviteMode === 'create') && !companyName.trim()) ||
    workspaceLoading ||
    isFinishing

  const getContinueLabel = () => {
    if (workspaceLoading || isFinishing) return 'Palun oota...'
    if (stepId === 'comm-prefs') return 'Alusta esimest sisselogimist'
    if (stepId === 'done') return isManager ? 'Mine töölaudale' : 'Alusta'
    if (stepId === 'workspace' && inviteEmails.length > 0)
      return `Saada ${inviteEmails.length} kutset ja edasi`
    if (stepId === 'workspace' && !isManager && inviteMode === 'join')
      return 'Liitu töökeskkonnaga'
    return 'Edasi'
  }

  const showSkip =
    stepId === 'workspace' &&
    (isManager || inviteMode === 'create') &&
    companyName.trim().length > 0 &&
    inviteEmails.length === 0

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div
      style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '24px', background: 'var(--pz-grad-app-bg)',
      }}
    >
      <div
        style={{
          width: '100%', maxWidth: '768px',
          borderRadius: '16px',
          background: 'var(--pz-surface)',
          border: '1px solid var(--pz-border)',
          boxShadow: 'var(--pz-shadow-md)',
          padding: '40px',
        }}
      >
        {/* Progress bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
          <span style={{ fontSize: '12px', color: 'var(--pz-fg-4)', whiteSpace: 'nowrap' }}>
            Samm {Math.min(currentStep + 1, steps.length)} / {steps.length}
          </span>
          <div
            style={{
              flex: 1, height: '6px', borderRadius: '999px',
              background: 'var(--pz-surface-2)', overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%', borderRadius: '999px',
                background: 'var(--pz-grad-primary)',
                width: `${progressValue}%`,
                transition: 'width 200ms ease',
              }}
            />
          </div>
        </div>

        {/* Step content */}
        <div key={stepId} style={{ animation: 'onbFadeIn 200ms ease both' }}>
          <style>{`
            @keyframes onbFadeIn {
              from { opacity: 0; transform: translateY(8px); }
              to   { opacity: 1; transform: translateY(0); }
            }
          `}</style>

          {stepId === 'role' && (
            <RoleStep selectedRole={selectedRole} onSelect={setSelectedRole} />
          )}

          {stepId === 'welcome' && <WelcomeStep isManager={isManager} />}

          {stepId === 'workspace' && (
            <WorkspaceStep
              isManager={isManager}
              inviteMode={inviteMode}
              setInviteMode={setInviteMode}
              companyName={companyName}
              setCompanyName={setCompanyName}
              orgCode={orgCode}
              setOrgCode={setOrgCode}
              inviteEmails={inviteEmails}
              setInviteEmails={setInviteEmails}
              emailInput={emailInput}
              setEmailInput={setEmailInput}
              error={workspaceError}
            />
          )}

          {stepId === 'confirm' && inviteCtx && (
            <ConfirmStep
              inviterName={inviteCtx.inviter_name}
              inviteeRole={inviteCtx.invitee_role}
            />
          )}

          {(stepId === 'info-1' || stepId === 'info-2' || stepId === 'info-3') && (() => {
            const slide = INFO_SLIDES.find((s) => s.id === stepId)!
            const Preview =
              stepId === 'info-1' ? ChatPreview :
              stepId === 'info-2' ? DashboardPreview :
              GoalsPreview
            return (
              <InfoStep
                badge={slide.badge}
                title={slide.title}
                body={slide.body}
                preview={<Preview />}
              />
            )
          })()}

          {stepId === 'comm-prefs' && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                <div style={{
                  width: '64px', height: '64px', margin: '0 auto 12px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #F4F3FF, #FCE7FB)',
                  boxShadow: '0 0 0 1px rgba(96,48,255,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--pz-violet)',
                }}>
                  <Users style={{ width: '28px', height: '28px' }} />
                </div>
                <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--pz-fg-1)', margin: '0 0 6px' }}>
                  Suhtluseelistused
                </h1>
                <p style={{ fontSize: '14px', color: 'var(--pz-fg-3)', margin: 0 }}>
                  tiim.space kohandab tooni ja sügavust sinu eelistuste järgi.
                </p>
              </div>
              <CommunicationPrefs value={prefs} onChange={setPrefs} />
            </div>
          )}

          {stepId === 'done' && <DoneStep isManager={isManager} />}
        </div>

        {/* Footer nav */}
        <div
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginTop: '28px', paddingTop: '20px',
            borderTop: '1px solid var(--pz-border)',
          }}
        >
          <button
            onClick={goBack}
            disabled={currentStep === 0}
            style={{
              fontSize: '13px', color: 'var(--pz-fg-4)',
              background: 'none', border: 'none',
              cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
              opacity: currentStep === 0 ? 0.3 : 1,
            }}
          >
            ← Tagasi
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {showSkip && (
              <button
                onClick={() => void handleContinue()}
                style={{
                  fontSize: '13px', color: 'var(--pz-fg-4)',
                  background: 'none', border: 'none', cursor: 'pointer',
                }}
              >
                Jäta kutsed vahele
              </button>
            )}
            <button
              onClick={() => void handleContinue()}
              disabled={!!isContinueDisabled}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 20px', borderRadius: 'var(--pz-radius-md)',
                fontSize: '14px', fontWeight: 600, border: 'none',
                background: 'var(--pz-grad-primary)', color: '#fff',
                cursor: isContinueDisabled ? 'not-allowed' : 'pointer',
                opacity: isContinueDisabled ? 0.4 : 1,
                transition: 'opacity 150ms',
              }}
            >
              {getContinueLabel()}
              {!workspaceLoading && !isFinishing && (
                <ArrowRight style={{ width: '16px', height: '16px' }} />
              )}
            </button>
          </div>
        </div>

        {(finishError || workspaceError) && (
          <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--pz-danger)', marginTop: '10px' }}>
            {finishError || workspaceError}
          </p>
        )}
      </div>

      <p style={{ marginTop: '24px', fontSize: '12px', color: 'var(--pz-fg-4)' }}>
        tiim.space · Aus AI meeskonnatoe jaoks
      </p>
    </div>
  )
}

// ─── Role step ────────────────────────────────────────────────────────────────

function RoleStep({
  selectedRole,
  onSelect,
}: {
  selectedRole: 'team_member' | 'manager'
  onSelect: (r: 'team_member' | 'manager') => void
}) {
  const options = [
    { value: 'team_member' as const, label: 'Tiimiliige', Icon: Target },
    { value: 'manager' as const, label: 'Juht', Icon: Users },
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{
          width: '64px', height: '64px', margin: '0 auto',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #F4F3FF, #FCE7FB)',
          boxShadow: '0 0 0 1px rgba(96,48,255,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--pz-violet)',
        }}>
          <Users style={{ width: '28px', height: '28px' }} />
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--pz-fg-1)', margin: '8px 0 0' }}>
          Juht või tiimiliige?
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--pz-fg-3)', margin: 0 }}>
          See aitab meil kohandada su kogemust tiim.space'is.
        </p>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: '12px', maxWidth: '400px', margin: '0 auto', width: '100%',
      }}>
        {options.map(({ value, label, Icon }) => {
          const active = selectedRole === value
          return (
            <button
              key={value}
              onClick={() => onSelect(value)}
              style={{
                padding: '24px 20px', borderRadius: '16px', border: 'none',
                textAlign: 'center', cursor: 'pointer',
                borderWidth: '1.5px', borderStyle: 'solid',
                borderColor: active ? 'var(--pz-violet)' : 'var(--pz-border)',
                background: active ? 'var(--accent)' : 'var(--pz-surface)',
                boxShadow: active ? '0 0 0 3px rgba(96,48,255,0.12)' : 'none',
                transition: 'border-color 150ms, background 150ms, box-shadow 150ms',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: active ? 'var(--pz-violet)' : 'var(--pz-surface-2)',
                  color: active ? '#fff' : 'var(--pz-fg-3)',
                  transition: 'background 150ms, color 150ms',
                }}>
                  <Icon style={{ width: '20px', height: '20px' }} />
                </div>
                <span style={{
                  fontWeight: 600, fontSize: '14px',
                  color: active ? 'var(--pz-violet)' : 'var(--pz-fg-1)',
                }}>
                  {label}
                </span>
              </div>
              {active && (
                <Check style={{ width: '16px', height: '16px', margin: '8px auto 0', color: 'var(--pz-violet)' }} />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Welcome step ─────────────────────────────────────────────────────────────

function WelcomeStep({ isManager }: { isManager: boolean }) {
  return (
    <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '24px', padding: '16px 0' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ fontSize: '56px', lineHeight: 1 }}>🎉</div>
        <h1 style={{
          fontSize: '36px', fontWeight: 700, margin: 0,
          background: 'linear-gradient(90deg, var(--pz-violet), var(--pz-fuchsia), var(--pz-sky))',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>
          Tere tulemast!
        </h1>
        <p style={{ fontSize: '18px', color: 'var(--pz-fg-2)', margin: 0 }}>
          {isManager ? 'Oled valmis oma tiimi toetama!' : 'Teeme tiimitöö loomulikuks!'}
        </p>
      </div>

      <div style={{
        maxWidth: '440px', margin: '0 auto', width: '100%',
        background: 'var(--pz-surface-2)', border: '1px solid var(--pz-border)',
        borderRadius: '16px', padding: '20px',
        display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0, marginTop: '2px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, var(--pz-violet), var(--pz-fuchsia))',
            color: '#fff',
          }}>
            <Sparkles style={{ width: '16px', height: '16px' }} />
          </div>
          <div>
            <p style={{ fontWeight: 600, fontSize: '14px', color: 'var(--pz-fg-1)', margin: '0 0 4px' }}>
              {isManager ? 'Tiimi ülevaade ühes kohas' : 'Chat-first, vormi täita pole vaja'}
            </p>
            <p style={{ fontSize: '13px', color: 'var(--pz-fg-3)', margin: 0 }}>
              {isManager
                ? 'Näe sisselogimisi, eesmärke ja tiimi enesetunnet ühest kohast.'
                : 'Räägi lihtsalt — tiim.space eraldab struktuuri sinu eest.'}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0, marginTop: '2px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, var(--pz-fuchsia), var(--pz-sky))',
            color: '#fff',
          }}>
            <Target style={{ width: '16px', height: '16px' }} />
          </div>
          <div>
            <p style={{ fontWeight: 600, fontSize: '14px', color: 'var(--pz-fg-1)', margin: '0 0 4px' }}>
              {isManager ? 'Eesmärgid ja saavutuste jälgimine' : 'Nädalane rütm'}
            </p>
            <p style={{ fontSize: '13px', color: 'var(--pz-fg-3)', margin: 0 }}>
              {isManager
                ? 'Jälgi tiimi eesmärke ja tähista ühiseid võite.'
                : '5 minutit kord nädalas, et mõtiskleda, planeerida ja jagada.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Workspace step ───────────────────────────────────────────────────────────

interface WorkspaceStepProps {
  isManager: boolean
  inviteMode: 'join' | 'create' | null
  setInviteMode: (m: 'join' | 'create') => void
  companyName: string
  setCompanyName: (v: string) => void
  orgCode: string
  setOrgCode: (v: string) => void
  inviteEmails: string[]
  setInviteEmails: (e: string[]) => void
  emailInput: string
  setEmailInput: (v: string) => void
  error: string | null
}

function WorkspaceStep({
  isManager,
  inviteMode, setInviteMode,
  companyName, setCompanyName,
  orgCode, setOrgCode,
  inviteEmails, setInviteEmails,
  emailInput, setEmailInput,
  error,
}: WorkspaceStepProps) {
  const showCreate = isManager || inviteMode === 'create'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{
          width: '64px', height: '64px', margin: '0 auto',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #F4F3FF, #FCE7FB)',
          boxShadow: '0 0 0 1px rgba(96,48,255,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--pz-violet)',
        }}>
          {isManager ? <UserPlus style={{ width: '28px', height: '28px' }} /> : <Building2 style={{ width: '28px', height: '28px' }} />}
        </div>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--pz-fg-1)', margin: '8px 0 0' }}>
          {isManager ? 'Kutsu oma tiim' : 'Liitu töökeskkonnaga'}
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--pz-fg-3)', margin: 0 }}>
          {isManager
            ? 'Loo tiimi tööruum ja kutsu liikmeid. Saad kutseid saata ka hiljem seadetest.'
            : 'Liitu olemasoleva töökeskkonnaga kutsekoodiga või loo uus oma tiimile.'}
        </p>
      </div>

      {/* Member: join or create choice */}
      {!isManager && (
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: '12px', maxWidth: '400px', margin: '0 auto', width: '100%',
        }}>
          {([
            { value: 'join' as const, label: 'Liitu olemasolevaga', subtitle: 'Mul on kood', Icon: Building2 },
            { value: 'create' as const, label: 'Kutsu tiim', subtitle: 'Alusta puhtalt lehelt', Icon: UserPlus },
          ]).map(({ value, label, subtitle, Icon }) => {
            const active = inviteMode === value
            return (
              <button
                key={value}
                onClick={() => setInviteMode(value)}
                style={{
                  padding: '20px 16px', borderRadius: '16px', border: 'none',
                  textAlign: 'center', cursor: 'pointer',
                  borderWidth: '1.5px', borderStyle: 'solid',
                  borderColor: active ? 'var(--pz-violet)' : 'var(--pz-border)',
                  background: active ? 'var(--accent)' : 'var(--pz-surface)',
                  boxShadow: active ? '0 0 0 3px rgba(96,48,255,0.12)' : 'none',
                  transition: 'border-color 150ms, background 150ms',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: active ? 'var(--pz-violet)' : 'var(--pz-surface-2)',
                    color: active ? '#fff' : 'var(--pz-fg-3)',
                  }}>
                    <Icon style={{ width: '20px', height: '20px' }} />
                  </div>
                  <span style={{ fontWeight: 600, fontSize: '13px', color: active ? 'var(--pz-violet)' : 'var(--pz-fg-1)' }}>
                    {label}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--pz-fg-4)' }}>{subtitle}</span>
                </div>
                {active && <Check style={{ width: '14px', height: '14px', margin: '6px auto 0', color: 'var(--pz-violet)' }} />}
              </button>
            )
          })}
        </div>
      )}

      {/* Join: invite code */}
      {!isManager && inviteMode === 'join' && (
        <div style={{ maxWidth: '400px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--pz-fg-1)' }}>
            Töökeskkonna kutse kood
          </label>
          <input
            type="text"
            value={orgCode}
            onChange={(e) => setOrgCode(e.target.value.toUpperCase())}
            placeholder="Küsi juhilt kutse kood"
            style={{
              width: '100%', padding: '12px 16px',
              borderRadius: 'var(--pz-radius-md)',
              border: '1px solid var(--pz-border)',
              fontSize: '16px', fontFamily: 'monospace',
              letterSpacing: '0.05em', textAlign: 'center',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          <p style={{ fontSize: '11px', color: 'var(--pz-fg-4)', margin: 0 }}>
            Küsi oma juhilt kutse kood
          </p>
        </div>
      )}

      {/* Create / manager: company name + email invites */}
      {showCreate && (
        <div style={{ maxWidth: '400px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--pz-fg-1)' }}>
              Tiimi / ettevõtte nimi
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="nt. Acme OÜ"
              style={{
                width: '100%', padding: '10px 12px',
                borderRadius: 'var(--pz-radius-md)',
                border: '1px solid var(--pz-border)',
                fontSize: '14px', outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--pz-fg-1)' }}>
              Tiimiliikmed (valikuline)
            </label>
            {inviteEmails.map((email, i) => (
              <div
                key={i}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '8px 12px', borderRadius: 'var(--pz-radius-md)',
                  background: 'var(--pz-surface-2)', border: '1px solid var(--pz-border)',
                }}
              >
                <Mail style={{ width: '14px', height: '14px', color: 'var(--pz-fg-4)', flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: '13px' }}>{email}</span>
                <button
                  onClick={() => setInviteEmails(inviteEmails.filter((_, j) => j !== i))}
                  style={{
                    width: '22px', height: '22px', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'none', border: 'none', cursor: 'pointer',
                  }}
                >
                  <X style={{ width: '12px', height: '12px', color: 'var(--pz-fg-4)' }} />
                </button>
              </div>
            ))}
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && emailInput.trim()) {
                    setInviteEmails([...inviteEmails, emailInput.trim()])
                    setEmailInput('')
                  }
                }}
                placeholder="email@example.com"
                style={{
                  flex: 1, padding: '8px 12px',
                  borderRadius: 'var(--pz-radius-md)',
                  border: '1px solid var(--pz-border)',
                  fontSize: '13px', outline: 'none',
                }}
              />
              <button
                onClick={() => {
                  if (emailInput.trim()) {
                    setInviteEmails([...inviteEmails, emailInput.trim()])
                    setEmailInput('')
                  }
                }}
                style={{
                  padding: '8px 14px', borderRadius: 'var(--pz-radius-md)',
                  border: '1px solid var(--pz-border)',
                  fontSize: '13px', background: 'var(--pz-surface)',
                  cursor: 'pointer', whiteSpace: 'nowrap',
                }}
              >
                Lisa
              </button>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--pz-fg-4)', margin: 0 }}>
              Saad kutseid saata ka hiljem seadetest
            </p>
          </div>
        </div>
      )}

      {error && (
        <p style={{ fontSize: '12px', color: 'var(--pz-danger)', textAlign: 'center', margin: 0 }}>
          {error}
        </p>
      )}
    </div>
  )
}

// ─── Confirm step ─────────────────────────────────────────────────────────────

function ConfirmStep({
  inviterName,
  inviteeRole,
}: {
  inviterName: string
  inviteeRole: 'team_member' | 'manager'
}) {
  return (
    <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', padding: '16px 0' }}>
      <div style={{
        width: '64px', height: '64px', margin: '0 auto',
        borderRadius: '16px',
        background: 'linear-gradient(135deg, #F4F3FF, #FCE7FB)',
        boxShadow: '0 0 0 1px rgba(96,48,255,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--pz-violet)',
      }}>
        <UserPlus style={{ width: '28px', height: '28px' }} />
      </div>
      <div>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--pz-fg-1)', margin: '0 0 8px' }}>
          Oled ühendatud
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--pz-fg-3)', margin: 0 }}>
          <strong style={{ color: 'var(--pz-fg-1)' }}>{inviterName}</strong> on su kutsunud tiimiga liituma{' '}
          {inviteeRole === 'team_member' ? 'tiimiliikme' : 'juhina'}.
        </p>
      </div>
      <div style={{
        maxWidth: '360px', margin: '0 auto',
        padding: '16px 20px', borderRadius: '12px',
        background: 'rgba(96,48,255,0.05)', border: '1px solid rgba(96,48,255,0.15)',
      }}>
        <p style={{ fontSize: '13px', color: 'var(--pz-fg-2)', margin: 0 }}>
          Klõpsa &ldquo;Edasi&rdquo;, et kinnitada liitumine ja jätkata seadistamist.
        </p>
      </div>
    </div>
  )
}

// ─── Info step ────────────────────────────────────────────────────────────────

function InfoStep({
  badge, title, body, preview,
}: {
  badge: string
  title: string
  body: string
  preview: React.ReactNode
}) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr 1fr',
      gap: '32px', alignItems: 'center',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          fontSize: '12px', padding: '4px 10px', borderRadius: '999px',
          background: 'var(--accent)', color: 'var(--pz-violet)', fontWeight: 600,
          width: 'fit-content',
        }}>
          <Sparkles style={{ width: '12px', height: '12px' }} /> {badge}
        </span>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--pz-fg-1)', margin: 0 }}>
          {title}
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--pz-fg-3)', margin: 0, lineHeight: 1.6 }}>
          {body}
        </p>
      </div>
      <div style={{
        borderRadius: '16px', padding: '16px',
        background: 'var(--pz-surface-2)', border: '1px solid var(--pz-border)',
      }}>
        {preview}
      </div>
    </div>
  )
}

// ─── Done step ────────────────────────────────────────────────────────────────

function DoneStep({ isManager }: { isManager: boolean }) {
  return (
    <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px 0' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ fontSize: '56px', lineHeight: 1 }}>🚀</div>
        <h1 style={{ fontSize: '32px', fontWeight: 700, color: 'var(--pz-fg-1)', margin: 0 }}>
          Kõik on valmis!
        </h1>
        <p style={{ fontSize: '16px', color: 'var(--pz-fg-3)', maxWidth: '400px', margin: '0 auto' }}>
          {isManager
            ? 'Sinu tiimi töölaud on valmis. Tiimi liikmete suhtluseelistusi näed nende profiilides.'
            : 'Oled häälestatud. Alusta esimese nädalase sisselogimisega.'}
        </p>
      </div>
    </div>
  )
}

// ─── Mini in-app preview screenshots ─────────────────────────────────────────

function FrameChrome({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      borderRadius: '8px', overflow: 'hidden',
      background: '#fff', border: '1px solid var(--pz-border)',
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        padding: '6px 10px',
        background: 'var(--pz-surface-2)', borderBottom: '1px solid var(--pz-border)',
      }}>
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FF5F57', display: 'inline-block' }} />
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FEBC2E', display: 'inline-block' }} />
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#28C840', display: 'inline-block' }} />
        <span style={{ fontSize: '10px', color: 'var(--pz-fg-4)', marginLeft: '6px', overflow: 'hidden', whiteSpace: 'nowrap' }}>
          tiim.space · {title}
        </span>
      </div>
      <div style={{ padding: '10px' }}>{children}</div>
    </div>
  )
}

function ChatPreview() {
  return (
    <FrameChrome title="Sisselogimine">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <div style={{
            maxWidth: '85%', background: 'var(--pz-surface-2)', border: '1px solid var(--pz-border)',
            borderRadius: '8px 8px 8px 2px', padding: '6px 10px', fontSize: '11px', lineHeight: 1.4,
          }}>
            Tere Mari 👋 kas oled valmis nädalaseks sisselogimiseks?
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{
            maxWidth: '85%', background: 'var(--pz-grad-primary)',
            borderRadius: '8px 8px 2px 8px', padding: '6px 10px', fontSize: '11px',
            lineHeight: 1.4, color: '#fff',
          }}>
            Viisin lõpule API dokumendid ja lähetan portaali ✨
          </div>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '6px 8px', border: '1px solid var(--pz-border)',
          borderRadius: '8px', marginTop: '4px',
        }}>
          <Mic style={{ width: '12px', height: '12px', color: 'var(--pz-fg-4)' }} />
          <span style={{ fontSize: '10px', color: 'var(--pz-fg-4)', flex: 1 }}>Räägi või kirjuta…</span>
          <Send style={{ width: '12px', height: '12px', color: 'var(--pz-violet)' }} />
        </div>
      </div>
    </FrameChrome>
  )
}

function DashboardPreview() {
  return (
    <FrameChrome title="Minu töölaud">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '4px' }}>
          {[
            { l: 'Meeleolu', v: '4.2', color: 'var(--pz-violet)' },
            { l: 'Energia', v: '4.0', color: 'var(--pz-sky)' },
            { l: 'Seeria', v: '12', icon: true },
          ].map((s) => (
            <div key={s.l} style={{
              borderRadius: '6px', background: 'var(--pz-surface-2)',
              border: '1px solid var(--pz-border)', padding: '6px',
            }}>
              <div style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--pz-fg-4)' }}>
                {s.l}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 700, fontSize: '13px', color: s.color || 'var(--pz-fg-1)' }}>
                {s.v}
                {s.icon && <Flame style={{ width: '10px', height: '10px', color: '#F59E0B' }} />}
              </div>
            </div>
          ))}
        </div>
        <div style={{ borderRadius: '6px', background: 'var(--pz-surface-2)', border: '1px solid var(--pz-border)', padding: '8px' }}>
          <div style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--pz-fg-4)', marginBottom: '6px' }}>
            Energia · 6 nädalat
          </div>
          <svg viewBox="0 0 200 40" style={{ width: '100%', height: '32px' }}>
            <polyline fill="none" stroke="#6030FF" strokeWidth="2" points="0,28 40,20 80,24 120,14 160,10 200,6" />
            <polyline fill="none" stroke="#49BBFF" strokeWidth="2" points="0,32 40,26 80,28 120,22 160,18 200,14" />
          </svg>
        </div>
      </div>
    </FrameChrome>
  )
}

function GoalsPreview() {
  const goals = [
    { t: 'Toote turule viimine', lvl: 'aasta', p: 42, color: 'var(--pz-violet)' },
    { t: 'Beeta 10 partnerile', lvl: 'kvartal', p: 68, color: 'var(--pz-sky)' },
    { t: 'Next.js põhitõed', lvl: 'isiklik', p: 55, color: '#F59E0B' },
  ]
  return (
    <FrameChrome title="Eesmärgid">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {goals.map((g) => (
          <div key={g.t} style={{
            background: '#fff', border: '1px solid var(--pz-border)',
            borderRadius: '6px', padding: '6px 8px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '3px', alignSelf: 'stretch', borderRadius: '2px', background: g.color, minHeight: '20px' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '9px', marginBottom: '2px' }}>
                  <span style={{ padding: '1px 6px', borderRadius: '999px', background: 'var(--accent)', color: 'var(--pz-violet)', fontSize: '8px' }}>
                    {g.lvl}
                  </span>
                </div>
                <div style={{ fontSize: '10px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {g.t}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                  <div style={{ flex: 1, height: '3px', borderRadius: '999px', background: 'var(--pz-surface-2)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: g.color, width: `${g.p}%` }} />
                  </div>
                  <span style={{ fontSize: '9px', color: 'var(--pz-fg-4)' }}>{g.p}%</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </FrameChrome>
  )
}
