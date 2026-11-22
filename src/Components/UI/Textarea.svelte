<script>
  let {
    value = $bindable(),
    name = undefined,
    id = undefined,
    label = '',
    description = '',
    error = '',
    placeholder = '',
    required = false,
    disabled = false,
    readonly = false,
    rows = 3,
    class: className = '',
    textareaClass = '',
    oninput = undefined,
    onchange = undefined,
    onkeydown = undefined,
    ...rest
  } = $props()

  const textareaId = $derived(id || (name ? `textarea-${name}` : undefined))
</script>

<div class="space-y-1.5 text-right {className}" dir="rtl">
  {#if label}
    <label for={textareaId} class="block text-xs font-bold text-slate-700">
      {label}
      {#if required}
        <span class="text-rose-500 mr-0.5">*</span>
      {/if}
    </label>
  {/if}

  <textarea
    {name}
    id={textareaId}
    bind:value
    {placeholder}
    {required}
    {disabled}
    {readonly}
    {rows}
    {oninput}
    {onchange}
    {onkeydown}
    class="w-full bg-slate-50 border transition-all outline-hidden text-slate-800 placeholder:text-slate-400 px-3.5 py-2.5 text-xs sm:text-sm rounded-xl resize-y {error ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20' : 'border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20'} {disabled ? 'opacity-50 cursor-not-allowed bg-slate-100' : ''} {textareaClass}"
    {...rest}
  ></textarea>

  {#if description && !error}
    <p class="text-[11px] text-slate-400 leading-tight">{description}</p>
  {/if}

  {#if error}
    <p class="text-xs text-rose-500 font-bold">{error}</p>
  {/if}
</div>
