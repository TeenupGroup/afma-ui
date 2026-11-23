<script>
  import { onMount } from 'svelte'
  import { usePage } from '@inertiajs/svelte'
  import { toPersianDigits } from '../../lib/utils.js'
  import { getBrandConfig, getSchoolsForBrand, hydrateBrandsFromSettings } from '../../lib/brands.js'
  import { Badge } from '../../Components/UI/index.js'

  let {
    letter = {},
    scale = 1,
    id = 'official-letter-doc',
    effectiveFontSize = $bindable(11),
    isAutoShrunk = $bindable(false),
    overflowsPage = $bindable(false),
    estimatedPages = $bindable(1),
  } = $props()

  const page = usePage()
  const brandKey = $derived(letter.brand || 'farhang-mahan')
  const brandConfig = $derived.by(() => {
    hydrateBrandsFromSettings(page.props?.siteSettings)
    return getBrandConfig(brandKey)
  })
  const isAliaj = $derived(brandKey === 'farhang-aliaj')

  const logoSrc = $derived(
    letter.logo_url !== undefined
      ? letter.logo_url
      : (isAliaj ? '/images/logo-aliaj.svg' : '/images/logo.svg')
  )
  const primaryColor = $derived(letter.primary_color || (isAliaj ? '#1e3a8a' : '#15803d'))
  const primaryDark = $derived(letter.primary_dark || (isAliaj ? '#172554' : '#14532d'))
  const borderAccent = $derived(letter.border_accent || (isAliaj ? '#bfdbfe' : '#bbf7d0'))

  const attachmentLabel = $derived.by(() => {
    if (!letter.attachment_status || letter.attachment_status === 'none') return 'ندارد'
    if (letter.attachment_status === 'has_attachment') return 'دارد'
    return letter.attachment_status
  })

  const matchedSchool = $derived.by(() => {
    const schools = getSchoolsForBrand(brandKey)
    const schoolId = letter.school_id || letter.metadata?.school_id || ''
    const schoolName = letter.metadata?.school_name || ''
    return (
      schools.find(
        (s) =>
          (schoolId && (s.id === schoolId || s.slug === schoolId || s.name === schoolId)) ||
          (schoolName && (s.official_name === schoolName || s.name === schoolName))
      ) || null
    )
  })

  const displayHeaderTitle = $derived(
    letter.header_title || brandConfig.full_name
  )
  const displaySchoolName = $derived(
    letter.header_subtitle || letter.metadata?.school_name || letter.school_name || matchedSchool?.official_name || matchedSchool?.name || brandConfig.school_name
  )
  const displayAddress = $derived(
    letter.address || letter.metadata?.custom_address || matchedSchool?.address || brandConfig.default_address || 'نشانی مرکز'
  )
  const displayPhone = $derived(
    letter.phone ?? letter.metadata?.custom_phone ?? matchedSchool?.phone ?? brandConfig.phone ?? ''
  )
  const displayDomain = $derived(
    letter.domain || letter.metadata?.domain || matchedSchool?.domain || brandConfig.domain || 'farmahan.ir'
  )
  const displayPostalCode = $derived.by(() => {
    const code = String(letter.metadata?.postal_code ?? matchedSchool?.postal_code ?? '').trim()
    if (['', '۷۹۴۱۱۱۱۱۱۱', '7941111111', '۸۹۴۱۹۹۹۹۹۹', '8941999999'].includes(code)) {
      return ''
    }
    return code
  })

  const baseFontSize = $derived.by(() => {
    const raw = Number(letter.metadata?.font_size)
    return Number.isFinite(raw) && raw > 0 ? Math.max(6, Math.min(18, raw)) : 11
  })

  const baseLineHeight = $derived.by(() => {
    const raw = Number(letter.metadata?.line_height)
    return Number.isFinite(raw) && raw > 0 ? Math.max(1.2, Math.min(2.5, raw)) : 1.95
  })

  const fitToOnePage = $derived(Boolean(letter.metadata?.fit_to_one_page))
  const paperSize = $derived((letter.metadata?.paper_size || 'a4').toLowerCase() === 'a5' ? 'a5' : 'a4')
  const isA5 = $derived(paperSize === 'a5')
  const sheetWidthMm = $derived(isA5 ? '148mm' : '210mm')
  const sheetHeightMm = $derived(isA5 ? '210mm' : '297mm')
  const fitHeightMm = $derived(isA5 ? '205mm' : '292mm')
  const sheetPadding = $derived(isA5 ? '10mm 11mm' : '16mm 18mm')
  const validTranscripts = $derived(
    Array.isArray(letter.transcripts) ? letter.transcripts.filter((t) => t && String(t).trim()) : []
  )

  let docEl = $state(null)
  let fitRulerEl = $state(null)
  let fullPageRulerEl = $state(null)

  function lerp(minVal, maxVal, t) {
    return minVal + (maxVal - minVal) * t
  }

  function applyTypographyAtFactor(t, startFont, startLineHeight) {
    if (!docEl) return startFont

    const a5Mult = isA5 ? 0.88 : 1
    const adjustedStartFont = Math.max(5.5, startFont * a5Mult)
    let fontPt
    let lineH
    if (t >= 0.3) {
      const localT = (t - 0.3) / 0.7
      const midFont = Math.min(6, adjustedStartFont)
      fontPt = lerp(midFont, adjustedStartFont, localT)
      lineH = lerp(Math.min(1.36, startLineHeight), startLineHeight, localT)
    } else {
      const localT = t / 0.3
      const midFont = Math.min(6, adjustedStartFont)
      fontPt = lerp(3.5, midFont, localT)
      lineH = lerp(1.2, Math.min(1.36, startLineHeight), localT)
    }

    const paraGap = lerp(2, 11 * a5Mult, t)
    const bodyPy = lerp(5, 20 * a5Mult, t)
    const recipientMb = lerp(4, 16 * a5Mult, t)
    const closingMt = lerp(4, 20 * a5Mult, t)
    const signerMt = lerp(5, 28 * a5Mult, t)
    const sigBoxH = lerp(34, 68 * a5Mult, t)
    const transcriptsMt = lerp(4, 22 * a5Mult, t)
    const footerMt = lerp(4, 16 * a5Mult, t)
    const subScale = lerp(0.76 * a5Mult, a5Mult, t)

    docEl.style.setProperty('--letter-font-size', `${fontPt.toFixed(2)}pt`)
    docEl.style.setProperty('--letter-line-height', `${lineH.toFixed(2)}`)
    docEl.style.setProperty('--letter-para-gap', `${paraGap.toFixed(1)}px`)
    docEl.style.setProperty('--letter-body-py', `${bodyPy.toFixed(1)}px`)
    docEl.style.setProperty('--letter-recipient-mb', `${recipientMb.toFixed(1)}px`)
    docEl.style.setProperty('--letter-closing-mt', `${closingMt.toFixed(1)}px`)
    docEl.style.setProperty('--letter-signer-mt', `${signerMt.toFixed(1)}px`)
    docEl.style.setProperty('--letter-sig-h', `${sigBoxH.toFixed(0)}px`)
    docEl.style.setProperty('--letter-transcripts-mt', `${transcriptsMt.toFixed(1)}px`)
    docEl.style.setProperty('--letter-footer-mt', `${footerMt.toFixed(1)}px`)
    docEl.style.setProperty('--letter-sub-scale', `${subScale.toFixed(3)}`)

    return fontPt
  }

  function recalculateLayout() {
    if (!docEl || !fitRulerEl || !fullPageRulerEl) return

    const startFont = baseFontSize
    const startLH = baseLineHeight
    const maxSinglePagePx = fitRulerEl.offsetHeight || (isA5 ? 775 : 1103)
    const fullPagePx = fullPageRulerEl.offsetHeight || (isA5 ? 794 : 1122)

    docEl.style.minHeight = '0px'
    docEl.style.height = 'auto'
    docEl.style.maxHeight = 'none'

    applyTypographyAtFactor(1, startFont, startLH)
    const naturalHeightAtBase = docEl.scrollHeight

    if (!fitToOnePage) {
      const doesOverflow = naturalHeightAtBase > fullPagePx + 4
      overflowsPage = doesOverflow
      isAutoShrunk = false
      effectiveFontSize = Math.round(startFont * 10) / 10
      estimatedPages = doesOverflow ? Math.max(2, Math.ceil(naturalHeightAtBase / fullPagePx)) : 1
      docEl.style.minHeight = sheetHeightMm
      return
    }

    if (naturalHeightAtBase <= maxSinglePagePx) {
      overflowsPage = false
      isAutoShrunk = false
      effectiveFontSize = Math.round(startFont * 10) / 10
      estimatedPages = 1
      docEl.style.minHeight = sheetHeightMm
      docEl.style.height = sheetHeightMm
      docEl.style.maxHeight = sheetHeightMm
      return
    }

    let low = 0
    let high = 1
    let bestT = 0
    for (let i = 0; i < 14; i++) {
      const mid = (low + high) / 2
      applyTypographyAtFactor(mid, startFont, startLH)
      if (docEl.scrollHeight <= maxSinglePagePx) {
        bestT = mid
        low = mid
      } else {
        high = mid
      }
    }

    const chosenFont = applyTypographyAtFactor(bestT, startFont, startLH)
    overflowsPage = false
    isAutoShrunk = true
    effectiveFontSize = Math.round(chosenFont * 10) / 10
    estimatedPages = 1
    docEl.style.minHeight = sheetHeightMm
    docEl.style.height = sheetHeightMm
    docEl.style.maxHeight = sheetHeightMm
  }

  $effect(() => {
    // Track every reactive field that affects vertical height
    void letter.content
    void letter.subject
    void letter.recipient
    void letter.recipient_position
    void letter.greeting
    void letter.closing
    void letter.signer_name
    void letter.signer_title
    void letter.has_signature
    void letter.has_stamp
    void letter.signature_image
    void letter.footer_note
    void letter.priority
    void letter.confidentiality
    void displayAddress
    void validTranscripts.length
    void baseFontSize
    void baseLineHeight
    void fitToOnePage
    void paperSize

    recalculateLayout()
  })

  onMount(() => {
    recalculateLayout()
    if (typeof document !== 'undefined' && document.fonts?.ready) {
      document.fonts.ready.then(() => {
        recalculateLayout()
      }).catch(() => {})
    }
  })
