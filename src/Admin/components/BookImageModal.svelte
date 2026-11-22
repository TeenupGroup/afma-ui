<script>
  import { router } from '@inertiajs/svelte'
  import { cn, storageUrl, FALLBACK_IMG, toPersianDigits } from '../../lib/utils.js'
  import { Modal, Button } from '../../Components/UI/index.js'
  import {
    Upload, Link as LinkIcon, Download, Trash2,
    Check, AlertCircle, ExternalLink, Copy, Image as ImageIcon,
    Globe, HardDrive, AlertTriangle
  } from 'lucide-svelte'
  import { askConfirm } from '../../lib/confirm.svelte.js'

  let {
    book = null,
    open = false,
    onclose = () => {}
  } = $props()

  // Active tab: 'upload', 'url', 'download'
  let activeTab = $state('upload')
  let selectedFile = $state(null)
  let filePreview = $state(null)
  let customUrl = $state('')
  let loading = $state(false)
  let errorMsg = $state(null)
  let successMsg = $state(null)
  let copied = $state(false)
  let imgLoadError = $state(false)
  let isDragging = $state(false)
  let fileInputRef = $state(null)

  // Derive source type
  let isExternal = $derived(book?.image_url?.startsWith('http://') || book?.image_url?.startsWith('https://'))
  let isLocal = $derived(Boolean(book?.image_url && !isExternal))
  let currentDisplayUrl = $derived(storageUrl(book?.image_url))

  $effect(() => {
    if (open && book) {
      customUrl = book.image_url || ''
      selectedFile = null
      filePreview = null
      errorMsg = null
      successMsg = null
      imgLoadError = false
      if (isExternal) {
        activeTab = 'download'
      } else {
        activeTab = 'upload'
      }
    }
  })

  function handleFileSelect(e) {
    const file = e.target.files?.[0]
    if (!file) return
    processFile(file)
  }

  function processFile(file) {
    if (!file.type.startsWith('image/')) {
      errorMsg = 'لطفاً یک فایل تصویری (JPG, PNG, WebP) انتخاب کنید.'
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      errorMsg = 'حجم فایل نباید بیشتر از ۵ مگابایت باشد.'
      return
    }
    errorMsg = null
    selectedFile = file
    const reader = new FileReader()
    reader.onload = (ev) => {
      filePreview = ev.target.result
    }
    reader.readAsDataURL(file)
  }

  function handleDrop(e) {
    e.preventDefault()
    isDragging = false
    const file = e.dataTransfer?.files?.[0]
    if (file) {
      processFile(file)
    }
  }

  function copyCurrentUrl() {
    if (!book?.image_url) return
    navigator.clipboard.writeText(book.image_url)
    copied = true
    setTimeout(() => { copied = false }, 2000)
  }

  function submitFileUpload() {
    if (!selectedFile || !book) return
    loading = true
    errorMsg = null
    successMsg = null

    router.post(`/admin/books/${book.id}/update-image`, {
      image: selectedFile
    }, {
      preserveScroll: true,
      preserveState: true,
      onSuccess: () => {
        successMsg = 'تصویر جدید با موفقیت روی هاست ذخیره و جایگزین شد.'
        selectedFile = null
        filePreview = null
        loading = false
      },
      onError: (errs) => {
        errorMsg = Object.values(errs).flat().join(' | ') || 'خطا در آپلود تصویر.'
        loading = false
      }
    })
  }

  function submitUrlChange() {
    if (!book) return
    loading = true
    errorMsg = null
    successMsg = null

    router.post(`/admin/books/${book.id}/update-image`, {
      image_url: customUrl.trim()
    }, {
      preserveScroll: true,
      preserveState: true,
      onSuccess: () => {
        successMsg = 'آدرس تصویر با موفقیت بروزرسانی شد.'
        loading = false
      },
      onError: (errs) => {
        errorMsg = Object.values(errs).flat().join(' | ') || 'خطا در ذخیره آدرس.'
        loading = false
      }
    })
  }

  function submitFetchExternal() {
    if (!book) return
    loading = true
    errorMsg = null
    successMsg = null

    router.post(`/admin/books/${book.id}/fetch-image`, {
      url: customUrl.trim() || book.image_url
    }, {
      preserveScroll: true,
      preserveState: true,
      onSuccess: () => {
        successMsg = 'تصویر با موفقیت از اینترنت دریافت و در فضای هاست ذخیره شد.'
        loading = false
      },
      onError: (errs) => {
        errorMsg = Object.values(errs).flat().join(' | ') || 'امکان دانلود تصویر از سرور مقصد وجود ندارد.'
        loading = false
      }
    })
  }

  async function submitRemoveImage() {
    if (!book) return
    if (await askConfirm({ message: 'آیا از حذف تصویر جلد این کتاب اطمینان دارید؟', title: 'حذف تصویر' })) {
      loading = true
      errorMsg = null
      successMsg = null

      router.post(`/admin/books/${book.id}/update-image`, {
        remove: true
      }, {
        preserveScroll: true,
        preserveState: true,
        onSuccess: () => {
          successMsg = 'تصویر جلد با موفقیت حذف شد.'
          customUrl = ''
          loading = false
        },
        onError: (errs) => {
          errorMsg = Object.values(errs).flat().join(' | ') || 'خطا در حذف تصویر.'
          loading = false
        }
      })
    }
  }
