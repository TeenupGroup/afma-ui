<script>
  import { page } from '@inertiajs/svelte'

  let {
    title = '',
    defaultTitle = '',
    description = '',
    canonical = '',
    ogType = '',
    robots = '',
    jsonLd = null,
  } = $props()

  const sharedSeo = $derived(page.props?.seo || {})
  const platformName = $derived(page.props?.platform?.name || '')
  const resolvedTitle = $derived(title || sharedSeo.title || defaultTitle || platformName)
  const resolvedDescription = $derived(
    description || sharedSeo.description || page.props?.platform?.tagline || ''
  )
  const resolvedCanonical = $derived(canonical || sharedSeo.canonical || '')
  const resolvedOgType = $derived(ogType || sharedSeo.ogType || '')
  const resolvedRobots = $derived(robots || sharedSeo.robots || '')
  const resolvedJsonLd = $derived(jsonLd || sharedSeo.jsonLd || null)

  const jsonLdBlocks = $derived.by(() => {
    if (!resolvedJsonLd) return []
    const items = Array.isArray(resolvedJsonLd) ? resolvedJsonLd : [resolvedJsonLd]
    return items
      .filter(Boolean)
      .map((item) => {
        const raw = JSON.stringify(item).replace(/<\//g, '<\\/')
        return `<script type="application/ld+json">${raw}</scr` + `ipt>`
      })
  })
</script>

<svelte:head>
  {#if resolvedTitle}
    <title>{resolvedTitle}</title>
  {/if}
  {#if resolvedDescription}
    <meta name="description" content={resolvedDescription} />
  {/if}
  {#if resolvedRobots}
    <meta name="robots" content={resolvedRobots} />
  {/if}
  {#if resolvedCanonical}
    <link rel="canonical" href={resolvedCanonical} />
    <meta property="og:url" content={resolvedCanonical} />
  {/if}
  {#if platformName}
    <meta property="og:site_name" content={platformName} />
  {/if}
  <meta property="og:locale" content="fa_IR" />
  {#if resolvedOgType}
    <meta property="og:type" content={resolvedOgType} />
  {/if}
  {#if resolvedTitle}
    <meta property="og:title" content={resolvedTitle} />
    <meta name="twitter:title" content={resolvedTitle} />
  {/if}
  {#if resolvedDescription}
    <meta property="og:description" content={resolvedDescription} />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:description" content={resolvedDescription} />
  {/if}
  {#each jsonLdBlocks as scriptHtml, idx (idx)}
    {@html scriptHtml}
  {/each}
</svelte:head>
