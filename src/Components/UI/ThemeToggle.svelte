<script>
  import { Moon, Sun } from 'lucide-svelte'
  import { getThemeState, toggleTheme } from '../../lib/theme.svelte.js'

  let {
    compact = false,
    lightLabel = 'حالت روز',
    darkLabel = 'حالت شب',
    class: classProp = '',
    className = '',
    ...rest
  } = $props()

  const themeState = getThemeState()
  const isDark = $derived(themeState.current === 'dark')
  const activeLabel = $derived(isDark ? lightLabel : darkLabel)
  const extraClass = $derived([classProp, className].filter(Boolean).join(' '))
</script>

<button
  type="button"
  onclick={toggleTheme}
  aria-label={activeLabel}
  title={activeLabel}
  class="inline-flex items-center justify-center gap-1.5 rounded-full border border-slate-200 bg-white/90 text-slate-700 hover:bg-slate-100 hover:text-slate-900 [.dark_&]:border-slate-700 [.dark_&]:bg-slate-900/90 [.dark_&]:text-slate-200 [.dark_&]:hover:bg-slate-800 [.dark_&]:hover:text-white text-xs font-bold transition-colors cursor-pointer {compact ? 'h-9 min-h-9 px-2.5' : 'min-h-11 sm:min-h-9 sm:h-9 px-3'} {extraClass}"
  {...rest}
>
  {#if isDark}
    <Sun class="h-4 w-4 shrink-0 text-amber-500" aria-hidden="true" />
  {:else}
    <Moon class="h-4 w-4 shrink-0 text-slate-700 [.dark_&]:text-slate-200" aria-hidden="true" />
  {/if}
  {#if !compact}
    <span class="hidden sm:inline text-xs font-bold">{activeLabel}</span>
  {/if}
</button>
