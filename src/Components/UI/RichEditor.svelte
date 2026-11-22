<script>
  import { onMount, onDestroy } from 'svelte'
  import { cn, toPersianDigits, renderRichText, htmlToMarkdown } from '../../lib/utils.js'
  import { compressImageFiles, formatFileSize } from '../../lib/compression.js'
  import Modal from './Modal.svelte'
  import Button from './Button.svelte'
  import {
    Bold, Italic, Underline, Strikethrough,
    List, ListOrdered, Quote, Code, Link, Image, ImagePlus, AlignRight, AlignLeft,
    AlignCenter, AlignJustify, Undo, Redo, Maximize, Minimize, Palette, Loader2, FileText, Eye, Check
  } from 'lucide-svelte'

  let {
    value = $bindable(''),
    placeholder = 'محتوای خود را بنویسید...',
    minHeight = '200px',
    maxHeight = '500px',
    editable = true,
    uploadUrl = '/admin/media/upload',
    cleanupUrl = '/admin/media/cleanup',
    autoCompress = true,
    signatureUpload = false,
    compressOptions = { maxWidth: 1920, maxHeight: 1920, quality: 0.82 },
    label = '',
    required = false,
    error = null,
    helperText = '',
    onchange = null,
    class: className = ''
  } = $props()

  let editor = $state(null)
  let editorElement = $state(null)
  let markdownTextarea = $state(null)
  let isFullscreen = $state(false)
  let mode = $state('visual') // 'visual' | 'markdown'
  let markdownText = $state('')
  let showLinkDialog = $state(false)
  let linkUrl = $state('')
  let linkText = $state('')
  let showImageDialog = $state(false)
  let imageUrlInput = $state('')
  let imageAltInput = $state('')
  let isCompressing = $state(false)
  let isUploading = $state(false)
  let isDraggingOver = $state(false)
  let uploadError = $state('')
  let compressionNotice = $state('')
  let noticeTimer = null
  let charCount = $state(0)
  let wordCount = $state(0)

  // Track images uploaded during this editor instance so discarded uploads can be cleaned up
  const uploadedInSession = new Set()
  let isFormSubmitting = false

  function sendCleanupRequest(urlsToDelete) {
    if (!urlsToDelete || urlsToDelete.length === 0 || !cleanupUrl) return
    const csrfToken = typeof document !== 'undefined'
      ? (document.querySelector('meta[name="csrf-token"]')?.content || '')
      : ''
    try {
      fetch(cleanupUrl, {
        method: 'POST',
        keepalive: true,
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken,
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ urls: urlsToDelete })
      }).catch(() => {})
    } catch {
      // Ignore network errors during unload
    }
  }

  function handleFormSubmissionStart() {
    isFormSubmitting = true
    if (uploadedInSession.size === 0) return
    const currentContent = `${value || ''} ${markdownText || ''}`
    const removedDuringEdit = []
    for (const url of uploadedInSession) {
      if (!currentContent.includes(url)) {
        removedDuringEdit.push(url)
        uploadedInSession.delete(url)
      }
    }
    if (removedDuringEdit.length > 0) {
      sendCleanupRequest(removedDuringEdit)
    }
  }

  function handleInertiaStart(event) {
    const method = (event?.detail?.visit?.method || 'get').toLowerCase()
    if (method === 'post' || method === 'put' || method === 'patch') {
      handleFormSubmissionStart()
    }
  }

  function handleInertiaError() {
    isFormSubmitting = false
  }

  function handlePageHide() {
    if (!isFormSubmitting && uploadedInSession.size > 0) {
      const toDelete = Array.from(uploadedInSession)
      uploadedInSession.clear()
      sendCleanupRequest(toDelete)
    }
  }

  onMount(() => {
    if (typeof document !== 'undefined') {
      document.addEventListener('submit', handleFormSubmissionStart, true)
      document.addEventListener('inertia:start', handleInertiaStart)
      document.addEventListener('inertia:error', handleInertiaError)
      document.addEventListener('inertia:invalid', handleInertiaError)
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('pagehide', handlePageHide)
    }

    ;(async () => {
      const { Editor } = await import('@tiptap/core')
      const { StarterKit } = await import('@tiptap/starter-kit')
      const { Image } = await import('@tiptap/extension-image')
      const { Link } = await import('@tiptap/extension-link')
      const { Placeholder } = await import('@tiptap/extension-placeholder')
      const { TextAlign } = await import('@tiptap/extension-text-align')
      const { Underline } = await import('@tiptap/extension-underline')
      const { TextStyle } = await import('@tiptap/extension-text-style')
      const { Color } = await import('@tiptap/extension-color')

      const initialHtml = value ? renderRichText(value) : ''

      editor = new Editor({
        element: editorElement,
        extensions: [
          StarterKit.configure({
            heading: {
              levels: [1, 2, 3]
            }
          }),
          Image.configure({
            inline: false,
            allowBase64: true,
            HTMLAttributes: {
              class: 'rounded-xl max-w-full h-auto my-3'
            }
          }),
          Link.configure({
            openOnClick: false,
            HTMLAttributes: {
              class: 'text-blue-600 underline cursor-pointer'
            }
          }),
          Placeholder.configure({
            placeholder
          }),
          TextAlign.configure({
            types: ['heading', 'paragraph'],
            defaultAlignment: 'right'
          }),
          Underline,
          TextStyle,
          Color
        ],
        content: initialHtml,
        editable,
        editorProps: {
          attributes: {
            class: 'prose prose-sm sm:prose-base max-w-none focus:outline-none px-4 py-3',
            dir: 'rtl',
            style: `min-height: ${minHeight};`
          }
        },
        onUpdate: ({ editor }) => {
          if (mode === 'visual') {
            value = editor.getHTML()
            updateCountsFromText(editor.getText())
            if (onchange) {
              onchange(value)
            }
          }
        },
        onSelectionUpdate: ({ editor }) => {
          if (mode === 'visual') {
            updateCountsFromText(editor.getText())
          }
        }
      })

      updateCountsFromText(editor.getText())
    })()

    return () => {
      if (typeof document !== 'undefined') {
        document.removeEventListener('submit', handleFormSubmissionStart, true)
        document.removeEventListener('inertia:start', handleInertiaStart)
        document.removeEventListener('inertia:error', handleInertiaError)
        document.removeEventListener('inertia:invalid', handleInertiaError)
      }
      if (typeof window !== 'undefined') {
        window.removeEventListener('pagehide', handlePageHide)
      }
    }
  })

  onDestroy(() => {
    if (!isFormSubmitting && uploadedInSession.size > 0) {
      const toDelete = Array.from(uploadedInSession)
      uploadedInSession.clear()
      sendCleanupRequest(toDelete)
    }
    if (noticeTimer) {
      clearTimeout(noticeTimer)
    }
    if (editor) {
      editor.destroy()
    }
  })

  function updateCountsFromText(text) {
    const clean = (text || '').trim()
    charCount = (text || '').length
    wordCount = clean ? clean.split(/\s+/).length : 0
  }

  function switchMode(newMode) {
    if (newMode === mode) return
    if (newMode === 'markdown') {
      markdownText = htmlToMarkdown(value)
      mode = 'markdown'
      updateCountsFromText(markdownText)
    } else {
      const converted = renderRichText(markdownText)
      value = converted
      mode = 'visual'
      if (editor) {
        editor.commands.setContent(converted, false)
        updateCountsFromText(editor.getText())
      }
      if (onchange) {
        onchange(value)
      }
    }
  }

  function handleMarkdownInput(e) {
    markdownText = e.target.value
    value = renderRichText(markdownText)
    updateCountsFromText(markdownText)
    if (onchange) {
      onchange(value)
    }
  }

  function insertMarkdownSyntax(prefix, suffix = '', defaultText = 'متن') {
    if (!markdownTextarea) {
      markdownText += `\n${prefix}${defaultText}${suffix}`
      value = renderRichText(markdownText)
      return
    }
    const start = markdownTextarea.selectionStart ?? markdownText.length
    const end = markdownTextarea.selectionEnd ?? markdownText.length
    const selected = markdownText.slice(start, end) || defaultText
    markdownText = markdownText.slice(0, start) + prefix + selected + suffix + markdownText.slice(end)
    value = renderRichText(markdownText)
    updateCountsFromText(markdownText)
    if (onchange) onchange(value)
  }

  function toggleBold() {
    if (mode === 'markdown') {
      insertMarkdownSyntax('**', '**')
      return
    }
    editor?.chain().focus().toggleBold().run()
  }

  function toggleItalic() {
    if (mode === 'markdown') {
      insertMarkdownSyntax('*', '*')
      return
    }
    editor?.chain().focus().toggleItalic().run()
  }

  function toggleUnderline() {
    if (mode === 'markdown') {
      insertMarkdownSyntax('__', '__')
      return
    }
    editor?.chain().focus().toggleUnderline().run()
  }

  function toggleStrikethrough() {
    if (mode === 'markdown') {
      insertMarkdownSyntax('~~', '~~')
      return
    }
    editor?.chain().focus().toggleStrike().run()
  }

  function toggleHeading(level) {
    if (mode === 'markdown') {
      const hashes = '#'.repeat(level) + ' '
      insertMarkdownSyntax(`\n${hashes}`, '\n', 'عنوان')
      return
    }
    editor?.chain().focus().toggleHeading({ level }).run()
  }

  function toggleBulletList() {
    if (mode === 'markdown') {
      insertMarkdownSyntax('\n- ', '', 'آیتم لیست')
      return
    }
    editor?.chain().focus().toggleBulletList().run()
  }

  function toggleOrderedList() {
    if (mode === 'markdown') {
      insertMarkdownSyntax('\n۱. ', '', 'آیتم لیست')
      return
    }
    editor?.chain().focus().toggleOrderedList().run()
  }

  function toggleBlockquote() {
    if (mode === 'markdown') {
      insertMarkdownSyntax('\n> ', '', 'نقل قول')
      return
    }
    editor?.chain().focus().toggleBlockquote().run()
  }

  function toggleCodeBlock() {
    if (mode === 'markdown') {
      insertMarkdownSyntax('\n```\n', '\n```\n', 'کد')
      return
    }
    editor?.chain().focus().toggleCodeBlock().run()
  }

  function setAlignment(alignment) {
    editor?.chain().focus().setTextAlign(alignment).run()
  }

  function undo() {
    editor?.chain().focus().undo().run()
  }

  function redo() {
    editor?.chain().focus().redo().run()
  }

  function addLink() {
    if (mode === 'visual' && editor?.isActive('link')) {
      editor.chain().focus().unsetLink().run()
      return
    }

    if (mode === 'visual' && editor) {
      const { href } = editor.getAttributes('link')
      linkUrl = href || ''
      const { from, to } = editor.state.selection
      linkText = editor.state.doc.textBetween(from, to, '')
    } else {
      linkUrl = ''
      linkText = ''
    }

    showLinkDialog = true
  }

  function insertLink() {
    if (!linkUrl) return

    if (mode === 'markdown') {
      insertMarkdownSyntax(`[${linkText || linkUrl}](`, ')', linkUrl)
    } else if (editor) {
      if (linkText && !editor.state.selection.content().size) {
        editor.chain().focus().insertContent(`<a href="${linkUrl}" target="_blank">${linkText}</a>`).run()
      } else {
        editor.chain().focus().setLink({ href: linkUrl, target: '_blank' }).run()
      }
    }

    showLinkDialog = false
    linkUrl = ''
    linkText = ''
  }

  function openImageModal() {
    imageUrlInput = ''
    imageAltInput = ''
    uploadError = ''
    showImageDialog = true
  }

  function insertImageByUrl() {
    if (!imageUrlInput.trim()) return
    const urls = imageUrlInput
      .split(/[\n,]+/)
      .map(u => u.trim())
      .filter(Boolean)

    insertUploadedUrls(urls, imageAltInput.trim())
    showImageDialog = false
    imageUrlInput = ''
    imageAltInput = ''
  }

  function insertUploadedUrls(urls, alt = '') {
    if (!urls || urls.length === 0) return

    if (mode === 'markdown') {
      const mdImages = urls.map(u => `![${alt}](${u})`).join('\n\n')
      const start = markdownTextarea?.selectionStart ?? markdownText.length
      const end = markdownTextarea?.selectionEnd ?? start
      markdownText = markdownText.slice(0, start) + mdImages + markdownText.slice(end)
      value = renderRichText(markdownText)
      updateCountsFromText(markdownText)
      if (onchange) onchange(value)
      return
    }

    if (editor) {
      const htmlImages = urls
        .map(u => `<p><img src="${u}" alt="${alt}" class="rounded-xl max-w-full h-auto my-3" /></p>`)
        .join('')
      editor.chain().focus().insertContent(htmlImages).run()
      value = editor.getHTML()
      if (onchange) onchange(value)
    }
  }

  function isImageFile(file) {
    if (!file) return false
    if (file.type && file.type.startsWith('image/')) return true
    return /\.(jpe?g|png|webp|gif|bmp|avif)$/i.test(file.name || '')
  }

  function showCompressionToast(text) {
    compressionNotice = text
    if (noticeTimer) clearTimeout(noticeTimer)
    noticeTimer = setTimeout(() => {
      compressionNotice = ''
    }, 6000)
  }

  async function uploadFiles(fileList, { signature = false } = {}) {
    const rawFiles = Array.from(fileList || []).filter(isImageFile)
    if (rawFiles.length === 0) return

    isUploading = true
    isCompressing = autoCompress && !signature
    uploadError = ''
    compressionNotice = ''

    try {
      let filesToUpload = rawFiles
      let stats = null

      if (autoCompress && !signature) {
        stats = await compressImageFiles(rawFiles, compressOptions)
        filesToUpload = stats.files
        isCompressing = false
      }

      const allUrls = []
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content || ''

      // Process in bounded batches (max 2 images per request) to prevent 504 Gateway Timeout on shared hosting
      for (let i = 0; i < filesToUpload.length; i += 2) {
        const batch = filesToUpload.slice(i, i + 2)
        const formData = new FormData()
        batch.forEach(file => {
          formData.append('images[]', file)
        })
        if (batch.length === 1) {
          formData.append('image', batch[0])
        }

        const response = await fetch(uploadUrl, {
          method: 'POST',
          body: formData,
          credentials: 'same-origin',
          headers: {
            'X-CSRF-TOKEN': csrfToken,
            'X-Requested-With': 'XMLHttpRequest',
            'Accept': 'application/json'
          }
        })

        let data = null
        try {
          data = await response.json()
        } catch {
          data = null
        }

        if (response.ok && data) {
          const urls = Array.isArray(data.urls) && data.urls.length > 0
            ? data.urls
            : (data.url ? [data.url] : [])

          urls.forEach(u => allUrls.push(u))
        } else {
          const serverError = data?.errors
            ? Object.values(data.errors).flat()[0]
            : data?.message
          throw new Error(serverError || 'خطا در بارگذاری برخی از تصاویر.')
        }
      }

      if (allUrls.length > 0) {
        allUrls.forEach(u => uploadedInSession.add(u))
        insertUploadedUrls(allUrls, signature ? 'امضا' : imageAltInput.trim())
        showImageDialog = false
        imageAltInput = ''

        if (stats && stats.savedBytes > 1024 && stats.savedPercent > 0) {
          showCompressionToast(
            `تصویر فشرده‌سازی (${toPersianDigits(stats.savedPercent)}٪ کاهش حجم: ${formatFileSize(stats.totalOriginalSize)} ← ${formatFileSize(stats.totalCompressedSize)}) و درج شد.`
          )
        } else {
          showCompressionToast('تصاویر با موفقیت در پس‌زمینه آپلود و در متن درج شدند.')
        }
      } else {
        uploadError = 'هیچ تصویری آپلود نشد.'
      }
    } catch (err) {
      console.error('RichEditor image upload failed:', err)
      uploadError = 'خطا در ارتباط با سرور هنگام آپلود تصویر.'
    } finally {
      isCompressing = false
      isUploading = false
    }
  }

  async function uploadImages(event) {
    const files = event.target?.files
    if (files && files.length > 0) {
      await uploadFiles(files)
    }
    if (event.target) {
      event.target.value = ''
    }
  }

  async function uploadSignature(event) {
    const input = event.currentTarget
    if (input.files?.length) await uploadFiles(input.files, { signature: true })
    input.value = ''
  }

  function handleDrop(event) {
    isDraggingOver = false
    if (!editable) return
    const files = event.dataTransfer?.files
    if (files && files.length > 0) {
      const imageFiles = Array.from(files).filter(isImageFile)
      if (imageFiles.length > 0) {
        event.preventDefault()
        event.stopPropagation()
        uploadFiles(imageFiles)
      }
    }
  }

  function handlePaste(event) {
    if (!editable) return
    const items = event.clipboardData?.items
    if (!items) return
    const imageFiles = []
    for (const item of items) {
      if (item.type?.startsWith('image/')) {
        const file = item.getAsFile()
        if (file) imageFiles.push(file)
      }
    }
    if (imageFiles.length > 0) {
      event.preventDefault()
      uploadFiles(imageFiles)
    }
  }

  function toggleFullscreen() {
    isFullscreen = !isFullscreen
  }

  function setTextColor(color) {
    editor?.chain().focus().setColor(color).run()
  }

  function isActive(type, attrs = {}) {
    return editor?.isActive(type, attrs) || false
  }

  // Update editor content when value changes externally
  $effect(() => {
    if (mode === 'visual' && editor && value !== editor.getHTML()) {
      const rendered = value ? renderRichText(value) : ''
      if (rendered !== editor.getHTML()) {
        editor.commands.setContent(rendered, false)
      }
    }
  })

  // Update editable state
  $effect(() => {
    if (editor) {
      editor.setEditable(editable)
    }
  })
