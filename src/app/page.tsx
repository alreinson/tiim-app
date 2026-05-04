import { redirect } from 'next/navigation'

/**
 * Root page — always redirect to /dashboard.
 * Unauthenticated users are intercepted by clerkMiddleware in middleware.ts
 * and sent to /sign-in before they ever reach this server component.
 */
export default function RootPage() {
  redirect('/dashboard')
}
