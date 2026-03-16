'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const schema = z.object({
  name: z.string().min(2),
  org_name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})
type FormData = z.infer<typeof schema>

export default function SignupPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setError(null)
    const supabase = createClient()

    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { data: { name: data.name, org_name: data.org_name } },
    })

    if (signUpError) { setError(signUpError.message); return }
    if (!authData.user) { setError('Signup failed. Please try again.'); return }

    // Create org + user record via service-role API
    const res = await fetch('/api/auth/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: authData.user.id, email: data.email, name: data.name, org_name: data.org_name }),
    })

    if (!res.ok) {
      const err = await res.json()
      setError(err.error ?? 'Setup failed')
      return
    }

    setSuccess(true)
    setTimeout(() => router.push('/dashboard'), 2000)
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md text-center p-8">
          <p className="text-green-600 font-medium text-lg">Account created!</p>
          <p className="text-gray-500 mt-2">Redirecting to your dashboard…</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <span className="text-2xl font-bold text-blue-600">Irvo</span>
          </div>
          <CardTitle>Create your account</CardTitle>
          <CardDescription>Start enforcing late payments automatically</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="name">Your name</Label>
              <Input id="name" {...register('name')} />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="org_name">Organisation name</Label>
              <Input id="org_name" placeholder="Acme Design Studio" {...register('org_name')} />
              {errors.org_name && <p className="text-sm text-red-500">{errors.org_name.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register('email')} />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...register('password')} />
              {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
            </div>
            {error && <p className="text-sm text-red-500 bg-red-50 p-2 rounded">{error}</p>}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Creating account…' : 'Create account'}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 hover:underline">Sign in</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
