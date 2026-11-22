<script>
  import { syncQueue } from '../../lib/syncQueue.svelte.js'
  import { WifiOff, RefreshCw, CheckCircle2 } from 'lucide-svelte'
  import { toPersianDigits } from '../../lib/utils.js'

  let isOnline = $derived(syncQueue.isOnline)
  let count = $derived(syncQueue.count)
  let isSyncing = $derived(syncQueue.isSyncing)
</script>

{#if !isOnline || count > 0}
  <aside
    class="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 flex items-center gap-2.5 px-3.5 py-2 rounded-2xl border backdrop-blur-md shadow-xl text-xs font-bold transition-all animate-in fade-in slide-in-from-bottom-2 {
      !isOnline
        ? 'bg-rose-950/90 text-rose-100 border-rose-800/80 shadow-rose-950/30'
        : 'bg-slate-900/90 text-slate-100 border-slate-700/80 shadow-slate-950/30'
    }"
    role="status"
    aria-live="polite"
    dir="rtl"
  >
    <div class="flex items-center gap-2">
      {#if !isOnline}
        <span class="flex h-2 w-2 relative">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
        </span>
        <WifiOff class="w-4 h-4 text-rose-400 shrink-0" />
        <span>حالت آفلاین</span>
      {:else}
        <CheckCircle2 class="w-4 h-4 text-emerald-400 shrink-0" />
        <span>ارتباط متصل</span>
      {/if}

      {#if count > 0}
        <span class="text-slate-300">
          • {toPersianDigits(count)} تغییر در صف همگام‌سازی
        </span>
      {/if}
    </div>

    {#if isOnline && count > 0}
      <button
        type="button"
        onclick={() => syncQueue.flush()}
        disabled={isSyncing}
        class="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold transition-colors cursor-pointer mr-1 disabled:opacity-50"
      >
        <RefreshCw class="w-3 h-3 {isSyncing ? 'animate-spin' : ''}" />
        <span>همگام‌سازی</span>
      </button>
    {/if}
  </aside>
{/if}
