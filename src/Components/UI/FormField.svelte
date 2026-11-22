<script>
  import { toPersianDigits } from '../../utils/persian.js'

  let {
    id,
    label = '',
    required = false,
    error = '',
    hint = '',
    class: classProp = '',
    className = '',
    children = undefined,
    ...rest
  } = $props()

  const errorId = $derived(error ? `${id}-error` : undefined)
  const hintId = $derived(hint ? `${id}-hint` : undefined)
  const describedBy = $derived([hintId, errorId].filter(Boolean).join(' ') || undefined)
  const extraClass = $derived([classProp, className].filter(Boolean).join(' '))
</script>

<div class="space-y-1.5 {extraClass}" dir="rtl" {...rest}>
  {#if label}
    <label
      for={id}
      class="block text-sm font-bold text-slate-800 [.dark_&]:text-slate-100"
    >
      {label}{#if required}<span class="text-rose-600 [.dark_&]:text-rose-400 mr-1" aria-hidden="true">*</span>{/if}
    </label>
  {/if}

  {@render children?.({ invalid: Boolean(error), describedBy })}

  {#if hint}
    <p id={hintId} class="text-xs text-slate-500 [.dark_&]:text-slate-400 leading-relaxed">
      {toPersianDigits(hint)}
    </p>
  {/if}

  {#if error}
    <p id={errorId} role="alert" class="text-xs font-bold text-rose-600 [.dark_&]:text-rose-400 leading-relaxed">
      {toPersianDigits(error)}
    </p>
  {/if}
</div>
