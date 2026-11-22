<script>
  import { AlertCircle } from 'lucide-svelte'
  import { toPersianDigits } from '../../utils/persian.js'

  let {
    errors = {},
    title = 'لطفاً اطلاعات واردشده را بررسی کنید.',
    class: classProp = '',
    className = '',
    ...rest
  } = $props()

  const messages = $derived(Object.values(errors || {}).filter(Boolean))
  const extraClass = $derived([classProp, className].filter(Boolean).join(' '))
</script>

{#if messages.length > 0}
  <div
    role="alert"
    dir="rtl"
    class="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-900 [.dark_&]:border-rose-800/80 [.dark_&]:bg-rose-950/60 [.dark_&]:text-rose-200 {extraClass}"
    {...rest}
  >
    <div class="flex items-center gap-2 mb-2">
      <AlertCircle class="h-4 w-4 shrink-0 text-rose-600 [.dark_&]:text-rose-400" aria-hidden="true" />
      <strong class="text-sm font-bold">{title}</strong>
    </div>
    <ul class="list-disc list-inside space-y-1 text-xs leading-relaxed">
      {#each messages as message, index (index)}
        <li>{toPersianDigits(message)}</li>
      {/each}
    </ul>
  </div>
{/if}
