import type { ReactNode } from 'react'

import { RenderParams } from '@/components/RenderParams'
import { AccountNav } from '@/components/AccountNav'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export default async function RootLayout({ children }: { children: ReactNode }) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  return (
    <div>
      <div className="container">
        <RenderParams className="" />
      </div>

      <div className="container mt-16 pb-8 flex gap-8">
        {session?.user && (
          <AccountNav className="max-w-[15.5rem] grow flex-col items-start gap-4 hidden md:flex" />
        )}

        <div className="flex flex-col gap-12 grow">{children}</div>
      </div>
    </div>
  )
}
