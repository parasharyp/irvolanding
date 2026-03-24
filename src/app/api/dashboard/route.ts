import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { unauthorized, serverError } from '@/lib/api-error'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return unauthorized()

    const { data: userData } = await supabase.from('users').select('organization_id').eq('id', user.id).single()
    if (!userData?.organization_id) return NextResponse.json({ error: 'No organization' }, { status: 400 })

    return NextResponse.json({
      total_systems: 0,
      classified: 0,
      documented: 0,
      at_risk: 0,
      systems: [],
    })
  } catch (err) {
    return serverError(err, 'GET /api/dashboard')
  }
}
