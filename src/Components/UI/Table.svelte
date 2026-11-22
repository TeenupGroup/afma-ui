<script>
  let {
    striped = false,
    hoverable = true,
    compact = false,
    class: className = '',
    children = undefined,
    ...rest
  } = $props()

  const computedClasses = $derived(
    [
      'w-full text-right border-collapse',
      compact ? 'text-xs' : 'text-xs sm:text-sm',
      striped ? '[&_tbody_tr:nth-child(even)]:bg-slate-50/50' : '',
      hoverable ? '[&_tbody_tr]:transition-colors [&_tbody_tr:hover]:bg-slate-50/80' : '',
      className,
    ].filter(Boolean).join(' ')
  )
</script>

<div class="w-full overflow-x-auto rounded-2xl border border-slate-200/80 bg-white">
  <table class={computedClasses} dir="rtl" {...rest}>
    {@render children?.()}
  </table>
</div>