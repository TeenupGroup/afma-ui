<script>
  import { ClipboardList, CheckCircle2, Clock, AlertCircle, ChevronLeft, Calendar, Users, Award } from 'lucide-svelte'
  import { toPersianDigits, fmtDate, persianDigits } from '../../lib/utils.js'
  import JalaliBadge from './JalaliBadge.svelte'
  import GradeBadge from './GradeBadge.svelte'

  /**
   * @typedef {Object} AssignmentCardProps
   * @property {Object} assignment
   * @property {'student' | 'teacher' | 'school'} [role='student']
   * @property {string} [href]
   * @property {'card' | 'compact'} [variant='card']
   * @property {boolean} [showCourse=true]
   * @property {string} [class='']
   */

  /** @type {AssignmentCardProps} */
  let {
    assignment,
    role = 'student',
    href = '',
    variant = 'card',
    showCourse = true,
    dataTestid = 'assignment-item',
    class: className = '',
  } = $props()

  const destination = $derived(
    href || `/panel/${role}/assignments/${assignment.id}`
  )

  const submission = $derived(assignment.submissions?.[0] || null)

  const isGraded = $derived(submission?.status === 'graded')
  const isSubmitted = $derived(Boolean(submission && !isGraded))
  const isExpired = $derived(
    !submission && assignment.due_date && new Date(assignment.due_date) <= new Date()
  )
  const isPending = $derived(
    !submission && (!assignment.due_date || new Date(assignment.due_date) > new Date())
  )

  const statusConfig = $derived(() => {
    if (role === 'student') {
      if (isGraded) {
        return {
          icon: CheckCircle2,
          iconClass: 'bg-emerald-50 text-emerald-600 border border-emerald-200/80',
          badgeText: 'نمره‌دار شده',
          badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
        }
      }
      if (isSubmitted) {
        return {
          icon: ClipboardList,
          iconClass: 'bg-sky-50 text-sky-600 border border-sky-200/80',
          badgeText: 'ارسال شده (در انتظار بررسی)',
          badgeClass: 'bg-sky-50 text-sky-700 border-sky-200/80',
        }
      }
      if (isExpired) {
        return {
          icon: AlertCircle,
          iconClass: 'bg-rose-50 text-rose-600 border border-rose-200/80',
          badgeText: 'پایان مهلت ارسال',
          badgeClass: 'bg-rose-50 text-rose-700 border-rose-200/80',
        }
      }
      // Pending
      return {
        icon: Clock,
        iconClass: 'bg-indigo-50 text-indigo-600 border border-indigo-200/80',
        badgeText: 'در انتظار ارسال',
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-200/80',
      }
    }

    // Teacher / School default
    return {
      icon: ClipboardList,
      iconClass: 'bg-indigo-50 text-indigo-600 border border-indigo-200/80',
      badgeText: 'تکلیف درسی',
      badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
    }
  })

  const status = $derived(statusConfig())
  const StatusIcon = $derived(status.icon)
</script>

<a
  href={destination}
  data-testid={dataTestid}
  class="group block bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 hover:border-indigo-300 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 {className}"
  dir="rtl"
>
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <!-- Main Info Section -->
    <div class="flex items-start sm:items-center gap-3.5 sm:gap-4 min-w-0">
      <!-- Icon Tile -->
      <div
        class="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 {status.iconClass}"
      >
        <StatusIcon class="w-5 h-5" />
      </div>

      <div class="min-w-0 flex-1">
        <!-- Top metadata badges -->
        <div class="flex items-center gap-2 flex-wrap mb-1">
          {#if showCourse && assignment.course}
            <span class="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2.5 py-0.5 rounded-full">
              {assignment.course?.title || 'درس تخصصی'}
            </span>
          {/if}

          {#if assignment.max_score}
            <span class="text-[11px] font-medium text-slate-500" use:persianDigits>
              بارم نمره: {toPersianDigits(assignment.max_score)}
            </span>
          {/if}
        </div>

        <!-- Assignment Title -->
        <h3 class="font-bold text-sm sm:text-base text-slate-800 group-hover:text-indigo-600 transition-colors truncate">
          {assignment.title}
        </h3>

        <!-- Due Date & Meta -->
        <div class="flex items-center gap-3 flex-wrap mt-1.5">
          {#if assignment.due_date}
            <JalaliBadge
              date={assignment.due_date}
              mode="deadline"
              size="xs"
              variant="soft"
            />
          {/if}

          {#if role === 'teacher' && assignment.submissions_count !== undefined}
            <span class="text-xs text-slate-500 flex items-center gap-1" use:persianDigits>
              <Users class="w-3.5 h-3.5 text-slate-400" />
              {toPersianDigits(assignment.submissions_count)} پاسخ ارسال‌شده
            </span>
          {/if}
        </div>
      </div>
    </div>

    <!-- Actions / Scores Section -->
    <div class="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
      {#if role === 'student'}
        {#if isGraded}
          <div class="flex items-center gap-2">
            <span class="text-xs text-slate-500 font-bold hidden sm:inline">نمره شما:</span>
            <GradeBadge
              score={submission.score}
              maxScore={assignment.max_score || 20}
              size="md"
              showTierLabel={false}
            />
          </div>
        {:else if isExpired}
          <span class="text-xs font-bold px-3 py-1.5 rounded-xl border {status.badgeClass}">
            {status.badgeText}
          </span>
        {:else if isSubmitted}
          <span class="text-xs font-bold px-3 py-1.5 rounded-xl border {status.badgeClass}">
            {status.badgeText}
          </span>
        {:else}
          <span class="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs group-hover:shadow-sm transition-all">
            <span>ارسال پاسخ</span>
            <ChevronLeft class="w-3.5 h-3.5" />
          </span>
        {/if}
      {:else}
        <!-- Teacher or School action button -->
        <div class="flex items-center gap-2">
          {#if assignment.pending_count > 0}
            <span class="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-xl bg-amber-50 text-amber-700 border border-amber-200/80" use:persianDigits>
              <Clock class="w-3.5 h-3.5" />
              {toPersianDigits(assignment.pending_count)} در انتظار
            </span>
          {/if}
          <span class="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 group-hover:gap-1.5 transition-all">
            <span>مشاهده و تصحیح</span>
            <ChevronLeft class="w-4 h-4" />
          </span>
        </div>
      {/if}
    </div>
  </div>
</a>
