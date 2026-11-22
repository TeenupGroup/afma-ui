<script>
  import { getIranianGradeTier, formatPersianScore } from '../../lib/grades.js'
  import { cn, toPersianDigits } from '../../lib/utils.js'

  let {
    score = null,
    maxScore = 20,
    showScale = false,
    showLabel = false,
    showEmoji = true,
    size = 'md', // 'xs' | 'sm' | 'md' | 'lg' | 'xl'
    variant = 'subtle', // 'subtle' | 'solid' | 'pill' | 'card'
    class: className = '',
    ...rest
  } = $props()

  const tier = $derived(getIranianGradeTier(score, maxScore))
  const formattedScore = $derived(formatPersianScore(score, { showScale, maxScore }))

  const colorStyles = {
    emerald: {
      subtle: 'bg-emerald-50 text-emerald-700 border-emerald-200/70',
      solid: 'bg-emerald-600 text-white border-transparent',
      pill: 'bg-emerald-500/10 text-emerald-700 border-emerald-300/40',
      card: 'bg-emerald-50/70 text-emerald-800 border-emerald-200 shadow-xs',
      text: 'text-emerald-600',
    },
    sky: {
      subtle: 'bg-sky-50 text-sky-700 border-sky-200/70',
      solid: 'bg-sky-600 text-white border-transparent',
      pill: 'bg-sky-500/10 text-sky-700 border-sky-300/40',
      card: 'bg-sky-50/70 text-sky-800 border-sky-200 shadow-xs',
      text: 'text-sky-600',
    },
    amber: {
      subtle: 'bg-amber-50 text-amber-700 border-amber-200/70',
      solid: 'bg-amber-600 text-white border-transparent',
      pill: 'bg-amber-500/10 text-amber-700 border-amber-300/40',
      card: 'bg-amber-50/70 text-amber-800 border-amber-200 shadow-xs',
      text: 'text-amber-600',
    },
    rose: {
      subtle: 'bg-rose-50 text-rose-700 border-rose-200/70',
      solid: 'bg-rose-600 text-white border-transparent',
      pill: 'bg-rose-500/10 text-rose-700 border-rose-300/40',
      card: 'bg-rose-50/70 text-rose-800 border-rose-200 shadow-xs',
      text: 'text-rose-600',
    },
    slate: {
      subtle: 'bg-slate-100 text-slate-700 border-slate-200',
      solid: 'bg-slate-700 text-white border-transparent',
      pill: 'bg-slate-200/50 text-slate-700 border-slate-300',
      card: 'bg-slate-50 text-slate-800 border-slate-200 shadow-xs',
      text: 'text-slate-600',
    },
  }

  const sizes = {
    xs: {
      wrap: 'px-1.5 py-0.5 text-[10px] gap-1',
      score: 'text-[11px] font-black',
      label: 'text-[9px] font-bold',
    },
    sm: {
      wrap: 'px-2 py-0.5 text-xs gap-1.5',
      score: 'text-xs font-black',
      label: 'text-[10px] font-bold',
    },
    md: {
      wrap: 'px-2.5 py-1 text-xs gap-1.5',
      score: 'text-sm font-black',
      label: 'text-[11px] font-bold',
    },
    lg: {
      wrap: 'px-3.5 py-1.5 text-sm gap-2',
      score: 'text-base font-black',
      label: 'text-xs font-bold',
    },
    xl: {
      wrap: 'px-4 py-2 text-base gap-2.5',
      score: 'text-xl font-black',
      label: 'text-sm font-bold',
    },
  }

  const activeColor = $derived(colorStyles[tier.color] || colorStyles.slate)
  const activeSize = $derived(sizes[size] || sizes.md)
</script>

<span
  class={cn(
    'inline-flex items-center rounded-xl border font-sans select-none transition-all',
    activeSize.wrap,
    activeColor[variant] || activeColor.subtle,
    className
  )}
  dir="rtl"
  {...rest}
>
  {#if showEmoji && tier.emoji !== '—'}
    <span class="shrink-0">{tier.emoji}</span>
  {/if}

  <span class={cn('tracking-tight font-black', activeSize.score)}>
    {formattedScore}
  </span>

  {#if showLabel && tier.label}
    <span class={cn('opacity-90 font-bold', activeSize.label)}>
      {tier.label}
    </span>
  {/if}
</span>
