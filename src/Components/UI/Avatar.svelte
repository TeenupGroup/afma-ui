<script>
  import { User } from 'lucide-svelte'
  import { cn } from '../../lib/utils.js'

  let {
    src = null,
    name = '',
    alt = '',
    size = 'md', // 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'
    shape = 'rounded', // 'circle' | 'rounded' | 'square'
    status = null, // 'online' | 'offline' | 'busy' | 'away' | null
    border = true,
    class: className = '',
    ...rest
  } = $props()

  let imgFailed = $state(false)

  // Reset imgFailed if src changes
  $effect(() => {
    if (src) imgFailed = false
  })

  const sizeClasses = {
    xs: 'h-6 w-6 text-[10px]',
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-lg',
    '2xl': 'h-20 w-20 text-xl',
    '3xl': 'h-24 w-24 text-2xl',
  }

  const shapeClasses = {
    circle: 'rounded-full',
    rounded: 'rounded-2xl',
    square: 'rounded-xl',
  }

  const statusDotSizes = {
    xs: 'h-1.5 w-1.5',
    sm: 'h-2 w-2',
    md: 'h-2.5 w-2.5',
    lg: 'h-3 w-3',
    xl: 'h-3.5 w-3.5',
    '2xl': 'h-4 w-4',
    '3xl': 'h-4.5 w-4.5',
  }

  const statusColors = {
    online: 'bg-emerald-500 ring-white',
    offline: 'bg-slate-400 ring-white',
    busy: 'bg-rose-500 ring-white',
    away: 'bg-amber-500 ring-white',
  }

  const pastelGradients = [
    'from-indigo-500 to-purple-600',
    'from-sky-500 to-blue-600',
    'from-emerald-500 to-teal-600',
    'from-rose-500 to-pink-600',
    'from-amber-500 to-orange-600',
    'from-violet-500 to-indigo-600',
    'from-cyan-500 to-blue-600',
    'from-fuchsia-500 to-pink-600',
  ]

  // Deterministic gradient selection based on name
  const gradientClass = $derived.by(() => {
    if (!name) return pastelGradients[0]
    let hash = 0
    for (let i = 0; i < name.length; i++) {
      hash = (hash << 5) - hash + name.charCodeAt(i)
      hash |= 0
    }
    const index = Math.abs(hash) % pastelGradients.length
    return pastelGradients[index]
  })

  // Extract Persian initials
  const initials = $derived.by(() => {
    if (!name) return ''
    const parts = name.trim().split(/\s+/).filter(Boolean)
    if (parts.length === 0) return ''
    if (parts.length === 1) return parts[0].slice(0, 2)
    return `${parts[0][0]}‌${parts[1][0]}`
  })

  const hasImage = $derived(Boolean(src) && !imgFailed)
</script>

<div class={cn('relative inline-flex shrink-0 select-none font-sans', className)} {...rest}>
  <div
    class={cn(
      'relative flex items-center justify-center overflow-hidden font-black text-white shadow-2xs transition-transform',
      sizeClasses[size] || sizeClasses.md,
      shapeClasses[shape] || shapeClasses.rounded,
      border && 'ring-1 ring-black/5 dark:ring-white/10',
      !hasImage && `bg-gradient-to-tr ${gradientClass}`
    )}
  >
    {#if hasImage}
      <img
        {src}
        alt={alt || name || 'آواتار'}
        class="h-full w-full object-cover"
        onerror={() => { imgFailed = true }}
      />
    {:else if initials}
      <span class="tracking-tighter">{initials}</span>
    {:else}
      <User class="h-1/2 w-1/2 text-white/90" />
    {/if}
  </div>

  {#if status && statusColors[status]}
    <span
      class={cn(
        'absolute -bottom-0.5 -right-0.5 rounded-full ring-2',
        statusDotSizes[size] || statusDotSizes.md,
        statusColors[status]
      )}
      title={status === 'online' ? 'آنلاین' : status === 'offline' ? 'آفلاین' : status === 'busy' ? 'مشغول' : 'در دسترس نیست'}
    ></span>
  {/if}
</div>
