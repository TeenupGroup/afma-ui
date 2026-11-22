<script>
  import { cn, debounce } from '../../lib/utils.js'
  import Input from './Input.svelte'
  import { Search, X, Loader2 } from 'lucide-svelte'

  let {
    value = $bindable(''),
    placeholder = 'جستجو...',
    debounceMs = 300,
    disabled = false,
    loading = false,
    size = 'md',
    onchange = undefined,
    onsearch = undefined,
    onclear = undefined,
    class: className = '',
    inputClass = '',
    ...rest
  } = $props()

  const debouncedChange = debounce((val) => {
    onchange?.(val)
    onsearch?.(val)
  }, debounceMs)

  function handleInput(event) {
    value = event.target.value
    debouncedChange(value)
  }

  function handleClear() {
    value = ''
    onclear?.()
    onchange?.('')
    onsearch?.('')
  }

  function handleKeydown(event) {
    if (event.key === 'Enter') {
      event.preventDefault()
      onsearch?.(value)
    }
  }
</script>

{#snippet startIconComp()}
  {#if loading}
    <Loader2 class="w-4 h-4 text-slate-400 animate-spin" />
  {:else}
    <Search class="w-4 h-4 text-slate-400" />
  {/if}
{/snippet}

{#snippet endIconComp()}
  {#if value && !disabled}
    <button
      type="button"
      onclick={handleClear}
      class="cursor-pointer text-slate-400 hover:text-slate-600 transition-colors p-0.5 rounded-md hover:bg-slate-200/60"
      aria-label="پاک کردن جستجو"
    >
      <X class="w-3.5 h-3.5" />
    </button>
  {/if}
{/snippet}

<Input
  class={cn('w-full', className)}
  {inputClass}
  type="text"
  {placeholder}
  {disabled}
  {size}
  bind:value
  oninput={handleInput}
  onkeydown={handleKeydown}
  startIcon={startIconComp}
  endIcon={endIconComp}
  {...rest}
/>
