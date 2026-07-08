import { cn } from '#/lib/utils';

function BrandMark({ className, letter = 'S' }: { className?: string; letter?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex size-8 items-center justify-center rounded-lg bg-primary text-[13px] font-semibold tracking-tight text-primary-foreground',
        className
      )}
    >
      {letter}
    </span>
  );
}

function BrandLockup({ className, shopName }: { className?: string; shopName?: string | null }) {
  const name = shopName || 'My Shop';
  const letter = name.charAt(0).toUpperCase();

  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <BrandMark letter={letter} />
      <span className="font-heading text-base font-semibold tracking-tight">{name}</span>
    </div>
  );
}

export { BrandLockup, BrandMark };
