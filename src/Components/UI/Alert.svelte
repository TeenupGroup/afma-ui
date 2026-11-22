<script>
  import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-svelte'

  let {
    variant = 'info', // 'success' | 'error' | 'danger' | 'warning' | 'info' | 'neutral'
    title = '',
    description = '',
    icon = undefined,
    showIcon = true,
    dismissible = false,
    onclose = undefined,
    solid = false,
    class: className = '',
    bodyClass = '',
    children = undefined,
    ...rest
  } = $props()

  const styles = {
    success: {
      wrap: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      solidWrap: 'bg-emerald-600 border-emerald-600 text-white',
      icon: 'text-emerald-600',
      solidIcon: 'text-white',
      default: CheckCircle2,
    },
    error: {
      wrap: 'bg-rose-50 border-rose-200 text-rose-900',
      solidWrap: 'bg-rose-600 border-rose-600 text-white',
      icon: 'text-rose-600',
      solidIcon: 'text-white',
      default: AlertCircle,
    },
    danger: {
      wrap: 'bg-rose-50 border-rose-200 text-rose-900',
      solidWrap: 'bg-rose-600 border-rose-600 text-white',
      icon: 'text-rose-600',
      solidIcon: 'text-white',
      default: AlertCircle,
    },
    warning: {
      wrap: 'bg-amber-50 border-amber-200 text-amber-900',
      solidWrap: 'bg-amber-500 border-amber-500 text-white',
      icon: 'text-amber-600',
      solidIcon: 'text-white',
      default: AlertTriangle,
    },
    info: {
      wrap: 'bg-sky-50 border-sky-200 text-sky-900',
      solidWrap: 'bg-sky-600 border-sky-600 text-white',
      icon: 'text-sky-600',
      solidIcon: 'text-white',
      default: Info,
    },
    neutral: {
      wrap: 'bg-slate-50 border-slate-200 text-slate-700',
      solidWrap: 'bg-slate-700 border-slate-700 text-white',
      icon: 'text-slate-500',
      solidIcon: 'text-white',
      default: Info,
    },
  }

  const active = $derived(styles[variant] || styles.info)
  const IconComp = $derived(icon === null ? null : (icon || active.default))
  const isComponent = $derived(typeof IconComp === 'function' && Boolean(IconComp.prototype))

  const computedClasses = $derived(
    [
      'mb-4 flex items-start gap-3 rounded-2xl border p-4 shadow-xs',
      solid ? active.solidWrap : active.wrap,
      className,
    ].filter(Boolean).join(' ')
  )
</script>

<div class={computedClasses} role="alert" dir="rtl" {...rest}>
  {#if showIcon && IconComp}
    <span class="shrink-0 mt-0.5 {solid ? active.solidIcon : active.icon}">
      {#if isComponent}
        {@const Cmp = IconComp}
        <Cmp class="w-5 h-5" />
      {:else}
        {@render IconComp()}
      {/if}
    </span>
  {/if}

  <div class="flex-1 min-w-0 space-y-1 {bodyClass}">
    {#if title}
      <p class="text-sm font-bold">{title}</p>
    {/if}
    {#if description}
      <p class="text-xs sm:text-sm leading-relaxed opacity-90 whitespace-pre-wrap">{description}</p>
    {/if}
    {#if children}
      <div class="text-xs sm:text-sm leading-relaxed">{@render children()}</div>
    {/if}
  </div>

  {#if dismissible}
    <button
      type="button"
      onclick={onclose}
      aria-label="بستن پیام"
      class="shrink-0 p-1 rounded-lg opacity-60 hover:opacity-100 hover:bg-black/5 transition-colors cursor-pointer"
    >
      <X class="w-4 h-4" />
    </button>
  {/if}
</div>