import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getUserByClerkId, updateUser } from '@/lib/db/users'
import { createCompany, getCompanyByName } from '@/lib/db/companies'

interface CompanyBody {
  name: string
  mode: 'create' | 'join'
  join_code?: string
}

export async function POST(request: Request) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: CompanyBody
  try {
    body = (await request.json()) as CompanyBody
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { name, mode, join_code } = body

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return NextResponse.json(
      { error: 'Ettevõtte nimi on kohustuslik.' },
      { status: 422 },
    )
  }

  if (!['create', 'join'].includes(mode)) {
    return NextResponse.json({ error: 'Invalid mode' }, { status: 422 })
  }

  const user = await getUserByClerkId(userId)
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  if (mode === 'create') {
    // Create a new company and link it to the user
    const company = await createCompany(name.trim())

    const updatedUser = await updateUser(user.id, {
      company_id: company.id,
    })

    return NextResponse.json({ company, user: updatedUser })
  }

  // mode === 'join'
  // v1: use the join_code (or name) as a lookup key — find company by name
  const lookupKey = (join_code ?? name).trim()

  const company = await getCompanyByName(lookupKey)
  if (!company) {
    return NextResponse.json(
      {
        error:
          'Ettevõtet ei leitud. Kontrolli liitumiskoodi või küsi adminilt abi.',
      },
      { status: 404 },
    )
  }

  // Link user to the found company
  const updatedUser = await updateUser(user.id, {
    company_id: company.id,
  })

  return NextResponse.json({
    company,
    user: updatedUser,
    message:
      'Liitumistaotlus saadetud. Admin kinnitab sinu liitumise peagi.',
  })
}
