import { cn } from '#/lib/utils'

function BrandMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex size-8 items-center justify-center rounded-lg bg-primary text-[13px] font-semibold tracking-tight text-primary-foreground',
        className,
      )}
    >
      P
    </span>
  )
}

function BrandLockup({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <BrandMark />
      <span className="font-heading text-base font-semibold tracking-tight">
        Payshelf
      </span>
    </div>
  )
}

export { BrandLockup, BrandMark }
