import { NextRequest, NextResponse } from 'next/server'
import Papa from 'papaparse'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { unauthorized } from '@/lib/api-error'

const CsvRowSchema = z.object({
  invoice_number: z.string().min(1),
  client_email: z.string().email(),
  amount: z.string().transform(Number),
  issue_date: z.string(),
  due_date: z.string(),
  currency: z.string().default('GBP'),
})

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return unauthorized()

  const { data: userData } = await supabase.from('users').select('organization_id').eq('id', user.id).single()
  const orgId = userData?.organization_id
  if (!orgId) return NextResponse.json({ error: 'No organization' }, { status: 400 })

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large (max 5 MB)' }, { status: 413 })
  }

  const text = await file.text()
  const { data: rows, errors } = Papa.parse(text, { header: true, skipEmptyLines: true })

  if (errors.length > 0) {
    return NextResponse.json({ error: 'CSV parse error', details: errors }, { status: 400 })
  }

  if (rows.length > 500) {
    return NextResponse.json({ error: 'Too many rows (max 500 per import)' }, { status: 422 })
  }

  const results = { imported: 0, skipped: 0, errors: [] as string[] }

  for (const row of rows as Record<string, string>[]) {
    const parsed = CsvRowSchema.safeParse(row)
    if (!parsed.success) {
      results.skipped++
      results.errors.push(`Row skipped: ${JSON.stringify(row)}`)
      continue
    }

    const { client_email, ...invoiceData } = parsed.data

    // Find or create client by email
    let { data: client } = await supabase
      .from('clients')
      .select('id')
      .eq('organization_id', orgId)
      .eq('email', client_email)
      .single()

    if (!client) {
      const { data: newClient } = await supabase
        .from('clients')
        .insert({ organization_id: orgId, name: client_email, email: client_email })
        .select('id')
        .single()
      client = newClient
    }

    if (!client) {
      results.skipped++
      continue
    }

    const { error } = await supabase.from('invoices').insert({
      ...invoiceData,
      client_id: client.id,
      organization_id: orgId,
      status: 'pending',
    })

    if (error) {
      results.skipped++
      results.errors.push(error.message)
    } else {
      results.imported++
    }
  }

  return NextResponse.json(results)
}
