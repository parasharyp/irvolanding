import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { randomBytes } from 'crypto'

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const admin = await createAdminClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify invoice belongs to user's org
  const { data: userData } = await supabase.from('users').select('organization_id').eq('id', user.id).single()
  const { data: invoice } = await supabase.from('invoices').select('id, organization_id, status').eq('id', id).single()

  if (!invoice || invoice.organization_id !== userData?.organization_id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  if (invoice.status === 'paid') {
    return NextResponse.json({ error: 'Invoice is already paid' }, { status: 400 })
  }

  const token = randomBytes(32).toString('hex')

  // Upsert — one token per invoice
  const { error } = await admin
    .from('payment_tokens')
    .upsert({ invoice_id: id, token, expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString() }, { onConflict: 'invoice_id' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  return NextResponse.json({ url: `${base}/pay/${token}` })
}
