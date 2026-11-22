<script>
  import { cn } from '../../lib/utils.js'
  import Toast from '../../Components/UI/Toast.svelte'

  let {
    open = $bindable(false),
    type = 'info', // 'success', 'error', 'warning', 'info'
    title = null,
    message = '',
    duration = 5000,
    position = 'top-left', // 'top-left', 'top-right', 'bottom-left', 'bottom-right'
    closable = true,
    onclose = undefined,
    class: className = '',
    ...rest
  } = $props()

  const positions = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  }
</script>

{#if open}
  <div class={cn('fixed z-50 max-w-sm w-full', positions[position])} dir="rtl">
    <Toast
      bind:open
      {type}
      {title}
      {message}
      {duration}
      dismissible={closable}
      {onclose}
      class={className}
      {...rest}
    />
  </div>
{/if}
