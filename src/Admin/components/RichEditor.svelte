<script>
  import UniversalRichEditor from '../../Components/UI/RichEditor.svelte'

  let {
    value = $bindable(''),
    ...rest
  } = $props()
</script>

<UniversalRichEditor bind:value {...rest} />
