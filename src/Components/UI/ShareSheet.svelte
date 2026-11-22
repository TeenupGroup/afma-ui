<script>
  import { Share2, Check, Copy, Send } from 'lucide-svelte'

  let {
    title = '',
    url = '',
    label = 'اشتراک‌گذاری:',
    compact = false,
    class: customClass = ''
  } = $props()

  let copied = $state(false)
  let copyTimeout = null

  let fullUrl = $derived(
    typeof window !== 'undefined'
      ? (url.startsWith('http') ? url : window.location.origin + (url.startsWith('/') ? url : '/' + url))
      : url
  )

  let canNativeShare = $derived(
    typeof navigator !== 'undefined' && typeof navigator.share === 'function'
  )

  async function handleNativeShare() {
    if (!canNativeShare) return
    try {
      await navigator.share({
        title,
        text: title,
        url: fullUrl
      })
    } catch {
      // User cancelled or share failed
    }
  }

  async function copyToClipboard() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(fullUrl)
      } else {
        const textarea = document.createElement('textarea')
        textarea.value = fullUrl
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
      }
      copied = true
      clearTimeout(copyTimeout)
      copyTimeout = setTimeout(() => {
        copied = false
      }, 2500)
    } catch {
      // Fallback
    }
  }

  function shareBale() {
    window.open(`https://ble.ir/share/url?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(title)}`, '_blank', 'noopener,noreferrer')
  }

  function shareEitaa() {
    window.open(`https://eitaa.com/share/url?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(title)}`, '_blank', 'noopener,noreferrer')
  }

  function shareTelegram() {
    window.open(`https://t.me/share/url?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(title)}`, '_blank', 'noopener,noreferrer')
  }

  function shareWhatsApp() {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(title + '\n' + fullUrl)}`, '_blank', 'noopener,noreferrer')
  }
</script>

<div class="flex items-center justify-between flex-wrap gap-3 {customClass}" dir="rtl">
  {#if label}
    <div class="flex items-center gap-2 text-slate-600 text-sm font-medium">
      <Share2 class="w-4 h-4 text-slate-500" />
      <span>{label}</span>
    </div>
  {/if}

  <div class="flex items-center gap-2 flex-wrap">
    {#if canNativeShare}
      <button
        type="button"
        onclick={handleNativeShare}
        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold transition-all border border-blue-200"
        title="اشتراک‌گذاری با برنامه‌ها"
      >
        <Share2 class="w-3.5 h-3.5" />
        <span>اشتراک</span>
      </button>
    {/if}

    <!-- Bale (بله) -->
    <button
      type="button"
      onclick={shareBale}
      class="px-2.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold transition-all border border-emerald-200"
      title="اشتراک در پیام‌رسان بله"
    >
      بله
    </button>

    <!-- Eitaa (ایتا) -->
    <button
      type="button"
      onclick={shareEitaa}
      class="px-2.5 py-1.5 rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100 text-xs font-semibold transition-all border border-amber-200"
      title="اشتراک در پیام‌رسان ایتا"
    >
      ایتا
    </button>

    <!-- Telegram -->
    <button
      type="button"
      onclick={shareTelegram}
      class="px-2.5 py-1.5 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 text-xs font-semibold transition-all border border-sky-200"
      title="اشتراک در تلگرام"
    >
      تلگرام
    </button>

    <!-- WhatsApp -->
    <button
      type="button"
      onclick={shareWhatsApp}
      class="px-2.5 py-1.5 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 text-xs font-semibold transition-all border border-green-200"
      title="اشتراک در واتساپ"
    >
      واتساپ
    </button>

    <!-- Copy Link -->
    <button
      type="button"
      onclick={copyToClipboard}
      class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border shadow-sm {
        copied
          ? 'bg-emerald-600 text-white border-emerald-600 shadow-emerald-600/20'
          : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200 hover:border-slate-300'
      }"
      title="کپی کردن لینک در کلیپ‌بورد"
    >
      {#if copied}
        <Check class="w-3.5 h-3.5" />
        <span>کپی شد!</span>
      {:else}
        <Copy class="w-3.5 h-3.5 text-slate-400" />
        <span>کپی لینک</span>
      {/if}
    </button>
  </div>
</div>
