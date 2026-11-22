<script>
  let {
    sticky = false,
    class: className = '',
    children = undefined,
  } = $props()
</script>

<!--
  NOTE: TableHead automatically wraps children in a <tr> tag.
  DO NOT wrap children in Tr component. Pass Th elements directly as children to avoid invalid nested <tr> tags.
-->

<thead class="{sticky ? 'sticky top-0 z-10' : ''} {className}">
  <tr class="bg-slate-50/80">
    {@render children?.()}
  </tr>
</thead>