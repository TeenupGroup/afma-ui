<script>
  import { cn, toPersianDigits, FALLBACK_IMG, storageUrl } from '../../lib/utils.js'
  import { compressImageFile, formatFileSize } from '../../lib/compression.js'
  import { Alert, Button, Progress, Spinner, Badge } from './index.js'
  import { Upload, X, Image as ImageIcon, File, FileText, Film, Music, Check, AlertCircle, Trash2 } from 'lucide-svelte'

  let {
    value = $bindable([]),
    file = $bindable(null),
    currentUrl = null,
    onremovecurrent = null,
    accept = 'image/*',
    multiple = false,
    maxSize = 5 * 1024 * 1024, // 5MB default
    maxFiles = 10,
    disabled = false,
    uploading = false,
    uploadProgress = 0,
    error = null,
    label = '',
    helperText = '',
    required = false,
    preview = true,
    dragDrop = true,
    autoCompress = true,
    compressOptions = {},
    onchange = null,
    onupload = null,
    onremove = null,
    class: className = ''
  } = $props()

  let isDragging = $state(false)
  let isCompressing = $state(false)
  let fileInput = $state(null)
  let localError = $state(null)

  let activeError = $derived(error || localError)

  // Support maxSize passed either in KB (e.g. 2048, 5120) or in Bytes
  let maxSizeBytes = $derived(maxSize && maxSize < 1024 * 1024 ? maxSize * 1024 : maxSize)

  // Get file icon based on type
  function getFileIcon(type = '') {
    if (type.startsWith('image/')) return ImageIcon
    if (type.startsWith('video/')) return Film
    if (type.startsWith('audio/')) return Music
    if (type.includes('pdf')) return FileText
    return File
  }

  const IMAGE_EXT_REGEX = /\.(jpe?g|png|webp|gif|bmp|heic|heif|jfif|svg|tiff?)$/i

  function isImageFile(f) {
    if (!f) return false
    const type = (f.type || '').toLowerCase()
    if (type.startsWith('image/')) return true
    return IMAGE_EXT_REGEX.test(f.name || '')
  }

  // Validate file type
  function validateFileType(f) {
    if (accept && accept !== '*/*') {
      const acceptedTypes = accept.split(',').map(t => t.trim().toLowerCase())
      const fileName = (f.name || '').toLowerCase()
      const fileType = (f.type || '').toLowerCase()

      const isAccepted = acceptedTypes.some(type => {
        if (type.startsWith('.')) {
          return fileName.endsWith(type)
        }
        if (type.endsWith('/*')) {
          const prefix = type.replace('/*', '/')
          if (prefix === 'image/') {
            return isImageFile(f)
          }
          return fileType.startsWith(prefix)
        }
        if (type === 'image/jpeg' || type === 'image/jpg') {
          return fileType === 'image/jpeg' || fileType === 'image/jpg' || /\.(jpe?g|jfif)$/i.test(fileName)
        }
        if (type === 'image/png') {
          return fileType === 'image/png' || /\.png$/i.test(fileName)
        }
        if (type === 'image/webp') {
          return fileType === 'image/webp' || /\.webp$/i.test(fileName)
        }
        if (type === 'image/heic' || type === 'image/heif') {
          return fileType === 'image/heic' || fileType === 'image/heif' || /\.(heic|heif)$/i.test(fileName)
        }
        return fileType === type
      })

      if (!isAccepted) {
        return 'فرمت فایل مجاز نیست'
      }
    }
    return null
  }

  // Validate file size
  function validateFileSize(f) {
    if (maxSizeBytes && f.size > maxSizeBytes) {
      return `حجم فایل بیشتر از ${formatFileSize(maxSizeBytes)} است`
    }
    return null
  }

  // Generate preview for image files
  function generatePreview(f) {
    return new Promise((resolve) => {
      if (!isImageFile(f)) {
        resolve(null)
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target.result)
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(f)
    })
  }

  // Handle file selection
  async function handleFiles(files) {
    const fileList = Array.from(files)
    if (!fileList.length) return

    const newFiles = []
    const errors = []

    if (multiple && value.length + fileList.length > maxFiles) {
      localError = `حداکثر ${toPersianDigits(maxFiles)} فایل مجاز است`
      return
    }

    isCompressing = true
    localError = null

    try {
      for (const rawFile of fileList) {
        const typeError = validateFileType(rawFile)
        if (typeError) {
          errors.push(`${rawFile.name}: ${typeError}`)
          continue
        }

        let processedFile = rawFile
        let wasCompressed = false
        const originalSize = rawFile.size

        if (autoCompress && isImageFile(rawFile)) {
          try {
            processedFile = await compressImageFile(rawFile, compressOptions)
            if (processedFile.size < originalSize) {
              wasCompressed = true
            }
          } catch {
            processedFile = rawFile
          }
        }

        const sizeError = validateFileSize(processedFile)
        if (sizeError) {
          errors.push(`${rawFile.name}: ${sizeError}`)
          continue
        }

        const previewUrl = await generatePreview(processedFile)
        newFiles.push({
          file: processedFile,
          name: processedFile.name,
          size: processedFile.size,
          originalSize,
          wasCompressed,
          type: processedFile.type,
          preview: previewUrl
        })
      }
    } finally {
      isCompressing = false
    }

    if (errors.length > 0) {
      localError = errors.join('، ')
    }

    if (newFiles.length > 0) {
      if (multiple) {
        value = [...value, ...newFiles]
      } else {
        value = newFiles
        file = newFiles[0]?.file || null
      }

      if (onchange) {
        onchange(multiple ? value : (newFiles[0]?.file || null))
      }

      if (onupload) {
        onupload(newFiles.map(f => f.file))
      }
    }
  }

  function handleDragEnter(e) {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) isDragging = true
  }

  function handleDragLeave(e) {
    e.preventDefault()
    e.stopPropagation()
    isDragging = false
  }

  function handleDragOver(e) {
    e.preventDefault()
    e.stopPropagation()
  }

  function handleDrop(e) {
    e.preventDefault()
    e.stopPropagation()
    isDragging = false
    if (disabled) return
    const files = e.dataTransfer.files
    if (files.length > 0) handleFiles(files)
  }

  function handleInputChange(e) {
    const files = e.target.files
    if (files.length > 0) handleFiles(files)
    e.target.value = ''
  }

  function removeFile(index) {
    value = value.filter((_, i) => i !== index)
    if (!multiple) {
      file = null
    }
    if (onremove) onremove(index)
    if (onchange) onchange(multiple ? value : null)
  }

  function openFileDialog() {
    if (!disabled) fileInput?.click()
  }
