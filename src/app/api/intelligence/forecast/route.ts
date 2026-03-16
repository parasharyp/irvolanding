import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateCashflowForecast } from '@/lib/intelligence/cashflowForecast'
import { Invoice } from '@/types'

export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: userData } = await supabase.from('users').select('organization_id').eq('id', user.id).single()
  const orgId = userData?.organization_id
  if (!orgId) return NextResponse.json({ error: 'No organization' }, { status: 400 })

  const { data: invoices, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('organization_id', orgId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const forecast = generateCashflowForecast((invoices ?? []) as Invoice[])
  return NextResponse.json(forecast)
}
