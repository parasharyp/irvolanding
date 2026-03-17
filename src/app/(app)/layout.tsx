import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AppNavigationWrapper from '@/components/layout/AppNavigationWrapper'
import { OrgPlan } from '@/types'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: userData } = await supabase
    .from('users')
    .select('organization_id, name')
    .eq('id', user.id)
    .single()

  const { data: org } = userData?.organization_id
    ? await supabase.from('organizations').select('name, plan').eq('id', userData.organization_id).single()
    : { data: null }

  return (
    <AppNavigationWrapper plan={(org?.plan ?? 'starter') as OrgPlan} orgName={org?.name}>
      {children}
    </AppNavigationWrapper>
  )
}
