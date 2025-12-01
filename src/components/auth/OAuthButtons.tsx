'use client'

import { Button } from '@/components/ui/button'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { Apple, Mail, LucideIcon } from 'lucide-react'
import React, { useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'

type Provider = 'google' | 'apple'

const providerIcons: Record<Provider, LucideIcon> = {
  google: Mail,
  apple: Apple,
}

const providerLabels: Record<Provider, string> = {
  google: 'Continue with Google',
  apple: 'Continue with Apple',
}

export function OAuthButtons({ providers = ['google'] }: { providers?: Provider[] }) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), [])
  const [loadingProvider, setLoadingProvider] = useState<Provider | null>(null)

  const handleOAuth = useCallback(
    async (provider: Provider) => {
      setLoadingProvider(provider)
      const redirectTo =
        typeof window !== 'undefined'
          ? `${window.location.origin}/account`
          : process.env.NEXT_PUBLIC_SITE_URL || ''

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
        },
      })

      if (error) {
        toast.error(`Unable to continue with ${provider}.`)
        setLoadingProvider(null)
      }
    },
    [supabase],
  )

  return (
    <div className="flex flex-col gap-3">
      {providers.map((provider) => {
        const Icon = providerIcons[provider]
        return (
          <Button
            key={provider}
            type="button"
            variant="outline"
            onClick={() => void handleOAuth(provider)}
            disabled={!!loadingProvider}
            className="justify-start gap-2"
          >
            <Icon className="h-4 w-4" />
            {loadingProvider === provider ? 'Redirecting...' : providerLabels[provider]}
          </Button>
        )
      })}
    </div>
  )
}
