<script>
  let {
    checked = $bindable(),
    disabled = false,
    size = 'md', // 'xs' | 'sm' | 'md' | 'lg'
    color = 'indigo', // 'indigo' | 'amber' | 'emerald' | 'rose' | 'blue' | 'purple' | 'sky' | 'green' | 'slate'
    label = '',
    description = '',
    labelClass = '',
    descriptionClass = '',
    layout = 'inline', // 'inline' | 'row'
    name = undefined,
    id = undefined,
    onchange = undefined,
    class: className = '',
    children = undefined,
    ...rest
  } = $props()

  const colorStyles = {
    indigo: {
      active: 'bg-indigo-600',
      ring: 'peer-focus-visible:ring-indigo-500',
    },
    primary: {
      active: 'bg-indigo-600',
      ring: 'peer-focus-visible:ring-indigo-500',
    },
    amber: {
      active: 'bg-amber-600',
      ring: 'peer-focus-visible:ring-amber-500',
    },
    emerald: {
      active: 'bg-emerald-600',
      ring: 'peer-focus-visible:ring-emerald-500',
    },
    green: {
      active: 'bg-emerald-600',
      ring: 'peer-focus-visible:ring-emerald-500',
    },
    rose: {
      active: 'bg-rose-600',
      ring: 'peer-focus-visible:ring-rose-500',
    },
    blue: {
      active: 'bg-blue-600',
      ring: 'peer-focus-visible:ring-blue-500',
    },
    purple: {
      active: 'bg-purple-600',
      ring: 'peer-focus-visible:ring-purple-500',
    },
    sky: {
      active: 'bg-sky-500',
      ring: 'peer-focus-visible:ring-sky-400',
    },
    slate: {
      active: 'bg-slate-700',
      ring: 'peer-focus-visible:ring-slate-500',
    },
  }

  const sizes = {
    xs: {
      track: 'w-7 h-4 p-0.5',
      thumb: 'w-3 h-3',
    },
    sm: {
      track: 'w-9 h-5 p-0.5',
      thumb: 'w-4 h-4',
    },
    md: {
      track: 'w-11 h-6 p-0.5',
      thumb: 'w-5 h-5',
    },
    lg: {
      track: 'w-14 h-8 p-1',
      thumb: 'w-6 h-6',
    },
  }

  const selectedColor = $derived(colorStyles[color] || colorStyles.indigo)
  const selectedSize = $derived(sizes[size] || sizes.md)

  function handleChange(e) {
    if (disabled) return
    const newChecked = e.target.checked
    checked = newChecked
    onchange?.(newChecked)
  }
</script>

{#snippet switchPill()}
  <span
    class="relative inline-flex shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 {selectedColor.ring} {checked ? selectedColor.active : 'bg-slate-200'} {selectedSize.track} {disabled ? 'opacity-50' : ''}"
  >
    <span
      aria-hidden="true"
      class="pointer-events-none inline-block rounded-full bg-white shadow-xs ring-0 transition-transform duration-200 ease-in-out {selectedSize.thumb} {checked ? 'ltr:translate-x-full rtl:-translate-x-full' : 'translate-x-0'}"
    ></span>
  </span>
{/snippet}

{#if layout === 'row'}
  <label
    class="flex items-center justify-between gap-4 cursor-pointer select-none {disabled ? 'opacity-50 cursor-not-allowed' : ''} {className}"
    {...rest}
  >
    <input
      type="checkbox"
      bind:checked
      {disabled}
      {name}
      {id}
      onchange={handleChange}
      class="sr-only peer"
    />
    <div class="space-y-0.5">
      {#if label}
        <span class="block font-bold text-slate-800 text-sm {labelClass}">{label}</span>
      {/if}
      {#if description}
        <p class="text-xs text-slate-500 leading-relaxed {descriptionClass}">{description}</p>
      {/if}
      {#if children}
        {@render children()}
      {/if}
    </div>
    {@render switchPill()}
  </label>
{:else if label || description || children}
  <label
    class="inline-flex items-center gap-3 cursor-pointer select-none {disabled ? 'opacity-50 cursor-not-allowed' : ''} {className}"
    {...rest}
  >
    <input
      type="checkbox"
      bind:checked
      {disabled}
      {name}
      {id}
      onchange={handleChange}
      class="sr-only peer"
    />
    {@render switchPill()}
    <div class="space-y-0.5">
      {#if label}
        <span class="block font-bold text-slate-700 text-xs {labelClass}">{label}</span>
      {/if}
      {#if description}
        <p class="text-[11px] text-slate-400 {descriptionClass}">{description}</p>
      {/if}
      {#if children}
        {@render children()}
      {/if}
    </div>
  </label>
{:else}
  <label
    class="relative inline-flex items-center cursor-pointer select-none {disabled ? 'opacity-50 cursor-not-allowed' : ''} {className}"
    {...rest}
  >
    <input
      type="checkbox"
      bind:checked
      {disabled}
      {name}
      {id}
      onchange={handleChange}
      class="sr-only peer"
    />
    {@render switchPill()}
  </label>
{/if}
