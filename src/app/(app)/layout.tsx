import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/layout/Sidebar'
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
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#080808' }}>
      <Sidebar plan={(org?.plan ?? 'starter') as OrgPlan} orgName={org?.name} />
      <main style={{ flex: 1, overflowY: 'auto', background: '#080808' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 36px' }}>
          {children}
        </div>
      </main>
    </div>
  )
}
