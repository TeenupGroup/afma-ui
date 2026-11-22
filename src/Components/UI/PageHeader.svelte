<script>
  import { ChevronLeft } from 'lucide-svelte'
  import { Link } from '@inertiajs/svelte'

  /**
   * PageHeader - Standard responsive page header with breadcrumbs, icon, title, subtitle, and action buttons.
   */
  let {
    title = '',
    subtitle = '',
    icon: Icon = null,
    badge = '',
    breadcrumbs = [],
    actions = undefined,
    class: className = '',
  } = $props()
</script>

<div class="mb-6 space-y-3 {className}">
  {#if breadcrumbs && breadcrumbs.length > 0}
    <nav class="flex items-center gap-1.5 text-xs text-slate-400 font-bold" aria-label="مسیر راهنما">
      {#each breadcrumbs as crumb, idx}
        {#if idx > 0}
          <ChevronLeft class="h-3 w-3 shrink-0 text-slate-300 rtl:rotate-0 ltr:rotate-180" />
        {/if}
        {#if crumb.href && idx < breadcrumbs.length - 1}
          <Link href={crumb.href} class="hover:text-indigo-600 transition-colors">
            {crumb.label}
          </Link>
        {:else}
          <span class="text-slate-600 font-black">{crumb.label}</span>
        {/if}
      {/each}
    </nav>
  {/if}

  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div class="flex items-center gap-3">
      {#if Icon}
        <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 shadow-xs">
          <Icon class="h-5 w-5" />
        </div>
      {/if}
      <div>
        <div class="flex items-center gap-2">
          <h1 class="text-lg sm:text-xl font-black text-slate-800 tracking-tight">
            {title}
          </h1>
          {#if badge}
            <span class="rounded-lg bg-indigo-50 px-2 py-0.5 text-xs font-black text-indigo-600 border border-indigo-100">
              {badge}
            </span>
          {/if}
        </div>
        {#if subtitle}
          <p class="mt-0.5 text-xs text-slate-500 font-bold">
            {subtitle}
          </p>
        {/if}
      </div>
    </div>

    {#if actions}
      <div class="flex flex-wrap items-center gap-2">
        {@render actions()}
      </div>
    {/if}
  </div>
</div>
