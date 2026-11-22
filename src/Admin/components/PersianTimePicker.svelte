<script>
  import { cn, toPersianDigits } from '../../lib/utils.js'
  import { Button } from '../../Components/UI/index.js'
  import { ChevronLeft, Clock, X } from 'lucide-svelte'

  /**
   * Persian time picker — same API spirit as JalaliDatePicker.
   * Binds `stringValue` as "HH:MM" (English digits) for server submission,
   * displays everything in Persian digits.
   */
  let {
    stringValue = $bindable(''),
    placeholder = 'ساعت را انتخاب کنید',
    disabled = false,
    clearable = true,
    minuteStep = 5,
    class: className = '',
  } = $props()

  let isOpen = $state(false)
  let wrapperEl = $state(null)

  let hour = $derived.by(() => {
    const m = /^(\d{1,2}):(\d{1,2})/.exec(stringValue || '')
    return m ? parseInt(m[1], 10) : null
  })
  let minute = $derived.by(() => {
    const m = /^(\d{1,2}):(\d{1,2})/.exec(stringValue || '')
    return m ? parseInt(m[2], 10) : null
  })

  const hours = Array.from({ length: 24 }, (_, i) => i)

  // Minute buttons on the step grid; include an off-grid selected minute so it stays visible
  let minutes = $derived.by(() => {
    const list = []
    for (let m = 0; m < 60; m += minuteStep) list.push(m)
    if (minute !== null && !list.includes(minute)) {
      list.push(minute)
      list.sort((a, b) => a - b)
    }
    return list
  })

  const fa = (n) => toPersianDigits(String(n).padStart(2, '0'))

  function setHour(h) {
    const mm = minute ?? 0
    stringValue = `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
  }

  function setMinute(m) {
    const hh = hour ?? 0
    stringValue = `${String(hh).padStart(2, '0')}:${String(m).padStart(2, '0')}`
    isOpen = false
  }

  function clear() {
    stringValue = ''
  }

  // Close on outside click / Escape
  $effect(() => {
    if (!isOpen) return
    function onDocClick(e) {
      if (wrapperEl && !wrapperEl.contains(e.target)) isOpen = false
    }
    function onKey(e) {
      if (e.key === 'Escape') isOpen = false
    }
    document.addEventListener('click', onDocClick, true)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('click', onDocClick, true)
      document.removeEventListener('keydown', onKey)
    }
  })
</script>

<div bind:this={wrapperEl} class={cn('relative', className)} dir="rtl">
  <!-- Trigger -->
  <div
    class={cn(
      'w-full flex items-center justify-between gap-2 px-3 py-2 text-sm border rounded-xl transition-all',
      'bg-white hover:border-gray-400 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500',
      disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : '',
      isOpen ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-300'
    )}
  >
    <button
      type="button"
      {disabled}
      onclick={() => isOpen = !isOpen}
      class="flex items-center gap-2 flex-1 text-right focus:outline-none cursor-pointer disabled:cursor-not-allowed"
      aria-haspopup="dialog"
      aria-expanded={isOpen}
    >
      <Clock class="w-4 h-4 text-gray-400 shrink-0" />
      {#if hour !== null}
        <span class="text-gray-800" dir="ltr">{fa(hour)}:{fa(minute ?? 0)}</span>
      {:else}
        <span class="text-gray-400">{placeholder}</span>
      {/if}
    </button>
    <div class="flex items-center gap-1 shrink-0">
      {#if clearable && hour !== null}
        <Button
          type="button"
          variant="ghost"
          size="xs"
          class="p-1 text-gray-400 hover:text-gray-600"
          title="پاک کردن"
          aria-label="پاک کردن"
          onclick={(e) => { e.stopPropagation(); clear() }}
        >
          <X class="w-3.5 h-3.5" />
        </Button>
      {/if}
      <Button
        type="button"
        variant="ghost"
        size="xs"
        class="p-1 text-gray-400 hover:text-gray-600"
        aria-label="باز کردن زمان"
        onclick={() => isOpen = !isOpen}
      >
        <ChevronLeft class="w-4 h-4" />
      </Button>
    </div>
  </div>

  <!-- Dropdown -->
  {#if isOpen}
    <div
      class="absolute z-50 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 p-4 w-72"
      role="dialog"
      aria-label="انتخاب ساعت"
    >
      <div class="flex gap-4">
        <!-- Hours -->
        <div class="flex-1">
          <p class="text-xs font-medium text-gray-500 text-center mb-2">ساعت</p>
          <div class="grid grid-cols-4 gap-1 max-h-44 overflow-y-auto pl-1">
            {#each hours as h}
              <button
                type="button"
                onclick={() => setHour(h)}
                class={cn(
                  'h-8 flex items-center justify-center text-xs rounded-lg transition-all',
                  hour === h ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                )}
              >{fa(h)}</button>
            {/each}
          </div>
        </div>

        <div class="w-px bg-gray-100 shrink-0"></div>

        <!-- Minutes -->
        <div class="flex-1">
          <p class="text-xs font-medium text-gray-500 text-center mb-2">دقیقه</p>
          <div class="grid grid-cols-3 gap-1 max-h-44 overflow-y-auto pl-1">
            {#each minutes as m}
              <button
                type="button"
                onclick={() => setMinute(m)}
                class={cn(
                  'h-8 flex items-center justify-center text-xs rounded-lg transition-all',
                  minute === m ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                )}
              >{fa(m)}</button>
            {/each}
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>
