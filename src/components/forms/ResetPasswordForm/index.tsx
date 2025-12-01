'use client'

import { FormError } from '@/components/forms/FormError'
import { FormItem } from '@/components/forms/FormItem'
import { Message } from '@/components/Message'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/providers/Auth'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

type FormData = {
  password: string
  passwordConfirm: string
}

export function ResetPasswordForm() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), [])
  const { resetPassword } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'pending' | 'ready' | 'complete'>('pending')
  const [error, setError] = useState<string | null>(null)
  const code = searchParams.get('code')

  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    watch,
  } = useForm<FormData>()

  const password = useRef({})
  password.current = watch('password', '')

  useEffect(() => {
    const exchangeSession = async () => {
      try {
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) throw error
          setStatus('ready')
          return
        }

        // Fallback for hash-based redirects (access_token in URL hash)
        if (typeof window !== 'undefined' && window.location.hash) {
          const hashParams = new URLSearchParams(window.location.hash.substring(1))
          const accessToken = hashParams.get('access_token')
          const refreshToken = hashParams.get('refresh_token')
          if (accessToken && refreshToken) {
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            })
            if (error) throw error
            setStatus('ready')
            return
          }
        }

        // If no token is found, prompt user to request a new reset email
        setError('Reset link is invalid or expired. Please request a new link.')
        setStatus('pending')
      } catch (_err) {
        setError('Unable to validate reset link. Please request a new one.')
        setStatus('pending')
      }
    }

    void exchangeSession()
  }, [code, supabase])

  const onSubmit = useCallback(
    async (data: FormData) => {
      setError(null)
      try {
        await resetPassword({
          password: data.password,
          passwordConfirm: data.passwordConfirm,
        })
        setStatus('complete')
        toast.success('Password updated. You are now signed in.')
        router.push('/account')
      } catch (_err) {
        setError('Unable to update password. Please try again.')
      }
    },
    [resetPassword, router],
  )

  const disabled = status === 'pending' || isSubmitting

  return (
    <form className="max-w-lg py-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="prose dark:prose-invert mb-6">
        <p>
          {status === 'pending'
            ? 'Validating your reset link...'
            : 'Enter a new password to finish resetting your account.'}
        </p>
      </div>

      <Message error={error || undefined} />

      <div className="flex flex-col gap-8 mb-8">
        <FormItem>
          <Label htmlFor="password" className="mb-2">
            New password
          </Label>
          <Input
            id="password"
            disabled={disabled}
            {...register('password', { required: 'Password is required.' })}
            type="password"
          />
          {errors.password && <FormError message={errors.password.message} />}
        </FormItem>

        <FormItem>
          <Label htmlFor="passwordConfirm" className="mb-2">
            Confirm password
          </Label>
          <Input
            id="passwordConfirm"
            disabled={disabled}
            {...register('passwordConfirm', {
              required: 'Please confirm your password.',
              validate: (value) => value === password.current || 'The passwords do not match',
            })}
            type="password"
          />
          {errors.passwordConfirm && <FormError message={errors.passwordConfirm.message} />}
        </FormItem>
      </div>
      <Button disabled={disabled} type="submit" variant="default">
        {status === 'pending' ? 'Validating link...' : 'Update password'}
      </Button>
    </form>
  )
}
