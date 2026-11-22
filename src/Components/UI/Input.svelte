<script>
  import { persianInputHandler } from '../../lib/utils.js'

  let {
    value = $bindable(),
    type = 'text',
    name = undefined,
    id = undefined,
    label = '',
    description = '',
    error = '',
    placeholder = '',
    required = false,
    disabled = false,
    readonly = false,
    numeric = false,
    persian = true,
    size = 'md', // 'sm' | 'md' | 'lg'
    startIcon = undefined,
    endIcon = undefined,
    class: className = '',
    inputClass = '',
    oninput = undefined,
    onchange = undefined,
    onkeydown = undefined,
    ...rest
  } = $props()

  const inputId = $derived(id || (name ? `input-${name}` : undefined))

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs rounded-xl',
    md: 'px-3.5 py-2 text-xs sm:text-sm rounded-xl',
    lg: 'px-4 py-2.5 text-sm sm:text-base rounded-2xl',
  }

  const shouldConvertPersian = $derived(
    (persian || numeric) &&
    rest.dir !== 'ltr' &&
    !['password', 'email', 'url', 'file', 'number', 'date', 'time'].includes(type) &&
    !inputClass.includes('no-persian-nums') &&
    !className.includes('no-persian-nums')
  )

  function handleInput(e) {
    if (shouldConvertPersian) {
      persianInputHandler(e)
    }
    value = e.target.value
    oninput?.(e)
    value = e.target.value
  }

  const isStartComponent = $derived(typeof startIcon === 'function' && Boolean(startIcon.prototype))
  const isEndComponent = $derived(typeof endIcon === 'function' && Boolean(endIcon.prototype))
</script>

<div class="space-y-1.5 text-right {className}" dir="rtl">
  {#if label}
    <label for={inputId} class="block text-xs font-bold text-slate-700">
      {label}
      {#if required}
        <span class="text-rose-500 mr-0.5">*</span>
      {/if}
    </label>
  {/if}

  <div class="relative flex items-center">
    {#if startIcon}
      <div class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
        {#if isStartComponent}
          {@const IconComp = startIcon}
          <IconComp class="w-4 h-4" />
        {:else}
          {@render startIcon()}
        {/if}
      </div>
    {/if}

    <input
      {type}
      {name}
      id={inputId}
      bind:value
      {placeholder}
      {required}
      {disabled}
      {readonly}
      oninput={handleInput}
      {onchange}
      {onkeydown}
      class="w-full bg-slate-50 border transition-all outline-hidden text-slate-800 placeholder:text-slate-400 {sizeStyles[size] || sizeStyles.md} {startIcon ? 'pr-9' : ''} {endIcon ? 'pl-9' : ''} {error ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20' : 'border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20'} {disabled ? 'opacity-50 cursor-not-allowed bg-slate-100' : ''} {inputClass}"
      {...rest}
    />

    {#if endIcon}
      <div class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
        {#if isEndComponent}
          {@const IconComp = endIcon}
          <IconComp class="w-4 h-4" />
        {:else}
          {@render endIcon()}
        {/if}
      </div>
    {/if}
  </div>

  {#if description && !error}
    <p class="text-[11px] text-slate-400 leading-tight">{description}</p>
  {/if}

  {#if error}
    <p class="text-xs text-rose-500 font-bold" data-testid={name ? `${name}-error` : 'input-error'}>{error}</p>
  {/if}
</div>
