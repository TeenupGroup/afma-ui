<script>
  import UniversalFileUpload from '../../Components/UI/FileUpload.svelte'

  let {
    file = $bindable(null),
    value = $bindable([]),
    ...rest
  } = $props()
</script>

<UniversalFileUpload bind:file bind:value {...rest} />
