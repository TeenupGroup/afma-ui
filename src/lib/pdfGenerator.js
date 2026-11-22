/**
 * Generate PDF from HTML string using html2pdf.js
 * Uses iframe for reliable rendering (lazy loads html2pdf on demand)
 */
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

  const isLandscape = orientation === 'landscape'
  const renderWidth = isLandscape ? 1160 : 840

  // Create a visible overlay with iframe for rendering
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

  // Write HTML to iframe
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
          * { font-family: 'YekanBakh', 'Tahoma', 'DejaVu Sans', sans-serif; }
          body { margin: 0; padding: 15px; direction: rtl; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>${html}</body>
      </html>
    `)
  }
  iframeDoc.close()

  // Wait for iframe to load
  await new Promise(resolve => {
    iframe.onload = resolve
    // Fallback if onload doesn't fire
    setTimeout(resolve, 800)
  })

  // Small delay for font loading and rendering
  await new Promise(resolve => setTimeout(resolve, 500))

  const config = {
    margin: margin,
    filename: filename,
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
      format: format,
      orientation: orientation,
    },
    pagebreak: {
      mode: ['avoid-all', 'css', 'legacy']
    }
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
