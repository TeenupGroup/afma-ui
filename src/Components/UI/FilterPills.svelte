<script>
  import { toPersianDigits } from '../../lib/utils.js'

  /**
   * FilterPills - Responsive Persian filter pill bar with auto Persian counts.
   * Eliminates repetitive button pill rows across admin and panels.
   */
  let {
    items = [],
    value = $bindable(''),
    label = '',
    icon: Icon = null,
    color = 'indigo',
    size = 'sm',
    class: className = '',
    onchange = null,
  } = $props()

  const colorVariants = {
    indigo: {
      active: 'bg-indigo-600 text-white shadow-xs border-indigo-600',
      badge: 'bg-white/20 text-white',
      inactiveBadge: 'bg-slate-100 text-slate-600',
    },
    blue: {
      active: 'bg-blue-600 text-white shadow-xs border-blue-600',
      badge: 'bg-white/20 text-white',
      inactiveBadge: 'bg-slate-100 text-slate-600',
    },
    emerald: {
      active: 'bg-emerald-600 text-white shadow-xs border-emerald-600',
      badge: 'bg-white/20 text-white',
      inactiveBadge: 'bg-slate-100 text-slate-600',
    },
    amber: {
      active: 'bg-amber-600 text-white shadow-xs border-amber-600',
      badge: 'bg-white/20 text-white',
      inactiveBadge: 'bg-slate-100 text-slate-600',
    },
    violet: {
      active: 'bg-violet-600 text-white shadow-xs border-violet-600',
      badge: 'bg-white/20 text-white',
      inactiveBadge: 'bg-slate-100 text-slate-600',
    },
  }

  const activeColor = $derived(colorVariants[color] || colorVariants.indigo)

  const sizeClasses = {
    xs: 'px-2 py-1 text-[11px]',
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-3.5 py-2 text-sm',
  }

  function selectItem(itemValue) {
    value = itemValue
    if (typeof onchange === 'function') {
      onchange(itemValue)
    }
  }
</script>

<div class="flex flex-wrap items-center gap-1.5 {className}">
  {#if label || Icon}
    <span class="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 ml-1">
      {#if Icon}
        <Icon class="h-3.5 w-3.5 shrink-0" />
      {/if}
      {#if label}
        <span>{label}</span>
      {/if}
    </span>
  {/if}

  {#each items as item (item.value ?? item.label)}
    {@const isSelected = String(value) === String(item.value)}
    <button
      type="button"
      onclick={() => selectItem(item.value)}
      aria-pressed={isSelected}
      class="inline-flex items-center gap-1.5 rounded-xl border font-bold transition-all cursor-pointer {sizeClasses[size] || sizeClasses.sm} {
        isSelected
          ? activeColor.active
          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300'
      }"
    >
      {#if item.icon}
        <item.icon class="h-3.5 w-3.5 shrink-0" />
      {/if}
      <span>{item.label}</span>
      {#if item.count !== undefined && item.count !== null}
        <span class="rounded-full px-1.5 py-0.2 text-[10px] font-black {
          isSelected ? activeColor.badge : activeColor.inactiveBadge
        }">
          {toPersianDigits(item.count)}
        </span>
      {/if}
    </button>
  {/each}
</div>
