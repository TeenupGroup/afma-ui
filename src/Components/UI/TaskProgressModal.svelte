<script>
  import { Modal, Button } from './index.js'
  import { toPersianDigits } from '../../lib/utils.js'
  import { pollAsyncTask } from '../../lib/asyncTask.js'
  import { Loader2, CheckCircle2, AlertTriangle, XCircle } from 'lucide-svelte'

  let {
    taskId = $bindable(''),
    open = $bindable(undefined),
    title = 'در حال پردازش عملیات',
    autoCloseOnSuccess = false,
    autoCloseDelayMs = 1200,
    onComplete = undefined,
    onError = undefined,
    oncompleted = undefined,
    onfailed = undefined,
    oncancelled = undefined,
  } = $props()

  let isOpen = $derived(open !== undefined ? (Boolean(open) && Boolean(taskId)) : Boolean(taskId))
  let progress = $state(0)
  let statusMessage = $state('در حال آغاز عملیات...')
  let status = $state('pending') // 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  let errorMessage = $state('')
  let lastTask = $state(null)
  let poller = null

  function closeModal() {
    if (open !== undefined) {
      open = false
    } else {
      taskId = ''
    }
  }

  $effect(() => {
    if (!isOpen || !taskId) {
      if (poller) {
        if (status === 'pending' || status === 'processing') {
          poller.cancel()
        }
        poller = null
      }
      return
    }

    status = 'pending'
    progress = 0
    errorMessage = ''
    statusMessage = 'در حال آغاز عملیات...'
    lastTask = null

    poller = pollAsyncTask(taskId, {
      onProgress: (task) => {
        lastTask = task
        status = task.status
        progress = task.progress || 0
        if (task.message) {
          statusMessage = task.message
        }
      },
      onComplete: (result) => {
        status = 'completed'
        progress = 100
        statusMessage = 'عملیات با موفقیت به پایان رسید.'
        poller = null
        const completedTask = {
          ...(lastTask || {}),
          status: 'completed',
          progress: 100,
          result: result || lastTask?.result || {},
        }
        onComplete?.(result)
        oncompleted?.(completedTask)

        if (autoCloseOnSuccess) {
          setTimeout(() => {
            closeModal()
          }, autoCloseDelayMs)
        }
      },
      onError: (err) => {
        status = 'failed'
        errorMessage = err
        poller = null
        const failedTask = {
          ...(lastTask || {}),
          status: 'failed',
          error: err,
        }
        onError?.(err)
        onfailed?.(failedTask)
      },
    })

    return () => {
      if (poller) {
        if (status === 'pending' || status === 'processing') {
          poller.cancel()
        }
        poller = null
      }
    }
  })

  function handleCancel() {
    if (poller) {
      poller.cancel()
      poller = null
    }
    status = 'cancelled'
    closeModal()
    oncancelled?.()
  }

  function handleModalClose() {
    if (status === 'completed' || status === 'failed') {
      closeModal()
    } else {
      handleCancel()
    }
  }
</script>

{#if isOpen}
  <Modal
    open={isOpen}
    {title}
    size="md"
    closeOnBackdrop={status === 'completed' || status === 'failed'}
    closeOnEscape={status === 'completed' || status === 'failed'}
    onclose={handleModalClose}
  >
    <div class="space-y-5 py-2 text-right font-sans" dir="rtl">
      <!-- Status Banner & Icon -->
      <div class="flex items-center gap-3">
        {#if status === 'completed'}
          <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
            <CheckCircle2 class="h-6 w-6" />
          </div>
        {:else if status === 'failed'}
          <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
            <XCircle class="h-6 w-6" />
          </div>
        {:else}
          <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
            <Loader2 class="h-6 w-6 animate-spin" />
          </div>
        {/if}

        <div class="min-w-0 flex-1">
          <p class="text-sm font-bold text-slate-800">
            {#if status === 'completed'}
              عملیات انجام شد
            {:else if status === 'failed'}
              خطا در اجرای عملیات
            {:else}
              در حال پردازش در پس‌زمینه...
            {/if}
          </p>
          <p class="mt-0.5 text-xs text-slate-500 truncate">
            {statusMessage}
          </p>
        </div>

        <div class="text-left text-sm font-black text-slate-700">
          {toPersianDigits(progress)}٪
        </div>
      </div>

      <!-- Progress Bar -->
      <div class="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          class="h-full transition-all duration-300 ease-out {status === 'completed' ? 'bg-emerald-500' : status === 'failed' ? 'bg-rose-500' : 'bg-indigo-600'}"
          style="width: {progress}%"
        ></div>
      </div>

      <!-- Error Details -->
      {#if status === 'failed' && errorMessage}
        <div class="flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
          <AlertTriangle class="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
          <p class="leading-relaxed">{errorMessage}</p>
        </div>
      {/if}

      <!-- Footer Actions -->
      <div class="flex items-center justify-end gap-2 pt-2">
        {#if status === 'completed' || status === 'failed'}
          <Button
            type="button"
            variant="primary"
            onclick={closeModal}
          >
            متوجه شدم و بستن
          </Button>
        {:else}
          <Button
            type="button"
            variant="outline"
            onclick={handleCancel}
          >
            انصراف و بستن
          </Button>
        {/if}
      </div>
    </div>
  </Modal>
{/if}
