<script>
  import { Link } from '@inertiajs/svelte'
  import { Inbox } from 'lucide-svelte'

  let {
    icon = Inbox,
    title = 'موردی یافت نشد',
    description = 'در حال حاضر هیچ داده‌ای برای نمایش وجود ندارد.',
    actionLabel = null,
    actionUrl = null,
    onaction = null,
    action = undefined,
    class: className = '',
    children = undefined,
    ...rest
  } = $props()

  const isComponent = $derived(typeof icon === 'function' && Boolean(icon.prototype))
</script>

<div
  class="flex flex-col items-center justify-center text-center py-12 px-4 rounded-3xl bg-slate-50/60 border border-slate-200/60 {className}"
  dir="rtl"
  {...rest}
>
  <div class="w-16 h-16 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-center mb-4 text-slate-400">
    {#if isComponent}
      {@const IconComp = icon}
      <IconComp class="w-8 h-8" />
    {:else if icon}
      {@render icon()}
    {:else}
      <Inbox class="w-8 h-8" />
    {/if}
  </div>

  <h3 class="text-base font-bold text-slate-700 mb-1">{title}</h3>
  {#if description}
    <p class="text-xs text-slate-400 max-w-sm mb-5 leading-relaxed">{description}</p>
  {/if}

  {#if action}
    {@render action()}
  {:else if actionLabel && actionUrl}
    <Link
      href={actionUrl}
      class="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
    >
      {actionLabel}
    </Link>
  {:else if actionLabel && onaction}
    <button
      type="button"
      onclick={onaction}
      class="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
    >
      {actionLabel}
    </button>
  {/if}

  {#if children}
    <div class="mt-4">
      {@render children()}
    </div>
  {/if}
</div>
