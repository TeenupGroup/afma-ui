<script>
  import { cn, toPersianDigits } from '../../lib/utils.js'

  /**
   * Responsive Navigation Tabs component conforming to AGENTS.md strict rules:
   * 1. No horizontal scrollable rows (`overflow-x-auto whitespace-nowrap`).
   * 2. Multiple rows/columns via `flex flex-wrap` or responsive `grid`.
   * 3. Persian numerals strictly used for counts and badges.
   * 4. Accessible RTL arrow-key navigation (`ArrowLeft` next, `ArrowRight` previous, `Home`/`End`).
   */
  let {
    tabs = [],
    active = $bindable(),
    variant = 'pills', // 'pills' | 'underline' | 'cards'
    layout = 'wrap', // 'wrap' | 'grid'
    size = 'md', // 'sm' | 'md' | 'lg'
    onchange = undefined,
    class: className = '',
    tabClass = '',
    ...rest
  } = $props()

  let tabRefs = $state([])

  const normalizedTabs = $derived(
    tabs.map((tab) => {
      if (typeof tab === 'string') {
        return { id: tab, label: tab }
      }
      return tab
    })
  )

  const firstEnabledId = $derived(normalizedTabs.find((t) => !t.disabled)?.id)

  function selectTab(id, disabled) {
    if (disabled) return
    active = id
    onchange?.(id)
  }

  function handleTabKeydown(e, currentIndex) {
    const enabledIndices = normalizedTabs
      .map((t, idx) => (!t.disabled ? idx : -1))
      .filter((idx) => idx !== -1)

    if (enabledIndices.length === 0) return

    const posInEnabled = enabledIndices.indexOf(currentIndex)
    let nextEnabledPos = -1

    // In RTL horizontal tablist: ArrowLeft moves to next tab, ArrowRight moves to previous tab
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      nextEnabledPos = posInEnabled === -1 ? 0 : (posInEnabled + 1) % enabledIndices.length
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      nextEnabledPos =
        posInEnabled === -1
          ? enabledIndices.length - 1
          : (posInEnabled - 1 + enabledIndices.length) % enabledIndices.length
    } else if (e.key === 'Home') {
      e.preventDefault()
      nextEnabledPos = 0
    } else if (e.key === 'End') {
      e.preventDefault()
      nextEnabledPos = enabledIndices.length - 1
    }

    if (nextEnabledPos !== -1) {
      const targetIndex = enabledIndices[nextEnabledPos]
      const targetTab = normalizedTabs[targetIndex]
      if (targetTab) {
        selectTab(targetTab.id, targetTab.disabled)
        tabRefs[targetIndex]?.focus()
      }
    }
  }

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs rounded-xl gap-1.5',
    md: 'px-4 py-2 text-xs sm:text-sm rounded-xl gap-2',
    lg: 'px-5 py-2.5 text-sm sm:text-base rounded-2xl gap-2.5',
  }

  const badgeSizeStyles = {
    sm: 'text-[10px] px-1.5 py-0.5',
    md: 'text-xs px-2 py-0.5',
    lg: 'text-xs px-2.5 py-1',
  }
</script>

<div
  role="tablist"
  aria-orientation="horizontal"
  dir="rtl"
  class={cn(
    layout === 'grid'
      ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 w-full'
      : 'flex flex-wrap gap-2 items-center',
    className
  )}
  {...rest}
>
  {#each normalizedTabs as tab, i (tab.id)}
    {@const isSelected = active === tab.id}
    {@const isDisabled = Boolean(tab.disabled)}
    {@const isTabStop = isSelected || (!normalizedTabs.some((t) => t.id === active && !t.disabled) && tab.id === firstEnabledId)}
    {@const IconComp = tab.icon}
    {@const isIconComponent = typeof IconComp === 'function' && Boolean(IconComp.prototype)}

    <button
      bind:this={tabRefs[i]}
      type="button"
      role="tab"
      aria-selected={isSelected}
      aria-disabled={isDisabled || undefined}
      tabindex={isDisabled ? -1 : isTabStop ? 0 : -1}
      disabled={isDisabled}
      data-testid={tab['data-testid'] || tab.testid}
      onclick={() => selectTab(tab.id, isDisabled)}
      onkeydown={(e) => handleTabKeydown(e, i)}
      class={cn(
        'font-bold transition-all duration-200 select-none cursor-pointer flex items-center justify-center outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500',
        sizeStyles[size] || sizeStyles.md,
        isDisabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        // Variants:
        variant === 'pills' && [
          isSelected
            ? 'bg-indigo-600 text-white shadow-xs'
            : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs',
        ],
        variant === 'cards' && [
          isSelected
            ? 'bg-slate-900 text-white shadow-xs'
            : 'bg-slate-100 hover:bg-slate-200 text-slate-700',
        ],
        variant === 'underline' && [
          'rounded-none border-b-2 bg-transparent',
          isSelected
            ? 'border-indigo-600 text-indigo-700'
            : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300',
        ],
        tabClass
      )}
    >
      {#if IconComp}
        <span class="shrink-0" aria-hidden="true">
          {#if isIconComponent}
            <IconComp class={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
          {:else}
            {@render IconComp()}
          {/if}
        </span>
      {/if}

      <span>{tab.label}</span>

      {#if tab.count !== undefined && tab.count !== null}
        <span
          class={cn(
            'rounded-full font-bold transition-colors shrink-0',
            badgeSizeStyles[size] || badgeSizeStyles.md,
            isSelected
              ? 'bg-white/20 text-white'
              : 'bg-slate-200/80 text-slate-700'
          )}
        >
          {toPersianDigits(tab.count)}
        </span>
      {/if}
    </button>
  {/each}
</div>
