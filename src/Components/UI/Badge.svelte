<script>
  let {
    color = undefined, // 'default' | 'primary' | 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky' | 'purple' | 'slate' | 'blue' | 'green' | 'yellow' | 'red' | 'cyan' | 'orange'
    variant = 'subtle', // 'subtle' | 'solid' | 'outline' | 'dot' | 'success' | 'danger' | 'warning' | 'info' | 'primary' | 'neutral' | color names
    size = 'sm', // 'xs' | 'sm' | 'md' | 'lg'
    dot = false,
    icon = undefined,
    class: className = '',
    children = undefined,
    ...rest
  } = $props()

  // Standardize semantic and color-name variant mappings
  const semanticVariants = {
    success: 'emerald',
    danger: 'rose',
    warning: 'amber',
    info: 'sky',
    primary: 'indigo',
    neutral: 'slate',
    default: 'slate',
    secondary: 'slate',
    indigo: 'indigo',
    emerald: 'emerald',
    amber: 'amber',
    rose: 'rose',
    sky: 'sky',
    purple: 'purple',
    slate: 'slate',
    blue: 'blue',
    cyan: 'cyan',
    green: 'emerald',
    yellow: 'amber',
    red: 'rose',
    orange: 'amber',
  }

  const effectiveColor = $derived((() => {
    if (color) return color
    if (variant in semanticVariants) return semanticVariants[variant]
    return 'slate'
  })())

  const effectiveVariant = $derived((() => {
    if (variant in semanticVariants) return 'subtle'
    return variant || 'subtle'
  })())

  // Standardize color aliases
  const normalizedColor = $derived((() => {
    const c = effectiveColor
    if (c === 'primary') return 'indigo'
    if (c === 'default' || c === 'neutral' || c === 'secondary') return 'slate'
    if (c === 'green' || c === 'success') return 'emerald'
    if (c === 'yellow' || c === 'warning' || c === 'orange') return 'amber'
    if (c === 'red' || c === 'danger') return 'rose'
    if (c === 'info') return 'sky'
    return c
  })())

  const colorPalettes = {
    indigo: {
      subtle: 'bg-indigo-50 text-indigo-700 border-indigo-100',
      solid: 'bg-indigo-600 text-white border-transparent',
      outline: 'bg-transparent text-indigo-600 border-indigo-300',
      dot: 'bg-indigo-500',
    },
    emerald: {
      subtle: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      solid: 'bg-emerald-600 text-white border-transparent',
      outline: 'bg-transparent text-emerald-600 border-emerald-300',
      dot: 'bg-emerald-500',
    },
    amber: {
      subtle: 'bg-amber-50 text-amber-700 border-amber-100',
      solid: 'bg-amber-600 text-white border-transparent',
      outline: 'bg-transparent text-amber-600 border-amber-300',
      dot: 'bg-amber-500',
    },
    rose: {
      subtle: 'bg-rose-50 text-rose-700 border-rose-100',
      solid: 'bg-rose-600 text-white border-transparent',
      outline: 'bg-transparent text-rose-600 border-rose-300',
      dot: 'bg-rose-500',
    },
    sky: {
      subtle: 'bg-sky-50 text-sky-700 border-sky-100',
      solid: 'bg-sky-600 text-white border-transparent',
      outline: 'bg-transparent text-sky-600 border-sky-300',
      dot: 'bg-sky-500',
    },
    purple: {
      subtle: 'bg-purple-50 text-purple-700 border-purple-100',
      solid: 'bg-purple-600 text-white border-transparent',
      outline: 'bg-transparent text-purple-600 border-purple-300',
      dot: 'bg-purple-500',
    },
    slate: {
      subtle: 'bg-slate-100 text-slate-700 border-slate-200',
      solid: 'bg-slate-700 text-white border-transparent',
      outline: 'bg-transparent text-slate-600 border-slate-300',
      dot: 'bg-slate-400',
    },
    blue: {
      subtle: 'bg-blue-50 text-blue-700 border-blue-100',
      solid: 'bg-blue-600 text-white border-transparent',
      outline: 'bg-transparent text-blue-600 border-blue-300',
      dot: 'bg-blue-500',
    },
    cyan: {
      subtle: 'bg-cyan-50 text-cyan-700 border-cyan-100',
      solid: 'bg-cyan-600 text-white border-transparent',
      outline: 'bg-transparent text-cyan-600 border-cyan-300',
      dot: 'bg-cyan-500',
    },
  }

  const sizes = {
    xs: 'px-2 py-0.5 text-[10px]',
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-xs',
    lg: 'px-3.5 py-1.5 text-sm',
  }

  const palette = $derived(colorPalettes[normalizedColor] || colorPalettes.slate)
  const variantClass = $derived(
    effectiveVariant === 'solid' ? palette.solid :
    effectiveVariant === 'outline' ? palette.outline :
    palette.subtle
  )

  const computedClasses = $derived([
    'inline-flex items-center gap-1.5 font-bold rounded-full border select-none transition-colors duration-150',
    sizes[size] || sizes.sm,
    variantClass,
    className
  ].filter(Boolean).join(' '))

  const isComponent = $derived(typeof icon === 'function' && Boolean(icon.prototype))
</script>

<span class={computedClasses} {...rest}>
  {#if effectiveVariant === 'dot' || dot}
    <span class="w-1.5 h-1.5 rounded-full {palette.dot} shrink-0"></span>
  {/if}
  {#if icon}
    {#if isComponent}
      {@const IconComp = icon}
      <IconComp class="shrink-0 {size === 'xs' ? 'w-3 h-3' : 'w-3.5 h-3.5'}" />
    {:else}
      {@render icon()}
    {/if}
  {/if}
  {#if children}
    {@render children()}
  {/if}
</span>
