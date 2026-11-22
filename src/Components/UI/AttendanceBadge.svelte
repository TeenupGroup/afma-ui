<script>
  import { getAttendanceMeta } from '../../lib/attendance.js'

  /**
   * @typedef {Object} AttendanceBadgeProps
   * @property {string} status - Attendance status ('present' | 'late' | 'absent' | 'excused')
   * @property {'xs' | 'sm' | 'md' | 'lg'} [size='sm']
   * @property {boolean} [showIcon=true]
   * @property {boolean} [showDot=false]
   * @property {'soft' | 'outline' | 'solid'} [variant='soft']
   * @property {string} [class='']
   */

  /** @type {AttendanceBadgeProps} */
  let {
    status,
    size = 'sm',
    showIcon = true,
    showDot = false,
    variant = 'soft',
    class: className = '',
  } = $props()

  const meta = $derived(getAttendanceMeta(status))

  const sizeClasses = {
    xs: 'text-[10px] px-1.5 py-0.5 gap-1 rounded-md font-medium',
    sm: 'text-xs px-2.5 py-1 gap-1.5 rounded-lg font-bold',
    md: 'text-sm px-3 py-1.5 gap-2 rounded-xl font-bold',
    lg: 'text-base px-4 py-2 gap-2.5 rounded-2xl font-black',
  }

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }

  const dotSizes = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
  }

  const variantClasses = $derived.by(() => {
    if (variant === 'solid') {
      const solidMap = {
        emerald: 'bg-emerald-600 text-white shadow-xs shadow-emerald-500/20',
        amber: 'bg-amber-500 text-white shadow-xs shadow-amber-500/20',
        rose: 'bg-rose-600 text-white shadow-xs shadow-rose-500/20',
        sky: 'bg-sky-600 text-white shadow-xs shadow-sky-500/20',
        slate: 'bg-slate-600 text-white shadow-xs',
      }
      return solidMap[meta.color] || solidMap.slate
    }

    if (variant === 'outline') {
      return `bg-transparent border ${meta.borderClass} ${meta.textClass}`
    }

    // Default 'soft'
    return `${meta.bgClass} border ${meta.borderClass} ${meta.textClass}`
  })
</script>

<span
  class="inline-flex items-center shrink-0 tracking-tight transition-all {sizeClasses[size] || sizeClasses.sm} {variantClasses} {className}"
  dir="rtl"
>
  {#if showDot}
    <span class="rounded-full shrink-0 {dotSizes[size] || dotSizes.sm} {variant === 'solid' ? 'bg-white' : meta.dotClass}"></span>
  {/if}

  {#if showIcon && meta.icon}
    <meta.icon class="{iconSizes[size] || iconSizes.sm} shrink-0" />
  {/if}

  <span>{meta.label}</span>
</span>
