import { MealPlan } from '@/payload-types'
import Link from 'next/link'
import { Media } from '@/components/Media'
import { format } from 'date-fns'
import clsx from 'clsx'

type Props = {
  plan: MealPlan
}

const formatWindow = (schedule?: MealPlan['schedule']) => {
  if (!schedule?.startDate || !schedule?.endDate) return null
  try {
    const start = format(new Date(schedule.startDate), 'MMM d')
    const end = format(new Date(schedule.endDate), 'MMM d')
    return `${start} – ${end}`
  } catch {
    return null
  }
}

export function PlanGridItem({ plan }: Props) {
  const image = plan.image && typeof plan.image !== 'number' ? plan.image : null
  const windowLabel = formatWindow(plan.schedule)

  return (
    <Link
      href={`/plans/${plan.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border bg-primary-foreground transition hover:-translate-y-1"
    >
      {image ? (
        <Media
          className="h-48 w-full overflow-hidden bg-muted"
          imgClassName={clsx(
            'h-full w-full object-cover transition duration-300 ease-in-out group-hover:scale-105',
          )}
          resource={image}
        />
      ) : null}
      <div className="flex flex-1 flex-col gap-2 p-4">
        {windowLabel ? (
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{windowLabel}</p>
        ) : null}
        <h3 className="text-lg font-semibold">{plan.title}</h3>
        {plan.tagline ? <p className="text-sm text-muted-foreground line-clamp-2">{plan.tagline}</p> : null}
        <div className="mt-auto pt-2 text-sm font-mono text-primary/70">View plan →</div>
      </div>
    </Link>
  )
}
