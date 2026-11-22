<script>
  import { getContext } from 'svelte'
  import { cn } from '../../lib/utils.js'

  let {
    id = String(Math.random()),
    title = '',
    disabled = false,
    class: className = '',
    headerClass = '',
    contentClass = '',
    children,
  } = $props()

  const accordion = getContext('accordion_context')
  const isOpen = $derived(accordion ? accordion.isItemOpen(id) : false)

  function handleToggle() {
    if (!disabled && accordion) {
      accordion.toggleItem(id)
    }
  }
</script>

<div class={cn('transition-colors', className)}>
  <button
    type="button"
    disabled={disabled}
    onclick={handleToggle}
    aria-expanded={isOpen}
    class={cn(
      'flex w-full items-center justify-between py-3.5 px-4 font-sans text-sm sm:text-base font-semibold text-zinc-900 dark:text-zinc-100 transition-colors outline-none',
      'hover:bg-zinc-50 dark:hover:bg-zinc-800/50',
      'focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500',
      disabled && 'opacity-50 cursor-not-allowed',
      headerClass
    )}
  >
    <span class="text-right truncate">{title}</span>
    <!-- RTL-aware Chevron Icon -->
    <svg
      class={cn(
        'size-4.5 shrink-0 text-zinc-400 dark:text-zinc-500 transition-transform duration-200 ease-out',
        isOpen ? 'rotate-180 text-primary-600 dark:text-primary-400' : 'rotate-0'
      )}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      stroke-width="2"
      aria-hidden="true"
    >
      <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  </button>

  <!-- Modern CSS Grid transition (0fr -> 1fr) -->
  <div
    class={cn(
      'grid transition-[grid-template-rows] duration-200 ease-out',
      isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
    )}
    role="region"
    aria-label={title}
  >
    <div class="overflow-hidden">
      <div class={cn('px-4 pb-4 pt-1 font-sans text-sm leading-relaxed text-zinc-600 dark:text-zinc-400', contentClass)}>
        {@render children?.()}
      </div>
    </div>
  </div>
</div>
