<script>
  import Badge from '../../Components/UI/Badge.svelte'

  let {
    variant = 'default',
    size = 'default',
    children,
    class: className = '',
    ...rest
  } = $props()

  // Map old admin size 'default' to 'sm'
  const mappedSize = $derived(size === 'default' ? 'sm' : size)
</script>

<Badge
  color={variant}
  size={mappedSize}
  class={className}
  {...rest}
>
  {#if children}
    {@render children()}
  {/if}
</Badge>
