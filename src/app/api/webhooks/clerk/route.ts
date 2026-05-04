import { verifyWebhook } from '@clerk/nextjs/webhooks'
import type { UserWebhookEvent } from '@clerk/backend/webhooks'
import type { NextRequest } from 'next/server'
import { createUser, getUserByClerkId, updateUser } from '@/lib/db/users'

// Clerk sends webhook payloads as POST requests.
// The proxy config already marks /api/webhooks(.*) as public,
// so no auth check is needed here.

export async function POST(req: NextRequest): Promise<Response> {
  // 1. Verify signature — verifyWebhook reads CLERK_WEBHOOK_SECRET env var by default.
  //    The env var name used by this helper is CLERK_WEBHOOK_SIGNING_SECRET, but we
  //    provide our key explicitly so the name in .env.local can be CLERK_WEBHOOK_SECRET.
  let event: UserWebhookEvent

  try {
    const signingSecret = process.env.CLERK_WEBHOOK_SECRET
    if (!signingSecret) {
      console.error('[webhook/clerk] CLERK_WEBHOOK_SECRET is not set')
      return Response.json({ error: 'Webhook secret not configured' }, { status: 500 })
    }

    // verifyWebhook accepts an options object with signingSecret so we can use our
    // chosen env var name without renaming it.
    const raw = await verifyWebhook(req, { signingSecret })

    // We only care about user events; filter early.
    if (!['user.created', 'user.updated', 'user.deleted'].includes(raw.type)) {
      return Response.json({ message: 'Event type not handled' }, { status: 200 })
    }

    event = raw as UserWebhookEvent
  } catch (err) {
    console.error('[webhook/clerk] Signature verification failed:', err)
    return Response.json({ error: 'Webhook verification failed' }, { status: 400 })
  }

  // 2. Dispatch to handler
  try {
    if (event.type === 'user.created') {
      await handleUserCreated(event.data)
    } else if (event.type === 'user.updated') {
      await handleUserUpdated(event.data)
    } else if (event.type === 'user.deleted') {
      await handleUserDeleted(event.data)
    }

    return Response.json({ success: true }, { status: 200 })
  } catch (err) {
    console.error('[webhook/clerk] Handler error:', err)
    return Response.json({ error: 'Internal handler error' }, { status: 500 })
  }
}

// ─── Handlers ─────────────────────────────────────────────────────────────────

// user.created and user.updated share one union member in the Clerk type, so extract both together.
type UserDataJSON = Extract<UserWebhookEvent, { type: 'user.created' | 'user.updated' }>['data']
type UserDeletedDataJSON = Extract<UserWebhookEvent, { type: 'user.deleted' }>['data']

async function handleUserCreated(data: UserDataJSON): Promise<void> {
  const clerkId = data.id
  const primaryEmailObj = data.email_addresses.find(
    (e) => e.id === data.primary_email_address_id,
  )
  const email = primaryEmailObj?.email_address ?? ''
  const name = [data.first_name, data.last_name].filter(Boolean).join(' ') || email

  // Guard against duplicate inserts (e.g. retried webhook delivery)
  const existing = await getUserByClerkId(clerkId)
  if (existing) {
    console.info(`[webhook/clerk] user.created: user already exists for clerk_id=${clerkId}, skipping`)
    return
  }

  await createUser({
    clerk_id: clerkId,
    email,
    name,
    role: 'team_member',
    language: 'et',
  })

  console.info(`[webhook/clerk] user.created: synced clerk_id=${clerkId}`)
}

async function handleUserUpdated(data: UserDataJSON): Promise<void> {
  const clerkId = data.id
  const primaryEmailObj = data.email_addresses.find(
    (e) => e.id === data.primary_email_address_id,
  )
  const email = primaryEmailObj?.email_address ?? ''
  const name = [data.first_name, data.last_name].filter(Boolean).join(' ') || email

  const existing = await getUserByClerkId(clerkId)
  if (!existing) {
    // User doesn't exist in our DB yet — create them instead of failing silently.
    // This can happen if the user.created webhook was missed.
    console.warn(`[webhook/clerk] user.updated: no DB record for clerk_id=${clerkId}, creating`)
    await createUser({ clerk_id: clerkId, email, name, role: 'team_member', language: 'et' })
    return
  }

  await updateUser(existing.id, { email, name })
  console.info(`[webhook/clerk] user.updated: synced clerk_id=${clerkId}`)
}

async function handleUserDeleted(data: UserDeletedDataJSON): Promise<void> {
  // data.id may be undefined for deletion events per Clerk docs
  const clerkId = data.id
  if (!clerkId) {
    console.warn('[webhook/clerk] user.deleted: received event with no id, ignoring')
    return
  }

  const existing = await getUserByClerkId(clerkId)
  if (!existing) {
    console.info(`[webhook/clerk] user.deleted: no record found for clerk_id=${clerkId}, nothing to do`)
    return
  }

  // Soft-delete: keep the row but mark the user as inactive.
  // This preserves historical data (goals, check-ins, etc.) linked to the user id.
  await updateUser(existing.id, { vacation_mode: true, onboarding_complete: false })
  console.info(`[webhook/clerk] user.deleted: soft-deleted clerk_id=${clerkId}`)
  // NOTE: For a hard delete, replace the above with a supabase .delete() call
  // once the DB cascade rules are confirmed.
}