</script>

<div class="w-full" dir="rtl">
  {#if label}
    <label class="block text-sm font-medium text-gray-700 mb-1.5">
      {label}
      {#if required}
        <span class="text-rose-500 mr-0.5">*</span>
      {/if}
    </label>
  {/if}

  <div
    class={cn(
      "border border-gray-300 rounded-xl overflow-hidden bg-white transition-all",
      error && "border-rose-400 ring-1 ring-rose-400/30",
      isDraggingOver && "ring-2 ring-blue-500 border-blue-500 bg-blue-50/20",
      isFullscreen && "fixed inset-0 z-50 rounded-none flex flex-col",
      className
    )}
    dir="rtl"
    ondragover={(e) => { if (editable && e.dataTransfer?.types?.includes('Files')) { e.preventDefault(); isDraggingOver = true } }}
    ondragleave={() => { isDraggingOver = false }}
    ondrop={handleDrop}
    onpaste={handlePaste}
    role="region"
    aria-label={label || "ویرایشگر متن"}
  >
    <!-- Toolbar -->
    {#if editable}
      <div class="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 bg-gray-50">
        <!-- Mode Switcher (Visual vs Markdown) -->
        <div class="flex items-center gap-1 border-l border-gray-300 pl-2 ml-1">
          <button
            type="button"
            onclick={() => switchMode('visual')}
            class={cn(
              "inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors",
              mode === 'visual' ? "bg-blue-600 text-white shadow-xs" : "hover:bg-gray-200 text-gray-600"
            )}
            title="ویرایشگر دیداری (غنی)"
          >
            <Eye class="w-3.5 h-3.5" />
            <span>دیداری</span>
          </button>
          <button
            type="button"
            onclick={() => switchMode('markdown')}
            class={cn(
              "inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors",
              mode === 'markdown' ? "bg-blue-600 text-white shadow-xs" : "hover:bg-gray-200 text-gray-600"
            )}
            title="ویرایشگر مارک‌داون (Markdown)"
          >
            <FileText class="w-3.5 h-3.5" />
            <span>مارک‌داون</span>
          </button>
        </div>

        <!-- Text formatting -->
        <div class="flex items-center gap-0.5 border-l border-gray-300 pl-1 ml-1">
          <button
            type="button"
            onclick={toggleBold}
            class={cn(
              "p-1.5 rounded-lg transition-colors",
              isActive('bold') ? "bg-blue-100 text-blue-700" : "hover:bg-gray-200 text-gray-600"
            )}
            title="ضخیم (Bold)"
          >
            <Bold class="w-4 h-4" />
          </button>
          <button
            type="button"
            onclick={toggleItalic}
            class={cn(
              "p-1.5 rounded-lg transition-colors",
              isActive('italic') ? "bg-blue-100 text-blue-700" : "hover:bg-gray-200 text-gray-600"
            )}
            title="مورب (Italic)"
          >
            <Italic class="w-4 h-4" />
          </button>
          <button
            type="button"
            onclick={toggleUnderline}
            class={cn(
              "p-1.5 rounded-lg transition-colors",
              isActive('underline') ? "bg-blue-100 text-blue-700" : "hover:bg-gray-200 text-gray-600"
            )}
            title="زیرخط (Underline)"
          >
            <Underline class="w-4 h-4" />
          </button>
          <button
            type="button"
            onclick={toggleStrikethrough}
            class={cn(
              "p-1.5 rounded-lg transition-colors",
              isActive('strike') ? "bg-blue-100 text-blue-700" : "hover:bg-gray-200 text-gray-600"
            )}
            title="خط‌خورده"
          >
            <Strikethrough class="w-4 h-4" />
          </button>
        </div>

        <!-- Headings -->
        <div class="flex items-center gap-0.5 border-l border-gray-300 pl-1 ml-1">
          <button
            type="button"
            onclick={() => toggleHeading(1)}
            class={cn(
              "p-1.5 rounded-lg transition-colors text-xs font-bold",
              isActive('heading', { level: 1 }) ? "bg-blue-100 text-blue-700" : "hover:bg-gray-200 text-gray-600"
            )}
            title="سرتیتر ۱"
          >
            تیتر ۱
          </button>
          <button
            type="button"
            onclick={() => toggleHeading(2)}
            class={cn(
              "p-1.5 rounded-lg transition-colors text-xs font-bold",
              isActive('heading', { level: 2 }) ? "bg-blue-100 text-blue-700" : "hover:bg-gray-200 text-gray-600"
            )}
            title="سرتیتر ۲"
          >
            تیتر ۲
          </button>
          <button
            type="button"
            onclick={() => toggleHeading(3)}
            class={cn(
              "p-1.5 rounded-lg transition-colors text-xs font-bold",
              isActive('heading', { level: 3 }) ? "bg-blue-100 text-blue-700" : "hover:bg-gray-200 text-gray-600"
            )}
            title="سرتیتر ۳"
          >
            تیتر ۳
          </button>
        </div>

        <!-- Lists -->
        <div class="flex items-center gap-0.5 border-l border-gray-300 pl-1 ml-1">
          <button
            type="button"
            onclick={toggleBulletList}
            class={cn(
              "p-1.5 rounded-lg transition-colors",
              isActive('bulletList') ? "bg-blue-100 text-blue-700" : "hover:bg-gray-200 text-gray-600"
            )}
            title="لیست نقطه‌ای"
          >
            <List class="w-4 h-4" />
          </button>
          <button
            type="button"
            onclick={toggleOrderedList}
            class={cn(
              "p-1.5 rounded-lg transition-colors",
              isActive('orderedList') ? "bg-blue-100 text-blue-700" : "hover:bg-gray-200 text-gray-600"
            )}
            title="لیست شماره‌دار"
          >
            <ListOrdered class="w-4 h-4" />
          </button>
        </div>

        <!-- Alignment (Visual mode) -->
        {#if mode === 'visual'}
          <div class="flex items-center gap-0.5 border-l border-gray-300 pl-1 ml-1">
            <button
              type="button"
              onclick={() => setAlignment('right')}
              class={cn(
                "p-1.5 rounded-lg transition-colors",
                isActive({ textAlign: 'right' }) ? "bg-blue-100 text-blue-700" : "hover:bg-gray-200 text-gray-600"
              )}
              title="راست‌چین"
            >
              <AlignRight class="w-4 h-4" />
            </button>
            <button
              type="button"
              onclick={() => setAlignment('center')}
              class={cn(
                "p-1.5 rounded-lg transition-colors",
                isActive({ textAlign: 'center' }) ? "bg-blue-100 text-blue-700" : "hover:bg-gray-200 text-gray-600"
              )}
              title="وسط‌چین"
            >
              <AlignCenter class="w-4 h-4" />
            </button>
            <button
              type="button"
              onclick={() => setAlignment('left')}
              class={cn(
                "p-1.5 rounded-lg transition-colors",
                isActive({ textAlign: 'left' }) ? "bg-blue-100 text-blue-700" : "hover:bg-gray-200 text-gray-600"
              )}
              title="چپ‌چین"
            >
              <AlignLeft class="w-4 h-4" />
            </button>
            <button
              type="button"
              onclick={() => setAlignment('justify')}
              class={cn(
                "p-1.5 rounded-lg transition-colors",
                isActive({ textAlign: 'justify' }) ? "bg-blue-100 text-blue-700" : "hover:bg-gray-200 text-gray-600"
              )}
              title="تراز دوطرفه"
            >
              <AlignJustify class="w-4 h-4" />
            </button>
          </div>
        {/if}

        <!-- Blocks -->
        <div class="flex items-center gap-0.5 border-l border-gray-300 pl-1 ml-1">
          <button
            type="button"
            onclick={toggleBlockquote}
            class={cn(
              "p-1.5 rounded-lg transition-colors",
              isActive('blockquote') ? "bg-blue-100 text-blue-700" : "hover:bg-gray-200 text-gray-600"
            )}
            title="نقل قول"
          >
            <Quote class="w-4 h-4" />
          </button>
          <button
            type="button"
            onclick={toggleCodeBlock}
            class={cn(
              "p-1.5 rounded-lg transition-colors",
              isActive('codeBlock') ? "bg-blue-100 text-blue-700" : "hover:bg-gray-200 text-gray-600"
            )}
            title="بلوک کد"
          >
            <Code class="w-4 h-4" />
          </button>
        </div>

        <!-- Links and Multiple Images -->
        <div class="flex items-center gap-1 border-l border-gray-300 pl-1 ml-1">
          <button
            type="button"
            onclick={addLink}
            class={cn(
              "p-1.5 rounded-lg transition-colors",
              isActive('link') ? "bg-blue-100 text-blue-700" : "hover:bg-gray-200 text-gray-600"
            )}
            title="افزودن لینک"
          >
            <Link class="w-4 h-4" />
          </button>

          <label
            class={cn(
              "inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer",
              isUploading ? "bg-blue-50 text-blue-600" : "bg-blue-50 hover:bg-blue-100 text-blue-700"
            )}
            title="آپلود و فشرده‌سازی خودکار یک یا چند تصویر در متن"
          >
            <input
              type="file"
              accept="image/*"
              multiple
              onchange={uploadImages}
              disabled={isUploading}
              class="hidden"
            />
            {#if isUploading}
              <Loader2 class="w-3.5 h-3.5 animate-spin" />
              <span>{isCompressing ? 'در حال فشرده‌سازی...' : 'در حال آپلود...'}</span>
            {:else}
              <ImagePlus class="w-3.5 h-3.5" />
              <span>آپلود تصاویر</span>
            {/if}
          </label>

          {#if signatureUpload}
            <label class="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 cursor-pointer">
              <input type="file" accept="image/png,image/jpeg,image/webp" onchange={uploadSignature} disabled={isUploading} class="sr-only" />
              <ImagePlus class="w-3.5 h-3.5" />
              <span>درج تصویر امضا</span>
            </label>
          {/if}

          <button
            type="button"
            onclick={openImageModal}
            class="p-1.5 rounded-lg hover:bg-gray-200 text-gray-600 transition-colors"
            title="افزودن تصویر با لینک یا آپلود"
          >
            <Image class="w-4 h-4" />
          </button>
        </div>

        <!-- Color (Visual mode) -->
        {#if mode === 'visual'}
          <div class="flex items-center gap-0.5 border-l border-gray-300 pl-1 ml-1">
            <div class="relative group">
              <button
                type="button"
                class="p-1.5 rounded-lg hover:bg-gray-200 text-gray-600 transition-colors"
                title="رنگ متن"
              >
                <Palette class="w-4 h-4" />
              </button>
              <div class="absolute top-full left-0 mt-1 p-2 bg-white rounded-xl shadow-lg border border-gray-200 hidden group-hover:block z-10">
                <div class="grid grid-cols-5 gap-1">
                  {#each ['#000000', '#ef4444', '#10b981', '#2563eb', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#475569', '#16a34a'] as color}
                    <button
                      type="button"
                      onclick={() => setTextColor(color)}
                      class="w-6 h-6 rounded-full border border-gray-200 hover:scale-110 transition-transform"
                      style="background-color: {color}"
                      title={color}
                    ></button>
                  {/each}
                </div>
              </div>
            </div>
          </div>

          <!-- Undo/Redo -->
          <div class="flex items-center gap-0.5 border-l border-gray-300 pl-1 ml-1">
            <button
              type="button"
              onclick={undo}
              class="p-1.5 rounded-lg hover:bg-gray-200 text-gray-600 transition-colors"
              title="بازگشت (Undo)"
            >
              <Undo class="w-4 h-4" />
            </button>
            <button
              type="button"
              onclick={redo}
              class="p-1.5 rounded-lg hover:bg-gray-200 text-gray-600 transition-colors"
              title="انجام مجدد (Redo)"
            >
              <Redo class="w-4 h-4" />
            </button>
          </div>
        {/if}

        <!-- Fullscreen -->
        <div class="flex items-center gap-0.5 mr-auto">
          <button
            type="button"
            onclick={toggleFullscreen}
            class="p-1.5 rounded-lg hover:bg-gray-200 text-gray-600 transition-colors"
            title={isFullscreen ? "خروج از تمام‌صفحه" : "تمام‌صفحه"}
          >
            {#if isFullscreen}
              <Minimize class="w-4 h-4" />
            {:else}
              <Maximize class="w-4 h-4" />
            {/if}
          </button>
        </div>
      </div>
    {/if}

    {#if uploadError}
      <div class="px-4 py-2 bg-rose-50 border-b border-rose-100 text-xs text-rose-600 flex items-center justify-between">
        <span>{uploadError}</span>
        <button type="button" onclick={() => uploadError = ''} class="text-rose-500 hover:text-rose-700 font-bold">بستن</button>
      </div>
    {/if}

    {#if compressionNotice}
      <div class="px-4 py-1.5 bg-emerald-50 border-b border-emerald-100 text-xs text-emerald-700 flex items-center justify-between">
        <span class="inline-flex items-center gap-1.5">
          <Check class="w-3.5 h-3.5 text-emerald-600" />
          {compressionNotice}
        </span>
        <button type="button" onclick={() => compressionNotice = ''} class="text-emerald-600 hover:text-emerald-800 font-bold">بستن</button>
      </div>
    {/if}

    <!-- Editor Content Area -->
    <div
      class={cn(
        "overflow-y-auto flex-1",
        mode === 'markdown' && "hidden"
      )}
      bind:this={editorElement}
      style="min-height: {minHeight}; max-height: {isFullscreen ? 'calc(100vh - 120px)' : maxHeight}"
    ></div>

    {#if mode === 'markdown'}
      <textarea
        bind:this={markdownTextarea}
        value={markdownText}
        oninput={handleMarkdownInput}
        {placeholder}
        dir="rtl"
        class="w-full px-4 py-3 text-sm leading-relaxed text-gray-800 bg-white focus:outline-none resize-y flex-1"
        style="min-height: {minHeight}; max-height: {isFullscreen ? 'calc(100vh - 120px)' : maxHeight}"
      ></textarea>
    {/if}

    <!-- Footer -->
    <div class="flex flex-wrap items-center justify-between gap-2 px-4 py-2 border-t border-gray-200 bg-gray-50 text-xs text-gray-500">
      <div class="flex items-center gap-4">
        <span>{toPersianDigits(charCount)} کاراکتر</span>
        <span>{toPersianDigits(wordCount)} کلمه</span>
        <span class="text-gray-400 hidden sm:inline">پشتیبانی از متن استایل‌دار، مارک‌داون، فشرده‌سازی خودکار و کشیدن و رها کردن تصویر</span>
      </div>
      {#if !editable}
        <span class="text-gray-400">فقط خواندنی</span>
      {/if}
    </div>
  </div>

  {#if error}
    <p class="mt-1.5 text-xs text-rose-600">{error}</p>
  {:else if helperText}
    <p class="mt-1.5 text-xs text-gray-500">{helperText}</p>
  {/if}
</div>

<!-- Link Dialog -->
<Modal bind:open={showLinkDialog} title="افزودن لینک" size="md">
  <div class="space-y-4">
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">متن لینک</label>
      <input
        type="text"
        bind:value={linkText}
        placeholder="متن نمایشی"
        class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
      />
    </div>
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">آدرس URL</label>
      <input
        type="url"
        bind:value={linkUrl}
        placeholder="https://example.com"
        class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        dir="ltr"
      />
    </div>
  </div>

  <div class="flex items-center justify-end gap-3 mt-6">
    <Button
      variant="ghost"
      onclick={() => showLinkDialog = false}
    >
      انصراف
    </Button>
    <Button
      variant="primary"
      onclick={insertLink}
    >
      افزودن
    </Button>
  </div>
</Modal>

<!-- Image Dialog (Multiple file upload + URL input) -->
<Modal bind:open={showImageDialog} title="افزودن تصویر" size="md">
  <div class="space-y-4">
    {#if uploadError}
      <div class="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600 flex items-center justify-between">
        <span>{uploadError}</span>
        <button type="button" onclick={() => uploadError = ''} class="text-rose-500 hover:text-rose-700 font-bold">بستن</button>
      </div>
    {/if}

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1.5">آپلود یک یا چند تصویر از دستگاه (با فشرده‌سازی خودکار)</label>
      <label class="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-colors">
        {#if isUploading}
          <Loader2 class="w-6 h-6 text-blue-600 animate-spin mb-1" />
          <span class="text-sm text-blue-600">
            {isCompressing ? 'در حال فشرده‌سازی تصاویر...' : 'در حال آپلود تصاویر...'}
          </span>
        {:else}
          <ImagePlus class="w-6 h-6 text-gray-400 mb-1" />
          <span class="text-sm text-gray-600">برای انتخاب یک یا چند تصویر کلیک کنید</span>
          <span class="text-xs text-gray-400 mt-0.5">کاهش خودکار حجم قبل از ارسال — JPG, PNG, WEBP</span>
        {/if}
        <input
          type="file"
          accept="image/*"
          multiple
          onchange={uploadImages}
          disabled={isUploading}
          class="hidden"
        />
      </label>
    </div>

    <div class="relative flex py-1 items-center">
      <div class="flex-grow border-t border-gray-200"></div>
      <span class="flex-shrink mx-3 text-xs text-gray-400">یا وارد کردن آدرس تصویر</span>
      <div class="flex-grow border-t border-gray-200"></div>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">آدرس تصویر (امکان وارد کردن چند آدرس در خطوط مجزا)</label>
      <textarea
        bind:value={imageUrlInput}
        rows="3"
        placeholder="https://example.com/image.jpg"
        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        dir="ltr"
      ></textarea>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">متن جایگزین (Alt)</label>
      <input
        type="text"
        bind:value={imageAltInput}
        placeholder="توضیح کوتاه تصویر"
        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
      />
    </div>
  </div>

  <div class="flex items-center justify-end gap-3 mt-6">
    <Button
      variant="ghost"
      onclick={() => showImageDialog = false}
    >
      انصراف
    </Button>
    <Button
      variant="primary"
      onclick={insertImageByUrl}
      disabled={!imageUrlInput.trim() || isUploading}
    >
      درج تصویر
    </Button>
  </div>
</Modal>

<style>
  :global(.ProseMirror) {
    min-height: 150px;
    outline: none;
  }

  :global(.ProseMirror p.is-editor-empty:first-child::before) {
    content: attr(data-placeholder);
    float: right;
    color: #9ca3af;
    pointer-events: none;
    height: 0;
  }

  :global(.ProseMirror img) {
    max-width: 100%;
    height: auto;
    border-radius: 0.75rem;
    margin: 0.75rem 0;
  }

  :global(.ProseMirror blockquote) {
    border-right: 3px solid #d1d5db;
    padding-right: 1rem;
    margin-right: 0;
    color: #6b7280;
  }

  :global(.ProseMirror pre) {
    background-color: #1f2937;
    color: #f9fafb;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    overflow-x: auto;
    direction: ltr;
    text-align: left;
  }

  :global(.ProseMirror ul),
  :global(.ProseMirror ol) {
    padding-right: 1.5rem;
  }

  :global(.ProseMirror h1) {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 1rem 0 0.5rem;
  }

  :global(.ProseMirror h2) {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0.875rem 0 0.5rem;
  }

  :global(.ProseMirror h3) {
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0.75rem 0 0.5rem;
  }
</style>
