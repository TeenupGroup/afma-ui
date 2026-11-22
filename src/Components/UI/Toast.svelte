<script>
  import { CheckCircle2, AlertCircle, AlertTriangle, Info, X, RotateCcw } from 'lucide-svelte'
  import { cn } from '../../lib/utils.js'

  let {
    open = $bindable(true),
    type = 'info', // 'success' | 'error' | 'warning' | 'info' | 'undo'
    title = '',
    message = '',
    dismissible = true,
    duration = 0,
    onclose = undefined,
    onundo = undefined,
    class: className = '',
    ...rest
  } = $props()

  const variants = {
    success: {
      wrap: 'bg-emerald-900/90 text-white border-emerald-700/60 shadow-emerald-950/20',
      icon: CheckCircle2,
      iconColor: 'text-emerald-400',
    },
    error: {
      wrap: 'bg-rose-900/90 text-white border-rose-700/60 shadow-rose-950/20',
      icon: AlertCircle,
      iconColor: 'text-rose-400',
    },
    warning: {
      wrap: 'bg-amber-900/90 text-white border-amber-700/60 shadow-amber-950/20',
      icon: AlertTriangle,
      iconColor: 'text-amber-400',
    },
    info: {
      wrap: 'bg-slate-900/90 text-white border-slate-700/60 shadow-slate-950/20',
      icon: Info,
      iconColor: 'text-sky-400',
    },
    undo: {
      wrap: 'bg-slate-900/95 text-white border-indigo-500/60 shadow-indigo-950/40 ring-1 ring-indigo-500/30',
      icon: RotateCcw,
      iconColor: 'text-indigo-400',
    },
  }

  const active = $derived(variants[type] || variants.info)
  const IconComponent = $derived(active.icon)

  let timeoutId = null

  function close() {
    open = false
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
    onclose?.()
  }

  $effect(() => {
    if (open && duration > 0) {
      timeoutId = setTimeout(() => {
        close()
      }, duration)
      return () => {
        if (timeoutId) clearTimeout(timeoutId)
      }
    }
  })
</script>

{#if open}
  <div
    class={cn(
      'flex items-start gap-3 p-3.5 sm:p-4 rounded-2xl border backdrop-blur-md shadow-xl text-right transition-all duration-300 animate-slide-in',
      active.wrap,
      className
    )}
    role="status"
    aria-live="polite"
    dir="rtl"
    data-testid="toast"
    {...rest}
  >
    <div class={cn('shrink-0 mt-0.5', active.iconColor)}>
      <IconComponent class="w-5 h-5" />
    </div>

    <div class="flex-1 min-w-0 space-y-0.5">
      {#if title}
        <h4 class="text-xs sm:text-sm font-bold leading-tight">{title}</h4>
      {/if}
      {#if message}
        <p class="text-xs sm:text-sm leading-relaxed text-slate-100 whitespace-pre-wrap">{message}</p>
      {/if}
    </div>

    {#if type === 'undo' && onundo}
      <button
        type="button"
        onclick={() => { onundo(); close(); }}
        class="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer select-none"
      >
        <RotateCcw class="w-3.5 h-3.5" />
        <span>بازگردانی</span>
        <kbd class="hidden sm:inline-block px-1 py-0.2 bg-indigo-800 text-[10px] rounded border border-indigo-400/40 text-indigo-200">Ctrl+Z</kbd>
      </button>
    {/if}

    {#if dismissible}
      <button
        type="button"
        onclick={close}
        class="shrink-0 p-1 -m-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        aria-label="بستن"
      >
        <X class="w-4 h-4" />
      </button>
    {/if}

    {#if type === 'undo' && duration > 0}
      <div class="absolute bottom-0 inset-x-0 h-1 bg-white/10 rounded-b-2xl overflow-hidden">
        <div
          class="h-full bg-indigo-400"
          style={`animation: shrink-progress ${duration}ms linear forwards;`}
        ></div>
      </div>
    {/if}
  </div>
{/if}

<style>
  @keyframes slide-in {
    from {
      opacity: 0;
      transform: translateY(-8px) scale(0.97);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
  @keyframes shrink-progress {
    from {
      width: 100%;
    }
    to {
      width: 0%;
    }
  }
  .animate-slide-in {
    animation: slide-in 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
</style>
