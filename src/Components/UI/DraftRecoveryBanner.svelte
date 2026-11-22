<script>
  import { RotateCcw, Trash2, FileEdit, X } from 'lucide-svelte'
  import { toPersianDigits } from '../../lib/utils.js'

  let {
    savedAt = '',
    onRestore = undefined,
    onDiscard = undefined,
    class: className = '',
  } = $props()

  let visible = $state(true)

  function handleDiscard() {
    visible = false
    onDiscard?.()
  }

  function handleRestore() {
    onRestore?.()
  }
</script>

{#if visible}
  <div
    class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-amber-50/90 border border-amber-200/90 text-amber-900 shadow-xs mb-5 animate-in fade-in duration-200 {className}"
    role="alert"
    dir="rtl"
  >
    <div class="flex items-center gap-2.5">
      <div class="p-1.5 rounded-xl bg-amber-100 text-amber-700 shrink-0">
        <FileEdit class="w-4 h-4" />
      </div>
      <div class="text-xs sm:text-sm">
        <span class="font-bold">پیش‌نویس ذخیره‌شده یافت شد!</span>
        {#if savedAt}
          <span class="text-amber-700 font-medium mr-1">
            آخرین ویرایش ذخیره‌نشده در {toPersianDigits(savedAt)}.
          </span>
        {/if}
      </div>
    </div>

    <div class="flex items-center gap-2 shrink-0 mr-auto sm:mr-0">
      {#if onRestore}
        <button
          type="button"
          onclick={handleRestore}
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs"
        >
          <RotateCcw class="w-3.5 h-3.5" />
          <span>بازیابی پیش‌نویس</span>
        </button>
      {/if}

      {#if onDiscard}
        <button
          type="button"
          onclick={handleDiscard}
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 hover:bg-white text-slate-600 hover:text-rose-600 border border-amber-200 text-xs font-bold transition-colors cursor-pointer"
          title="پاک‌سازی پیش‌نویس"
        >
          <Trash2 class="w-3.5 h-3.5" />
          <span>حذف</span>
        </button>
      {/if}
    </div>
  </div>
{/if}
