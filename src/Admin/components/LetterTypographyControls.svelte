<script>
  import { Switch, Badge } from '../../Components/UI/index.js'
  import { toPersianDigits } from '../../lib/utils.js'
  import { Type, Minimize2, RotateCcw, AlertTriangle, CheckCircle2 } from 'lucide-svelte'

  let {
    fontSize = $bindable(11),
    lineHeight = $bindable(1.95),
    fitToOnePage = $bindable(false),
    effectiveFontSize = 11,
    isAutoShrunk = false,
    overflowsPage = false,
  } = $props()

  const lineHeightPresets = [
    { value: 1.45, label: 'فشرده' },
    { value: 1.7, label: 'متوسط' },
    { value: 1.95, label: 'استاندارد' },
    { value: 2.2, label: 'باز' },
  ]

  const isModified = $derived(
    Number(fontSize) !== 11 || Number(lineHeight) !== 1.95 || Boolean(fitToOnePage)
  )

  function stepFont(delta) {
    const next = Math.round((Number(fontSize || 11) + delta) * 2) / 2
    fontSize = Math.max(6, Math.min(18, next))
  }

  function resetDefaults() {
    fontSize = 11
    lineHeight = 1.95
    fitToOnePage = false
  }
</script>

<div class="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5 space-y-3" dir="rtl">
  <!-- Top row: Auto-fit toggle & live page-fit status -->
  <div class="flex flex-wrap items-center justify-between gap-2.5">
    <Switch
      bind:checked={fitToOnePage}
      color="indigo"
      size="sm"
      label="جا دادن خودکار در یک صفحه"
      description="در صورت سرریز متن، اندازه قلم و فاصله خطوط به‌صورت هوشمند متناسب با فضای یک برگ تنظیم می‌شود"
    />

    <div class="flex items-center gap-2 shrink-0">
      {#if fitToOnePage && isAutoShrunk}
        <Badge color="emerald" size="xs" icon={CheckCircle2}>
          تنظیم خودکار در ۱ صفحه ({toPersianDigits(effectiveFontSize)} پوینت)
        </Badge>
      {:else if overflowsPage && !fitToOnePage}
        <Badge color="amber" size="xs" icon={AlertTriangle}>
          سرریز به صفحه دوم
        </Badge>
        <button
          type="button"
          onclick={() => (fitToOnePage = true)}
          class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold transition-colors cursor-pointer"
        >
          <Minimize2 class="w-3 h-3" />
          <span>جمع کن در ۱ صفحه</span>
        </button>
      {:else}
        <Badge color="emerald" size="xs" icon={CheckCircle2}>
          در ۱ صفحه جا شده
        </Badge>
      {/if}
    </div>
  </div>

  <!-- Bottom row: Manual font size & line spacing controls -->
  <div class="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-slate-200/70">
    <!-- Font size stepper + slider -->
    <div class="flex flex-wrap items-center gap-2">
      <span class="inline-flex items-center gap-1 text-xs font-bold text-slate-600">
        <Type class="w-3.5 h-3.5 text-indigo-600" />
        <span>اندازه قلم:</span>
      </span>

      <div class="inline-flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5">
        <button
          type="button"
          onclick={() => stepFont(-0.5)}
          disabled={fontSize <= 6}
          class="w-6 h-6 rounded-md text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition-colors cursor-pointer"
          title="کوچک کردن فونت"
          aria-label="کوچک کردن فونت"
        >
          -
        </button>
        <span class="min-w-[58px] text-center text-xs font-bold text-slate-800">
          {toPersianDigits(fontSize)} پوینت
        </span>
        <button
          type="button"
          onclick={() => stepFont(0.5)}
          disabled={fontSize >= 18}
          class="w-6 h-6 rounded-md text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition-colors cursor-pointer"
          title="بزرگ کردن فونت"
          aria-label="بزرگ کردن فونت"
        >
          +
        </button>
      </div>

      <input
        type="range"
        min="6"
        max="18"
        step="0.5"
        bind:value={fontSize}
        aria-label="تنظیم اندازه قلم متن نامه"
        class="w-24 sm:w-28 accent-indigo-600 cursor-pointer"
      />
    </div>

    <!-- Line height presets + reset -->
    <div class="flex flex-wrap items-center gap-1.5">
      <span class="text-xs font-bold text-slate-500">فاصله خطوط:</span>
      <div class="inline-flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5">
        {#each lineHeightPresets as preset}
          <button
            type="button"
            onclick={() => (lineHeight = preset.value)}
            class="px-2 py-0.5 rounded-md text-[11px] font-bold transition-colors cursor-pointer {Math.abs(Number(lineHeight) - preset.value) < 0.06 ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'}"
          >
            {preset.label}
          </button>
        {/each}
      </div>

      {#if isModified}
        <button
          type="button"
          onclick={resetDefaults}
          class="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 transition-colors cursor-pointer"
          title="بازنشانی تنظیمات قلم به حالت پیش‌فرض"
        >
          <RotateCcw class="w-3 h-3" />
          <span>بازنشانی</span>
        </button>
      {/if}
    </div>
  </div>
</div>
