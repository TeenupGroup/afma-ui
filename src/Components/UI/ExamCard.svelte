<script>
  import {
    Clock, Calendar, Award, CheckCircle2, AlertCircle,
    Play, Eye, RotateCcw, FileQuestion, ChevronLeft
  } from 'lucide-svelte'
  import { toPersianDigits, fmtDate, persianDigits } from '../../lib/utils.js'
  import { getExamState } from '../../lib/exams.js'
  import Badge from './Badge.svelte'
  import Button from './Button.svelte'

  /**
   * @typedef {Object} ExamCardProps
   * @property {Object} exam
   * @property {Object} [participation=null]
   * @property {'student' | 'teacher'} [role='student']
   * @property {number|string} [courseId]
   * @property {string} [class='']
   */

  /** @type {ExamCardProps} */
  let {
    exam,
    participation = null,
    role = 'student',
    courseId = null,
    class: className = '',
  } = $props()

  const state = $derived(getExamState(exam, participation))
  const cId = $derived(courseId || exam.course_id)
</script>

<div
  class="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs hover:shadow-lg hover:border-violet-300 dark:hover:border-violet-600 transition-all duration-200 flex flex-col justify-between {className}"
  dir="rtl"
>
  <div>
    <!-- Top Card Row: Status Badge & Multiple Attempts Tag -->
    <div class="flex items-center justify-between gap-2 mb-3">
      <Badge variant={state.badgeVariant} size="sm">
        {state.label}
      </Badge>

      {#if exam.allow_multiple_attempts}
        <span class="text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2.5 py-0.5 rounded-lg flex items-center gap-1 border border-slate-200/60 dark:border-slate-700">
          <RotateCcw class="w-3 h-3 text-slate-500" />
          <span>چند بار شرکت</span>
        </span>
      {/if}
    </div>

    <!-- Exam Title & Description -->
    <h3
      class="font-bold text-slate-800 dark:text-slate-100 text-base mb-1.5 line-clamp-1 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors"
      title={exam.title}
    >
      {exam.title}
    </h3>

    {#if exam.description}
      <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
        {exam.description}
      </p>
    {:else}
      <div class="mb-3"></div>
    {/if}

    <!-- Metadata Chips -->
    <div class="space-y-2 text-xs text-slate-500 dark:text-slate-400 mb-4 bg-slate-50/80 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
      <div class="flex items-center justify-between" use:persianDigits>
        <span class="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
          <FileQuestion class="w-3.5 h-3.5 text-slate-400" />
          <span>تعداد سؤالات:</span>
        </span>
        <span class="font-bold text-slate-700 dark:text-slate-300">
          {toPersianDigits(exam.questions_count || 0)} سؤال
        </span>
      </div>

      {#if exam.duration_minutes}
        <div class="flex items-center justify-between" use:persianDigits>
          <span class="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <Clock class="w-3.5 h-3.5 text-slate-400" />
            <span>مدت پاسخگویی:</span>
          </span>
          <span class="font-bold text-slate-700 dark:text-slate-300">
            {toPersianDigits(exam.duration_minutes)} دقیقه
          </span>
        </div>
      {/if}

      {#if exam.total_score}
        <div class="flex items-center justify-between" use:persianDigits>
          <span class="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <Award class="w-3.5 h-3.5 text-slate-400" />
            <span>نمره کل:</span>
          </span>
          <span class="font-bold text-slate-700 dark:text-slate-300">
            {toPersianDigits(exam.total_score)}
          </span>
        </div>
      {/if}

      {#if exam.starts_at}
        <div class="flex items-center justify-between" use:persianDigits>
          <span class="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <Calendar class="w-3.5 h-3.5 text-slate-400" />
            <span>زمان شروع:</span>
          </span>
          <span class="font-medium text-slate-700 dark:text-slate-300">
            {fmtDate(exam.starts_at)}
          </span>
        </div>
      {/if}

      {#if exam.ends_at}
        <div class="flex items-center justify-between" use:persianDigits>
          <span class="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <Calendar class="w-3.5 h-3.5 text-slate-400" />
            <span>مهلت پایان:</span>
          </span>
          <span class="font-medium text-slate-700 dark:text-slate-300">
            {fmtDate(exam.ends_at)}
          </span>
        </div>
      {/if}
    </div>

    <!-- Score banner if completed -->
    {#if state.type === 'completed' && state.participation}
      <div class="mb-4 p-3 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/50 rounded-xl flex items-center justify-between">
        <div class="flex items-center gap-2">
          <CheckCircle2 class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span class="text-xs font-bold text-emerald-900 dark:text-emerald-200">نتیجه آزمون:</span>
        </div>
        {#if state.participation.percentage !== null && state.participation.percentage !== undefined}
          <span class="text-sm font-black text-emerald-700 dark:text-emerald-300" use:persianDigits>
            درصد: {toPersianDigits(Math.round(state.participation.percentage))}٪
          </span>
        {:else if state.participation.score !== null && state.participation.score !== undefined}
          <span class="text-sm font-black text-emerald-700 dark:text-emerald-300" use:persianDigits>
            نمره: {toPersianDigits(state.participation.score)}
          </span>
        {:else}
          <span class="text-xs font-bold text-emerald-700 dark:text-emerald-300">ثبت‌شده</span>
        {/if}
      </div>
    {/if}
  </div>

  <!-- Bottom Actions -->
  <div class="pt-3 border-t border-slate-100 dark:border-slate-800">
    {#if state.type === 'open'}
      <Button
        href={exam.uuid ? `/exam/${exam.uuid}/take` : `/panel/student/courses/${cId}/exams`}
        variant="primary"
        class="w-full justify-center !bg-gradient-to-r !from-violet-600 !to-indigo-600 hover:!from-violet-700 hover:!to-indigo-700 text-white font-bold shadow-md shadow-violet-500/20"
        icon={Play}
      >
        شروع آزمون
      </Button>
    {:else if state.type === 'in_progress'}
      <Button
        href={state.participation?.uuid ? `/exam/participant/${state.participation.uuid}?token=${state.participation.access_token}` : `/panel/student/courses/${cId}/exams`}
        variant="primary"
        class="w-full justify-center !bg-gradient-to-r !from-sky-500 !to-blue-600 hover:!from-sky-600 hover:!to-blue-700 text-white font-bold shadow-md shadow-sky-500/20"
        icon={ChevronLeft}
      >
        ادامه آزمون
      </Button>
    {:else if state.type === 'completed'}
      <div class="flex flex-col sm:flex-row gap-2 w-full">
        <Button
          href={state.participation?.uuid ? `/exam/participant/${state.participation.uuid}/result?token=${state.participation.access_token}` : `/panel/student/courses/${cId}/exams`}
          variant="outline"
          class="flex-1 justify-center text-emerald-700 border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950 font-bold"
          icon={Eye}
        >
          مشاهده نتیجه
        </Button>
        {#if state.canRetake}
          <Button
            href={exam.uuid ? `/exam/${exam.uuid}/take` : `/panel/student/courses/${cId}/exams`}
            variant="secondary"
            class="justify-center text-xs font-bold"
            icon={RotateCcw}
          >
            شرکت مجدد
          </Button>
        {/if}
      </div>
    {:else if state.type === 'upcoming'}
      <div class="flex items-center justify-center gap-1.5 text-xs text-slate-400 py-2">
        <Clock class="w-4 h-4" />
        <span>آزمون در تاریخ مشخص‌شده فعال خواهد شد</span>
      </div>
    {:else if state.type === 'expired'}
      <div class="flex items-center justify-center gap-1.5 text-xs text-rose-500 dark:text-rose-400 py-2 font-medium">
        <AlertCircle class="w-4 h-4" />
        <span>مهلت شرکت در این آزمون به پایان رسیده است</span>
      </div>
    {/if}
  </div>
</div>
