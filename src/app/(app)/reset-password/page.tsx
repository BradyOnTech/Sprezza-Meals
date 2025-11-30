import type { Metadata } from 'next'

import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { ResetPasswordForm } from '@/components/forms/ResetPasswordForm'
import React from 'react'

export default function ResetPasswordPage() {
  return (
    <div className="container py-16">
      <h1 className="text-2xl font-semibold mb-4">Reset your password</h1>
      <ResetPasswordForm />
    </div>
  )
}

export const metadata: Metadata = {
  description: 'Reset your Sprezza Meals account password.',
  openGraph: mergeOpenGraph({
    title: 'Reset Password',
    url: '/reset-password',
  }),
  title: 'Reset Password',
}
