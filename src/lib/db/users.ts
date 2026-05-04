import { createServiceClient } from '@/lib/supabase/server'
import type { User, UserRole, Language } from '@/types'

export interface CreateUserData {
  clerk_id: string
  email: string
  name: string
  role?: UserRole
  company_id?: string
  language?: Language
  timezone?: string
}

export async function getUserByClerkId(clerkId: string): Promise<User | null> {
  const supabase = await createServiceClient()

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('clerk_id', clerkId)
    .maybeSingle()

  if (error) {
    console.error('[db/users] getUserByClerkId error:', error)
    throw new Error(`Failed to fetch user by clerk_id: ${error.message}`)
  }

  return data as User | null
}

export async function createUser(data: CreateUserData): Promise<User> {
  const supabase = await createServiceClient()

  const insert = {
    clerk_id: data.clerk_id,
    email: data.email,
    name: data.name,
    role: data.role ?? 'team_member',
    company_id: data.company_id ?? null,
    language: data.language ?? 'et',
    timezone: data.timezone ?? 'Europe/Tallinn',
    // defaults handled by DB column defaults:
    // support_style, feedback_directness, vacation_mode, belbin_uploaded, onboarding_complete
  }

  const { data: created, error } = await supabase
    .from('users')
    .insert(insert)
    .select()
    .single()

  if (error) {
    console.error('[db/users] createUser error:', error)
    throw new Error(`Failed to create user: ${error.message}`)
  }

  return created as User
}

export async function updateUser(id: string, data: Partial<User>): Promise<User> {
  const supabase = await createServiceClient()

  // Never allow mutation of immutable fields via this function
  const { id: _id, clerk_id: _clerkId, created_at: _createdAt, ...rest } = data

  const { data: updated, error } = await supabase
    .from('users')
    .update(rest)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('[db/users] updateUser error:', error)
    throw new Error(`Failed to update user ${id}: ${error.message}`)
  }

  return updated as User
}

export async function getUsersByCompany(companyId: string): Promise<User[]> {
  const supabase = await createServiceClient()

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('company_id', companyId)
    .order('name', { ascending: true })

  if (error) {
    console.error('[db/users] getUsersByCompany error:', error)
    throw new Error(`Failed to fetch users for company ${companyId}: ${error.message}`)
  }

  return (data ?? []) as User[]
}

export async function getUsersByManager(managerId: string): Promise<User[]> {
  const supabase = await createServiceClient()

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('manager_id', managerId)
    .order('name', { ascending: true })

  if (error) {
    console.error('[db/users] getUsersByManager error:', error)
    throw new Error(`Failed to fetch users for manager ${managerId}: ${error.message}`)
  }

  return (data ?? []) as User[]
}
