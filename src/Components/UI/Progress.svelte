<script>
  import { toPersianDigits } from '../../lib/utils.js'

  let {
    value = 0, // 0..100
    max = 100,
    color = 'indigo', // 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky' | 'purple' | 'slate'
    size = 'md', // 'sm' | 'md' | 'lg'
    label = '',
    showValue = false,
    striped = false,
    class: className = '',
  } = $props()

  const colors = {
    indigo: 'bg-indigo-600',
    emerald: 'bg-emerald-600',
    amber: 'bg-amber-600',
    rose: 'bg-rose-600',
    sky: 'bg-sky-600',
    purple: 'bg-purple-600',
    slate: 'bg-slate-700',
  }

  const sizes = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  }

  const percent = $derived(Math.max(0, Math.min(100, (Number(value) / (Number(max) || 100)) * 100)))
  const activeColor = $derived(colors[color] || colors.indigo)
  const activeSize = $derived(sizes[size] || sizes.md)
</script>

<div class="space-y-1.5 w-full {className}" dir="rtl">
  {#if label || showValue}
    <div class="flex items-center justify-between gap-2">
      {#if label}
        <span class="text-xs font-bold text-slate-600">{label}</span>
      {/if}
      {#if showValue}
        <span class="text-xs font-bold text-slate-500">{`${toPersianDigits(Math.round(percent))}٪`}</span>
      {/if}
    </div>
  {/if}

  <div
    class="w-full {activeSize} bg-slate-200/80 rounded-full overflow-hidden"
    role="progressbar"
    aria-valuenow={Math.round(percent)}
    aria-valuemin="0"
    aria-valuemax="100"
    aria-label={label || undefined}
  >
    <div
      class="h-full rounded-full transition-all duration-500 ease-out {activeColor} {striped ? 'bg-[length:1rem_1rem] bg-[linear-gradient(45deg,rgba(255,255,255,.25)_25%,transparent_25%,transparent_50%,rgba(255,255,255,.25)_50%,rgba(255,255,255,.25)_75%,transparent_75%,transparent)]' : ''}"
      style="width: {percent}%"
    ></div>
  </div>
</div>