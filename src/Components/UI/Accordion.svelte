<script>
  import { setContext } from 'svelte'
  import { cn } from '../../lib/utils.js'

  let {
    multiple = false,
    value = $bindable(multiple ? [] : null),
    class: className = '',
    children,
  } = $props()

  function toggleItem(id) {
    if (multiple) {
      const currentList = Array.isArray(value) ? [...value] : []
      if (currentList.includes(id)) {
        value = currentList.filter((item) => item !== id)
      } else {
        value = [...currentList, id]
      }
    } else {
      value = value === id ? null : id
    }
  }

  function isItemOpen(id) {
    if (multiple) {
      return Array.isArray(value) && value.includes(id)
    }
    return value === id
  }

  setContext('accordion_context', {
    toggleItem,
    isItemOpen,
  })
</script>

<div class={cn('w-full divide-y divide-zinc-200 dark:divide-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm', className)} dir="rtl">
  {@render children?.()}
</div>
