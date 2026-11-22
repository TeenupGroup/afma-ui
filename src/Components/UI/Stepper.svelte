<script>
  import { toPersianDigits, cn } from '../../lib/utils.js'

  let {
    steps = [],
    activeStep = 0,
    clickable = false,
    onstepclick = null,
    class: className = '',
  } = $props()

  function handleStepClick(index) {
    if (clickable && onstepclick) {
      onstepclick(index)
    }
  }
</script>

<div class={cn('w-full select-none py-2', className)} dir="rtl">
  <div class="relative flex items-center justify-between">
    <!-- Connecting progress bar behind the circles -->
    <div
      class="absolute top-1/2 start-0 end-0 -translate-y-1/2 h-1 bg-zinc-200 dark:bg-zinc-800 z-0"
      aria-hidden="true"
    >
      <div
        class="h-full bg-primary-600 dark:bg-primary-500 transition-all duration-300 ease-out"
        style={`width: ${steps.length > 1 ? (Math.min(activeStep, steps.length - 1) / (steps.length - 1)) * 100 : 0}%`}
      ></div>
    </div>

    <!-- Step Items -->
    {#each steps as step, i}
      {@const isCompleted = i < activeStep}
      {@const isCurrent = i === activeStep}
      {@const isUpcoming = i > activeStep}

      <div class="relative z-10 flex flex-col items-center group">
        <button
          type="button"
          disabled={!clickable || isUpcoming}
          onclick={() => handleStepClick(i)}
          class={cn(
            'flex size-10 sm:size-11 items-center justify-center rounded-full font-sans text-sm sm:text-base font-bold transition-all duration-200 outline-none',
            isCompleted && 'bg-primary-600 text-white shadow-sm hover:bg-primary-700',
            isCurrent && 'bg-white dark:bg-zinc-900 border-2 border-primary-600 dark:border-primary-400 text-primary-600 dark:text-primary-400 ring-4 ring-primary-100 dark:ring-primary-950/60 shadow-md',
            isUpcoming && 'bg-white dark:bg-zinc-900 border-2 border-zinc-300 dark:border-zinc-700 text-zinc-400 dark:text-zinc-500',
            clickable && !isUpcoming && 'cursor-pointer'
          )}
          aria-current={isCurrent ? 'step' : undefined}
          aria-label={`مرحله ${toPersianDigits(i + 1)}: ${step.title || ''}`}
        >
          {#if isCompleted}
            <!-- Checkmark SVG -->
            <svg class="size-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          {:else}
            <span>{toPersianDigits(i + 1)}</span>
          {/if}
        </button>

        <!-- Step title and optional description -->
        <div class="mt-2 text-center max-w-[5rem] sm:max-w-[7rem]">
          <span
            class={cn(
              'block font-sans text-xs sm:text-sm font-medium transition-colors truncate',
              isCurrent && 'text-primary-600 dark:text-primary-400 font-bold',
              isCompleted && 'text-zinc-800 dark:text-zinc-200',
              isUpcoming && 'text-zinc-400 dark:text-zinc-500'
            )}
            title={step.title}
          >
            {step.title}
          </span>
          {#if step.description}
            <span class="hidden sm:block font-sans text-[11px] text-zinc-400 dark:text-zinc-500 truncate mt-0.5" title={step.description}>
              {step.description}
            </span>
          {/if}
        </div>
      </div>
    {/each}
  </div>
</div>
