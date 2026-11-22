<script>
  import { Link, router, usePage } from '@inertiajs/svelte'
  import { cn, debounce, toPersianDigits, storageUrl, FALLBACK_IMG } from '../../lib/utils.js'
  import { askConfirm } from '../../lib/confirm.svelte.js'
  import JalaliDatePicker from './JalaliDatePicker.svelte'
  import { Button, EmptyState, Input, Select, Spinner } from '../../Components/UI/index.js'
  import {
    ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
    Search, Filter, Download, Trash2, ArrowUpDown, ArrowUp, ArrowDown, X, Loader2, GripVertical
  } from 'lucide-svelte'
  import { jsonHeaders } from '../../lib/api.js'

  let {
    data = [],
    columns = [],
    pagination = null,
    filters = {},
    searchable = true,
    selectable = false,
    actions = [],
    bulkActions = [],
    loading = false,
    emptyTitle = 'داده‌ای یافت نشد',
    emptyDescription = 'هنوز هیچ رکوردی ثبت نشده است.',
    createUrl = null,
    createLabel = 'افزودن',
    canDelete = null,
    onSearch = null,
    onSort = null,
    onFilter = null,
    onPageChange = null,
    onDelete = null,
    onBulkDelete = null,
    onExport = null,
    initialFilterValues = {},
    reorderable = false,
    reorderUrl = null,
    onReorder = null,
    class: className = ''
  } = $props()

  const page = usePage()
  let isSuperAdmin = $derived(page.props.auth?.isSuperAdmin || false)
  let effectiveCanDelete = $derived(canDelete !== null ? canDelete : isSuperAdmin)

  // Restore state from URL (preserved on browser back)
  let urlParams = new URLSearchParams(window.location.search)

  // State
  let items = $state([])
  let draggedRowIndex = $state(null)
  let dragOverRowIndex = $state(null)
  let isReordering = $state(false)
  let searchQuery = $state(urlParams.get('search') || '')
  let selectedRows = $state([])
  let sortColumn = $state(urlParams.get('sort') || null)
  let sortDirection = $state(urlParams.get('direction') || null) // 'asc', 'desc', null

  $effect(() => {
    items = [...(data || [])]
  })
  let showFilters = $state(false)
  let activeFilters = $state({ ...initialFilterValues })
  let currentPage = $state(pagination?.current_page || Number(urlParams.get('page')) || 1)
  let perPage = $state(pagination?.per_page || Number(urlParams.get('per_page')) || 15)

  $effect(() => {
    if (pagination?.current_page !== undefined) {
      currentPage = pagination.current_page
    }
    if (pagination?.per_page !== undefined) {
      perPage = pagination.per_page
    }
  })

  // Sync state from Inertia page URL changes
  $effect(() => {
    const searchString = page.url && page.url.includes('?') ? page.url.substring(page.url.indexOf('?')) : window.location.search
    const currentParams = new URLSearchParams(searchString)
    sortColumn = currentParams.get('sort') || null
    sortDirection = currentParams.get('direction') || null
    searchQuery = currentParams.get('search') || ''
  })

  // Sync activeFilters when initialFilterValues updates, stripping pagination/sort keys
  $effect(() => {
    const clean = { ...initialFilterValues }
    delete clean.sort
    delete clean.direction
    delete clean.search
    delete clean.page
    delete clean.per_page
    activeFilters = clean
  })

  function getCleanFilters() {
    const clean = { ...activeFilters }
    delete clean.sort
    delete clean.direction
    delete clean.search
    delete clean.page
    delete clean.per_page
    Object.keys(clean).forEach(k => {
      if (clean[k] === '' || clean[k] === null || clean[k] === undefined) {
        delete clean[k]
      }
    })
    return clean
  }

  // Debounced search
  const debouncedSearch = debounce((query) => {
    if (onSearch) {
      onSearch(query)
    } else {
      const params = {
        ...getCleanFilters(),
        page: 1,
      }
      if (query) {
        params.search = query
      }
      if (sortColumn) {
        params.sort = sortColumn
        params.direction = sortDirection || 'asc'
      }
      router.get(window.location.pathname, params, { 
        preserveState: true,
        preserveScroll: true 
      })
    }
  }, 300)

  // Handle search input
  function handleSearch(event) {
    searchQuery = event.target.value
    debouncedSearch(searchQuery)
  }

  // Handle sort
  function handleSort(column) {
    if (!column.sortable) return
    
    let newSortColumn = sortColumn
    let newSortDirection = sortDirection

    if (sortColumn === column.key) {
      if (sortDirection === 'asc') {
        newSortDirection = 'desc'
      } else if (sortDirection === 'desc') {
        newSortColumn = null
        newSortDirection = null
      }
    } else {
      newSortColumn = column.key
      newSortDirection = 'asc'
    }

    sortColumn = newSortColumn
    sortDirection = newSortDirection

    if (onSort) {
      onSort(newSortColumn, newSortDirection)
    } else {
      const params = {
        ...getCleanFilters(),
        page: 1,
      }
      if (searchQuery) {
        params.search = searchQuery
      }
      if (newSortColumn) {
        params.sort = newSortColumn
        params.direction = newSortDirection || 'asc'
      }

      router.get(window.location.pathname, params, { 
        preserveState: true,
        preserveScroll: true 
      })
    }
  }

  // Handle filter change
  function handleFilter(key, value) {
    if (value === '' || value === null || value === undefined) {
      delete activeFilters[key]
    } else {
      activeFilters[key] = value
    }
    activeFilters = { ...activeFilters }

    if (onFilter) {
      onFilter(activeFilters)
    } else {
      const params = {
        ...getCleanFilters(),
        page: 1,
      }
      if (searchQuery) {
        params.search = searchQuery
      }
      if (sortColumn) {
        params.sort = sortColumn
        params.direction = sortDirection || 'asc'
      }

      router.get(window.location.pathname, params, { 
        preserveState: true,
        preserveScroll: true 
      })
    }
  }

  // Clear all filters
  function clearFilters() {
    activeFilters = {}
    searchQuery = ''
    if (onFilter) {
      onFilter({})
    } else {
      const params = { page: 1 }
      if (sortColumn) {
        params.sort = sortColumn
        params.direction = sortDirection || 'asc'
      }
      router.get(window.location.pathname, params, { 
        preserveState: true,
        preserveScroll: true 
      })
    }
  }

  // Handle page change
  function handlePageChange(p) {
    currentPage = p
    if (onPageChange) {
      onPageChange(p)
    } else {
      const params = {
        ...getCleanFilters(),
        page: p,
        per_page: perPage,
      }
      if (searchQuery) {
        params.search = searchQuery
      }
      if (sortColumn) {
        params.sort = sortColumn
        params.direction = sortDirection || 'asc'
      }

      router.get(window.location.pathname, params, { 
        preserveState: true,
        preserveScroll: true 
      })
    }
  }

  // Handle per page change
  function handlePerPageChange(newPerPage) {
    perPage = newPerPage
    currentPage = 1
    handlePageChange(1)
  }

  // Toggle row selection
  function toggleRowSelection(row) {
    const index = selectedRows.findIndex(r => r.id === row.id)
    if (index === -1) {
      selectedRows = [...selectedRows, row]
    } else {
      selectedRows = selectedRows.filter(r => r.id !== row.id)
    }
  }

  // Toggle all rows selection
  function toggleAllSelection() {
    if (selectedRows.length === items.length) {
      selectedRows = []
    } else {
      selectedRows = [...items]
    }
  }

  // Handle bulk action
  async function handleBulkAction(action) {
    if (selectedRows.length === 0) return
    
    if (action.confirm) {
      if (!(await askConfirm({ message: action.confirmMessage || `آیا از انجام این عمل برای ${toPersianDigits(selectedRows.length)} مورد اطمینان دارید؟` }))) {
        return
      }
    }

    if (action.handler) {
      action.handler(selectedRows)
    } else if (action.url) {
      router.post(action.url, {
        ids: selectedRows.map(r => r.id)
      }, {
        preserveScroll: true,
        onSuccess: () => {
          selectedRows = []
        }
      })
    }
  }

  // Handle delete
  async function handleDelete(row) {
    if (onDelete) {
      onDelete(row)
    } else if (await askConfirm({ message: 'آیا از حذف این مورد اطمینان دارید؟' })) {
      router.delete(`${window.location.pathname}/${row.id}`, {
        preserveScroll: true
      })
    }
  }

  // Handle bulk delete
  async function handleBulkDelete() {
    if (selectedRows.length === 0) return
    
    if (await askConfirm({ message: `آیا از حذف ${toPersianDigits(selectedRows.length)} مورد انتخاب‌شده اطمینان دارید؟` })) {
      if (onBulkDelete) {
        await onBulkDelete(selectedRows)
        selectedRows = []
      } else {
        router.post(`${window.location.pathname}/bulk-delete`, {
          ids: selectedRows.map(r => r.id)
        }, {
          preserveScroll: true,
          onSuccess: () => {
            selectedRows = []
          }
        })
      }
    }
  }

  // Handle export
  function handleExport(format = 'csv') {
    if (onExport) {
      onExport(format, selectedRows)
    } else {
      const params = new URLSearchParams({
        format,
        ...(selectedRows.length > 0 && { ids: selectedRows.map(r => r.id).join(',') }),
        ...activeFilters
      })
      window.location.href = `${window.location.pathname}/export?${params.toString()}`
    }
  }

  // Get cell value
  function getCellValue(row, column) {
    if (column.getValue) {
      return column.getValue(row)
    }
    return row[column.key]
  }

  // Generate pagination range
  function getPaginationRange() {
    if (!pagination) return []
    
    const total = pagination.last_page
    const current = pagination.current_page
    const delta = 2
    const range = []
    const rangeWithDots = []

    for (let i = 1; i <= total; i++) {
      if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
        range.push(i)
      }
    }

    let prev = null
    for (const i of range) {
      if (prev) {
        if (i - prev === 2) {
          rangeWithDots.push(prev + 1)
        } else if (i - prev !== 1) {
          rangeWithDots.push('...')
        }
      }
      rangeWithDots.push(i)
      prev = i
    }

    return rangeWithDots
  }

  // Drag and drop sorting handlers
  function handleDragStart(e, index) {
    if (!reorderable) return
    draggedRowIndex = index
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(index))
  }

  function handleDragOver(e, index) {
    if (!reorderable || draggedRowIndex === null) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    dragOverRowIndex = index
  }

  function handleDragEnter(e, index) {
    if (!reorderable || draggedRowIndex === null) return
    dragOverRowIndex = index
  }

  function handleDragLeave() {
    // Keep dragOverRowIndex or let it update on next enter
  }

  function handleDragEnd() {
    draggedRowIndex = null
    dragOverRowIndex = null
  }

  async function handleDrop(e, dropIndex) {
    if (!reorderable || draggedRowIndex === null) return
    e.preventDefault()
    const fromIndex = draggedRowIndex
    draggedRowIndex = null
    dragOverRowIndex = null

    if (fromIndex === dropIndex) return

    const updated = [...items]
    const [movedItem] = updated.splice(fromIndex, 1)
    updated.splice(dropIndex, 0, movedItem)
    items = updated

    if (onReorder) {
      onReorder(items)
      return
    }

    if (reorderUrl) {
      isReordering = true
      try {
        const res = await fetch(reorderUrl, {
          method: 'POST',
          headers: jsonHeaders(),
          body: JSON.stringify({
            ids: items.map(r => r.id),
          }),
        })

        if (!res.ok) {
          console.error('Failed to save order')
          items = [...(data || [])]
        } else {
          router.reload({ preserveScroll: true, preserveState: true })
        }
      } catch (err) {
        console.error('Error reordering items:', err)
        items = [...(data || [])]
      } finally {
        isReordering = false
      }
    }
  }

  // Count active filters
  let activeFilterCount = $derived(Object.keys(activeFilters).filter(k => activeFilters[k]).length)
