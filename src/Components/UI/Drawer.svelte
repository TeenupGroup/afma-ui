<script>
  import Modal from './Modal.svelte'

  let {
    open = $bindable(false),
    title = '',
    description = '',
    size = 'lg',
    position = 'left',
    closeOnBackdrop = true,
    closeOnEscape = true,
    onclose = undefined,
    onClose = undefined,
    header = undefined,
    footer = undefined,
    class: className = '',
    children = undefined,
    ...rest
  } = $props()
</script>

<Modal
  bind:open
  variant="drawer"
  {title}
  {description}
  {size}
  {position}
  {closeOnBackdrop}
  {closeOnEscape}
  {onclose}
  {onClose}
  {header}
  {footer}
  class={className}
  {...rest}
>
  {#if children}
    {@render children()}
  {/if}
</Modal>
