<script>
  let {
    align = 'start', // 'start' | 'center' | 'end'
    width = undefined,
    class: className = '',
    children = undefined,
    ...rest
  } = $props()

  const aligns = {
    start: 'text-right',
    center: 'text-center',
    end: 'text-left',
  }
</script>

<th
  scope="col"
  style={width ? `width: ${width}` : undefined}
  class="px-4 py-3 text-xs font-bold text-slate-500 whitespace-nowrap {aligns[align] || aligns.start} {className}"
  {...rest}
>
  {@render children?.()}
</th>