<script>
  import { Eye, PenLine, Trash2, CheckSquare, Square, X } from 'lucide-svelte'
  import { toPersianDigits, persianDigits } from '../../lib/utils.js'
  import Avatar from './Avatar.svelte'
  import Badge from './Badge.svelte'

  /**
   * @typedef {Object} StudentRowProps
   * @property {Object} student - Student object
   * @property {boolean} [selected=false]
   * @property {(id: number|string) => void} [onselect]
   * @property {(student: Object) => void} [ondelete]
   * @property {(student: Object) => void} [onremove]
   * @property {string} [href]
   * @property {'principal' | 'teacher'} [role='principal']
   * @property {boolean} [showCheckbox=false]
   * @property {boolean} [showActions=true]
   * @property {boolean} [showBadges=true]
   * @property {string} [dataTestid='']
   * @property {string} [class='']
   */

  /** @type {StudentRowProps} */
  let {
    student,
    selected = false,
    onselect = null,
    ondelete = null,
    onremove = null,
    href = '',
    role = 'principal',
    showCheckbox = false,
    showActions = true,
    showBadges = true,
    dataTestid = '',
    class: className = '',
  } = $props()

  const destination = $derived(
    href || `/panel/${role}/students/${student?.id}`
  )

  const fullName = $derived(
    student?.full_name || `${student?.first_name || ''} ${student?.last_name || ''}`.trim() || 'هنرجو'
  )

  const metaSubtitle = $derived(
    [
      student?.national_code ? `کدملی: ${toPersianDigits(student.national_code)}` : (student?.student_id ? `کد: ${toPersianDigits(student.student_id)}` : ''),
      student?.grade,
      student?.field_of_study || student?.major,
      student?.class?.name,
    ].filter(Boolean).join(' · ')
  )
</script>

<div
  class="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-800 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-all duration-150 {selected ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800' : ''} {className}"
  data-testid={dataTestid || undefined}
  dir="rtl"
>
  <div class="flex items-center gap-3 min-w-0">
    {#if showCheckbox && onselect}
      <button
        type="button"
        onclick={() => onselect(student.id)}
        class="text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors shrink-0 cursor-pointer"
        aria-label="انتخاب هنرجو"
      >
        {#if selected}
          <CheckSquare class="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        {:else}
          <Square class="w-5 h-5" />
        {/if}
      </button>
    {/if}

    <Avatar
      src={student?.profile_image || student?.avatar}
      name={fullName}
      size="md"
    />

    <div class="min-w-0 flex-1">
      <div class="flex items-center gap-2 flex-wrap">
        <a
          href={destination}
          class="text-sm font-bold text-black dark:text-black transition-colors truncate"
        >
          {fullName}
        </a>
        {#if showBadges && (student?.class?.name || student?.grade)}
          <Badge variant="slate" size="xs">
            {student?.class?.name || student?.grade}
          </Badge>
        {/if}
      </div>

      {#if metaSubtitle}
        <p class="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate" use:persianDigits>
          {metaSubtitle}
        </p>
      {/if}
    </div>
  </div>

  {#if showActions}
    <div class="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800 shrink-0">
      {#if student?.is_active !== undefined}
        <Badge variant={student.is_active ? 'emerald' : 'slate'} size="xs">
          {student.is_active ? 'فعال' : 'غیرفعال'}
        </Badge>
      {/if}

      <div class="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
        <a
          href={destination}
          class="p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          title="مشاهده پرونده"
        >
          <Eye class="w-4 h-4" />
        </a>

        {#if onremove}
          <button
            type="button"
            onclick={() => onremove(student)}
            class="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/50 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
            title="حذف از کلاس"
          >
            <X class="w-4 h-4" />
          </button>
        {/if}

        {#if ondelete}
          <button
            type="button"
            onclick={() => ondelete(student)}
            class="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/50 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
            title="حذف"
          >
            <Trash2 class="w-4 h-4" />
          </button>
        {/if}
      </div>
    </div>
  {/if}
</div>
