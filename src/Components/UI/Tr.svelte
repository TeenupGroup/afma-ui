<script>
  let {
    clickable = false,
    selected = false,
    class: className = '',
    children = undefined,
    ...rest
  } = $props()
</script>

<tr
  class="{clickable ? 'cursor-pointer' : ''} {selected ? 'bg-indigo-50/60' : ''} {className}"
  {...rest}
>
  {@render children?.()}
</tr>