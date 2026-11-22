<script>
  import { slide } from 'svelte/transition'
  import { BarChart3, ChevronDown } from 'lucide-svelte'
  import { cn } from '../../lib/utils.js'

  let {
    title = 'آمار و شاخص‌ها',
    openLabel = '',
    closeLabel = '',
    open = $bindable(false),
    summary = '',
    class: className = '',
    buttonClass = '',
    contentClass = '',
    children,
  } = $props()

  const effectiveOpenText = $derived(closeLabel || `بستن ${title}`)
  const effectiveClosedText = $derived(openLabel || `مشاهده ${title}`)
</script>

<div class={cn('w-full', className)} dir="rtl">
  <div class="flex items-center justify-between">
    <button
      type="button"
      onclick={() => (open = !open)}
      class={cn(
        'group inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-indigo-600 bg-white/90 hover:bg-white border border-slate-200/80 hover:border-indigo-200 py-1.5 px-3 rounded-xl transition-all shadow-2xs cursor-pointer select-none',
        buttonClass
      )}
      aria-expanded={open}
    >
      <div class="w-5 h-5 rounded-lg bg-slate-100 group-hover:bg-indigo-50 flex items-center justify-center transition-colors">
        <BarChart3 class="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-600" />
      </div>
      <span>{open ? effectiveOpenText : effectiveClosedText}</span>
      {#if summary}
        <span class="text-[11px] font-medium text-slate-400 group-hover:text-indigo-400">
          ({summary})
        </span>
      {/if}
      <ChevronDown
        class={cn('w-3.5 h-3.5 text-slate-400 transition-transform duration-200', open && 'rotate-180 text-indigo-600')}
      />
    </button>
  </div>

  {#if open}
    <div transition:slide={{ duration: 200 }} class={cn('mt-3', contentClass)}>
      {@render children?.()}
    </div>
  {/if}
</div>
