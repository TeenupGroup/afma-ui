<script>
  import { School, Users, ClipboardList, Eye, PenLine, Trash2, ArrowUp, ArrowDown } from 'lucide-svelte'
  import { toPersianDigits, persianDigits } from '../../lib/utils.js'
  import Badge from './Badge.svelte'

  /**
   * @typedef {Object} ClassCardProps
   * @property {Object} cls - Class model object
   * @property {string} [href]
   * @property {string} [rosterHref]
   * @property {(cls: Object) => void} [onedit]
   * @property {(cls: Object) => void} [ondelete]
   * @property {(id: number|string, direction: 'up'|'down') => void} [onmove]
   * @property {number|string|null} [movingId=null]
   * @property {boolean} [showActions=true]
   * @property {boolean} [showReorder=true]
   * @property {boolean} [showRoster=true]
   * @property {string} [dataTestid='class-item']
   * @property {string} [class='']
   */

  /** @type {ClassCardProps} */
  let {
    cls,
    href = '',
    rosterHref = '',
    onedit = null,
    ondelete = null,
    onmove = null,
    movingId = null,
    showActions = true,
    showReorder = true,
    showRoster = true,
    dataTestid = 'class-item',
    class: className = '',
  } = $props()

  const destination = $derived(
    href || `/panel/principal/classes/${cls?.id}`
  )

  const printUrl = $derived(
    rosterHref || `/panel/principal/class-roster-print?class_id=${cls?.id}`
  )

  const isMoving = $derived(movingId !== null && movingId === cls?.id)
</script>

<div
  class="bg-white border border-slate-200/80 rounded-2xl p-5 hover:shadow-md hover:border-slate-300 transition-all duration-200 group flex flex-col justify-between {className}"
  data-testid={dataTestid || undefined}
  dir="rtl"
>
  <div>
    <!-- Header: Icon & Action toolbar -->
    <div class="flex items-start justify-between mb-3.5">
      <div class="w-11 h-11 rounded-xl flex items-center justify-center border bg-slate-50 border-slate-200/80 text-slate-700 transition-all group-hover:scale-105 group-hover:bg-slate-100 group-hover:text-slate-900 shadow-2xs">
        <School class="w-5 h-5 text-slate-600 group-hover:text-slate-900" />
      </div>

      {#if showActions}
        <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {#if showRoster}
            <a
              href={printUrl}
              title="چاپ لیست کلاسی و فرم نمره‌دهی"
              class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <ClipboardList class="w-4 h-4" />
            </a>
          {/if}

          <a
            href={destination}
            title="مشاهده کلاس"
            class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-indigo-600 transition-colors"
          >
            <Eye class="w-4 h-4" />
          </a>

          {#if onedit}
            <button
              type="button"
              onclick={() => onedit(cls)}
              title="ویرایش"
              class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <PenLine class="w-4 h-4" />
            </button>
          {/if}

          {#if ondelete}
            <button
              type="button"
              onclick={() => ondelete(cls)}
              title="حذف"
              data-testid="class-delete-btn"
              class="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          {/if}
        </div>
      {/if}
    </div>

    <!-- Title & Grade/Major Badge -->
    <a href={destination} class="block group/link">
      <div class="flex items-center justify-between gap-2">
        <h3 class="font-bold text-slate-900 group-hover/link:text-indigo-600 transition-colors truncate">
          {cls?.name || 'کلاس'}
        </h3>
        {#if cls?.grade || cls?.major}
          <Badge variant="slate" size="xs">
            {cls.grade || ''}{#if cls.grade && cls.major} — {/if}{cls.major || ''}
          </Badge>
        {/if}
      </div>

      {#if cls?.description}
        <p class="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
          {cls.description}
        </p>
      {/if}
    </a>
  </div>

  <!-- Footer: Student Count & Reorder arrows -->
  <div class="flex items-center justify-between mt-4 pt-3 border-t border-slate-100" use:persianDigits>
    <div class="flex items-center gap-1.5 text-slate-500 text-xs">
      <Users class="w-4 h-4 text-slate-400 shrink-0" />
      <span>{toPersianDigits(cls?.students_count ?? 0)} هنرجو</span>
    </div>

    {#if showReorder && onmove}
      <div class="flex items-center gap-1">
        <button
          type="button"
          onclick={(e) => { e.stopPropagation(); onmove(cls.id, 'up') }}
          disabled={movingId !== null}
          title="انتقال به بالا"
          class="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 active:scale-95 disabled:opacity-40 transition-all cursor-pointer"
        >
          <ArrowUp class="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onclick={(e) => { e.stopPropagation(); onmove(cls.id, 'down') }}
          disabled={movingId !== null}
          title="انتقال به پایین"
          class="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 active:scale-95 disabled:opacity-40 transition-all cursor-pointer"
        >
          <ArrowDown class="w-3.5 h-3.5" />
        </button>
      </div>
    {/if}
  </div>
</div>
