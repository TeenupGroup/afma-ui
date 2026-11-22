<script>
  import { cn } from '../../lib/utils.js'
  import { Tag, Plus, Check, X, Layers, ExternalLink, Sparkles } from 'lucide-svelte'
  import { Button, Badge } from './index.js'

  let {
    value = $bindable(''),
    categories = [],
    label = 'دسته‌بندی',
    placeholder = 'انتخاب دسته‌بندی...',
    error = '',
    required = false,
    disabled = false,
    showChips = true,
    manageUrl = '/admin/categories',
    onchange = null,
    class: className = '',
  } = $props()

  const EXCLUDED_KEYWORDS = ['موز', 'کشاورزی', 'رویداد پل', 'شهرک مطهر', 'بشاگرد', 'باهوکلات', 'پلدشت', 'قصر شیرین']

  function isExcluded(cat) {
    if (!cat || typeof cat !== 'string') return false
    return EXCLUDED_KEYWORDS.some(k => cat.includes(k))
  }

  // Track locally added categories so user-entered ones persist in current session options
  let localCategories = $state(
    (categories || []).filter(c => !isExcluded(c))
  )
  let isCreatingNew = $state(false)
  let newCategoryName = $state('')
  let newCategoryInputRef = $state(null)

  // Sync incoming categories prop if it updates
  $effect(() => {
    const combined = Array.from(new Set([...categories, ...localCategories, value].filter(Boolean)))
      .filter(cat => cat === value || !isExcluded(cat))
    if (combined.length !== localCategories.length) {
      localCategories = combined
    }
  })

  function handleSelectChange(e) {
    const selected = e.currentTarget.value
    if (selected === '__NEW__') {
      isCreatingNew = true
      setTimeout(() => newCategoryInputRef?.focus(), 50)
      return
    }
    value = selected
    if (onchange) onchange(value)
  }

  function selectCategory(cat) {
    if (disabled) return
    value = cat
    if (onchange) onchange(value)
  }

  function clearCategory() {
    if (disabled) return
    value = ''
    if (onchange) onchange('')
  }

  function handleAddNewCategory(e) {
    if (e) e.preventDefault()
    const trimmed = newCategoryName.trim()
    if (!trimmed) return

    if (!localCategories.includes(trimmed)) {
      localCategories = [...localCategories, trimmed]
    }
    value = trimmed
    newCategoryName = ''
    isCreatingNew = false
    if (onchange) onchange(value)
  }

  function cancelNewCategory() {
    newCategoryName = ''
    isCreatingNew = false
  }

  function handleKeyDownNew(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddNewCategory()
    } else if (e.key === 'Escape') {
      cancelNewCategory()
    }
  }
</script>

<div class={cn("space-y-2 text-right font-sans", className)} dir="rtl">
  <!-- Header with Label and Optional Management Link -->
  <div class="flex items-center justify-between">
    <label for="category-select" class="flex items-center gap-1.5 text-xs font-bold text-slate-700">
      <Tag class="w-3.5 h-3.5 text-indigo-500" />
      <span>{label}</span>
      {#if required}
        <span class="text-rose-500">*</span>
      {/if}
    </label>

    {#if manageUrl}
      <a
        href={manageUrl}
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-indigo-600 transition-colors"
        title="مدیریت دسته‌بندی‌های کلی سامانه"
      >
        <span>مدیریت دسته‌ها</span>
        <ExternalLink class="w-3 h-3" />
      </a>
    {/if}
  </div>

  <!-- Main Dropdown Row -->
  <div class="relative flex items-center">
    <div class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
      <Layers class="w-4 h-4" />
    </div>

    <select
      id="category-select"
      value={value}
      onchange={handleSelectChange}
      {disabled}
      class={cn(
        "w-full bg-slate-50 border transition-all outline-hidden text-slate-800 rounded-xl pr-9 pl-9 py-2.5 text-xs sm:text-sm font-sans",
        error
          ? "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
          : "border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20",
        disabled && "opacity-50 cursor-not-allowed bg-slate-100"
      )}
    >
      <option value="">{placeholder || 'بدون دسته‌بندی / عمومی'}</option>
      {#each localCategories as cat}
        <option value={cat}>{cat}</option>
      {/each}
      <option value="__NEW__" class="font-bold text-indigo-600 bg-indigo-50">✨ + افزودن دسته‌بندی جدید...</option>
    </select>

    {#if value && !disabled}
      <button
        type="button"
        onclick={clearCategory}
        class="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
        title="حذف دسته‌بندی انتخابی"
      >
        <X class="w-3.5 h-3.5" />
      </button>
    {/if}
  </div>

  <!-- Inline New Category Input Box -->
  {#if isCreatingNew}
    <div class="p-3 bg-gradient-to-br from-indigo-50/70 to-slate-50 border border-indigo-100 rounded-xl space-y-2.5 animate-in fade-in zoom-in-95 duration-150">
      <div class="flex items-center justify-between text-xs font-semibold text-indigo-900">
        <span class="flex items-center gap-1">
          <Sparkles class="w-3.5 h-3.5 text-indigo-600" />
          افزودن دسته‌بندی جدید
        </span>
        <button
          type="button"
          onclick={cancelNewCategory}
          class="text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
          title="انصراف"
        >
          <X class="w-3.5 h-3.5" />
        </button>
      </div>

      <div class="flex items-center gap-2">
        <input
          bind:this={newCategoryInputRef}
          bind:value={newCategoryName}
          onkeydown={handleKeyDownNew}
          type="text"
          placeholder="نام دسته‌بندی جدید (مثلاً: مراسم جشن تکلیف، اردوی یزد)"
          class="flex-1 px-3 py-2 text-xs sm:text-sm bg-white border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
        />
        <Button
          type="button"
          size="sm"
          variant="primary"
          onclick={handleAddNewCategory}
          disabled={!newCategoryName.trim()}
        >
          ثبت
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onclick={cancelNewCategory}
        >
          انصراف
        </Button>
      </div>
      <p class="text-[11px] text-slate-500">
        این دسته‌بندی جدید پس از ذخیره، به‌صورت خودکار در فهرست دسته‌بندی‌های کل سامانه ثبت می‌شود.
      </p>
    </div>
  {/if}

  <!-- Quick Selection Pills / Chips -->
  {#if showChips && localCategories.length > 0 && !isCreatingNew}
    <div class="space-y-1.5 pt-1">
      <div class="flex items-center justify-between">
        <span class="text-[11px] font-semibold text-slate-500">دسته‌بندی‌های سریع:</span>
        <button
          type="button"
          onclick={() => { isCreatingNew = true; setTimeout(() => newCategoryInputRef?.focus(), 50) }}
          class="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
        >
          <Plus class="w-3 h-3" />
          <span>دسته‌بندی جدید</span>
        </button>
      </div>

      <div class="flex flex-wrap gap-1.5">
        {#each localCategories as cat}
          {@const isSelected = value === cat}
          <button
            type="button"
            onclick={() => selectCategory(cat)}
            {disabled}
            class={cn(
              "inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg transition-all cursor-pointer font-sans",
              isSelected
                ? "bg-indigo-600 text-white font-bold shadow-xs ring-2 ring-indigo-200"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200/60"
            )}
          >
            {#if isSelected}
              <Check class="w-3 h-3 text-white" />
            {/if}
            <span>{cat}</span>
          </button>
        {/each}
      </div>
    </div>
  {/if}

  {#if error}
    <p class="text-xs text-rose-500 font-bold">{error}</p>
  {/if}
</div>
