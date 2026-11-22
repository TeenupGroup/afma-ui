<script>
  import SearchInput from '../../Components/UI/SearchInput.svelte'

  let {
    value = $bindable(),
    placeholder = 'جستجو...',
    debounceMs = 300,
    disabled = false,
    onchange = undefined,
    onclear = undefined,
    class: className = '',
    ...rest
  } = $props()
</script>

<SearchInput
  bind:value
  {placeholder}
  {debounceMs}
  {disabled}
  {onchange}
  {onclear}
  class={className}
  {...rest}
/>
