<script>
  import StatsCard from '../../Components/UI/StatsCard.svelte'

  let {
    title,
    value,
    subtitle = null,
    description = null,
    icon = null,
    trend = null,
    trendValue = null,
    color = 'blue',
    loading = false,
    class: className = '',
    ...rest
  } = $props()
</script>

<StatsCard
  {title}
  {value}
  {subtitle}
  {description}
  {icon}
  {trend}
  {trendValue}
  {color}
  {loading}
  class={className}
  {...rest}
/>
