<script>
  import { Link } from '@inertiajs/svelte'
  import { Loader2 } from 'lucide-svelte'
  import { cn } from '../../lib/utils.js'

  let {
    variant = 'primary', // 'primary' | 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky' | 'purple' | 'slate' | 'secondary' | 'ghost' | 'outline' | 'danger' | 'dark' | 'success' | 'warning' | 'info'
    size = 'md', // 'xs' | 'sm' | 'md' | 'lg'
    href = undefined,
    external = false,
    type = 'button',
    disabled = false,
    loading = false,
    icon = undefined,
    iconPosition = 'start', // 'start' | 'end'
    class: className = '',
    onclick = undefined,
    children = undefined,
    ...rest
  } = $props()

  const variantStyles = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-xs focus-visible:ring-indigo-500',
    indigo: 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-xs focus-visible:ring-indigo-500',
    emerald: 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-xs focus-visible:ring-emerald-500',
    success: 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-xs focus-visible:ring-emerald-500',
    green: 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-xs focus-visible:ring-emerald-500',
    amber: 'bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white shadow-xs focus-visible:ring-amber-500',
    warning: 'bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white shadow-xs focus-visible:ring-amber-500',
    rose: 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-xs focus-visible:ring-rose-500',
    sky: 'bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white shadow-xs focus-visible:ring-sky-400',
    info: 'bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white shadow-xs focus-visible:ring-sky-400',
    blue: 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-xs focus-visible:ring-blue-500',
    purple: 'bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white shadow-xs focus-visible:ring-purple-500',
    slate: 'bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 focus-visible:ring-slate-400',
    secondary: 'bg-slate-700 hover:bg-slate-800 active:bg-slate-900 text-white shadow-xs focus-visible:ring-slate-500',
    ghost: 'bg-transparent hover:bg-slate-100 active:bg-slate-200 text-slate-700 focus-visible:ring-slate-400',
    outline: 'bg-transparent border border-slate-300 hover:bg-slate-50 active:bg-slate-100 text-slate-700 focus-visible:ring-slate-400',
    danger: 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white shadow-xs focus-visible:ring-red-500',
    red: 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white shadow-xs focus-visible:ring-red-500',
    dark: 'bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white shadow-xs focus-visible:ring-slate-700',
  }

  const sizeStyles = {
    xs: 'px-2.5 py-1 text-xs rounded-lg gap-1.5',
    sm: 'px-3.5 py-1.5 text-xs font-bold rounded-xl gap-2',
    md: 'px-4 py-2 text-sm font-bold rounded-xl gap-2',
    lg: 'px-6 py-2.5 text-base font-bold rounded-2xl gap-2.5',
  }

  const baseClasses = 'inline-flex items-center justify-center font-bold transition-all duration-150 cursor-pointer select-none focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none'

  const computedClasses = $derived(cn(
    baseClasses,
    variantStyles[variant] || variantStyles.primary,
    sizeStyles[size] || sizeStyles.md,
    className
  ))

  const isDisabled = $derived(disabled || loading)
  const isComponent = $derived(typeof icon === 'function' && Boolean(icon.prototype))
  const isNativeLink = $derived(
    Boolean(href) && (
      external ||
      rest.target === '_blank' ||
      (rest.download !== undefined && rest.download !== false) ||
      /^(https?:|mailto:|tel:|#|javascript:|blob:|data:|\/storage\/)/i.test(String(href)) ||
      /\/(download|template|export|export-[a-z-]+|print|batch-print)(\/|\?|$)/i.test(String(href))
    )
  )
</script>

{#snippet content()}
  {#if loading}
    <Loader2 class="animate-spin shrink-0 {size === 'xs' ? 'w-3.5 h-3.5' : 'w-4 h-4'}" />
  {:else if icon && iconPosition === 'start'}
    {#if isComponent}
      {@const IconComp = icon}
      <IconComp class="shrink-0 {size === 'xs' ? 'w-3.5 h-3.5' : 'w-4 h-4'}" />
    {:else}
      {@render icon()}
    {/if}
  {/if}

  {#if children}
    {@render children()}
  {/if}

  {#if !loading && icon && iconPosition === 'end'}
    {#if isComponent}
      {@const IconComp = icon}
      <IconComp class="shrink-0 {size === 'xs' ? 'w-3.5 h-3.5' : 'w-4 h-4'}" />
    {:else}
      {@render icon()}
    {/if}
  {/if}
{/snippet}

{#if href}
  {#if isNativeLink}
    <a {href} class={computedClasses} aria-disabled={isDisabled} {onclick} {...rest}>
      {@render content()}
    </a>
  {:else}
    <Link {href} class={computedClasses} aria-disabled={isDisabled} {onclick} {...rest}>
      {@render content()}
    </Link>
  {/if}
{:else}
  <button {type} disabled={isDisabled} {onclick} class={computedClasses} {...rest}>
    {@render content()}
  </button>
{/if}
