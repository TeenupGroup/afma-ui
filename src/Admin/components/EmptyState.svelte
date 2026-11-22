<script>
  import EmptyState from '../../Components/UI/EmptyState.svelte'
  import { Inbox, Search, FileText, Users, Package, AlertCircle } from 'lucide-svelte'

  let {
    icon = 'inbox',
    title = 'داده‌ای یافت نشد',
    description = 'هنوز هیچ رکوردی ثبت نشده است.',
    actionLabel = null,
    actionUrl = null,
    onAction = null,
    class: className = '',
    ...rest
  } = $props()

  const iconMap = {
    inbox: Inbox,
    search: Search,
    file: FileText,
    users: Users,
    package: Package,
    error: AlertCircle,
  }

  const resolvedIcon = $derived(
    typeof icon === 'string' ? (iconMap[icon] || Inbox) : icon
  )
</script>

<EmptyState
  icon={resolvedIcon}
  {title}
  {description}
  {actionLabel}
  {actionUrl}
  onaction={onAction}
  class={className}
  {...rest}
/>
