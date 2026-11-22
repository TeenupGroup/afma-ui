<script>
  import { Search, X } from 'lucide-svelte'
  import { toPersianDigits } from '../../lib/utils.js'

  let {
    search = $bindable(''),
    placeholder = 'جستجو...',
    categories = [],
    activeCategory = $bindable(''),
    allLabel = 'همه',
    color = 'primary',
    extraFilters = null,
    onsearch = null,
    oncategorychange = null
  } = $props()

  let searchTimeout = null

  function handleInput(e) {
    search = e.target.value
    if (onsearch) {
      clearTimeout(searchTimeout)
      searchTimeout = setTimeout(() => {
        onsearch(search)
      }, 300)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      clearTimeout(searchTimeout)
      if (onsearch) onsearch(search)
    }
  }

  function clearSearch() {
    search = ''
    if (onsearch) onsearch('')
  }

  function selectCategory(cat) {
    const value = typeof cat === 'object' && cat !== null ? cat.value : cat
    activeCategory = value
    if (oncategorychange) oncategorychange(value)
  }

  function getCatLabel(cat) {
    if (typeof cat === 'object' && cat !== null) return cat.label || cat.name || cat.value
    return cat
  }

  function getCatValue(cat) {
    if (typeof cat === 'object' && cat !== null) return cat.value ?? cat.slug ?? cat.name
    return cat
  }

  function getCatCount(cat) {
    if (typeof cat === 'object' && cat !== null && cat.count !== undefined) return cat.count
    return null
  }
</script>

<div class="flex flex-col gap-4 mb-8">
  <div class="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
    <!-- Search Bar -->
    <div class="relative flex-1">
      <div class="absolute inset-y-0 start-0 flex items-center ps-4 pointer-events-none text-slate-400">
        <Search class="w-4 h-4" />
      </div>
      <input
        type="search"
        value={search}
        oninput={handleInput}
        onkeydown={handleKeyDown}
        {placeholder}
        dir="rtl"
        class="w-full ps-11 pe-10 py-3 rounded-2xl bg-white border border-slate-200 text-slate-800 placeholder:text-slate-400 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-sm transition-all"
      />
      {#if search}
        <button
          type="button"
          onclick={clearSearch}
          class="absolute inset-y-0 end-0 flex items-center pe-3.5 text-slate-400 hover:text-slate-600 transition-colors"
          aria-label="پاک کردن جستجو"
        >
          <X class="w-4 h-4" />
        </button>
      {/if}
    </div>

    <!-- Extra Filter Slot -->
    {#if extraFilters}
      <div class="flex items-center gap-2">
        {@render extraFilters()}
      </div>
    {/if}
  </div>

  <!-- Categories Flex Wrap (No horizontal scrollbar per AGENTS.md) -->
  {#if categories && categories.length > 0}
    <div class="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onclick={() => selectCategory('')}
        class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm {
          !activeCategory
            ? 'bg-blue-600 text-white shadow-blue-600/20'
            : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80 hover:border-slate-300'
        }"
      >
        <span>{allLabel}</span>
      </button>

      {#each categories as cat}
        {@const val = getCatValue(cat)}
        {@const label = getCatLabel(cat)}
        {@const count = getCatCount(cat)}
        {@const isSelected = activeCategory === val}
        <button
          type="button"
          onclick={() => selectCategory(val)}
          class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm {
            isSelected
              ? 'bg-blue-600 text-white shadow-blue-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80 hover:border-slate-300'
          }"
        >
          <span>{label}</span>
          {#if count !== null}
            <span class="px-1.5 py-0.5 rounded-full text-[10px] {
              isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
            }">
              {toPersianDigits(count)}
            </span>
          {/if}
        </button>
      {/each}
    </div>
  {/if}
</div>
