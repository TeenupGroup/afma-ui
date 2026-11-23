/**
 * Generate PDF from HTML string using html2pdf.js
 * Injects local Persian @font-face declarations and awaits iframe font readiness.
 */
function buildPersianFontFaceCss() {
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  return `
    @font-face {
      font-family: 'YekanBakh';
      src: url('${origin}/fonts/YekanBakh-Regular.woff2') format('woff2');
      font-weight: 400;
      font-style: normal;
    }
    @font-face {
      font-family: 'YekanBakh';
      src: url('${origin}/fonts/YekanBakh-SemiBold.woff2') format('woff2');
      font-weight: 600;
      font-style: normal;
    }
    @font-face {
      font-family: 'YekanBakh';
      src: url('${origin}/fonts/YekanBakh-Bold.woff2') format('woff2');
      font-weight: 700;
      font-style: normal;
    }
    @font-face {
      font-family: 'Vazir';
      src: url('${origin}/fonts/vazir/400.woff2') format('woff2');
      font-weight: 400;
      font-style: normal;
    }
    @font-face {
      font-family: 'Vazir';
      src: url('${origin}/fonts/vazir/700.woff2') format('woff2');
      font-weight: 700;
      font-style: normal;
    }
    @font-face {
      font-family: 'Vazirmatn';
      src: url('${origin}/fonts/vazir/400.woff2') format('woff2');
      font-weight: 400;
      font-style: normal;
    }
    @font-face {
      font-family: 'Vazirmatn';
      src: url('${origin}/fonts/vazir/700.woff2') format('woff2');
      font-weight: 700;
      font-style: normal;
    }
  `
}

export async function generatePdf(html, options = {}) {
  const html2pdf = (await import('html2pdf.js')).default
  const {
    filename = 'document.pdf',
    orientation = 'landscape',
    format = 'a4',
    margin = orientation === 'landscape' ? [6, 8, 6, 8] : [6, 6, 6, 6],
    download = true,
    preview = false,
  } = options

  const normalizedFormat = String(format || 'a4').toLowerCase() === 'a5' ? 'a5' : 'a4'
  const normalizedOrientation = orientation === 'portrait' ? 'portrait' : 'landscape'
  const isLandscape = normalizedOrientation === 'landscape'
  const renderWidth = normalizedFormat === 'a5' ? (isLandscape ? 840 : 595) : (isLandscape ? 1160 : 840)

  const overlay = document.createElement('div')
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.5);
    z-index: 99999;
    display: flex;
    align-items: center;
    justify-content: center;
  `

  const iframe = document.createElement('iframe')
  iframe.style.cssText = `
    width: ${renderWidth}px;
    height: 85vh;
    background: white;
    border: none;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
  `
  overlay.appendChild(iframe)
  document.body.appendChild(overlay)

  const fontCss = buildPersianFontFaceCss()
  const iframeDoc = iframe.contentDocument || iframe.contentWindow.document
  iframeDoc.open()
  if (html.includes('<!DOCTYPE') || html.includes('<html')) {
    iframeDoc.write(html)
  } else {
    iframeDoc.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="fa">
      <head>
        <meta charset="UTF-8">
        <style>
          ${fontCss}
          * { font-family: 'YekanBakh', 'Vazir', 'Vazirmatn', sans-serif; box-sizing: border-box; }
          body { margin: 0; padding: 12px; direction: rtl; color: #0f172a; }
          @page { size: ${normalizedFormat.toUpperCase()} ${normalizedOrientation}; margin: 0; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>${html}</body>
      </html>
    `)
  }
  iframeDoc.close()

  if (iframeDoc.head && !iframeDoc.getElementById('afma-persian-pdf-fonts')) {
    const styleNode = iframeDoc.createElement('style')
    styleNode.id = 'afma-persian-pdf-fonts'
    styleNode.textContent = `${fontCss}\n* { font-family: 'YekanBakh', 'Vazir', 'Vazirmatn', sans-serif; }`
    iframeDoc.head.appendChild(styleNode)
  }

  await new Promise((resolve) => {
    iframe.onload = resolve
    setTimeout(resolve, 600)
  })

  if (iframeDoc.fonts && iframeDoc.fonts.ready) {
    try {
      await iframeDoc.fonts.ready
    } catch {
      // Ignore font observer failure and continue with timeout fallback
    }
  }
  await new Promise((resolve) => setTimeout(resolve, 250))

  const config = {
    margin,
    filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      letterRendering: true,
      logging: false,
      windowWidth: renderWidth,
    },
    jsPDF: {
      unit: 'mm',
      format: normalizedFormat,
      orientation: normalizedOrientation,
    },
    pagebreak: {
      mode: ['avoid-all', 'css', 'legacy'],
    },
  }

  try {
    const element = iframeDoc.body

    if (preview) {
      const blob = await html2pdf().set(config).from(element).outputPdf('blob')
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank')
      setTimeout(() => URL.revokeObjectURL(url), 60000)
      return blob
    }

    if (download) {
      await html2pdf().set(config).from(element).save()
    } else {
      return await html2pdf().set(config).from(element).outputPdf('blob')
    }
  } finally {
    document.body.removeChild(overlay)
  }
}
