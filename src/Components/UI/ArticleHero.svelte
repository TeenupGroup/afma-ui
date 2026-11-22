<script>
  import { onMount } from 'svelte'
  import { Link } from '@inertiajs/svelte'
  import { Calendar, Eye, Clock, User, ArrowRight } from 'lucide-svelte'
  import { formatDate } from '../../lib/format.js'
  import { storageUrl, toPersianDigits, stripRichText, renderRichText } from '../../lib/utils.js'

  let {
    title = '',
    excerpt = '',
    imageUrl = '',
    category = null,
    categoryHref = '',
    backHref = '',
    backLabel = 'بازگشت',
    date = null,
    views = null,
    author = '',
    content = '',
    readingTime = null,
    showProgressBar = true
  } = $props()

  let readingProgress = $state(0)

  let categoryName = $derived(
    category
      ? (typeof category === 'object' ? (category.name || category.title) : category)
      : null
  )

  let calculatedReadingTime = $derived(
    readingTime ?? (content ? Math.max(1, Math.round(stripRichText(content).length / 600)) : null)
  )

  onMount(() => {
    if (!showProgressBar) return

    function onScroll() {
      const h = document.documentElement
      const scrolled = h.scrollTop
      const height = h.scrollHeight - h.clientHeight
      readingProgress = height > 0 ? Math.min(100, Math.max(0, (scrolled / height) * 100)) : 0
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  })
</script>

<!-- Top Window Sticky Reading Progress Bar -->
{#if showProgressBar}
  <div class="fixed top-0 inset-x-0 z-50 h-1 bg-transparent pointer-events-none">
    <div
      class="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 transition-[width] duration-150 ease-out"
      style="width: {readingProgress}%"
    ></div>
  </div>
{/if}

<!-- Article Hero Header -->
<header class="relative overflow-hidden py-16 md:py-24" dir="rtl">
  <!-- Background Image with Gradient Overlay -->
  {#if imageUrl}
    <div class="absolute inset-0">
      <img
        src={storageUrl(imageUrl)}
        alt={title}
        class="w-full h-full object-cover"
        loading="eager"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-slate-900/50 backdrop-blur-[2px]"></div>
    </div>
  {:else}
    <div class="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950">
      <div class="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]"></div>
    </div>
  {/if}

  <div class="relative container mx-auto px-4 max-w-5xl">
    <!-- Back Link -->
    {#if backHref}
      <nav class="mb-6">
        <Link
          href={backHref}
          class="inline-flex items-center gap-1.5 text-xs sm:text-sm text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/15 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10"
        >
          <ArrowRight class="w-3.5 h-3.5" />
          <span>{backLabel}</span>
        </Link>
      </nav>
    {/if}

    <!-- Category Pill -->
    {#if categoryName}
      <div class="mb-4">
        {#if categoryHref}
          <Link
            href={categoryHref}
            class="inline-block px-3.5 py-1 rounded-full text-xs font-semibold bg-blue-500/30 text-blue-200 border border-blue-400/30 hover:bg-blue-500/40 backdrop-blur-md transition-colors"
          >
            {categoryName}
          </Link>
        {:else}
          <span class="inline-block px-3.5 py-1 rounded-full text-xs font-semibold bg-white/15 text-white/90 border border-white/20 backdrop-blur-md">
            {categoryName}
          </span>
        {/if}
      </div>
    {/if}

    <!-- Title -->
    <h1 class="text-2xl sm:text-4xl md:text-5xl font-black text-white leading-tight md:leading-snug mb-5">
      {title}
    </h1>

    <!-- Excerpt / Subtitle -->
    {#if excerpt}
      <div class="text-base sm:text-lg text-white/80 leading-relaxed max-w-3xl mb-6">
        {@html renderRichText(excerpt)}
      </div>
    {/if}

    <!-- Metadata Bar -->
    <div class="flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm text-white/70 pt-2 border-t border-white/10">
      {#if author}
        <span class="inline-flex items-center gap-1.5">
          <User class="w-4 h-4 text-blue-400" />
          <span>{author}</span>
        </span>
      {/if}

      {#if date}
        <span class="inline-flex items-center gap-1.5">
          <Calendar class="w-4 h-4 text-emerald-400" />
          <span>{formatDate(date)}</span>
        </span>
      {/if}

      {#if calculatedReadingTime}
        <span class="inline-flex items-center gap-1.5">
          <Clock class="w-4 h-4 text-amber-400" />
          <span>{toPersianDigits(calculatedReadingTime)} دقیقه مطالعه</span>
        </span>
      {/if}

      {#if views !== null && views !== undefined}
        <span class="inline-flex items-center gap-1.5">
          <Eye class="w-4 h-4 text-cyan-400" />
          <span>{toPersianDigits(views)} بازدید</span>
        </span>
      {/if}
    </div>
  </div>
</header>
