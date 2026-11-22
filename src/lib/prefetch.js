/**
 * Global Hover Prefetcher
 *
 * Automatically prefetches internal panel routes when users hover
 * over links for > 80ms, eliminating page transition wait times completely.
 */
import { router } from '@inertiajs/svelte'

const prefetchedUrls = new Set()
let hoverTimer = null
let initialized = false

export function initGlobalPrefetch() {
  if (typeof window === 'undefined' || initialized) return
  initialized = true

  document.addEventListener('mouseover', (e) => {
    const targetLink = e.target?.closest?.('a[href^="/panel/"]')
    if (!targetLink) return

    const href = targetLink.getAttribute('href')
    if (!href || href === '#' || href.startsWith('javascript:') || prefetchedUrls.has(href)) return

    clearTimeout(hoverTimer)
    hoverTimer = setTimeout(() => {
      prefetchedUrls.add(href)
      try {
        if (typeof router.prefetch === 'function') {
          router.prefetch(href, { method: 'get' })
        }
      } catch {
        // Safe fallback
      }
    }, 180)
  })

  document.addEventListener('mouseout', (e) => {
    if (e.target?.closest?.('a[href]')) {
      clearTimeout(hoverTimer)
    }
  })
}
