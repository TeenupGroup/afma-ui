<script>
  import { usePage } from '@inertiajs/svelte'

  let {
    permission = null,
    role = null,
    superAdminOnly = false,
    fallback = null,
    children,
    class: className = ''
  } = $props()

  const page = usePage()

  let canAccess = $derived.by(() => {
    if (superAdminOnly) {
      return page.props.auth?.isSuperAdmin || false
    }

    if (role) {
      return page.props.auth?.user?.role === role
    }

    if (permission) {
      if (page.props.auth?.isSuperAdmin) return true
      return page.props.auth?.user?.permissions?.includes(permission) || false
    }

    return true
  })
</script>

{#if canAccess}
  <div class={className}>
    {@render children()}
  </div>
{:else if fallback}
  {@render fallback()}
{/if}
