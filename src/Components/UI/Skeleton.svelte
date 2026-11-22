<script>
  import { cn } from '../../lib/utils.js'

  let {
    variant = 'text', // 'text' | 'circle' | 'rect' | 'card' | 'table' | 'button'
    type = undefined, // alias for variant for backwards compatibility with LoadingSkeleton
    width = null,
    height = null,
    count = 1,
    class: className = '',
  } = $props()

  const resolvedVariant = $derived(type || variant)

  const variantStyles = {
    text: 'h-4 rounded-md',
    circle: 'rounded-full',
    rect: 'rounded-xl',
    card: 'h-32 rounded-2xl',
    table: 'h-10 rounded-xl',
    button: 'h-10 rounded-xl',
  }

  function getWidth() {
    if (width) return width
    if (resolvedVariant === 'circle') return 'w-10'
    if (resolvedVariant === 'card' || resolvedVariant === 'table') return 'w-full'
    if (resolvedVariant === 'button') return 'w-24'
    return 'w-3/4'
  }

  function getHeight() {
    if (height) return height
    if (resolvedVariant === 'circle') return 'h-10'
    return variantStyles[resolvedVariant] || 'h-4'
  }
</script>

<div class={cn('space-y-3', className)} aria-hidden="true" role="status">
  {#each Array(count) as _, i (i)}
    <div
      class={cn(
        'bg-slate-200/80 animate-pulse',
        getWidth(),
        getHeight()
      )}
    ></div>
  {/each}
</div>
