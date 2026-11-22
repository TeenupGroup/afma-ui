<script>
  import { Link } from '@inertiajs/svelte'
  import { ChevronRight, ChevronLeft } from 'lucide-svelte'
  import { toPersianDigits } from '../../lib/utils.js'

  /**
   * Inertia paginator pagination.
   *
   * Pass the paginator's `current_page`, `last_page` and `links`
   * (Laravel's serialized pagination links array). Page URLs keep
   * the original query string because links come from
   * `->withQueryString()`.
   */
  let {
    data = null,
    currentPage = 1,
    lastPage = 1,
    links = [],
    class: className = '',
  } = $props()

  const resolvedCurrentPage = $derived(data?.current_page ?? currentPage ?? 1)
  const resolvedLastPage = $derived(data?.last_page ?? lastPage ?? 1)
  const resolvedLinks = $derived(data?.links ?? links ?? [])

  const total = $derived(Math.max(1, resolvedLastPage))
  const current = $derived(Math.min(Math.max(1, resolvedCurrentPage), total))

  // Compact window: always show first / last / around-current,
  // collapse the rest into ellipsis.
  const pages = $derived.by(() => {
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1)
    }

    const set = new Set([1, 2, current - 1, current, current + 1, total - 1, total])
    const list = [...set].filter(n => n >= 1 && n <= total).sort((a, b) => a - b)

    const out = []
    let prev = 0
    for (const n of list) {
      if (n - prev > 1) out.push('…')
      out.push(n)
      prev = n
    }
    return out
  })

  const urlFor = (page) => {
    if (page === current) return null
    const link = resolvedLinks.find(l => l.url && String(l.label).trim() === String(page))
    if (link?.url) return link.url
    const sample = resolvedLinks.find(l => l.url)?.url
    if (!sample) return `?page=${page}`
    return sample.replace(/([?&]page=)\d+/, `$1${page}`)
  }

  const prevUrl = $derived(
    (resolvedLinks[0]?.url && !resolvedLinks[0]?.active ? resolvedLinks[0].url : null) ??
    resolvedLinks.find(l => l.label?.toLowerCase()?.includes('previous') || l.label?.includes('قبلی'))?.url ??
    null
  )
  const nextUrl = $derived(
    (resolvedLinks.length > 1 && resolvedLinks[resolvedLinks.length - 1]?.url && !resolvedLinks[resolvedLinks.length - 1]?.active ? resolvedLinks[resolvedLinks.length - 1].url : null) ??
    resolvedLinks.find(l => l.label?.toLowerCase()?.includes('next') || l.label?.includes('بعدی'))?.url ??
    null
  )

  const btnBase = 'flex h-9 min-w-9 items-center justify-center rounded-xl px-2 text-xs font-bold transition-all cursor-pointer'
  const btnActive = 'bg-indigo-600 text-white shadow-xs'
  const btnIdle = 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
  const btnDisabled = 'border border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed'
</script>

{#if total > 1}
  <nav class={`flex flex-wrap items-center justify-center gap-1.5 ${className}`} aria-label="صفحه‌ها" dir="rtl">
    <!-- Previous (RTL: points right) -->
    {#if prevUrl}
      <Link href={prevUrl} class={`${btnBase} ${btnIdle}`} aria-label="صفحه قبل">
        <ChevronRight class="h-4 w-4" />
      </Link>
    {:else}
      <span class={`${btnBase} ${btnDisabled}`} aria-hidden="true">
        <ChevronRight class="h-4 w-4" />
      </span>
    {/if}

    {#each pages as page}
      {#if page === '…'}
        <span class="px-1 text-xs font-bold text-slate-400">…</span>
      {:else if page === current}
        <span class={`${btnBase} ${btnActive}`} aria-current="page">
          {toPersianDigits(page)}
        </span>
      {:else}
        {@const href = urlFor(page)}
        {#if href}
          <Link href={href} class={`${btnBase} ${btnIdle}`}>
            {toPersianDigits(page)}
          </Link>
        {:else}
          <span class={`${btnBase} ${btnIdle}`}>
            {toPersianDigits(page)}
          </span>
        {/if}
      {/if}
    {/each}

    <!-- Next (RTL: points left) -->
    {#if nextUrl}
      <Link href={nextUrl} class={`${btnBase} ${btnIdle}`} aria-label="صفحه بعد">
        <ChevronLeft class="h-4 w-4" />
      </Link>
    {:else}
      <span class={`${btnBase} ${btnDisabled}`} aria-hidden="true">
        <ChevronLeft class="h-4 w-4" />
      </span>
    {/if}
  </nav>
{/if}
