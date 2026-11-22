<script>
  let {
    align = 'start', // 'start' | 'center' | 'end'
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

<td
  class="px-4 py-3 text-slate-700 align-middle {aligns[align] || aligns.start} {className}"
  {...rest}
>
  {@render children?.()}
</td>