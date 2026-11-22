<script>
  import { Link } from '@inertiajs/svelte'
  import { Inbox } from 'lucide-svelte'

  let {
    icon = Inbox,
    image = null,
    imageAlt = '',
    title = 'موردی یافت نشد',
    description = 'در حال حاضر هیچ داده‌ای برای نمایش وجود ندارد.',
    actionLabel = null,
    actionUrl = null,
    onaction = null,
    action = undefined,
    bare = false,
    class: className = '',
    children = undefined,
    ...rest
  } = $props()

  const isComponent = $derived(typeof icon === 'function' && Boolean(icon.prototype))
  const frameClass = $derived(
    bare
      ? 'px-4 py-6 sm:py-8'
      : 'py-12 px-4 rounded-3xl bg-slate-50/60 border border-slate-200/60'
  )
</script>

<div
  class="flex flex-col items-center justify-center text-center {frameClass} {className}"
  dir="rtl"
  {...rest}
>
  {#if image}
    <div class="mb-4 w-44 sm:w-52 overflow-hidden rounded-2xl bg-slate-100/80 p-1.5 border border-slate-200/70 shadow-2xs">
      <img
        src={image}
        alt={imageAlt}
        aria-hidden={imageAlt ? undefined : 'true'}
        class="aspect-video w-full rounded-xl object-cover"
        loading="lazy"
        width="512"
        height="288"
      />
    </div>
  {:else}
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
  {/if}

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
