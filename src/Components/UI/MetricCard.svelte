<script>
  import { toPersianDigits, cn } from '../../lib/utils.js'
  import { TrendingUp, TrendingDown } from 'lucide-svelte'

  let {
    title = '',
    value = 0,
    subtitle = '',
    icon = undefined,
    color = 'indigo', // 'indigo' | 'purple' | 'emerald' | 'sky' | 'amber' | 'rose'
    trend = undefined, // { value: number|string, positive?: boolean, label?: string }
    badge = '',
    badgeColor = '',
    href = '',
    variant = 'surface', // 'surface' | 'glass' | 'gradient'
    class: className = '',
    children = undefined,
    ...rest
  } = $props()

  const colorPalettes = {
    indigo: {
      iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      iconGlow: 'from-indigo-500 to-purple-600',
      accent: 'text-indigo-600',
      border: 'hover:border-indigo-300',
      badge: 'bg-indigo-50 text-indigo-700 border-indigo-200/60',
    },
    purple: {
      iconBg: 'bg-purple-50 text-purple-600 border-purple-100',
      iconGlow: 'from-purple-500 to-pink-600',
      accent: 'text-purple-600',
      border: 'hover:border-purple-300',
      badge: 'bg-purple-50 text-purple-700 border-purple-200/60',
    },
    emerald: {
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      iconGlow: 'from-emerald-500 to-teal-600',
      accent: 'text-emerald-600',
      border: 'hover:border-emerald-300',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    },
    sky: {
      iconBg: 'bg-sky-50 text-sky-600 border-sky-100',
      iconGlow: 'from-sky-500 to-blue-600',
      accent: 'text-sky-600',
      border: 'hover:border-sky-300',
      badge: 'bg-sky-50 text-sky-700 border-sky-200/60',
    },
    amber: {
      iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
      iconGlow: 'from-amber-500 to-orange-600',
      accent: 'text-amber-600',
      border: 'hover:border-amber-300',
      badge: 'bg-amber-50 text-amber-700 border-amber-200/60',
    },
    rose: {
      iconBg: 'bg-rose-50 text-rose-600 border-rose-100',
      iconGlow: 'from-rose-500 to-pink-600',
      accent: 'text-rose-600',
      border: 'hover:border-rose-300',
      badge: 'bg-rose-50 text-rose-700 border-rose-200/60',
    },
  }

  const activePalette = $derived(colorPalettes[color] || colorPalettes.indigo)

  const variantStyles = {
    surface: 'bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:-translate-y-0.5 text-slate-800',
    glass: 'bg-white/15 backdrop-blur-md border border-white/20 shadow-xs hover:bg-white/20 text-white',
    gradient: 'bg-gradient-to-br from-white to-slate-50/80 border border-slate-200 shadow-xs hover:shadow-md text-slate-800',
  }

  const isInteractive = $derived(Boolean(href))
</script>

<svelte:element
  this={isInteractive ? 'a' : 'div'}
  {href}
  class={cn(
    'relative overflow-hidden rounded-2xl p-4 sm:p-5 font-sans transition-all duration-200 block text-right select-none',
    variantStyles[variant] || variantStyles.surface,
    isInteractive && activePalette.border,
    className
  )}
  dir="rtl"
  {...rest}
>
  <div class="flex items-start justify-between gap-3">
    <div class="space-y-1 min-w-0 flex-1">
      <span class={cn('text-xs font-bold block truncate', variant === 'glass' ? 'text-white/80' : 'text-slate-500')}>
        {title}
      </span>

      <div class="flex items-baseline gap-2">
        <span class={cn('text-2xl sm:text-3xl font-black tracking-tight', variant === 'glass' ? 'text-white' : 'text-slate-900')}>
          {toPersianDigits(value)}
        </span>

        {#if trend}
          {@const isPos = trend.positive !== false}
          <span class={cn('inline-flex items-center gap-0.5 text-[11px] font-bold px-1.5 py-0.5 rounded-lg', isPos ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700')}>
            {#if isPos}
              <TrendingUp class="w-3 h-3" />
            {:else}
              <TrendingDown class="w-3 h-3" />
            {/if}
            <span>{toPersianDigits(trend.value)}٪</span>
          </span>
        {/if}
      </div>

      {#if subtitle}
        <p class={cn('text-[11px] font-medium truncate mt-0.5', variant === 'glass' ? 'text-white/70' : 'text-slate-400')}>
          {toPersianDigits(subtitle)}
        </p>
      {/if}
    </div>

    {#if icon}
      {@const IconComp = icon}
      <div
        class={cn(
          'w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border transition-transform duration-200',
          variant === 'glass'
            ? 'bg-white/20 border-white/25 text-white'
            : cn(activePalette.iconBg, 'shadow-2xs')
        )}
      >
        <IconComp class="w-5 h-5" />
      </div>
    {/if}
  </div>

  {#if badge}
    <div class="mt-3 pt-2.5 border-t border-slate-100/40 flex items-center justify-between">
      <span class={cn('text-[10px] font-black px-2 py-0.5 rounded-full border', badgeColor || activePalette.badge)}>
        {badge}
      </span>
      {#if trend?.label}
        <span class={cn('text-[10px]', variant === 'glass' ? 'text-white/60' : 'text-slate-400')}>
          {trend.label}
        </span>
      {/if}
    </div>
  {/if}

  {#if children}
    <div class="mt-2">
      {@render children()}
    </div>
  {/if}
</svelte:element>
