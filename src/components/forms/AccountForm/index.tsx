'use client'

import { FormError } from '@/components/forms/FormError'
import { FormItem } from '@/components/forms/FormItem'
import { Message } from '@/components/Message'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/providers/Auth'
import { useRouter } from 'next/navigation'
import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

type FormData = {
  email: string
  name?: string | null
  phone?: string | null
  password: string
  passwordConfirm: string
}

export const AccountForm: React.FC = () => {
  const { setUser, user } = useAuth()
  const supabase = useMemo(() => createSupabaseBrowserClient(), [])
  const [changePassword, setChangePassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    formState: { errors, isLoading, isSubmitting, isDirty },
    handleSubmit,
    register,
    reset,
    watch,
  } = useForm<FormData>()

  const password = useRef({})
  password.current = watch('password', '')

  const router = useRouter()

  const onSubmit = useCallback(
    async (data: FormData) => {
      setError(null)

      if (!user) return

      if (changePassword) {
        try {
          if (data.password !== data.passwordConfirm) {
            throw new Error('Passwords do not match.')
          }

          const { error } = await supabase.auth.updateUser({ password: data.password })
          if (error) throw error
          toast.success('Password updated.')
          setChangePassword(false)
          reset({
            name: data.name,
            phone: data.phone,
            email: data.email,
            password: '',
            passwordConfirm: '',
          })
        } catch (_err) {
          setError('Unable to update password. Please try again.')
          toast.error('Unable to update password.')
        }
        return
      }

      try {
        const { error: upsertError } = await supabase.from('profiles').upsert(
          {
            user_id: user.id,
            full_name: data.name,
            phone: data.phone,
          },
          { onConflict: 'user_id' },
        )

        if (upsertError) {
          throw upsertError
        }

        setUser({
          ...user,
          name: data.name || user.name,
        })

        toast.success('Profile updated.')
        reset({
          name: data.name,
          phone: data.phone,
          email: user.email || '',
          password: '',
          passwordConfirm: '',
        })
      } catch (_err) {
        setError('There was a problem updating your account.')
        toast.error('There was a problem updating your account.')
      }
    },
    [user, setUser, reset, supabase, changePassword],
  )

  useEffect(() => {
    if (user === null) {
      router.push(
        `/login?error=${encodeURIComponent(
          'You must be logged in to view this page.',
        )}&redirect=${encodeURIComponent('/account')}`,
      )
    }

    // Once user is loaded, reset form to have default values
    if (user) {
      const loadProfile = async () => {
        const { data } = await supabase
          .from('profiles')
          .select('full_name, phone')
          .eq('user_id', user.id)
          .maybeSingle()

        reset({
          name: data?.full_name || user.name,
          phone: data?.phone || '',
          email: user.email || '',
          password: '',
          passwordConfirm: '',
        })
      }

      void loadProfile()
    }
  }, [user, router, reset, changePassword, supabase])

  return (
    <form className="max-w-xl" onSubmit={handleSubmit(onSubmit)}>
      <Message className="mb-4" error={error || undefined} />
      {!changePassword ? (
        <Fragment>
          <div className="prose dark:prose-invert mb-8">
            <p className="">
              {'Change your account details below, or '}
              <Button
                className="px-0 text-inherit underline hover:cursor-pointer"
                onClick={() => setChangePassword(!changePassword)}
                type="button"
                variant="link"
              >
                click here
              </Button>
              {' to change your password.'}
            </p>
          </div>

          <div className="flex flex-col gap-8 mb-8">
            <FormItem>
              <Label htmlFor="email" className="mb-2">
                Email Address
              </Label>
              <Input
                disabled
                id="email"
                {...register('email', { required: 'Please provide an email.' })}
                type="email"
              />
              {errors.email && <FormError message={errors.email.message} />}
            </FormItem>

            <FormItem>
              <Label htmlFor="name" className="mb-2">
                Name
              </Label>
              <Input
                id="name"
                {...register('name', { required: 'Please provide a name.' })}
                type="text"
              />
              {errors.name && <FormError message={errors.name.message} />}
            </FormItem>

            <FormItem>
              <Label htmlFor="phone" className="mb-2">
                Phone
              </Label>
              <Input id="phone" {...register('phone')} type="tel" />
              {errors.phone && <FormError message={errors.phone.message} />}
            </FormItem>
          </div>
        </Fragment>
      ) : (
        <Fragment>
          <div className="prose dark:prose-invert mb-8">
            <p>
              {'Change your password below, or '}
              <Button
                className="px-0 text-inherit underline hover:cursor-pointer"
                onClick={() => setChangePassword(!changePassword)}
                type="button"
                variant="link"
              >
                cancel
              </Button>
              .
            </p>
          </div>

          <div className="flex flex-col gap-8 mb-8">
            <FormItem>
              <Label htmlFor="password" className="mb-2">
                New password
              </Label>
              <Input
                id="password"
                {...register('password', { required: 'Please provide a new password.' })}
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
                {...register('passwordConfirm', {
                  required: 'Please confirm your new password.',
                  validate: (value) => value === password.current || 'The passwords do not match',
                })}
                type="password"
              />
              {errors.passwordConfirm && <FormError message={errors.passwordConfirm.message} />}
            </FormItem>
          </div>
        </Fragment>
      )}
      <Button disabled={isLoading || isSubmitting || !isDirty} type="submit" variant="default">
        {isLoading || isSubmitting
          ? 'Processing'
          : changePassword
            ? 'Change Password'
            : 'Update Account'}
      </Button>
    </form>
  )
}