</script>

<div
  bind:this={docEl}
  {id}
  class="letter-a4-sheet {fitToOnePage ? 'is-fit-mode' : ''} {isA5 ? 'is-a5' : ''} bg-white text-slate-800 shadow-xl rounded-lg mx-auto relative flex flex-col justify-between overflow-hidden transition-transform duration-200 border border-slate-200"
  style="width: {sheetWidthMm}; min-height: {sheetHeightMm}; padding: {sheetPadding}; transform-origin: top center; transform: scale({scale}); font-family: var(--font-sans, 'YekanBakh', system-ui, sans-serif);"
  dir="rtl"
>
  <!-- Hidden physical mm rulers for zoom/DPI-independent A4/A5 measurement -->
  <div
    bind:this={fitRulerEl}
    aria-hidden="true"
    style="position: absolute; top: 0; left: 0; width: 0; height: {fitHeightMm}; visibility: hidden; pointer-events: none;"
  ></div>
  <div
    bind:this={fullPageRulerEl}
    aria-hidden="true"
    style="position: absolute; top: 0; left: 0; width: 0; height: {sheetHeightMm}; visibility: hidden; pointer-events: none;"
  ></div>

  {#if overflowsPage && !fitToOnePage}
    <div
      aria-hidden="true"
      class="pointer-events-none absolute left-0 right-0 border-t-2 border-dashed border-amber-500/80 z-20 flex justify-center"
      style="top: {sheetHeightMm};"
    >
      <span class="bg-amber-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full -mt-2.5 shadow-xs">
        مرز پایان صفحه اول {paperSize.toUpperCase()} (ادامه با سربرگ و فوتر ثابت)
      </span>
    </div>
  {/if}

  <!-- Letterhead Header -->
  <header class="flex items-start justify-between pb-3 border-b-2 relative shrink-0" style="border-color: {primaryColor}">
    <div class="absolute -bottom-[5px] left-0 right-0 h-[1px]" style="background-color: {borderAccent}"></div>

    <!-- Right: Vector Logo & Organization Info -->
    <div class="flex items-center gap-3 w-[40%]">
      {#if logoSrc}
        <img src={logoSrc} alt={displayHeaderTitle} onload={recalculateLayout} onerror={(e) => { e.currentTarget.style.display = 'none' }} class="{isA5 ? 'w-11 h-11' : 'w-16 h-16'} object-contain shrink-0" />
      {/if}
      <div class="flex flex-col text-right">
        <h2 class="{isA5 ? 'text-sm' : 'text-base'} font-extrabold leading-tight" style="color: {primaryDark}">
          {displayHeaderTitle}
        </h2>
        <span class="{isA5 ? 'text-[10px]' : 'text-xs'} font-semibold text-slate-700 mt-0.5">
          {displaySchoolName}
        </span>
      </div>
    </div>

    <!-- Center: Bismillah -->
    <div class="text-center w-[20%] pt-2.5">
      <div class="{isA5 ? 'text-xs' : 'text-sm'} font-extrabold text-slate-900 tracking-wide">
        «بسمه تعالی»
      </div>
    </div>

    <!-- Left: Metadata (Letter number, Date, Attachment, Page number in header) -->
    <div class="w-[40%] flex flex-col items-end gap-1 {isA5 ? 'text-[10px]' : 'text-xs'}">
      <div class="flex items-center gap-1.5">
        <span class="text-slate-500 font-medium">شماره:</span>
        <span class="font-bold text-slate-900">{toPersianDigits(letter.letter_number || '---')}</span>
      </div>
      <div class="flex items-center gap-1.5">
        <span class="text-slate-500 font-medium">تاریخ:</span>
        <span class="font-bold text-slate-900">{toPersianDigits(letter.letter_date || '---')}</span>
      </div>
      <div class="flex items-center gap-1.5">
        <span class="text-slate-500 font-medium">پیوست:</span>
        <span class="font-semibold text-slate-800">{attachmentLabel}</span>
      </div>
      <div class="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-700">
        صفحه {toPersianDigits(1)} از {toPersianDigits(estimatedPages)}
      </div>

      {#if letter.priority && letter.priority !== 'normal'}
        <Badge variant="danger" size="xs" class="mt-1">
          {letter.priority === 'instant' ? 'خیلی فوری (آنی)' : 'فوری'}
        </Badge>
      {/if}
      {#if letter.confidentiality && letter.confidentiality !== 'normal'}
        <Badge variant="warning" size="xs" class="mt-1">
          {letter.confidentiality === 'secret' ? 'سری' : 'محرمانه'}
        </Badge>
      {/if}
    </div>
  </header>

  <!-- Letter Body -->
  <main class="letter-body-area flex-grow text-right flex flex-col justify-start">
    <!-- Recipient & Subject -->
    <div class="letter-recipient-block">
      <div class="letter-recipient-to font-extrabold text-slate-900 mb-1">
        به: {letter.recipient || 'مخاطب محترم'}
        {#if letter.recipient_position}
          <span class="text-xs font-semibold text-slate-600 mr-1">({letter.recipient_position})</span>
        {/if}
      </div>
      <div class="letter-subject-line font-bold flex items-center gap-1.5 mb-2" style="color: {primaryDark}">
        <span class="text-slate-600 font-semibold text-xs">موضوع:</span>
        <span>{letter.subject || 'موضوع نامه'}</span>
      </div>
      <div class="letter-greeting-line font-semibold text-slate-700">
        {letter.greeting || 'با سلام و احترام'}،
      </div>
    </div>

    <!-- Main Rich Content -->
    <div class="letter-rich-content text-slate-800 text-justify max-w-none">
      {#if letter.content}
        {@html letter.content}
      {:else}
        <p class="text-slate-400 italic">متن نامه هنوز نوشته نشده است...</p>
      {/if}
    </div>

    <!-- Closing -->
    <div class="letter-closing-line font-semibold text-slate-600 text-left pl-8">
      {letter.closing || 'با تشکر و تجدید احترام'}
    </div>

    <!-- Signer & Stamp Section -->
    <div class="letter-signer-block flex justify-end pl-6">
      <div class="min-w-[200px] text-center flex flex-col items-center">
        <div class="letter-signer-title font-medium text-slate-600 mb-0.5">
          {letter.signer_title || 'مدیریت'}
        </div>
        <div class="letter-signer-name font-extrabold text-slate-900 mb-1.5">
          {letter.signer_name || 'امضاکننده رسمی'}
        </div>

        <div class="letter-sig-box w-36 flex items-center justify-center relative">
          {#if letter.has_signature && letter.signature_image}
            <img
              src={letter.signature_image}
              alt="امضا"
              onload={recalculateLayout}
              class="max-h-full max-w-32 object-contain"
            />
          {:else if letter.has_signature || letter.has_stamp}
            <div class="border border-dashed border-slate-300 rounded-lg w-full h-full flex items-center justify-center text-[11px] text-slate-400">
              محل مهر و امضا
            </div>
          {/if}
        </div>
      </div>
    </div>

    <!-- Transcripts (رونوشت) -->
    {#if validTranscripts.length > 0}
      <div class="letter-transcripts-block pt-2.5 border-t border-dashed border-slate-300 text-slate-600">
        <div class="font-bold text-slate-800 mb-1">رونوشت:</div>
        <ul class="space-y-0.5 pr-2">
          {#each validTranscripts as t, idx}
            <li>{toPersianDigits(idx + 1)}- {t}</li>
          {/each}
        </ul>
      </div>
    {/if}
  </main>

  <!-- Letter Footer -->
  <footer class="letter-footer-block pt-2.5 border-t-2 relative text-right text-[11px] text-slate-600 shrink-0" style="border-color: {primaryColor}">
    <div class="absolute -top-[4px] left-0 right-0 h-[1px]" style="background-color: {borderAccent}"></div>

    <div class="flex items-center justify-between gap-3">
      <div class="max-w-[68%] text-[11px] leading-relaxed">
        <span class="font-bold text-slate-700">نشانی:</span>
        {displayAddress}
      </div>
      <div class="text-left font-sans text-[11px] text-slate-600 flex items-center gap-1.5 shrink-0" dir="rtl">
        {#if displayPhone}
          <span class="inline-flex items-center gap-1" dir="rtl">
            <span>تلفن:</span>
            <span dir="ltr" class="inline-block" style="unicode-bidi: isolate;">{toPersianDigits(displayPhone)}</span>
          </span>
          <span class="text-slate-300">|</span>
        {/if}
        {#if displayPostalCode}
          <span class="inline-flex items-center gap-1" dir="rtl">
            <span>کد پستی:</span>
            <span dir="ltr" class="inline-block" style="unicode-bidi: isolate;">{toPersianDigits(displayPostalCode)}</span>
          </span>
          <span class="text-slate-300">|</span>
        {/if}
        <span dir="ltr" class="inline-block" style="unicode-bidi: isolate;">{displayDomain}</span>
      </div>
    </div>

    {#if letter.footer_note}
      <div class="text-center text-[10px] text-slate-500 mt-1">
        {letter.footer_note}
      </div>
    {/if}
  </footer>
</div>

<style>
  .letter-a4-sheet {
    --letter-font-size: 11pt;
    --letter-line-height: 1.95;
    --letter-para-gap: 11px;
    --letter-body-py: 20px;
    --letter-recipient-mb: 16px;
    --letter-closing-mt: 20px;
    --letter-signer-mt: 28px;
    --letter-sig-h: 68px;
    --letter-transcripts-mt: 22px;
    --letter-footer-mt: 16px;
    --letter-sub-scale: 1;
  }

  .letter-body-area {
    padding-top: var(--letter-body-py);
    padding-bottom: var(--letter-body-py);
  }

  .letter-recipient-block {
    margin-bottom: var(--letter-recipient-mb);
  }

  .letter-recipient-to {
    font-size: calc(11.5pt * var(--letter-sub-scale));
  }

  .letter-subject-line {
    font-size: calc(11pt * var(--letter-sub-scale));
  }

  .letter-greeting-line {
    font-size: calc(10.5pt * var(--letter-sub-scale));
  }

  .letter-rich-content {
    font-size: var(--letter-font-size);
    line-height: var(--letter-line-height);
  }

  .letter-rich-content :global(p) {
    margin-top: 0;
    margin-bottom: var(--letter-para-gap);
    text-indent: 1.5em;
  }

  .letter-rich-content :global(p:last-child) {
    margin-bottom: 0;
  }

  .letter-rich-content :global(h1) {
    font-size: 1.25em;
    font-weight: 800;
    margin-bottom: var(--letter-para-gap);
  }

  .letter-rich-content :global(h2) {
    font-size: 1.15em;
    font-weight: 700;
    margin-bottom: var(--letter-para-gap);
  }

  .letter-rich-content :global(h3) {
    font-size: 1.05em;
    font-weight: 700;
    margin-bottom: var(--letter-para-gap);
  }

  .letter-rich-content :global(ul),
  .letter-rich-content :global(ol) {
    margin: var(--letter-para-gap) 1.5em var(--letter-para-gap) 0;
    padding-right: 1em;
  }

  .letter-rich-content :global(ul) {
    list-style-type: disc;
  }

  .letter-rich-content :global(ol) {
    list-style-type: decimal;
  }

  .letter-rich-content :global(li) {
    margin-bottom: calc(var(--letter-para-gap) * 0.45);
  }

  .letter-rich-content :global(strong),
  .letter-rich-content :global(b) {
    font-weight: 700;
    color: #0f172a;
  }

  .letter-a4-sheet.is-fit-mode .letter-rich-content :global(p),
  .letter-a4-sheet.is-fit-mode .letter-rich-content :global(span),
  .letter-a4-sheet.is-fit-mode .letter-rich-content :global(div),
  .letter-a4-sheet.is-fit-mode .letter-rich-content :global(li) {
    font-size: inherit !important;
    line-height: inherit !important;
  }

  .letter-a4-sheet.is-fit-mode .letter-rich-content :global(img) {
    max-height: calc(160px * var(--letter-sub-scale));
    width: auto;
  }

  .letter-closing-line {
    margin-top: var(--letter-closing-mt);
    font-size: calc(10.5pt * var(--letter-sub-scale));
  }

  .letter-signer-block {
    margin-top: var(--letter-signer-mt);
  }

  .letter-signer-title {
    font-size: calc(9.5pt * var(--letter-sub-scale));
  }

  .letter-signer-name {
    font-size: calc(11pt * var(--letter-sub-scale));
  }

  .letter-sig-box {
    height: var(--letter-sig-h);
  }

  .letter-transcripts-block {
    margin-top: var(--letter-transcripts-mt);
    font-size: calc(8.8pt * var(--letter-sub-scale));
  }

  .letter-footer-block {
    margin-top: var(--letter-footer-mt);
  }

  :global(.letter-rich-content img) {
    max-width: 100% !important;
    max-height: 220px !important;
    object-fit: contain !important;
    display: block !important;
    margin: 10px auto !important;
    border-radius: 6px !important;
  }
</style>
