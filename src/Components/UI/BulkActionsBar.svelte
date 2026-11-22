<script>
  import { toPersianDigits } from '../../lib/utils.js'
  import { X, CheckSquare } from 'lucide-svelte'

  /**
   * BulkActionsBar - Floating/sticky bottom toolbar for batch operations.
   * Renders when items are selected with Persian count, clear button, and slot for actions.
   */
  let {
    selectedCount = 0,
    itemLabel = 'مورد',
    onClear = null,
    class: className = '',
    children = undefined,
  } = $props()
</script>

{#if selectedCount > 0}
  <div
    class="fixed bottom-6 inset-x-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 z-40 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-700 bg-slate-900/95 px-4 py-3 text-white shadow-2xl backdrop-blur-md transition-all sm:min-w-[480px] {className}"
    role="region"
    aria-label="عملیات گروهی"
  >
    <div class="flex items-center gap-2.5">
      <div class="flex h-7 w-7 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
        <CheckSquare class="h-4 w-4" />
      </div>
      <div class="text-xs font-bold">
        <span>{toPersianDigits(selectedCount)}</span>
        <span class="text-slate-300 mr-1">{itemLabel} انتخاب شده</span>
      </div>

      {#if onClear}
        <button
          type="button"
          onclick={onClear}
          class="mr-2 inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
          title="لغو انتخاب همه"
        >
          <X class="h-3 w-3" />
          <span>لغو</span>
        </button>
      {/if}
    </div>

    <div class="flex items-center gap-2">
      {@render children?.()}
    </div>
  </div>
{/if}