</script>

<div class={cn("space-y-3 font-sans text-right", className)} dir="rtl">
  <!-- Optional Label -->
  {#if label}
    <div class="flex items-center justify-between">
      <span class="block text-sm font-medium text-gray-700">
        {label}
        {#if required}<span class="text-red-500">*</span>{/if}
      </span>
      {#if helperText}
        <span class="text-xs text-gray-400">{helperText}</span>
      {/if}
    </div>
  {/if}

  <!-- Existing / Current File Card (when in edit mode and no new file chosen) -->
  {#if currentUrl && value.length === 0 && !file}
    {@const resolvedCurrentUrl = storageUrl(currentUrl)}
    <div class="flex items-center gap-4 p-3.5 bg-slate-50 border border-slate-200 rounded-xl transition-all">
      <a
        href={resolvedCurrentUrl}
        target="_blank"
        rel="noopener noreferrer"
        class="w-16 h-16 rounded-lg overflow-hidden bg-white border border-slate-200 shrink-0 block hover:opacity-90 transition-opacity"
        title="مشاهده تصویر در اندازه کامل"
      >
        <img
          src={resolvedCurrentUrl}
          alt="تصویر فعلی"
          onerror={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMG }}
          class="w-full h-full object-cover"
        />
      </a>
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2">
          <Badge variant="secondary" size="xs">تصویر فعلی ذخیره شده</Badge>
          <a
            href={resolvedCurrentUrl}
            target="_blank"
            rel="noopener noreferrer"
            class="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
          >
            مشاهده تصویر
          </a>
        </div>
        <p class="text-[11px] text-slate-500 mt-1">برای تغییر تصویر، فایل جدیدی را در کادر زیر انتخاب یا رها کنید</p>
      </div>
      {#if onremovecurrent}
        <button
          type="button"
          onclick={onremovecurrent}
          class="p-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
          title="حذف تصویر فعلی"
        >
          <Trash2 class="w-4 h-4" />
        </button>
      {/if}
    </div>
  {/if}

  <!-- Drop zone -->
  {#if dragDrop}
    <div
      class={cn(
        "relative border-2 border-dashed rounded-2xl p-6 transition-all cursor-pointer text-center select-none",
        isDragging
          ? "border-blue-500 bg-blue-50/60 shadow-sm"
          : "border-gray-300 hover:border-blue-400 hover:bg-blue-50/20 bg-white",
        disabled && "opacity-50 cursor-not-allowed bg-gray-50 hover:bg-gray-50 hover:border-gray-300"
      )}
      ondragenter={handleDragEnter}
      ondragleave={handleDragLeave}
      ondragover={handleDragOver}
      ondrop={handleDrop}
      onclick={openFileDialog}
      role="button"
      tabindex="0"
      onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && openFileDialog()}
    >
      <div class="flex flex-col items-center gap-3">
        <div class={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-200",
          isDragging ? "bg-blue-100 text-blue-600 scale-110" : "bg-blue-50 text-blue-600 group-hover:scale-105"
        )}>
          {#if uploading || isCompressing}
            <Spinner size="md" color="sky" />
          {:else}
            <Upload class="w-6 h-6 text-blue-600" />
          {/if}
        </div>
        <div>
          <p class="text-sm font-semibold text-gray-800">
            {#if isCompressing}
              در حال فشرده‌سازی و بهینه‌سازی تصویر...
            {:else if isDragging}
              فایل را اینجا رها کنید
            {:else}
              فایل را بکشید و رها کنید یا <span class="text-blue-600 underline underline-offset-4 font-bold">انتخاب فایل</span>
            {/if}
          </p>
          <p class="text-xs text-gray-400 mt-2 flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
            {#if accept && accept !== '*/*'}
              <span>فرمت‌های مجاز: {accept.replace(/\/\*/g, '')}</span>
            {/if}
            {#if maxSizeBytes}
              <span>• حداکثر حجم: {formatFileSize(maxSizeBytes)}</span>
            {/if}
            {#if multiple && maxFiles}
              <span>• حداکثر {toPersianDigits(maxFiles)} فایل</span>
            {/if}
          </p>
        </div>
      </div>

      <!-- Upload progress -->
      {#if uploading}
        <div class="mt-4 max-w-xs mx-auto">
          <Progress value={uploadProgress} color="sky" size="sm" />
          <p class="text-xs text-slate-500 mt-1.5 text-center">
            {toPersianDigits(uploadProgress)}٪ آپلود شده
          </p>
        </div>
      {/if}
    </div>
  {:else}
    <Button
      type="button"
      variant="outline"
      size="md"
      {disabled}
      onclick={openFileDialog}
      icon={Upload}
      loading={uploading || isCompressing}
    >
      انتخاب فایل
    </Button>
  {/if}

  <!-- Native file input (sr-only for mobile event triggering resilience) -->
  <input
    bind:this={fileInput}
    type="file"
    accept={accept && accept.includes('image') && !accept.includes('.heic') ? `${accept},.heic,.heif` : accept}
    {multiple}
    {disabled}
    onchange={handleInputChange}
    class="sr-only"
    tabindex="-1"
  />

  <!-- Active error alert -->
  {#if activeError}
    <Alert variant="error" class="mb-0 items-center" bodyClass="flex items-center gap-2">
      <p class="text-xs sm:text-sm flex-1 font-medium">{activeError}</p>
      <button
        type="button"
        onclick={() => { localError = null; error = null }}
        class="p-1 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer shrink-0"
        aria-label="بستن پیام خطا"
      >
        <X class="w-3.5 h-3.5 text-rose-500" />
      </button>
    </Alert>
  {/if}

  <!-- File List / Selected File Card -->
  {#if value.length > 0}
    <div class="space-y-2">
      {#each value as item, index}
        {@const IconComponent = getFileIcon(item.type)}
        <div class="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl shadow-xs transition-all hover:border-gray-300">
          <!-- Thumbnail preview or file icon -->
          {#if preview && item.preview}
            <div class="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
              <img
                src={item.preview}
                alt={item.name}
                class="w-full h-full object-cover"
              />
            </div>
          {:else}
            <div class="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
              <IconComponent class="w-6 h-6" />
            </div>
          {/if}

          <!-- File details -->
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-gray-800 truncate" title={item.name}>{item.name}</p>
            <div class="flex items-center gap-2 mt-1">
              <span class="text-xs text-gray-500">{formatFileSize(item.size)}</span>
              {#if item.wasCompressed}
                <Badge variant="success" size="xs">
                  بهینه‌شده (کاهش از {formatFileSize(item.originalSize)})
                </Badge>
              {/if}
            </div>
          </div>

          <!-- Status indicator -->
          {#if item.status === 'uploading'}
            <Spinner size="xs" color="sky" />
          {:else if item.status === 'success'}
            <Check class="w-4 h-4 text-emerald-500" />
          {:else if item.status === 'error'}
            <AlertCircle class="w-4 h-4 text-rose-500" />
          {/if}

          <!-- Remove selected file button -->
          <button
            type="button"
            onclick={() => removeFile(index)}
            class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            title="حذف این فایل"
            aria-label="حذف {item.name}"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
      {/each}
    </div>
  {/if}
</div>
