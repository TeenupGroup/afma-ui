<script>
  import { Link } from '@inertiajs/svelte'
  import { toPersianDigits } from '../../lib/utils.js'
  import { TrendingUp, TrendingDown, Minus } from 'lucide-svelte'

  let {
    title,
    value,
    subtitle = null,
    description = null,
    icon = null,
    trend = null, // 'up' | 'down' | 'neutral'
    trendValue = null,
    color = 'indigo', // 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky' | 'purple' | 'blue' | 'slate' | 'green' | 'yellow' | 'red' | 'orange' | 'cyan'
    loading = false,
    href = null,
    class: className = '',
    ...rest
  } = $props()

  const defaultTrend = {
    up: 'text-emerald-600 bg-emerald-50',
    down: 'text-rose-600 bg-rose-50',
    neutral: 'text-slate-600 bg-slate-50',
  }

  const colors = {
    indigo: {
      bg: 'bg-indigo-50/60',
      icon: 'bg-indigo-100 text-indigo-600',
      blob: 'bg-indigo-500/10',
      trend: defaultTrend,
    },
    emerald: {
      bg: 'bg-emerald-50/60',
      icon: 'bg-emerald-100 text-emerald-600',
      blob: 'bg-emerald-500/10',
      trend: defaultTrend,
    },
    green: {
      bg: 'bg-emerald-50/60',
      icon: 'bg-emerald-100 text-emerald-600',
      blob: 'bg-emerald-500/10',
      trend: defaultTrend,
    },
    amber: {
      bg: 'bg-amber-50/60',
      icon: 'bg-amber-100 text-amber-600',
      blob: 'bg-amber-500/10',
      trend: defaultTrend,
    },
    yellow: {
      bg: 'bg-amber-50/60',
      icon: 'bg-amber-100 text-amber-600',
      blob: 'bg-amber-500/10',
      trend: defaultTrend,
    },
    orange: {
      bg: 'bg-amber-50/60',
      icon: 'bg-amber-100 text-amber-600',
      blob: 'bg-amber-500/10',
      trend: defaultTrend,
    },
    rose: {
      bg: 'bg-rose-50/60',
      icon: 'bg-rose-100 text-rose-600',
      blob: 'bg-rose-500/10',
      trend: defaultTrend,
    },
    red: {
      bg: 'bg-rose-50/60',
      icon: 'bg-rose-100 text-rose-600',
      blob: 'bg-rose-500/10',
      trend: defaultTrend,
    },
    sky: {
      bg: 'bg-sky-50/60',
      icon: 'bg-sky-100 text-sky-600',
      blob: 'bg-sky-500/10',
      trend: defaultTrend,
    },
    cyan: {
      bg: 'bg-cyan-50/60',
      icon: 'bg-cyan-100 text-cyan-600',
      blob: 'bg-cyan-500/10',
      trend: defaultTrend,
    },
    purple: {
      bg: 'bg-purple-50/60',
      icon: 'bg-purple-100 text-purple-600',
      blob: 'bg-purple-500/10',
      trend: defaultTrend,
    },
    blue: {
      bg: 'bg-blue-50/60',
      icon: 'bg-blue-100 text-blue-600',
      blob: 'bg-blue-500/10',
      trend: defaultTrend,
    },
    slate: {
      bg: 'bg-slate-50/60',
      icon: 'bg-slate-100 text-slate-600',
      blob: 'bg-slate-500/10',
      trend: defaultTrend,
    },
  }

  const activeColor = $derived(colors[color] || colors.indigo)
  const effectiveSubtitle = $derived(subtitle ?? description)

  const formattedValue = $derived(
    typeof value === 'number' || (!isNaN(Number(value)) && String(value).trim() !== '')
      ? toPersianDigits(value)
      : value
  )

  const TrendIcon = $derived(
    trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus
  )

  const isComponent = $derived(typeof icon === 'function' && Boolean(icon.prototype))
</script>

{#snippet cardInner()}
  {#if loading}
    <div class="animate-pulse space-y-3">
      <div class="flex items-center justify-between">
        <div class="w-10 h-10 bg-slate-100 rounded-xl"></div>
        <div class="w-16 h-4 bg-slate-100 rounded-lg"></div>
      </div>
      <div class="w-24 h-8 bg-slate-100 rounded-lg"></div>
      <div class="w-32 h-3 bg-slate-100 rounded-lg"></div>
    </div>
  {:else}
    <div class="flex items-center justify-between mb-3.5">
      {#if icon}
        <div class="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 {activeColor.icon}">
          {#if isComponent}
            {@const IconComp = icon}
            <IconComp class="w-5 h-5" />
          {:else}
            {@render icon()}
          {/if}
        </div>
      {/if}

      {#if trend && trendValue}
        {@const TrendComp = TrendIcon}
        <div class="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full {activeColor.trend[trend]}">
          <TrendComp class="w-3.5 h-3.5" />
          <span>{toPersianDigits(trendValue)}</span>
        </div>
      {/if}
    </div>

    <div class="space-y-1 relative z-10">
      <p class="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
        {formattedValue}
      </p>
      <p class="text-xs sm:text-sm font-bold text-slate-500">{title}</p>
      {#if effectiveSubtitle}
        <p class="text-[11px] text-slate-400 leading-tight">{effectiveSubtitle}</p>
      {/if}
    </div>

    <!-- Decorative background glow -->
    <div
      class="absolute top-0 left-0 w-28 h-28 -translate-x-6 -translate-y-6 rounded-full pointer-events-none {activeColor.blob}"
    ></div>
  {/if}
{/snippet}

{#if href}
  <Link
    {href}
    class="block relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 {className}"
    dir="rtl"
    {...rest}
  >
    {@render cardInner()}
  </Link>
{:else}
  <div
    class="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all duration-200 hover:shadow-md {className}"
    dir="rtl"
    {...rest}
  >
    {@render cardInner()}
  </div>
{/if}

