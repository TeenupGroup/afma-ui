<script>
  let {
    size = 'md', // 'xs' | 'sm' | 'md' | 'lg' | 'xl'
    color = 'slate', // 'slate' | 'white' | 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky'
    label = '',
    class: className = '',
  } = $props()

  const sizes = {
    xs: 'w-3 h-3 border-2',
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-9 h-9 border-[3px]',
    xl: 'w-12 h-12 border-4',
  }

  const colors = {
    slate: 'border-slate-200 border-t-slate-600',
    white: 'border-white/35 border-t-white',
    indigo: 'border-indigo-200 border-t-indigo-600',
    emerald: 'border-emerald-200 border-t-emerald-600',
    amber: 'border-amber-200 border-t-amber-600',
    rose: 'border-rose-200 border-t-rose-600',
    sky: 'border-sky-200 border-t-sky-600',
  }
</script>

<div
  class="flex flex-col items-center justify-center gap-2 {className}"
  role="status"
  aria-live="polite"
>
  <div
    class="rounded-full animate-spin shrink-0 {sizes[size] || sizes.md} {colors[color] || colors.slate}"
    aria-hidden="true"
  ></div>
  {#if label}
    <span class="text-xs font-bold text-slate-500">{label}</span>
  {/if}
  <span class="sr-only">در حال بارگذاری</span>
</div>