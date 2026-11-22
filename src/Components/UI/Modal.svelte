<script module>
  const openModalStack = []
</script>

<script>
  import { tick } from 'svelte'
  import { X } from 'lucide-svelte'

  let {
    open = $bindable(false),
    isOpen = undefined,
    title = '',
    description = '',
    size = 'md', // 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full'
    variant = 'drawer', // 'drawer' | 'dialog' | 'modal'
    position = 'left', // 'left' | 'right'
    closeOnBackdrop = true,
    closeOnEscape = true,
    ariaLabel = '',
    onclose = undefined,
    onClose = undefined,
    header = undefined,
    footer = undefined,
    class: className = '',
    children = undefined,
    ...rest
  } = $props()

  const modalId = `modal-${Math.random().toString(36).slice(2, 9)}`
  const modalTitleId = `${modalId}-title`
  const modalDescId = `${modalId}-desc`

  let dialogEl = $state(null)

  const isModalOpen = $derived(isOpen !== undefined ? Boolean(isOpen) : Boolean(open))
  const isDrawer = $derived(variant === 'drawer')
  const hasVisibleTitleHeading = $derived(Boolean(title) && !header)

  const dialogSizes = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl',
    '2xl': 'max-w-6xl',
    '3xl': 'max-w-7xl',
    full: 'max-w-[95vw]',
  }

  const drawerSizes = {
    sm: 'max-w-full sm:max-w-md',
    md: 'max-w-full sm:max-w-lg md:max-w-xl',
    lg: 'max-w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl',
    xl: 'max-w-full sm:max-w-2xl md:max-w-4xl lg:max-w-5xl',
    '2xl': 'max-w-full sm:max-w-3xl md:max-w-5xl lg:max-w-6xl',
    '3xl': 'max-w-full sm:max-w-4xl md:max-w-6xl lg:max-w-7xl',
    full: 'max-w-full sm:max-w-[95vw]',
  }

  const FOCUSABLE_SELECTOR = [
    'a[href]',
    'button:not(:disabled)',
    'input:not(:disabled):not([type="hidden"])',
    'select:not(:disabled)',
    'textarea:not(:disabled)',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ')

  function getFocusableElements(container) {
    if (!container) return []
    return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
      (el) =>
        !el.hasAttribute('disabled') &&
        el.getAttribute('aria-hidden') !== 'true' &&
        (el.offsetParent !== null || el === document.activeElement)
    )
  }

  function handleClose() {
    open = false
    onclose?.()
    onClose?.()
  }

  function handleBackdropClick(e) {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      handleClose()
    }
  }

  function handleKeydown(e) {
    if (!isModalOpen || openModalStack[openModalStack.length - 1] !== modalId) {
      return
    }

    if (closeOnEscape && e.key === 'Escape') {
      e.preventDefault()
      e.stopImmediatePropagation?.()
      handleClose()
      return
    }

    if (e.key === 'Tab' && dialogEl) {
      const focusables = getFocusableElements(dialogEl)
      if (focusables.length === 0) {
        e.preventDefault()
        dialogEl.focus()
        return
      }

      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      const active = document.activeElement

      if (e.shiftKey) {
        if (active === first || !dialogEl.contains(active)) {
          e.preventDefault()
          last.focus()
        }
      } else if (active === last || !dialogEl.contains(active)) {
        e.preventDefault()
        first.focus()
      }
    }
  }

  $effect(() => {
    if (isModalOpen) {
      const previouslyFocused =
        typeof document !== 'undefined' && document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null

      openModalStack.push(modalId)
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'

      tick().then(() => {
        if (!dialogEl) return
        const autoTarget = dialogEl.querySelector('[autofocus]')
        if (autoTarget instanceof HTMLElement) {
          autoTarget.focus()
        } else {
          dialogEl.focus()
        }
      })

      return () => {
        const idx = openModalStack.lastIndexOf(modalId)
        if (idx !== -1) openModalStack.splice(idx, 1)
        if (openModalStack.length === 0) {
          document.body.style.overflow = originalOverflow
        }
        if (previouslyFocused && document.contains(previouslyFocused)) {
          requestAnimationFrame(() => {
            previouslyFocused.focus()
          })
        }
      }
    }
  })
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isModalOpen}
  {#if isDrawer}
    <!-- Drawer Container -->
    <div
      class="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fade-in"
      onclick={handleBackdropClick}
      role="presentation"
    >
      <div
        bind:this={dialogEl}
        class="fixed inset-y-0 {position === 'left' ? 'left-0 border-r drawer-animate-left' : 'right-0 border-l drawer-animate-right'} z-50 h-full bg-white shadow-2xl border-slate-200/80 {drawerSizes[size] || drawerSizes.md} w-full flex flex-col overflow-hidden text-right outline-hidden {className}"
        dir="rtl"
        onclick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={hasVisibleTitleHeading ? modalTitleId : undefined}
        aria-label={!hasVisibleTitleHeading ? (ariaLabel || title || 'پنجره گفتگو') : undefined}
        aria-describedby={description && !header ? modalDescId : undefined}
        tabindex="-1"
        {...rest}
      >
        <!-- Header -->
        {#if header || title || description}
          <div class="flex items-start justify-between px-6 py-4.5 border-b border-slate-100 bg-slate-50/70 shrink-0">
            <div class="space-y-0.5 pr-1">
              {#if header}
                {@render header()}
              {:else}
                {#if title}
                  <h2 id={modalTitleId} class="text-base sm:text-lg font-black text-slate-800">{title}</h2>
                {/if}
                {#if description}
                  <p id={modalDescId} class="text-xs text-slate-400 mt-0.5">{description}</p>
                {/if}
              {/if}
            </div>
            <button
              type="button"
              onclick={handleClose}
              class="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors shrink-0 mr-auto cursor-pointer"
              aria-label="بستن پنجره"
            >
              <X class="w-5 h-5" />
            </button>
          </div>
        {:else}
          <div class="relative shrink-0">
            <button
              type="button"
              onclick={handleClose}
              class="absolute top-4 left-4 z-10 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
              aria-label="بستن پنجره"
            >
              <X class="w-5 h-5" />
            </button>
          </div>
        {/if}

        <!-- Body -->
        <div class="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {#if children}
            {@render children()}
          {/if}
        </div>

        <!-- Footer -->
        {#if footer}
          <div class="px-6 py-4 border-t border-slate-100 bg-slate-50/80 backdrop-blur-xs flex items-center justify-end gap-3 shrink-0">
            {@render footer()}
          </div>
        {/if}
      </div>
    </div>
  {:else}
    <!-- Centered Dialog Container -->
    <div
      class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fade-in"
      onclick={handleBackdropClick}
      role="presentation"
    >
      <div
        bind:this={dialogEl}
        class="bg-white rounded-3xl shadow-2xl border border-slate-200/80 {dialogSizes[size] || dialogSizes.md} w-full max-h-[92vh] flex flex-col overflow-hidden text-right outline-hidden {className}"
        dir="rtl"
        onclick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={hasVisibleTitleHeading ? modalTitleId : undefined}
        aria-label={!hasVisibleTitleHeading ? (ariaLabel || title || 'پنجره گفتگو') : undefined}
        aria-describedby={description && !header ? modalDescId : undefined}
        tabindex="-1"
        {...rest}
      >
        <!-- Header -->
        {#if header || title || description}
          <div class="flex items-start justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
            <div class="space-y-0.5 pr-1">
              {#if header}
                {@render header()}
              {:else}
                {#if title}
                  <h2 id={modalTitleId} class="text-base sm:text-lg font-black text-slate-800">{title}</h2>
                {/if}
                {#if description}
                  <p id={modalDescId} class="text-xs text-slate-400 mt-0.5">{description}</p>
                {/if}
              {/if}
            </div>
            <button
              type="button"
              onclick={handleClose}
              class="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0 mr-auto cursor-pointer"
              aria-label="بستن پنجره"
            >
              <X class="w-5 h-5" />
            </button>
          </div>
        {:else}
          <div class="relative shrink-0">
            <button
              type="button"
              onclick={handleClose}
              class="absolute top-4 left-4 z-10 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="بستن پنجره"
            >
              <X class="w-5 h-5" />
            </button>
          </div>
        {/if}

        <!-- Body -->
        <div class="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {#if children}
            {@render children()}
          {/if}
        </div>

        <!-- Footer -->
        {#if footer}
          <div class="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3 shrink-0">
            {@render footer()}
          </div>
        {/if}
      </div>
    </div>
  {/if}
{/if}

<style>
  @keyframes drawer-slide-left {
    from {
      transform: translateX(-100%);
      opacity: 0.8;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes drawer-slide-right {
    from {
      transform: translateX(100%);
      opacity: 0.8;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  .drawer-animate-left {
    animation: drawer-slide-left 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  .drawer-animate-right {
    animation: drawer-slide-right 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
</style>
