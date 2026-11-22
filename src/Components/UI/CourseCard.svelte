<script>
  import { BookOpen, Clock, User, Users, ChevronLeft, Calendar } from 'lucide-svelte'
  import { toPersianDigits, fmtDate, persianDigits } from '../../lib/utils.js'
  import Avatar from './Avatar.svelte'

  /**
   * @typedef {Object} CourseCardProps
   * @property {Object} course
   * @property {'student' | 'teacher' | 'principal'} [role='student']
   * @property {string} [href]
   * @property {'card' | 'compact'} [variant='card']
   * @property {string} [class='']
   */

  /** @type {CourseCardProps} */
  let {
    course,
    role = 'student',
    href = '',
    variant = 'card',
    class: className = '',
  } = $props()

  const destination = $derived(
    href || `/panel/${role}/courses/${course?.id}`
  )

  const palette = [
    { from: 'from-indigo-500', to: 'to-purple-600', shadow: 'shadow-indigo-500/20' },
    { from: 'from-sky-500', to: 'to-blue-600', shadow: 'shadow-sky-500/20' },
    { from: 'from-emerald-500', to: 'to-teal-600', shadow: 'shadow-emerald-500/20' },
    { from: 'from-amber-500', to: 'to-orange-600', shadow: 'shadow-amber-500/20' },
    { from: 'from-rose-500', to: 'to-pink-600', shadow: 'shadow-rose-500/20' },
    { from: 'from-violet-500', to: 'to-indigo-600', shadow: 'shadow-violet-500/20' },
  ]

  const tileStyle = $derived(
    palette[Math.abs(Number(course?.id) || 0) % palette.length]
  )

  const teacherName = $derived(
    course?.teacher?.full_name ||
    (course?.teacher ? `${course.teacher.first_name || ''} ${course.teacher.last_name || ''}`.trim() : null) ||
    'هنرآموز تعیین نشده'
  )
</script>

<a
  href={destination}
  class="group block bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 hover:shadow-xl hover:border-indigo-300 dark:hover:border-indigo-500 transition-all duration-200 hover:-translate-y-1 {className}"
  dir="rtl"
>
  <!-- Card Header -->
  <div class="flex items-center gap-3.5 mb-4">
    <div
      class="w-12 h-12 bg-gradient-to-br {tileStyle.from} {tileStyle.to} {tileStyle.shadow} rounded-2xl flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform shrink-0"
    >
      <BookOpen class="w-6 h-6" />
    </div>

    <div class="min-w-0 flex-1">
      <h3 class="font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate text-base">
        {course?.title || 'عنوان درس'}
      </h3>
      <p class="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">
        {course?.subject || 'درس عمومی/تخصصی'}
      </p>
    </div>
  </div>

  <!-- Details List -->
  <div class="space-y-2 text-sm text-slate-500 dark:text-slate-400">
    {#if role === 'student'}
      <div class="flex items-center gap-2 min-w-0">
        <Avatar
          src={course?.teacher?.avatar}
          name={teacherName}
          size="xs"
        />
        <span class="truncate text-xs sm:text-sm">{teacherName}</span>
      </div>
    {:else}
      <div class="flex items-center gap-2 text-xs sm:text-sm" use:persianDigits>
        <Users class="w-4 h-4 text-slate-400 shrink-0" />
        <span>{toPersianDigits(course?.students_count || 0)} هنرجو</span>
      </div>
    {/if}

    {#if course?.next_lesson}
      <div class="flex items-center gap-2 text-xs text-slate-400" use:persianDigits>
        <Clock class="w-4 h-4 text-slate-400 shrink-0" />
        <span>جلسه بعدی: {fmtDate(course.next_lesson.lesson_date)}</span>
      </div>
    {/if}
  </div>

  <!-- Footer Actions -->
  <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
    {#if course?.grade_level}
      <span class="text-xs font-bold px-2.5 py-1 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700" use:persianDigits>
        پایه {toPersianDigits(course.grade_level)}
      </span>
    {:else}
      <span class="text-xs font-medium text-slate-400">کلاس فعال</span>
    {/if}

    <span class="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 group-hover:gap-2 transition-all">
      <span>{role === 'student' ? 'مشاهده کلاس' : 'مدیریت درس'}</span>
      <ChevronLeft class="w-3.5 h-3.5" />
    </span>
  </div>
</a>
