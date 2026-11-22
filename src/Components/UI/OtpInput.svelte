<script>
  import { onMount, untrack } from 'svelte'
  import { toEnglishDigits, toPersianDigits, cn } from '../../lib/utils.js'

  let {
    length = 6,
    value = $bindable(''),
    error = null,
    disabled = false,
    autofocus = false,
    oncomplete = null,
    onchange = null,
    theme = 'auto',
    id = undefined,
    class: className = '',
  } = $props()

  let inputRefs = $state([])
  let digits = $state(untrack(() => {
    const initial = toEnglishDigits(value || '').replace(/\D/g, '')
    return Array.from({ length }, (_, index) => initial[index] || '')
  }))

  // Synchronize internal digits with external bound value
  $effect(() => {
    const clean = toEnglishDigits(value || '').replace(/\D/g, '').slice(0, length)
    const newDigits = Array.from({ length }, (_, i) => clean[i] || '')
    // Only update if different to avoid cursor jumps
    if (newDigits.length !== digits.length || newDigits.join('') !== digits.join('')) {
      digits = newDigits
    }
  })

  function notifyChange(newDigits) {
    const rawVal = newDigits.join('')
    value = rawVal
    if (onchange) {
      onchange(rawVal)
    }
    if (rawVal.length === length && oncomplete) {
      oncomplete(rawVal)
    }
  }

  function handleInput(e, index) {
    if (disabled) return
    const inputVal = e.target.value
    const cleaned = toEnglishDigits(inputVal).replace(/\D/g, '')

    if (!cleaned) {
      digits[index] = ''
      notifyChange(digits)
      return
    }

    // Handle single character typed
    if (cleaned.length === 1) {
      digits[index] = cleaned
      notifyChange(digits)

      if (index < length - 1) {
        inputRefs[index + 1]?.focus()
      }
      return
    }

    // If browser auto-filled or user typed multiple chars
    handlePastedCode(cleaned, index)
  }

  function handleKeyDown(e, index) {
    if (disabled) return

    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        e.preventDefault()
        digits[index - 1] = ''
        notifyChange(digits)
        inputRefs[index - 1]?.focus()
      } else {
        digits[index] = ''
        notifyChange(digits)
      }
      return
    }

    if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault()
      inputRefs[index - 1]?.focus()
      return
    }

    if (e.key === 'ArrowRight' && index < length - 1) {
      e.preventDefault()
      inputRefs[index + 1]?.focus()
      return
    }
  }

  function handlePaste(e, startIndex) {
    e.preventDefault()
    if (disabled) return
    const pasted = e.clipboardData?.getData('text') || ''
    const cleaned = toEnglishDigits(pasted).replace(/\D/g, '')
    if (cleaned) {
      handlePastedCode(cleaned, startIndex)
    }
  }

  function handlePastedCode(rawString, startIndex) {
    const chars = rawString.split('')
    const updated = [...digits]
    let targetIndex = startIndex

    for (let i = 0; i < chars.length && targetIndex < length; i++) {
      updated[targetIndex] = chars[i]
      targetIndex++
    }

    digits = updated
    notifyChange(digits)

    const nextFocusIndex = Math.min(targetIndex, length - 1)
    inputRefs[nextFocusIndex]?.focus()
  }

  onMount(() => {
    if (autofocus && !disabled && inputRefs[0]) {
      inputRefs[0].focus()
    }
  })
</script>

<div class={cn('flex flex-col items-center gap-2', className)}>
  <div
    class="grid w-full max-w-sm gap-1.5 sm:gap-3"
    style={`grid-template-columns: repeat(${length}, minmax(0, 1fr)); max-width: ${length * 3 + (length - 1) * 0.75}rem`}
    dir="ltr"
    role="group"
    aria-label="کد تایید پیامکی"
  >
    {#each Array.from({ length }) as _, i}
      <div class="relative">
        <input
          id={id ? (i === 0 ? id : `${id}-${i}`) : undefined}
          bind:this={inputRefs[i]}
          type="text"
          inputmode="numeric"
          pattern="[0-9]*"
          maxlength="1"
          autocomplete={i === 0 ? 'one-time-code' : 'off'}
          disabled={disabled}
          value={toPersianDigits(digits[i])}
          oninput={(e) => handleInput(e, i)}
          onkeydown={(e) => handleKeyDown(e, i)}
          onpaste={(e) => handlePaste(e, i)}
          onfocus={(e) => e.target.select()}
          aria-label={`رقم ${toPersianDigits(i + 1)}`}
          aria-invalid={!!error}
          class={cn(
            'aspect-square w-full min-w-0 rounded-xl text-center font-sans text-xl sm:text-2xl font-bold transition-all duration-200 outline-none motion-reduce:transition-none',
            'border bg-white shadow-sm text-zinc-900 select-none',
            theme === 'auto' && 'dark:bg-zinc-900 dark:text-zinc-100',
            'focus:ring-2 focus:ring-offset-1 focus:ring-emerald-500 focus:border-emerald-500',
            error
              ? 'border-rose-400 focus:ring-rose-500 text-rose-600'
              : 'border-zinc-300 hover:border-zinc-400',
            theme === 'auto' && (error ? 'dark:border-rose-600' : 'dark:border-zinc-700 dark:hover:border-zinc-600'),
            disabled && 'opacity-50 cursor-not-allowed',
            disabled && theme === 'auto' && 'bg-zinc-100 dark:bg-zinc-800',
            digits[i] && !error && 'border-emerald-500',
            digits[i] && !error && theme === 'auto' && 'dark:border-primary-400 dark:bg-primary-950/20'
          )}
        />
      </div>
    {/each}
  </div>

  {#if error}
    <p class={cn('font-sans text-xs text-rose-600 text-center', theme === 'auto' && 'dark:text-rose-400')} role="alert">
      {error}
    </p>
  {/if}
</div>
