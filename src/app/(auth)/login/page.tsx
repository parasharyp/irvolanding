'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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
  email: z.string().email(),
  password: z.string().min(6),
})
type FormData = z.infer<typeof schema>

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') ?? '/dashboard'
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword(data)
    if (error) { setError(error.message); return }
    router.push(redirect)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" autoComplete="email" {...register('email')} />
        {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
      </div>
      <div className="space-y-1">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" autoComplete="current-password" {...register('password')} />
        {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
      </div>
      {error && <p className="text-sm text-red-500 bg-red-50 p-2 rounded">{error}</p>}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Signing in…' : 'Sign in'}
      </Button>
    </form>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <span className="text-2xl font-bold text-blue-600">Irvo</span>
          </div>
          <CardTitle>Sign in to your account</CardTitle>
          <CardDescription>Enter your email and password to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100 rounded" />}>
            <LoginForm />
          </Suspense>
          <div className="mt-4 text-center text-sm text-gray-600 space-y-1">
            <p><Link href="/reset-password" className="text-blue-600 hover:underline">Forgot password?</Link></p>
            <p>No account? <Link href="/signup" className="text-blue-600 hover:underline">Sign up</Link></p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
