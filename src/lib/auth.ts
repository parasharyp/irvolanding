import { createClient } from '@/lib/supabase/server'
import { unauthorized } from '@/lib/api-error'
import { NextResponse } from 'next/server'

export async function getAuthContext() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return { error: unauthorized() } as const

  const { data: profile } = await supabase
    .from('users')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  if (!profile?.organization_id) return { error: unauthorized() } as const

  return {
    supabase,
    user,
    orgId: profile.organization_id as string,
  } as const
}

export type AuthContext = Exclude<Awaited<ReturnType<typeof getAuthContext>>, { error: NextResponse }>
