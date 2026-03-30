import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  const rawRedirect = searchParams.get('redirect') ?? '/dashboard'
  // Strict redirect validation: must start with /, not //, not /\, no encoded slashes, no protocol
  const redirect = /^\/[a-zA-Z0-9\-._~:/?#[\]@!$&'()*+,;=%]*$/.test(rawRedirect)
    && !rawRedirect.startsWith('//')
    && !rawRedirect.includes('\\')
    && !rawRedirect.includes('%2f')
    && !rawRedirect.includes('%5c')
    ? rawRedirect
    : '/dashboard'

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`)
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('[auth/callback] Code exchange failed:', error.message)
    return NextResponse.redirect(`${origin}/login?error=auth_failed`)
  }

  // Get the authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.redirect(`${origin}/login?error=no_user`)
  }

  // Check if user already has a profile + org
  const admin = await createAdminClient()
  const { data: existing } = await admin
    .from('users')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  if (!existing?.organization_id) {
    // First-time user — auto-create org + profile
    const displayName = user.user_metadata?.full_name ?? user.user_metadata?.name ?? user.email?.split('@')[0] ?? 'User'
    const orgName = user.user_metadata?.company ?? `${displayName}'s Organisation`

    const { data: org, error: orgError } = await admin
      .from('organizations')
      .insert({ name: orgName, owner_user_id: user.id })
      .select('id')
      .single()

    if (orgError) {
      console.error('[auth/callback] Org creation failed:', orgError.message)
      return NextResponse.redirect(`${origin}/login?error=setup_failed`)
    }

    const { error: userError } = await admin.from('users').insert({
      id: user.id,
      email: user.email ?? '',
      name: displayName,
      organization_id: org.id,
    })

    if (userError) {
      // Cleanup the org if user insert fails
      await admin.from('organizations').delete().eq('id', org.id)
      console.error('[auth/callback] User creation failed:', userError.message)
      return NextResponse.redirect(`${origin}/login?error=setup_failed`)
    }
  }

  return NextResponse.redirect(`${origin}${redirect}`)
}
