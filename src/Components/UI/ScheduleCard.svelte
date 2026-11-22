<script>
  import { Clock, MapPin, Video, ExternalLink } from 'lucide-svelte'
  import { toPersianDigits, persianDigits } from '../../lib/utils.js'

  /**
   * @typedef {Object} ScheduleCardProps
   * @property {Object} lesson
   * @property {'student' | 'teacher'} [role='student']
   * @property {boolean} [highlight=false]
   * @property {string} [class='']
   */

  /** @type {ScheduleCardProps} */
  let {
    lesson,
    role = 'student',
    highlight = false,
    class: className = '',
  } = $props()

  const startTime = $derived(lesson.start_time?.substring(0, 5) || lesson.time?.split(' ')[0] || '-')
  const endTime = $derived(lesson.end_time?.substring(0, 5) || lesson.time?.split(' ')[2] || '-')
</script>

<div
  class="group p-3 rounded-2xl transition-all duration-200 border {highlight ? 'bg-gradient-to-l from-emerald-50 via-teal-50/50 to-white dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-slate-900 border-emerald-300 dark:border-emerald-700 shadow-sm' : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-indigo-200 hover:shadow-xs'} {className}"
  dir="rtl"
>
  <div class="flex items-center justify-between gap-2 mb-1.5">
    <h4 class="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 transition-colors truncate">
      {lesson.title || lesson.subject || 'جلسه درسی'}
    </h4>

    {#if lesson.is_online}
      <span class="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0">
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
        <span>آنلاین</span>
      </span>
    {:else if lesson.room}
      <span class="text-[10px] font-medium text-slate-400 dark:text-slate-500 flex items-center gap-0.5 shrink-0">
        <MapPin class="w-3 h-3 text-slate-400" />
        <span>{lesson.room}</span>
      </span>
    {/if}
  </div>

  <div class="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400" use:persianDigits>
    <div class="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-[11px]">
      <Clock class="w-3 h-3 text-slate-400 shrink-0" />
      <span>{toPersianDigits(startTime)} تا {toPersianDigits(endTime)}</span>
    </div>

    {#if lesson.course?.title}
      <span class="text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-[120px]">
        {lesson.course.title}
      </span>
    {/if}
  </div>

  {#if lesson.is_online && lesson.meeting_link}
    <div class="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
      <a
        href={lesson.meeting_link}
        target="_blank"
        rel="noopener"
        class="inline-flex items-center justify-center gap-1 w-full text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white py-1.5 rounded-xl shadow-xs transition-all"
      >
        <Video class="w-3.5 h-3.5" />
        <span>ورود به کلاس آنلاین</span>
      </a>
    </div>
  {/if}
</div>
