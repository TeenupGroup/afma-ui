<script>
  let {
    checked = $bindable(),
    indeterminate = false,
    disabled = false,
    size = 'md', // 'sm' | 'md' | 'lg'
    color = 'indigo', // 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky' | 'purple' | 'slate' | 'blue' | 'green'
    label = '',
    description = '',
    name = undefined,
    value = undefined,
    id = undefined,
    bare = false,
    class: className = '',
    labelClass = '',
    descriptionClass = '',
    onchange = undefined,
    onkeydown = undefined,
    children = undefined,
    ...rest
  } = $props()

  const colors = {
    indigo: 'checked:bg-indigo-600 indeterminate:bg-indigo-600',
    primary: 'checked:bg-indigo-600 indeterminate:bg-indigo-600',
    emerald: 'checked:bg-emerald-600 indeterminate:bg-emerald-600',
    green: 'checked:bg-emerald-600 indeterminate:bg-emerald-600',
    amber: 'checked:bg-amber-600 indeterminate:bg-amber-600',
    rose: 'checked:bg-rose-600 indeterminate:bg-rose-600',
    sky: 'checked:bg-sky-600 indeterminate:bg-sky-600',
    blue: 'checked:bg-blue-600 indeterminate:bg-blue-600',
    purple: 'checked:bg-purple-600 indeterminate:bg-purple-600',
    slate: 'checked:bg-slate-700 indeterminate:bg-slate-700',
  }

  const sizes = {
    sm: { box: 'w-4 h-4 rounded-md', icon: 'w-3 h-3', dash: 'w-2 h-0.5' },
    md: { box: 'w-5 h-5 rounded-lg', icon: 'w-3.5 h-3.5', dash: 'w-2.5 h-0.5' },
    lg: { box: 'w-6 h-6 rounded-xl', icon: 'w-4 h-4', dash: 'w-3 h-0.5' },
  }

  const checkboxId = $derived(id || (name ? `checkbox-${name}` : undefined))
  const activeSize = $derived(sizes[size] || sizes.md)
  const activeColor = $derived(colors[color] || colors.indigo)

  function handleChange(e) {
    if (disabled) return
    checked = e.target.checked
    onchange?.(e.target.checked, e)
  }

  function handleKeydown(e) {
    onkeydown?.(e)
    if (e.key === ' ' && !bare) e.preventDefault()
  }

  function syncIndeterminate(node, isIndeterminate) {
    node.indeterminate = Boolean(isIndeterminate)
    return {
      update(nextVal) {
        node.indeterminate = Boolean(nextVal)
      },
    }
  }
</script>

{#snippet control()}
  <span class="relative inline-flex items-center justify-center shrink-0 {disabled ? 'opacity-50' : ''}">
    <!--
      The checkbox is styled directly (appearance-none) rather than being hidden
      behind an sr-only input. This keeps it a real, hit-testable, visible control
      so native form participation and Playwright selectors such as
      `table tbody tr input[type="checkbox"]` + .check() keep working.
    -->
    <input
      type="checkbox"
      bind:checked
      {disabled}
      {name}
      {value}
      id={checkboxId}
      onchange={handleChange}
      onkeydown={handleKeydown}
      aria-checked={indeterminate ? 'mixed' : Boolean(checked)}
      use:syncIndeterminate={indeterminate}
      class="peer appearance-none m-0 shrink-0 cursor-pointer bg-white border border-slate-300 transition-colors {activeColor} checked:border-transparent indeterminate:border-transparent focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 {activeSize.box} {disabled ? 'cursor-not-allowed' : ''}"
      {...rest}
    />
    {#if indeterminate}
      <span
        aria-hidden="true"
        class="pointer-events-none absolute rounded-full bg-white {activeSize.dash}"
      ></span>
    {:else}
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="pointer-events-none absolute text-white transition-opacity {activeSize.icon} {checked ? 'opacity-100' : 'opacity-0 peer-checked:opacity-100'}"
      >
        <path d="M4 10.5 8 14.5 16 6" />
      </svg>
    {/if}
  </span>
{/snippet}

{#if bare}
  {@render control()}
{:else}
  <label
    class="inline-flex items-start gap-2.5 select-none {disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} {className}"
  >
    {@render control()}
    {#if label || description || children}
      <div class="space-y-0.5 min-w-0">
        {#if label}
          <span class="block text-xs font-bold text-slate-700 {labelClass}">{label}</span>
        {/if}
        {#if description}
          <p class="text-[11px] text-slate-400 leading-relaxed {descriptionClass}">{description}</p>
        {/if}
        {#if children}
          {@render children()}
        {/if}
      </div>
    {/if}
  </label>
{/if}