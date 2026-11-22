<script>
  import { X, Sparkles, AlertCircle, CheckCircle, Info, Video } from 'lucide-svelte'
  import { cn } from '../../lib/utils.js'
  import Button from './Button.svelte'

  let {
    title = '',
    description = '',
    variant = 'info', // 'live' | 'info' | 'success' | 'warning' | 'danger' | 'gradient'
    icon = undefined,
    badge = '',
    action = undefined, // { label: string, href?: string, onclick?: Function, icon?: any, variant?: string }
    closable = false,
    onclose = undefined,
    class: className = '',
    children = undefined,
    ...rest
  } = $props()

  let visible = $state(true)

  function handleClose() {
    visible = false
    onclose?.()
  }

  const variantStyles = {
    live: 'bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-sky-500/15 border border-sky-400/20',
    gradient: 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white shadow-lg shadow-indigo-500/15 border border-indigo-400/20',
    info: 'bg-sky-50 text-sky-900 border border-sky-200/80',
    success: 'bg-emerald-50 text-emerald-900 border border-emerald-200/80',
    warning: 'bg-amber-50 text-amber-900 border border-amber-200/80',
    danger: 'bg-rose-50 text-rose-900 border border-rose-200/80',
  }

  const defaultIcons = {
    live: Video,
    gradient: Sparkles,
    info: Info,
    success: CheckCircle,
    warning: AlertCircle,
    danger: AlertCircle,
  }

  const ActiveIcon = $derived(icon || defaultIcons[variant] || Info)
  const isDark = $derived(variant === 'live' || variant === 'gradient')
</script>

{#if visible}
  <div
    class={cn(
      'relative overflow-hidden rounded-2xl p-4 sm:p-5 font-sans transition-all text-right',
      variantStyles[variant] || variantStyles.info,
      className
    )}
    dir="rtl"
    {...rest}
  >
    <div class="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="flex items-start gap-3 min-w-0 flex-1">
        <!-- Icon / Pulse wrapper -->
        <div class="relative shrink-0 mt-0.5 sm:mt-0">
          {#if variant === 'live'}
            <span class="absolute -top-1 -right-1 flex h-3 w-3">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
            </span>
          {/if}
          <div
            class={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center',
              isDark ? 'bg-white/20 backdrop-blur-md text-white' : 'bg-white shadow-2xs'
            )}
          >
            <ActiveIcon class="w-5 h-5 shrink-0" />
          </div>
        </div>

        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2 flex-wrap">
            <h3 class="font-bold text-sm sm:text-base leading-snug">
              {title}
            </h3>
            {#if badge}
              <span
                class={cn(
                  'text-[10px] font-black px-2 py-0.5 rounded-full border',
                  isDark ? 'bg-white/20 text-white border-white/20' : 'bg-white text-slate-700 border-slate-200 shadow-2xs'
                )}
              >
                {badge}
              </span>
            {/if}
          </div>

          {#if description}
            <p class={cn('text-xs sm:text-sm mt-1 leading-relaxed', isDark ? 'text-white/85' : 'text-slate-600')}>
              {description}
            </p>
          {/if}

          {#if children}
            <div class="mt-2">
              {@render children()}
            </div>
          {/if}
        </div>
      </div>

      <!-- Action Button & Close -->
      <div class="flex items-center gap-2 self-end sm:self-center shrink-0">
        {#if action}
          <Button
            href={action.href}
            onclick={action.onclick}
            variant={action.variant || (isDark ? 'outline' : 'primary')}
            size="sm"
            icon={action.icon}
            class={cn(isDark && 'bg-white text-indigo-700 hover:bg-white/90 border-transparent shadow-md font-bold')}
          >
            {action.label}
          </Button>
        {/if}

        {#if closable}
          <button
            type="button"
            onclick={handleClose}
            class={cn(
              'p-1.5 rounded-xl transition-colors cursor-pointer',
              isDark ? 'text-white/70 hover:bg-white/20 hover:text-white' : 'text-slate-400 hover:bg-slate-200/60 hover:text-slate-600'
            )}
            title="بستن اعلان"
            aria-label="بستن اعلان"
          >
            <X class="w-4 h-4" />
          </button>
        {/if}
      </div>
    </div>
  </div>
{/if}
