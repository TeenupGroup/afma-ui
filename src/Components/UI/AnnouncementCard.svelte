<script>
  import { Megaphone, Pin, Calendar, User, ChevronLeft, Trash2 } from 'lucide-svelte'
  import { toPersianDigits, fmtDate, persianDigits } from '../../lib/utils.js'
  import Badge from './Badge.svelte'
  import Avatar from './Avatar.svelte'

  /**
   * @typedef {Object} AnnouncementCardProps
   * @property {Object} announcement
   * @property {'student' | 'teacher' | 'school'} [role='student']
   * @property {string} [href]
   * @property {(id: number|string) => void} [ondelete]
   * @property {string} [class='']
   * @property {string} [dataTestid='']
   */

  /** @type {AnnouncementCardProps} */
  let {
    announcement,
    role = 'student',
    href = '',
    ondelete = null,
    class: className = '',
    dataTestid = '',
  } = $props()

  const destination = $derived(
    href || `/panel/${role}/announcements/${announcement.id}`
  )

  const authorName = $derived(
    announcement.teacher?.full_name ||
    (announcement.teacher ? `${announcement.teacher.first_name || ''} ${announcement.teacher.last_name || ''}`.trim() : null) ||
    'مدیریت مدرسه'
  )
</script>

<div
  class="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 hover:border-emerald-300 dark:hover:border-emerald-500 hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 {className}"
  data-testid={dataTestid || undefined}
  dir="rtl"
>
  <div class="flex items-start gap-4">
    <!-- Icon Tile -->
    <div
      class="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 {announcement.is_pinned ? 'bg-gradient-to-tr from-amber-400 to-orange-500 text-white shadow-md shadow-amber-500/20' : 'bg-gradient-to-tr from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20'}"
    >
      {#if announcement.is_pinned}
        <Pin class="w-6 h-6" />
      {:else}
        <Megaphone class="w-6 h-6" />
      {/if}
    </div>

    <!-- Content -->
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2 flex-wrap mb-1.5">
        {#if announcement.is_pinned}
          <Badge variant="amber" size="xs">سنجاق شده</Badge>
        {/if}
        <h3 class="font-bold text-sm sm:text-base text-slate-800 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors truncate">
          {#if role === 'student'}
            <a href={destination} class="hover:underline">
              {announcement.title}
            </a>
          {:else}
            {announcement.title}
          {/if}
        </h3>
      </div>

      <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-3.5 line-clamp-2 leading-relaxed">
        {announcement.body}
      </p>

      <!-- Footer Metadata & Actions -->
      <div class="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex-wrap">
        <div class="flex items-center gap-3 sm:gap-4 text-xs text-slate-400" use:persianDigits>
          <span class="flex items-center gap-1.5">
            <Avatar size="xs" name={authorName} />
            <span class="text-slate-600 dark:text-slate-300 font-medium">{authorName}</span>
          </span>
          <span class="flex items-center gap-1 text-slate-400">
            <Calendar class="w-3.5 h-3.5" />
            <span>{fmtDate(announcement.created_at)}</span>
          </span>
        </div>

        {#if role === 'student'}
          <a
            href={destination}
            class="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 group-hover:gap-1.5 transition-all"
          >
            <span>مشاهده متن کامل</span>
            <ChevronLeft class="w-3.5 h-3.5" />
          </a>
        {:else}
          <div class="flex items-center gap-1.5">
            <a
              href={destination}
              class="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:text-blue-400 rounded-lg transition-colors"
              title="مشاهده جزئیات"
            >
              <ChevronLeft class="w-4 h-4" />
            </a>
            {#if ondelete}
              <button
                type="button"
                data-testid="t-announcement-delete"
                onclick={() => ondelete(announcement.id)}
                class="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors"
                title="حذف اعلان"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            {/if}
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>
