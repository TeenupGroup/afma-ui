import { generatePdf } from './pdfGenerator'

/**
 * Client-side export helpers for panel reports.
 */

const FA_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
function toFaNum(val) {
  return String(val ?? '').replace(/\d/g, (d) => FA_DIGITS[Number(d)] || d)
}

function escapeHtml(val) {
  return String(val ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * Download rows as a UTF-8 CSV (with BOM so Excel detects the encoding).
 */
export function downloadCsv(filename, headers, rows) {
  const escape = (cell) => {
    const s = String(cell ?? '')
    return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s
  }
  const csv = [headers, ...rows].map((r) => r.map(escape).join(',')).join('\r\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
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
 * Render rows into paginated A4/A5 RTL HTML sheets with fixed repeating header
 * (containing Persian page numbers) + fixed footer, and export via html2pdf.
 */
export async function exportTablePdf({
  title,
  subtitle = '',
  headers,
  rows,
  filename = 'report.pdf',
  paper = 'a4',
  orientation = 'landscape',
  schoolName = 'سامانه آموزشی مسیر',
}) {
  const normalizedPaper = String(paper || 'a4').toLowerCase() === 'a5' ? 'a5' : 'a4'
  const normalizedOrientation = orientation === 'portrait' ? 'portrait' : 'landscape'
  const rowsPerPage = normalizedPaper === 'a5' ? 14 : (normalizedOrientation === 'landscape' ? 18 : 26)
  const chunks = []
  const list = Array.isArray(rows) ? rows : []

  if (list.length === 0) {
    chunks.push([])
  } else {
    for (let i = 0; i < list.length; i += rowsPerPage) {
      chunks.push(list.slice(i, i + rowsPerPage))
    }
  }

  const totalPages = chunks.length
  const thCells = headers
    .map((h) => `<th style="border:1px solid #334155; padding:5px 7px; background:#0f172a; color:#fff; font-weight:800; text-align:right;">${escapeHtml(h)}</th>`)
    .join('')

  const pagesHtml = chunks
    .map((chunk, pageIdx) => {
      const trs = chunk.length > 0
        ? chunk
            .map(
              (r, rIdx) =>
                `<tr style="background:${rIdx % 2 === 1 ? '#f8fafc' : '#fff'};">${r
                  .map((c) => `<td style="border:1px solid #cbd5e1; padding:4px 7px; text-align:right; color:#1e293b;">${escapeHtml(c ?? '')}</td>`)
                  .join('')}</tr>`
            )
            .join('')
        : `<tr><td colspan="${headers.length}" style="border:1px solid #cbd5e1; padding:12px; text-align:center; color:#64748b;">موردی یافت نشد.</td></tr>`

      const sheetHeight = normalizedPaper === 'a5' ? (normalizedOrientation === 'landscape' ? '136mm' : '198mm') : (normalizedOrientation === 'landscape' ? '198mm' : '285mm')

      return `
        <div style="min-height:${sheetHeight}; display:flex; flex-direction:column; justify-content:space-between; padding:8px; page-break-after:${pageIdx < totalPages - 1 ? 'always' : 'avoid'};">
          <div>
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #0f172a; padding-bottom:6px; margin-bottom:8px;">
              <div>
                <div style="font-size:13px; font-weight:800; color:#0f172a;">${escapeHtml(schoolName)}</div>
                <div style="font-size:11px; font-weight:700; color:#334155;">${escapeHtml(title)}</div>
                ${subtitle ? `<div style="font-size:10px; color:#64748b;">${escapeHtml(subtitle)}</div>` : ''}
              </div>
              <div style="background:#f1f5f9; border:1px solid #cbd5e1; border-radius:6px; padding:3px 10px; font-size:10px; font-weight:800; color:#0f172a;">
                صفحه ${toFaNum(pageIdx + 1)} از ${toFaNum(totalPages)}
              </div>
            </div>
            <table style="width:100%; border-collapse:collapse; font-size:10px;">
              <thead><tr>${thCells}</tr></thead>
              <tbody>${trs}</tbody>
            </table>
          </div>
          <div style="border-top:1px solid #cbd5e1; padding-top:4px; margin-top:8px; display:flex; justify-content:space-between; font-size:9px; color:#64748b;">
            <span>${escapeHtml(schoolName)} — نسخه رسمی چاپی</span>
            <span>تعداد کل ردیف‌ها: ${toFaNum(list.length)}</span>
          </div>
        </div>
      `
    })
    .join('')

  await generatePdf(pagesHtml, {
    filename,
    format: normalizedPaper,
    orientation: normalizedOrientation,
    margin: [4, 6, 4, 6],
  })
}