</script>

<div class={cn("bg-white rounded-xl border border-gray-200", className)} dir="rtl">
  <!-- Header -->
  <div class="p-4 border-b border-gray-100">
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div class="flex items-center gap-3 flex-1 w-full sm:w-auto">
        {#if searchable}
          <div class="flex-1 max-w-md">
            <Input
              type="text"
              placeholder="جستجو..."
              bind:value={searchQuery}
              oninput={handleSearch}
              startIcon={Search}
            >
              {#snippet endIcon()}
                {#if searchQuery}
                  <button
                    type="button"
                    onclick={() => { searchQuery = ''; debouncedSearch('') }}
                    class="cursor-pointer hover:text-slate-600 transition-colors"
                    aria-label="پاک کردن جستجو"
                  >
                    <X class="w-3.5 h-3.5" />
                  </button>
                {/if}
              {/snippet}
            </Input>
          </div>
        {/if}
        
        {#if Object.keys(filters).length > 0}
          <Button
            type="button"
            variant="outline"
            size="sm"
            class={showFilters ? "border-indigo-500 bg-indigo-50 text-indigo-700" : ""}
            onclick={() => showFilters = !showFilters}
            aria-expanded={showFilters}
          >
            <Filter class="w-4 h-4" />
            فیلترها
            {#if activeFilterCount > 0}
              <span class="w-5 h-5 flex items-center justify-center text-xs bg-indigo-600 text-white rounded-full">
                {toPersianDigits(activeFilterCount)}
              </span>
            {/if}
          </Button>
        {/if}
      </div>

      <div class="flex items-center gap-2">
        {#if selectedRows.length > 0 && bulkActions.length > 0}
          <div class="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 rounded-xl">
            <span class="text-sm text-indigo-700">
              {toPersianDigits(selectedRows.length)} مورد انتخاب شده
            </span>
            {#each bulkActions as action}
              <Button
                type="button"
                variant={action.variant === 'danger' ? 'danger' : 'primary'}
                size="xs"
                icon={action.icon || undefined}
                onclick={() => handleBulkAction(action)}
              >
                {action.label}
              </Button>
            {/each}
          </div>
        {/if}

        {#if selectedRows.length > 0 && effectiveCanDelete}
          <Button
            type="button"
            variant="rose"
            size="sm"
            icon={Trash2}
            onclick={handleBulkDelete}
          >
            حذف
          </Button>
        {/if}

        {#if onExport}
          <Button
            type="button"
            variant="outline"
            size="sm"
            icon={Download}
            onclick={() => handleExport('csv')}
          >
            خروجی
          </Button>
        {/if}

        {#if createUrl}
          <Button href={createUrl} variant="primary" size="sm">{createLabel}</Button>
        {/if}
      </div>
    </div>

    <!-- Filters -->
    {#if showFilters && Object.keys(filters).length > 0}
      <div class="mt-4 pt-4 border-t border-gray-100">
        <div class="flex flex-wrap items-center gap-3">
          {#each Object.entries(filters) as [key, filter]}
            <div class="flex items-center gap-2">
              <span class="text-sm text-slate-600 whitespace-nowrap">{filter.label}:</span>
              {#if filter.type === 'select'}
                <Select
                  size="sm"
                  value={activeFilters[key] || ''}
                  onchange={(e) => handleFilter(key, e.target.value)}
                >
                  <option value="">همه</option>
                  {#each filter.options as option}
                    <option value={option.value}>{option.label}</option>
                  {/each}
                </Select>
              {:else if filter.type === 'date'}
                <JalaliDatePicker
                  value={activeFilters[key] || ''}
                  onchange={(val) => handleFilter(key, val)}
                  placeholder={filter.placeholder || 'انتخاب تاریخ'}
                  clearable
                />
              {:else}
                <Input
                  size="sm"
                  type="text"
                  placeholder={filter.placeholder || ''}
                  value={activeFilters[key] || ''}
                  oninput={(e) => handleFilter(key, e.target.value)}
                />
              {/if}
            </div>
          {/each}
          
          {#if activeFilterCount > 0}
            <Button
              type="button"
              variant="ghost"
              size="xs"
              icon={X}
              onclick={clearFilters}
            >
              پاک کردن فیلترها
            </Button>
          {/if}
        </div>
      </div>
    {/if}
  </div>

  <!-- Table -->
  <div class="overflow-x-auto">
    <table class="w-full">
      <thead>
        <tr class="border-b border-gray-100">
          {#if reorderable}
            <th class="w-10 px-3 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider" title="جابجایی ترتیب">
              {#if isReordering}
                <Spinner size="sm" color="indigo" />
              {:else}
                <GripVertical class="w-4 h-4 text-gray-400 mx-auto" />
              {/if}
            </th>
          {/if}
          {#if selectable}
            <th class="w-10 px-4 py-3">
              <input
                type="checkbox"
                checked={selectedRows.length === items.length && items.length > 0}
                onchange={toggleAllSelection}
                class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </th>
          {/if}
          {#each columns as column}
            <th 
              class={cn(
                "px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider",
                column.sortable && "cursor-pointer hover:text-gray-700 select-none",
                column.class
              )}
              onclick={() => handleSort(column)}
            >
              <div class="flex items-center gap-1">
                {column.label}
                {#if column.sortable}
                  {#if sortColumn === column.key}
                    {#if sortDirection === 'asc'}
                      <ArrowUp class="w-3.5 h-3.5 text-blue-600" />
                    {:else}
                      <ArrowDown class="w-3.5 h-3.5 text-blue-600" />
                    {/if}
                  {:else}
                    <ArrowUpDown class="w-3.5 h-3.5 text-gray-400" />
                  {/if}
                {/if}
              </div>
            </th>
          {/each}
          {#if actions.length > 0}
            <th class="w-20 px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
              عملیات
            </th>
          {/if}
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-50">
        {#if loading}
          {#each Array(5) as _}
            <tr>
              {#if reorderable}
                <td class="px-3 py-3">
                  <div class="w-4 h-4 bg-gray-200 rounded animate-pulse mx-auto"></div>
                </td>
              {/if}
              {#if selectable}
                <td class="px-4 py-3">
                  <div class="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                </td>
              {/if}
              {#each columns as _}
                <td class="px-4 py-3">
                  <div class="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                </td>
              {/each}
              {#if actions.length > 0}
                <td class="px-4 py-3">
                  <div class="h-4 bg-gray-200 rounded animate-pulse w-1/2 mx-auto"></div>
                </td>
              {/if}
            </tr>
          {/each}
        {:else if items.length === 0}
          <tr>
            <td
              colspan={columns.length + (selectable ? 1 : 0) + (actions.length > 0 ? 1 : 0) + (reorderable ? 1 : 0)}
              class="px-4 py-0 text-center"
            >
              <EmptyState
                icon={Search}
                title={emptyTitle}
                description={emptyDescription}
                class="border-0 bg-transparent shadow-none"
              >
                {#snippet action()}
                  {#if createUrl}
                    <Button href={createUrl} variant="primary" size="sm">{createLabel}</Button>
                  {/if}
                {/snippet}
              </EmptyState>
            </td>
          </tr>
        {:else}
          {#each items as row, index (row.id)}
            <tr class={cn(
              "hover:bg-gray-50 transition-colors",
              selectedRows.some(r => r.id === row.id) && "bg-blue-50/50",
              reorderable && draggedRowIndex === index && "opacity-40 bg-gray-100",
              reorderable && dragOverRowIndex === index && "border-t-2 border-blue-500"
            )}
              draggable={reorderable}
              ondragstart={(e) => handleDragStart(e, index)}
              ondragover={(e) => handleDragOver(e, index)}
              ondragenter={(e) => handleDragEnter(e, index)}
              ondragleave={handleDragLeave}
              ondragend={handleDragEnd}
              ondrop={(e) => handleDrop(e, index)}
            >
              {#if reorderable}
                <td class="w-10 px-3 py-3 text-center text-gray-400 cursor-grab active:cursor-grabbing select-none" title="برای جابجایی ترتیب بکشید">
                  <GripVertical class="w-4 h-4 mx-auto hover:text-gray-600 transition-colors" />
                </td>
              {/if}
              {#if selectable}
                <td class="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedRows.some(r => r.id === row.id)}
                    onchange={() => toggleRowSelection(row)}
                    class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </td>
              {/if}
              {#each columns as column}
                <td class={cn("px-4 py-3 text-sm text-gray-700 align-middle", column.cellClass)}>
                  {#if column.render}
                    {@html column.render(getCellValue(row, column), row)}
                  {:else if column.type === 'image'}
                    {@const val = getCellValue(row, column)}
                    {#if val}
                      <img
                        src={storageUrl(val)}
                        alt=""
                        onerror={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMG }}
                        class={cn(
                          "object-cover rounded-lg",
                          column.circular ? "w-10 h-10 rounded-full" : "w-14 h-14"
                        )}
                        style={column.height ? `height: ${column.height}px; width: auto;` : ''}
                      />
                    {:else}
                      <div class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                      </div>
                    {/if}
                  {:else}
                    {getCellValue(row, column) ?? '-'}
                  {/if}
                </td>
              {/each}
              {#if actions.length > 0}
                <td class="px-4 py-3">
                  <div class="flex items-center justify-center gap-1">
                    {#each actions as action}
                      {#if (action.variant !== 'danger' || effectiveCanDelete) && (action.show ? action.show(row) : true)}
                        <Link
                          href={action.href ? action.href(row) : '#'}
                          onclick={action.handler ? () => action.handler(row) : undefined}
                          class={cn(
                            "p-1.5 rounded-lg transition-colors",
                            action.variant === 'danger' 
                              ? "text-red-600 hover:bg-red-50" 
                              : "text-gray-600 hover:bg-gray-100"
                          )}
                          title={action.label}
                        >
                          {#if action.icon}
                            <action.icon class="w-4 h-4" />
                          {/if}
                        </Link>
                      {/if}
                    {/each}
                  </div>
                </td>
              {/if}
            </tr>
          {/each}
        {/if}
      </tbody>
    </table>
  </div>

  <!-- Pagination -->
  {#if pagination && pagination.last_page > 1}
    <div class="p-4 border-t border-gray-100">
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-2 text-sm text-slate-600">
          <span>نمایش</span>
          <Select
            size="sm"
            class="w-20"
            value={perPage}
            onchange={(e) => handlePerPageChange(Number(e.target.value))}
          >
            {#each [10, 15, 25, 50, 100] as size}
              <option value={size}>{toPersianDigits(size)}</option>
            {/each}
          </Select>
          <span>از {toPersianDigits(pagination.total)} مورد</span>
        </div>

        <div class="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            class="px-2"
            icon={ChevronsRight}
            onclick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            aria-label="صفحه اول"
          ></Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            class="px-2"
            icon={ChevronRight}
            onclick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="صفحه قبل"
          ></Button>

          {#each getPaginationRange() as page}
            {#if page === '...'}
              <span class="px-2 py-1 text-slate-400">...</span>
            {:else}
              <Button
                type="button"
                variant={currentPage === page ? 'primary' : 'ghost'}
                size="sm"
                class={currentPage === page ? '' : 'w-9 px-0'}
                onclick={() => handlePageChange(page)}
                aria-label="صفحه {toPersianDigits(page)}"
                aria-current={currentPage === page ? 'page' : undefined}
              >
                {toPersianDigits(page)}
              </Button>
            {/if}
          {/each}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            class="px-2"
            icon={ChevronLeft}
            onclick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === pagination.last_page}
            aria-label="صفحه بعد"
          ></Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            class="px-2"
            icon={ChevronsLeft}
            onclick={() => handlePageChange(pagination.last_page)}
            disabled={currentPage === pagination.last_page}
            aria-label="صفحه آخر"
          ></Button>
        </div>
      </div>
    </div>
  {/if}
</div>
