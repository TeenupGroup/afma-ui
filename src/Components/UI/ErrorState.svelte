<script>
  import { AlertTriangle } from 'lucide-svelte'
  import { toPersianDigits } from '../../utils/persian.js'

  let {
    title = 'خطا در دریافت یا پردازش اطلاعات',
    message = '',
    retryLabel = 'تلاش مجدد',
    onretry = null,
    onDismiss = null,
    class: classProp = '',
    className = '',
    ...rest
  } = $props()

  const actionHandler = $derived(onretry || onDismiss)
  const extraClass = $derived([classProp, className].filter(Boolean).join(' '))
</script>

{#if message}
  <div
    role="alert"
    dir="rtl"
    class="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-900 [.dark_&]:border-rose-800/80 [.dark_&]:bg-rose-950/60 [.dark_&]:text-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 {extraClass}"
    {...rest}
  >
    <div class="flex items-start gap-3 min-w-0 flex-1">
      <AlertTriangle class="h-5 w-5 shrink-0 mt-0.5 text-rose-600 [.dark_&]:text-rose-400" aria-hidden="true" />
      <div class="min-w-0 flex-1">
        {#if title}
          <h3 class="text-sm font-extrabold">{toPersianDigits(title)}</h3>
        {/if}
        <p class="mt-0.5 text-xs sm:text-sm leading-relaxed opacity-90">{toPersianDigits(message)}</p>
      </div>
    </div>

    {#if actionHandler}
      <button
        type="button"
        onclick={actionHandler}
        class="self-end sm:self-center shrink-0 rounded-xl border border-rose-300 bg-white/80 px-3 py-1.5 text-xs font-bold text-rose-800 hover:bg-white [.dark_&]:border-rose-700 [.dark_&]:bg-rose-900/50 [.dark_&]:text-rose-100 [.dark_&]:hover:bg-rose-900 transition-colors cursor-pointer"
      >
        {retryLabel}
      </button>
    {/if}
  </div>
{/if}
