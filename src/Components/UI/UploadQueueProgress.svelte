<script>
  import { toPersianDigits } from '../../lib/utils.js'
  import { formatFileSize } from '../../lib/compression.js'
  import {
    Loader2,
    CheckCircle2,
    AlertCircle,
    RotateCw,
    X,
    ChevronDown,
    ChevronUp,
    FileText,
    Image as ImageIcon,
    Film,
  } from 'lucide-svelte'

  let {
    queue,
    title = 'صف بارگذاری فایل‌ها',
    class: className = '',
  } = $props()

  let isDetailsOpen = $state(false)

  function getFileIcon(type = '') {
    if (type.startsWith('video/')) return Film
    if (type.startsWith('image/')) return ImageIcon
    return FileText
  }
</script>

{#if queue && queue.totalCount > 0}
  <div class="rounded-xl border border-gray-200 bg-white p-3.5 shadow-2xs space-y-2.5 {className}">
    <!-- Header Summary Bar -->
    <div class="flex items-center justify-between gap-2">
      <div class="flex items-center gap-2 min-w-0">
        {#if queue.isBusy}
          <Loader2 class="w-4 h-4 text-blue-600 animate-spin shrink-0" />
        {:else if queue.hasErrors}
          <AlertCircle class="w-4 h-4 text-amber-500 shrink-0" />
        {:else}
          <CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0" />
        {/if}

        <div class="truncate text-xs">
          <span class="font-semibold text-gray-800">{title}:</span>
          <span class="text-gray-500 mr-1">
            {#if queue.isBusy}
              در حال ارسال ({toPersianDigits(queue.completedCount)} از {toPersianDigits(queue.totalCount)} فایل - {toPersianDigits(queue.progress)}٪)
            {:else if queue.hasErrors}
              {toPersianDigits(queue.failedCount)} فایل با خطا مواجه شد ({toPersianDigits(queue.completedCount)} فایل ذخیره شد)
            {:else}
              تمام {toPersianDigits(queue.completedCount)} فایل با موفقیت بارگذاری شدند
            {/if}
          </span>
        </div>
      </div>

      <div class="flex items-center gap-1.5 shrink-0">
        {#if queue.hasErrors}
          <button
            type="button"
            onclick={() => queue.retryAll()}
            class="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCw class="w-3 h-3" />
            <span>تلاش مجدد ناموفق‌ها</span>
          </button>
        {/if}

        <button
          type="button"
          onclick={() => isDetailsOpen = !isDetailsOpen}
          class="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          title="مشاهده جزئیات فایل‌ها"
        >
          {#if isDetailsOpen}
            <ChevronUp class="w-4 h-4" />
          {:else}
            <ChevronDown class="w-4 h-4" />
          {/if}
        </button>
      </div>
    </div>

    <!-- Overall Progress Line -->
    {#if queue.isBusy}
      <div class="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
        <div
          class="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
          style="width: {queue.progress}%"
        ></div>
      </div>
    {/if}

    <!-- Collapsible Itemized List -->
    {#if isDetailsOpen}
      <div class="space-y-1.5 pt-2 border-t border-gray-100 max-h-48 overflow-y-auto">
        {#each queue.items as item (item.id)}
          {@const Icon = getFileIcon(item.type)}
          <div class="flex items-center justify-between gap-2 p-2 rounded-lg bg-gray-50/70 text-xs">
            <div class="flex items-center gap-2 min-w-0">
              <Icon class="w-3.5 h-3.5 text-gray-500 shrink-0" />
              <div class="truncate">
                <span class="text-gray-700 font-medium">{item.name}</span>
                {#if item.wasCompressed && item.compressedSize > 0}
                  <span class="text-[10px] text-emerald-600 mr-1.5">
                    ({formatFileSize(item.compressedSize)} - فشرده‌شده)
                  </span>
                {:else if item.size > 0}
                  <span class="text-[10px] text-gray-400 mr-1.5">({formatFileSize(item.size)})</span>
                {/if}
              </div>
            </div>

            <div class="flex items-center gap-2 shrink-0">
              {#if item.status === 'compressing'}
                <span class="text-[11px] text-purple-600 font-medium">فشرده‌سازی...</span>
              {:else if item.status === 'uploading'}
                <span class="text-[11px] text-blue-600 font-medium">{toPersianDigits(item.progress)}٪</span>
              {:else if item.status === 'completed'}
                <span class="text-[11px] text-emerald-600 font-medium">آماده</span>
              {:else if item.status === 'error'}
                <span class="text-[11px] text-rose-600 font-medium">{item.error || 'خطا'}</span>
                <button
                  type="button"
                  onclick={() => queue.retry(item.id)}
                  class="p-1 text-blue-600 hover:text-blue-800 rounded hover:bg-blue-50 cursor-pointer"
                  title="تلاش مجدد"
                >
                  <RotateCw class="w-3 h-3" />
                </button>
              {/if}

              {#if item.status !== 'completed'}
                <button
                  type="button"
                  onclick={() => queue.remove(item.id)}
                  class="p-1 text-gray-400 hover:text-rose-600 rounded hover:bg-gray-200/50 cursor-pointer"
                  title="حذف از صف"
                >
                  <X class="w-3 h-3" />
                </button>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
{/if}
