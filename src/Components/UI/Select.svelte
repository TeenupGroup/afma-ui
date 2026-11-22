<script>
  import { ChevronDown } from 'lucide-svelte'

  let {
    value = $bindable(),
    options = [],
    name = undefined,
    id = undefined,
    label = '',
    description = '',
    error = '',
    placeholder = '',
    required = false,
    disabled = false,
    size = 'md', // 'sm' | 'md' | 'lg'
    class: className = '',
    selectClass = '',
    onchange = undefined,
    children = undefined,
    ...rest
  } = $props()

  const selectId = $derived(id || (name ? `select-${name}` : undefined))

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs rounded-xl',
    md: 'px-3.5 py-2 text-xs sm:text-sm rounded-xl',
    lg: 'px-4 py-2.5 text-sm sm:text-base rounded-2xl',
  }
</script>

<div class="space-y-1.5 text-right {className}" dir="rtl">
  {#if label}
    <label for={selectId} class="block text-xs font-bold text-slate-700">
      {label}
      {#if required}
        <span class="text-rose-500 mr-0.5">*</span>
      {/if}
    </label>
  {/if}

  <div class="relative flex items-center">
    <select
      {name}
      id={selectId}
      bind:value
      {required}
      {disabled}
      {onchange}
      class="w-full bg-slate-50 border transition-all outline-hidden text-slate-800 appearance-none pl-9 {sizeStyles[size] || sizeStyles.md} {error ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20' : 'border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20'} {disabled ? 'opacity-50 cursor-not-allowed bg-slate-100' : ''} {selectClass}"
      {...rest}
    >
      {#if placeholder}
        <option value="" disabled>{placeholder}</option>
      {/if}

      {#if children}
        {@render children()}
      {:else}
        {#each options as opt}
          {#if typeof opt === 'object' && opt !== null}
            <option value={opt.value}>{opt.label ?? opt.name ?? opt.value}</option>
          {:else}
            <option value={opt}>{opt}</option>
          {/if}
        {/each}
      {/if}
    </select>

    <div class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
      <ChevronDown class="w-4 h-4" />
    </div>
  </div>

  {#if description && !error}
    <p class="text-[11px] text-slate-400 leading-tight">{description}</p>
  {/if}

  {#if error}
    <p class="text-xs text-rose-500 font-bold">{error}</p>
  {/if}
</div>