</script>

{#if book}
  <Modal
    {open}
    {onclose}
    title="مدیریت و سفارشی‌سازی تصویر کتاب"
    description={`${book.title} • پایه ${toPersianDigits(book.grade)}${book.school ? ` • ${book.school}` : ''}`}
    size="lg"
  >
        <!-- Messages -->
        {#if successMsg}
          <div class="flex items-center gap-2.5 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium">
            <Check class="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        {/if}

        {#if errorMsg}
          <div class="flex items-center gap-2.5 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-medium">
            <AlertCircle class="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        {/if}

        <!-- Current Image Overview Card -->
        <div class="bg-gray-50 rounded-2xl p-4 border border-gray-200/80 flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <!-- Thumbnail -->
          <div class="relative w-24 h-32 rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden flex items-center justify-center shrink-0">
            {#if currentDisplayUrl && !imgLoadError}
              <img 
                src={currentDisplayUrl} 
                alt={book.title}
                class="w-full h-full object-cover"
                onerror={() => { imgLoadError = true }}
              />
            {:else}
              <div class="text-center p-2">
                {#if imgLoadError}
                  <AlertTriangle class="w-6 h-6 text-amber-500 mx-auto mb-1" />
                  <span class="text-[10px] text-amber-700 leading-tight block">خطا در بارگذاری لینک</span>
                {:else}
                  <ImageIcon class="w-7 h-7 text-gray-300 mx-auto mb-1" />
                  <span class="text-[10px] text-gray-400 block">بدون تصویر</span>
                {/if}
              </div>
            {/if}
          </div>

          <!-- Metadata & Details -->
          <div class="flex-1 min-w-0 space-y-2 w-full text-center sm:text-right">
            <div class="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              {#if isExternal}
                <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                  <Globe class="w-3.5 h-3.5" />
                  لینک سرور خارجی (اینترنتی)
                </span>
              {:else if isLocal}
                <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <HardDrive class="w-3.5 h-3.5" />
                  ذخیره شده در فضای هاست ما
                </span>
              {:else}
                <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                  <AlertCircle class="w-3.5 h-3.5" />
                  بدون تصویر اختصاصی
                </span>
              {/if}

              {#if imgLoadError}
                <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                  <AlertTriangle class="w-3.5 h-3.5" />
                  سرور مقصد فعلاً پاسخگو نیست
                </span>
              {/if}
            </div>

            <div class="bg-white px-3 py-2 rounded-xl border border-gray-200/60 text-xs text-gray-600 break-all text-left dir-ltr">
              {book.image_url || 'تصویری ثبت نشده است'}
            </div>

            <!-- Quick Action Links -->
            <div class="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1">
              {#if book.image_url}
                <button 
                  type="button" 
                  onclick={copyCurrentUrl}
                  class="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-blue-600 transition-colors"
                >
                  {#if copied}
                    <Check class="w-3.5 h-3.5 text-emerald-600" />
                    <span class="text-emerald-600">کپی شد</span>
                  {:else}
                    <Copy class="w-3.5 h-3.5" />
                    <span>کپی آدرس</span>
                  {/if}
                </button>

                {#if currentDisplayUrl}
                  <a 
                    href={currentDisplayUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    class="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <ExternalLink class="w-3.5 h-3.5" />
                    <span>مشاهده تصویر اصلی</span>
                  </a>
                {/if}

                <button 
                  type="button" 
                  onclick={submitRemoveImage}
                  disabled={loading}
                  class="inline-flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 transition-colors mr-auto"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                  <span>حذف تصویر</span>
                </button>
              {/if}
            </div>
          </div>
        </div>

        <!-- Mode Switcher Tabs -->
        <div class="flex items-center gap-2 border-b border-gray-200 pb-2">
          {#if isExternal}
            <button 
              type="button" 
              onclick={() => activeTab = 'download'}
              class={cn(
                "flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-xl transition-all",
                activeTab === 'download' 
                  ? "bg-amber-500 text-white shadow-sm" 
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <Download class="w-4 h-4" />
              <span>انتقال مستقیم به هاست ما</span>
            </button>
          {/if}

          <button 
            type="button" 
            onclick={() => activeTab = 'upload'}
            class={cn(
              "flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-xl transition-all",
              activeTab === 'upload' 
                ? "bg-blue-600 text-white shadow-sm" 
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            <Upload class="w-4 h-4" />
            <span>آپلود فایل از کامپیوتر</span>
          </button>

          <button 
            type="button" 
            onclick={() => activeTab = 'url'}
            class={cn(
              "flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-xl transition-all",
              activeTab === 'url' 
                ? "bg-blue-600 text-white shadow-sm" 
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            <LinkIcon class="w-4 h-4" />
            <span>تغییر یا درج لینک (URL)</span>
          </button>
        </div>

        <!-- Tab 1: Download to host (if external) -->
        {#if activeTab === 'download' && isExternal}
          <div class="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 space-y-3">
            <div class="flex items-start gap-3">
              <div class="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Download class="w-5 h-5" />
              </div>
              <div class="space-y-1">
                <h4 class="text-sm font-bold text-amber-900">ذخیره و مستقل‌سازی روی هاست</h4>
                <p class="text-xs text-amber-800/90 leading-relaxed">
                  تصویر این کتاب هم‌اکنون روی یک سرور اینترنتی دیگر قرار دارد. با کلیک بر روی دکمه زیر، تصویر توسط سرور ما دانلود شده و در پوشه اختصاصی آپلودهای هاست ذخیره می‌گردد تا در صورت بروز قطعی در سایت مبدأ یا مسدود شدن آن، تصویر برای همیشه سالم بماند.
                </p>
              </div>
            </div>

            <div class="pt-2 flex items-center justify-end">
              <Button 
                type="button" 
                onclick={submitFetchExternal}
                disabled={loading}
                loading={loading}
                variant="amber"
                size="sm"
                icon={Download}
              >
                دانلود و ذخیره روی هاست
              </Button>
            </div>
          </div>
        {/if}

        <!-- Tab 2: Upload File -->
        {#if activeTab === 'upload'}
          <div class="space-y-4">
            <!-- Dropzone -->
            <div 
              class={cn(
                "border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer",
                isDragging ? "border-blue-500 bg-blue-50/60" : "border-gray-200 hover:border-gray-300 bg-gray-50/50"
              )}
              ondragover={(e) => { e.preventDefault(); isDragging = true }}
              ondragleave={() => isDragging = false}
              ondrop={handleDrop}
              onclick={() => fileInputRef?.click()}
              onkeydown={(e) => e.key === 'Enter' && fileInputRef?.click()}
              role="button"
              tabindex="0"
            >
              <input 
                bind:this={fileInputRef}
                type="file" 
                accept="image/jpeg,image/png,image/webp" 
                onchange={handleFileSelect} 
                class="hidden" 
              />

              {#if filePreview}
                <div class="flex flex-col items-center gap-3">
                  <div class="w-24 h-32 rounded-xl overflow-hidden shadow border border-gray-200">
                    <img src={filePreview} alt="پیش‌نمایش جدید" class="w-full h-full object-cover" />
                  </div>
                  <div class="text-xs text-gray-600">
                    <span class="font-medium text-gray-800">{selectedFile?.name}</span>
                    <span class="text-gray-400 block mt-0.5">برای انتخاب تصویر دیگر کلیک کنید</span>
                  </div>
                </div>
              {:else}
                <div class="flex flex-col items-center gap-2">
                  <div class="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Upload class="w-6 h-6" />
                  </div>
                  <p class="text-sm font-semibold text-gray-800">فایل تصویر را بکشید یا اینجا کلیک کنید</p>
                  <p class="text-xs text-gray-400">فرمت‌های مجاز: JPG, PNG, WebP • حداکثر ۵ مگابایت</p>
                </div>
              {/if}
            </div>

            <div class="flex items-center justify-end gap-3">
              {#if selectedFile}
                <Button 
                  type="button" 
                  onclick={() => { selectedFile = null; filePreview = null }}
                  variant="outline"
                  size="sm"
                >
                  انصراف از انتخاب
                </Button>
              {/if}
              <Button 
                type="button" 
                onclick={submitFileUpload}
                disabled={loading || !selectedFile}
                loading={loading}
                variant="primary"
                size="sm"
                icon={Upload}
              >
                آپلود و جایگزینی تصویر
              </Button>
            </div>
          </div>
        {/if}

        <!-- Tab 3: URL Editing -->
        {#if activeTab === 'url'}
          <div class="space-y-4">
            <div>
              <label for="modal-custom-url" class="block text-xs font-semibold text-gray-700 mb-1.5">
                آدرس مستقیم تصویر (اینترنتی یا مسیر هاست)
              </label>
              <div class="relative">
                <input 
                  id="modal-custom-url"
                  type="text" 
                  bind:value={customUrl}
                  placeholder="https://example.com/cover.jpg یا uploads/..."
                  dir="ltr"
                  class="w-full pl-4 pr-10 py-2.5 text-xs text-left border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                <LinkIcon class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              <p class="text-[11px] text-gray-400 mt-1.5 leading-relaxed">
                می‌توانید لینک مستقیم فایل‌های CDN، سایت کتاب‌های درسی (chap.sch.ir) یا هر آدرس دلخواهی را وارد کنید.
              </p>
            </div>

            <!-- Test Preview if typed URL differs -->
            {#if customUrl && customUrl !== book.image_url}
              <div class="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center gap-3">
                <div class="w-14 h-18 rounded-lg bg-white border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
                  <img 
                    src={storageUrl(customUrl)} 
                    alt="پیش‌نمایش تست" 
                    class="w-full h-full object-cover"
                    onerror={(e) => { e.target.src = FALLBACK_IMG }}
                  />
                </div>
                <div class="text-xs text-gray-600">
                  <span class="font-medium text-gray-800 block">پیش‌نمایش آدرس جدید</span>
                  <span class="text-[11px] text-gray-400">بررسی کنید که آیا تصویر به درستی نمایش داده می‌شود</span>
                </div>
              </div>
            {/if}

            <div class="flex items-center justify-end gap-3">
              <Button 
                type="button" 
                onclick={submitUrlChange}
                disabled={loading || !customUrl.trim()}
                loading={loading}
                variant="primary"
                size="sm"
                icon={Check}
              >
                ذخیره تغییرات آدرس
              </Button>
            </div>
          </div>
        {/if}

    {#snippet footer()}
      <div class="flex items-center justify-between w-full">
        <span class="text-[11px] text-gray-400">
          تغییرات تصویر فوراً اعمال و در صفحه ذخیره می‌شوند
        </span>
        <Button 
          type="button" 
          onclick={onclose}
          variant="outline"
          size="sm"
        >
          بستن پنجره
        </Button>
      </div>
    {/snippet}
  </Modal>
{/if}
