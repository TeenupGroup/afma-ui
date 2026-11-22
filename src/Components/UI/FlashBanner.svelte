<script>
  import { page } from '@inertiajs/svelte'
  import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-svelte'
  import { toPersianDigits } from '../../utils/persian.js'

  let {
    class: classProp = '',
    className = '',
    ...rest
  } = $props()

  let dismissedKey = $state('')

  const flash = $derived(page.props?.flash || {})
  const activeMessage = $derived.by(() => {
    if (flash.error) return { type: 'error', text: flash.error }
    if (flash.warning) return { type: 'warning', text: flash.warning }
    if (flash.success) return { type: 'success', text: flash.success }
    if (flash.info) return { type: 'info', text: flash.info }
    return null
  })
  const generatedToken = $derived(flash.generated_token || '')
  const currentKey = $derived(
    activeMessage ? `${activeMessage.type}:${activeMessage.text}:${generatedToken}` : ''
  )
  const visible = $derived(Boolean(activeMessage && currentKey !== dismissedKey))
  const extraClass = $derived([classProp, className].filter(Boolean).join(' '))

  const variantStyles = {
    error: {
      wrap: 'bg-rose-50 border-rose-200 text-rose-900 [.dark_&]:bg-rose-950/60 [.dark_&]:border-rose-800/80 [.dark_&]:text-rose-200',
      icon: 'text-rose-600 [.dark_&]:text-rose-400',
      comp: AlertCircle,
    },
    warning: {
      wrap: 'bg-amber-50 border-amber-200 text-amber-900 [.dark_&]:bg-amber-950/60 [.dark_&]:border-amber-800/80 [.dark_&]:text-amber-200',
      icon: 'text-amber-600 [.dark_&]:text-amber-400',
      comp: AlertTriangle,
    },
    success: {
      wrap: 'bg-emerald-50 border-emerald-200 text-emerald-900 [.dark_&]:bg-emerald-950/60 [.dark_&]:border-emerald-800/80 [.dark_&]:text-emerald-200',
      icon: 'text-emerald-600 [.dark_&]:text-emerald-400',
      comp: CheckCircle2,
    },
    info: {
      wrap: 'bg-sky-50 border-sky-200 text-sky-900 [.dark_&]:bg-sky-950/60 [.dark_&]:border-sky-800/80 [.dark_&]:text-sky-200',
      icon: 'text-sky-600 [.dark_&]:text-sky-400',
      comp: Info,
    },
  }

  const style = $derived(variantStyles[activeMessage?.type] || variantStyles.info)
  const IconComp = $derived(style.comp)
</script>

{#if visible && activeMessage}
  <div
    role={activeMessage.type === 'error' ? 'alert' : 'status'}
    aria-live="polite"
    dir="rtl"
    class="rounded-xl border p-4 flex items-start justify-between gap-3 {style.wrap} {extraClass}"
    {...rest}
  >
    <div class="flex items-start gap-2.5 min-w-0 flex-1">
      <IconComp class="h-4 w-4 shrink-0 mt-0.5 {style.icon}" aria-hidden="true" />
      <div class="min-w-0 flex-1 space-y-2">
        <p class="text-sm font-bold leading-relaxed">{toPersianDigits(activeMessage.text)}</p>
        {#if generatedToken}
          <div class="rounded-lg border border-black/10 bg-white/85 px-3 py-2 text-xs text-slate-800 [.dark_&]:border-white/15 [.dark_&]:bg-slate-900/90 [.dark_&]:text-slate-100 space-y-1">
            <span class="block font-bold">کلید / توکن یک‌بارنمایش صادرشده (هم‌اکنون کپی کنید):</span>
            <code dir="ltr" class="block font-mono break-all select-all">{generatedToken}</code>
          </div>
        {/if}
      </div>
    </div>

    <button
      type="button"
      onclick={() => (dismissedKey = currentKey)}
      aria-label="بستن پیام"
      class="shrink-0 rounded-lg p-1.5 opacity-75 hover:opacity-100 hover:bg-black/5 [.dark_&]:hover:bg-white/10 transition-colors cursor-pointer"
    >
      <X class="h-4 w-4" aria-hidden="true" />
    </button>
  </div>
{/if}
