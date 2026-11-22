<script>
  let { class: className = '', children = undefined, ...rest } = $props()
</script>

<tbody class="divide-y divide-slate-100 {className}" {...rest}>
  {@render children?.()}
</tbody>