<script module>
  // Module-level tracking so remounting ToastHost across visits does not re-fire previous flash messages
  let lastFlashSuccess = null
  let lastFlashError = null
  let lastFlashWarning = null
  let lastFlashInfo = null
</script>

<script>
  import { onMount } from 'svelte'
  import { router, usePage } from '@inertiajs/svelte'
  import { getToastsState, dismissToast, toast, triggerUndo } from '../../lib/toast.svelte.js'
  import Toast from './Toast.svelte'
  import { cn } from '../../lib/utils.js'

  let {
    position = 'top-left', // 'top-left' | 'top-right' | 'top-center' | 'bottom-left' | 'bottom-right'
    class: className = '',
  } = $props()

  const page = usePage()
  const toasts = $derived(getToastsState())
  let visitTick = $state(0)

  onMount(() => {
    const offStart = router.on('start', () => {
      lastFlashSuccess = null
      lastFlashError = null
      lastFlashWarning = null
      lastFlashInfo = null
    })
    const offFinish = router.on('finish', () => {
      visitTick++
    })

    return () => {
      offStart()
      offFinish()
    }
  })

  $effect(() => {
    void visitTick
    const flash = page?.props?.flash
    const successMsg = flash?.success || page?.props?.success || null
    const errors = page?.props?.errors
    const firstError = errors && typeof errors === 'object' ? Object.values(errors)[0] : null
    const errorMsg = flash?.error || page?.props?.error || (typeof firstError === 'string' ? firstError : null)
    const warningMsg = flash?.warning || null
    const infoMsg = flash?.info || null

    if (!successMsg) {
      lastFlashSuccess = null
    } else if (successMsg !== lastFlashSuccess) {
      lastFlashSuccess = successMsg
      toast.success(successMsg, { replaceDuplicate: true })
    }

    if (!errorMsg) {
      lastFlashError = null
    } else if (errorMsg !== lastFlashError) {
      lastFlashError = errorMsg
      toast.error(errorMsg, { replaceDuplicate: true })
    }

    if (!warningMsg) {
      lastFlashWarning = null
    } else if (warningMsg !== lastFlashWarning) {
      lastFlashWarning = warningMsg
      toast.warning(warningMsg, { replaceDuplicate: true })
    }

    if (!infoMsg) {
      lastFlashInfo = null
    } else if (infoMsg !== lastFlashInfo) {
      lastFlashInfo = infoMsg
      toast.info(infoMsg, { replaceDuplicate: true })
    }
  })

  const positionStyles = {
    'top-left': 'top-4 left-4 items-start',
    'top-right': 'top-4 right-4 items-end',
    'top-center': 'top-4 left-1/2 -translate-x-1/2 items-center',
    'bottom-left': 'bottom-4 left-4 items-start',
    'bottom-right': 'bottom-4 right-4 items-end',
  }
</script>

{#if toasts.length > 0}
  <aside
    class={cn(
      'fixed z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none print:hidden px-3 sm:px-0',
      positionStyles[position] || positionStyles['top-left'],
      className
    )}
    aria-label="اعلان‌ها"
  >
    {#each toasts as item (item.id)}
      <div class="w-full pointer-events-auto">
        <Toast
          type={item.type}
          title={item.title}
          message={item.message}
          duration={item.duration}
          dismissible={item.dismissible}
          onundo={() => triggerUndo(item.id)}
          onclose={() => dismissToast(item.id, { runConfirm: true })}
        />
      </div>
    {/each}
  </aside>
{/if}
