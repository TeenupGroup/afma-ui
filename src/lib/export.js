import { generatePdf } from './pdfGenerator'

/**
 * Client-side export helpers for panel reports.
 * Both operate on the currently loaded page data (callers say so in the UI).
 */

/**
 * Download rows as a UTF-8 CSV (with BOM so Excel detects the encoding).
 * Pass raw values — numbers stay machine-readable.
 */
export function downloadCsv(filename, headers, rows) {
  const escape = (cell) => {
    const s = String(cell ?? '')
    return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s
  }
  const csv = [headers, ...rows].map((r) => r.map(escape).join(',')).join('\r\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

/**
 * Render rows into an RTL-styled HTML table and export as PDF via html2pdf.
 * Pass display-ready strings (e.g. Persian digits) — they are rendered as-is.
 */
export async function exportTablePdf({ title, subtitle = '', headers, rows, filename = 'report.pdf' }) {
  const cellStyle = 'border:1px solid #e2e8f0; padding:6px 10px; text-align:right;'
  const th = headers.map((h) => `<th style="${cellStyle} background:#f1f5f9; font-weight:700;">${h}</th>`).join('')
  const trs = rows
    .map((r) => `<tr>${r.map((c) => `<td style="${cellStyle}">${c ?? ''}</td>`).join('')}</tr>`)
    .join('')

  const html = `
    <h2 style="margin:0 0 4px; font-size:18px; color:#1e293b;">${title}</h2>
    ${subtitle ? `<p style="margin:0 0 12px; font-size:12px; color:#64748b;">${subtitle}</p>` : '<div style="height:12px"></div>'}
    <table style="width:100%; border-collapse:collapse; font-size:12px; color:#334155;">
      <thead><tr>${th}</tr></thead>
      <tbody>${trs}</tbody>
    </table>
    <p style="font-size:10px; color:#94a3b8; margin-top:12px;">خروجی از داده‌های صفحه فعلی</p>
  `

  await generatePdf(html, { filename, orientation: 'landscape' })
}
