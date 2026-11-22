/**
 * Shared light/dark theme controller for AFMA ecosystem portals.
 * Persists user preference under a portal-specific localStorage key and toggles
 * `light` / `dark` classes plus `colorScheme` on `<html>`.
 */

const state = $state({
  current: 'light',
})

let activeStorageKey = 'afma-theme'

function applyDomTheme(mode) {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  const resolved = mode === 'dark' ? 'dark' : 'light'
  root.classList.remove('light', 'dark')
  root.classList.add(resolved)
  root.style.colorScheme = resolved
}

export function initTheme(storageKey = 'afma-theme', defaultTheme = 'light') {
  activeStorageKey = storageKey || 'afma-theme'
  const fallback = defaultTheme === 'dark' ? 'dark' : 'light'

  if (typeof window === 'undefined') {
    state.current = fallback
    return
  }

  let saved = fallback
  try {
    const stored = window.localStorage.getItem(activeStorageKey)
    if (stored === 'dark' || stored === 'light') {
      saved = stored
    }
  } catch {
    saved = fallback
  }

  state.current = saved
  applyDomTheme(saved)
}

export function setTheme(mode) {
  const resolved = mode === 'dark' ? 'dark' : 'light'
  state.current = resolved
  applyDomTheme(resolved)

  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(activeStorageKey, resolved)
    } catch {
      // Ignore storage restriction errors (private browsing / CSP)
    }
  }
}

export function toggleTheme() {
  setTheme(state.current === 'dark' ? 'light' : 'dark')
}

export function getThemeState() {
  return state
}
