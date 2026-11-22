<script>
  import { cn } from '../../lib/utils.js'

  let {
    school,
    title = '',
    subtitle = '',
    badge = '',
    icon: Icon = null,
    class: className = '',
    extra,
    children,
  } = $props()

  const schoolGradients = {
    bashagard: 'from-[#1e3a5f] via-[#2563eb] to-[#3b82f6]',
    bahokalat: 'from-[#065f46] via-[#059669] to-[#10b981]',
    poldasht: 'from-[#3f6212] via-[#65a30d] to-[#84cc16]',
    goharkooh: 'from-[#065f46] via-[#10b981] to-[#34d399]',
    aliaj: 'from-[#065f46] via-[#0d9f4f] to-[#35b40e]',
    ashkezar: 'from-[#065f46] via-[#0d9f4f] to-[#35b40e]',
    'khalij-fars': 'from-[#0f766e] via-[#0d9488] to-[#14b8a6]',
  }

  const gradient = $derived(
    schoolGradients[school?.slug] ||
    (school?.slug?.includes('aliaj') || school?.slug?.includes('ashkezar') ? schoolGradients.aliaj : schoolGradients.bashagard)
  )
</script>

<header class={cn('relative py-16 md:py-24 px-5 text-center overflow-hidden bg-gradient-to-br', gradient, className)} dir="rtl">
  <!-- Subtle decorative pattern -->
  <div class="absolute inset-0 opacity-10 pointer-events-none" aria-hidden="true">
    <div
      class="absolute inset-0"
      style="background-image: url(&quot;data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/svg%3E&quot;);"
    ></div>
  </div>

  <div class="relative z-10 max-w-3xl mx-auto">
    {#if badge}
      <div class="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-white text-xs sm:text-sm font-medium mb-4 shadow-sm">
        <span>{badge}</span>
      </div>
    {/if}

    {#if Icon}
      <div class="w-16 h-16 sm:w-20 sm:h-20 bg-white/15 backdrop-blur-md rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-5 sm:mb-6 shadow-lg border border-white/20">
        <Icon class="w-8 h-8 sm:w-10 sm:h-10 text-white" />
      </div>
    {/if}

    {#if title}
      <h1 class="text-white text-3xl sm:text-4xl md:text-5xl font-black mb-3 sm:mb-4 tracking-tight">
        {title}
      </h1>
    {/if}

    {#if subtitle}
      <p class="text-white/90 text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
        {subtitle}
      </p>
    {/if}

    {#if extra}
      <div class="mt-6 flex flex-wrap items-center justify-center gap-3">
        {@render extra()}
      </div>
    {/if}

    {#if children}
      <div class="mt-6">
        {@render children()}
      </div>
    {/if}
  </div>
</header>
