/**
 * Global Keyboard Shortcuts Manager (Svelte 5)
 *
 * Provides vim/linear-like keyboard navigation across all panels without
 * interfering with active text inputs.
 */

let helpModalOpen = $state(false)

export function getShortcutsHelpState() {
  return helpModalOpen
}

export function openShortcutsHelp() {
  helpModalOpen = true
}

export function closeShortcutsHelp() {
  helpModalOpen = false
}

if (typeof window !== 'undefined') {
  window.addEventListener('keydown', (e) => {
    const activeEl = document.activeElement
    const isInput = activeEl && (
      activeEl.tagName === 'INPUT' ||
      activeEl.tagName === 'TEXTAREA' ||
      activeEl.isContentEditable
    )

    // Shortcuts only trigger when NOT focused on form fields
    if (isInput) {
      if (e.key === 'Escape') {
        activeEl.blur()
      }
      return
    }

    // '?' opens shortcuts modal
    if (e.key === '?' || (e.shiftKey && e.key === '/')) {
      e.preventDefault()
      helpModalOpen = true
      return
    }

    // '/' focuses primary search bar
    if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
      e.preventDefault()
      const searchInput = document.querySelector(
        'input[type="search"], input[name="search"], input[placeholder*="جستجو"]'
      )
      searchInput?.focus()
      return
    }

    // Esc closes help modal if open
    if (e.key === 'Escape' && helpModalOpen) {
      helpModalOpen = false
    }
  })
}
