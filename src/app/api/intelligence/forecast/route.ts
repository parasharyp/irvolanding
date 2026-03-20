import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateCashflowForecast } from '@/lib/intelligence/cashflowForecast'
import { Invoice } from '@/types'
import { serverError, unauthorized } from '@/lib/api-error'

export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return unauthorized()

  const { data: userData } = await supabase.from('users').select('organization_id').eq('id', user.id).single()
  const orgId = userData?.organization_id
  if (!orgId) return NextResponse.json({ error: 'No organization' }, { status: 400 })

  const { data: invoices, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('organization_id', orgId)

  if (error) return serverError(error, 'GET /api/intelligence/forecast')

  const forecast = generateCashflowForecast((invoices ?? []) as Invoice[])
  return NextResponse.json(forecast)
}
