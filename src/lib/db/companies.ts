import { createServiceClient } from '@/lib/supabase/server'
import type { Company } from '@/types'

export async function getCompany(id: string | null | undefined): Promise<Company | null> {
  if (!id) return null
  const supabase = await createServiceClient()

  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    console.error('[db/companies] getCompany error:', error)
    throw new Error(`Failed to fetch company ${id}: ${error.message}`)
  }

  return data as Company | null
}

export async function createCompany(name: string): Promise<Company> {
  const supabase = await createServiceClient()

  const { data, error } = await supabase
    .from('companies')
    .insert({ name })
    .select()
    .single()

  if (error) {
    console.error('[db/companies] createCompany error:', error)
    throw new Error(`Failed to create company "${name}": ${error.message}`)
  }

  return data as Company
}

export async function getCompanyByName(name: string): Promise<Company | null> {
  const supabase = await createServiceClient()

  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('name', name)
    .maybeSingle()

  if (error) {
    console.error('[db/companies] getCompanyByName error:', error)
    throw new Error(`Failed to fetch company by name "${name}": ${error.message}`)
  }

  return data as Company | null
}
