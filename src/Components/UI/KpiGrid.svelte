<script>
  import { toPersianDigits } from '../../lib/utils.js'

  /**
   * KpiGrid - Unified responsive KPI and statistics metric cards grid.
   * Enforces Persian numerals, responsive wrap (no horizontal scroll), and RTL alignment.
   */
  let {
    items = [],
    cols = null,
    class: className = '',
  } = $props()

  const defaultGridCols = 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6'
  const colClassMap = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5',
    6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
  }

  const iconColors = {
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    slate: 'bg-slate-50 text-slate-600 border-slate-100',
  }
</script>

<div class="grid {cols ? (colClassMap[cols] || defaultGridCols) : defaultGridCols} gap-3 {className}">
  {#each items as item (item.label)}
    {@const colorClass = iconColors[item.color] || iconColors.indigo}
    <div class="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-xs transition-all hover:border-slate-300">
      <div class="flex items-center justify-between gap-2">
        <span class="text-xs font-bold text-slate-500 truncate">{item.label}</span>
        {#if item.icon}
          <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border {colorClass}">
            <item.icon class="h-3.5 w-3.5" />
          </div>
        {/if}
      </div>

      <div class="mt-2 flex items-baseline justify-between gap-2">
        <span class="text-xl font-black text-slate-800 tracking-tight">
          {toPersianDigits(item.value ?? 0)}
        </span>
        {#if item.unit}
          <span class="text-[11px] font-bold text-slate-400">{item.unit}</span>
        {/if}
      </div>

      {#if item.hint || item.sub}
        <p class="mt-1 text-[11px] font-bold text-slate-400 truncate">
          {item.hint || item.sub}
        </p>
      {/if}
    </div>
  {/each}
</div>
