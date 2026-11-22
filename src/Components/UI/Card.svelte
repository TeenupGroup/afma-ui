<script>
  let {
    variant = 'default', // 'default' | 'muted' | 'flat' | 'elevated' | 'glass'
    padding = 'md', // 'none' | 'xs' | 'sm' | 'md' | 'lg'
    hoverable = false,
    title = '',
    description = '',
    header = undefined,
    footer = undefined,
    class: className = '',
    children = undefined,
    ...rest
  } = $props()

  const variantStyles = {
    default: 'bg-white border border-slate-200/80 shadow-xs',
    muted: 'bg-slate-50 border border-slate-200/70',
    flat: 'bg-white border border-slate-200',
    elevated: 'bg-white border border-slate-100 shadow-md',
    glass: 'bg-white/80 backdrop-blur-md border border-white/40 shadow-xs',
  }

  const paddingStyles = {
    none: 'p-0',
    xs: 'p-3',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }

  const computedClasses = $derived([
    'rounded-2xl transition-all duration-200',
    variantStyles[variant] || variantStyles.default,
    paddingStyles[padding] || paddingStyles.md,
    hoverable ? 'hover:shadow-md hover:-translate-y-0.5' : '',
    className,
  ].filter(Boolean).join(' '))
</script>

<div class={computedClasses} {...rest}>
  {#if header || title || description}
    <div class="mb-4 space-y-1">
      {#if header}
        {@render header()}
      {:else}
        {#if title}
          <h3 class="font-bold text-slate-800 text-base sm:text-lg">{title}</h3>
        {/if}
        {#if description}
          <p class="text-xs sm:text-sm text-slate-500">{description}</p>
        {/if}
      {/if}
    </div>
  {/if}

  {#if children}
    {@render children()}
  {/if}

  {#if footer}
    <div class="mt-4 pt-4 border-t border-slate-100">
      {@render footer()}
    </div>
  {/if}
</div>
