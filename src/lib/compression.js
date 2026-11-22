import { toPersianDigits } from './utils.js'

/**
 * Client-Side High-Performance Image Compression Utility.
 *
 * Runs in the user's browser before network transmission:
 * - Downscales multi-megapixel photos (e.g. 15MB 48MP camera shots) to web dimensions
 * - Encodes to WebP or optimized JPEG, reducing file size by 70%–90%
 * - Slashes upload times, prevents cPanel timeout & post_max_size errors on mobile networks
 * - Fallback resilience: Returns original file untouched if compression fails or yields a larger file
 */

/**
 * Format bytes into human-readable Persian size.
 *
 * @param {number} bytes
 * @returns {string}
 */
export function formatFileSize(bytes) {
  if (!bytes || bytes <= 0) return toPersianDigits('0') + ' بایت'
  const k = 1024
  const sizes = ['بایت', 'کیلوبایت', 'مگابایت', 'گیگابایت']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  const formatted = parseFloat((bytes / Math.pow(k, i)).toFixed(1))
  return toPersianDigits(formatted) + ' ' + sizes[i]
}

/**
 * Check if the browser environment supports canvas image compression.
 *
 * @returns {boolean}
 */
export function isCompressionSupported() {
  return typeof window !== 'undefined' && typeof document !== 'undefined' && typeof document.createElement === 'function'
}

/**
 * Compress an image file using HTML5 Canvas API in the browser.
 *
 * @param {File} file - Original file object selected by user
 * @param {Object} [options]
 * @param {number} [options.maxWidth=1920] - Maximum width in pixels
 * @param {number} [options.maxHeight=1920] - Maximum height in pixels
 * @param {number} [options.quality=0.82] - Compression quality (0.1 to 1.0)
 * @param {boolean} [options.convertToWebp=false] - Whether to convert JPEG/PNG to WebP
 * @param {number} [options.minSizeThreshold=51200] - Skip compression if file is under 50KB and within bounds
 * @returns {Promise<File>} Compressed File, or original File if uncompressed/larger
 */
export async function compressImageFile(file, options = {}) {
  if (!file || !(file instanceof File) || !isCompressionSupported()) {
    return file
  }

  const fileName = (file.name || '').toLowerCase()
  let mime = (file.type || '').toLowerCase()
  const isImageExt = /\.(jpe?g|png|webp|bmp|heic|heif|jfif|tiff?)$/i.test(fileName)

  if (!mime || mime === 'application/octet-stream') {
    if (isImageExt) {
      if (fileName.endsWith('.png')) mime = 'image/png'
      else if (fileName.endsWith('.webp')) mime = 'image/webp'
      else if (fileName.endsWith('.heic') || fileName.endsWith('.heif')) mime = 'image/heic'
      else mime = 'image/jpeg'
    } else {
      return file
    }
  }

  // Only compress raster images; skip SVG, PDF, audio, video, etc.
  if (!mime.startsWith('image/') || mime.includes('svg') || mime.includes('gif')) {
    return file
  }

  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.82,
    convertToWebp = false,
    minSizeThreshold = 51200,
    maxTargetBytes = 4 * 1024 * 1024 // 4MB target ceiling so uploads always pass 5MB limits
  } = options

  return new Promise((resolve) => {
    let resolved = false
    const safeResolve = (res) => {
      if (!resolved) {
        resolved = true
        clearTimeout(timeoutId)
        resolve(res)
      }
    }

    // Safety timeout: Never hang form submissions if image decoding gets stuck
    const timeoutId = setTimeout(() => {
      safeResolve(file)
    }, 6000)

    function renderCanvas(origWidth, origHeight, drawFn) {
      if (!origWidth || !origHeight) {
        safeResolve(file)
        return
      }

      const needsResize = origWidth > maxWidth || origHeight > maxHeight

      // If already small and within dimension bounds, skip re-encoding
      if (!needsResize && file.size < minSizeThreshold) {
        safeResolve(file)
        return
      }

      // Calculate proportional dimensions
      let targetWidth = origWidth
      let targetHeight = origHeight

      if (needsResize) {
        const ratio = Math.min(maxWidth / origWidth, maxHeight / origHeight)
        targetWidth = Math.max(1, Math.round(origWidth * ratio))
        targetHeight = Math.max(1, Math.round(origHeight * ratio))
      }

      // Render onto canvas
      const canvas = document.createElement('canvas')
      canvas.width = targetWidth
      canvas.height = targetHeight

      const ctx = canvas.getContext('2d', { alpha: true })
      if (!ctx) {
        safeResolve(file)
        return
      }

      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      drawFn(ctx, targetWidth, targetHeight)

      let outputType = mime
      let outputExt = (file.name ? file.name.split('.').pop() : '')?.toLowerCase() || 'jpg'

      if (convertToWebp || mime === 'image/webp' || (mime === 'image/png' && file.size > 300 * 1024) || !['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(mime)) {
        outputType = 'image/webp'
        outputExt = 'webp'
      } else if (mime === 'image/jpeg' || mime === 'image/jpg') {
        outputType = 'image/jpeg'
        outputExt = 'jpg'
      } else if (mime === 'image/png') {
        outputType = 'image/png'
        outputExt = 'png'
      }

      const finalizeBlob = (blob, finalType, finalExt) => {
        if (!blob) {
          safeResolve(file)
          return
        }

        if (blob.size >= file.size && !needsResize && file.size <= maxTargetBytes) {
          safeResolve(file)
          return
        }

        const rawName = file.name || 'image.jpg'
        const baseName = rawName.replace(/\.[^/.]+$/, '') || 'image'
        const newName = `${baseName}.${finalExt}`
        const actualType = blob.type || finalType
        const compressedFile = new File([blob], newName, {
          type: actualType,
          lastModified: Date.now()
        })

        Object.defineProperty(compressedFile, '_originalSize', {
          value: file.size,
          writable: false
        })
        Object.defineProperty(compressedFile, '_wasCompressed', {
          value: compressedFile.size < file.size,
          writable: false
        })

        safeResolve(compressedFile)
      }

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            safeResolve(file)
            return
          }

          if (blob.size > maxTargetBytes || (outputType === 'image/webp' && blob.type === 'image/png' && blob.size >= file.size)) {
            const fallbackCanvas = document.createElement('canvas')
            const scale = blob.size > maxTargetBytes ? Math.min(1, Math.sqrt(maxTargetBytes / blob.size) * 0.9) : 1
            fallbackCanvas.width = Math.max(1, Math.round(targetWidth * scale))
            fallbackCanvas.height = Math.max(1, Math.round(targetHeight * scale))
            const fCtx = fallbackCanvas.getContext('2d')
            if (fCtx) {
              fCtx.fillStyle = '#ffffff'
              fCtx.fillRect(0, 0, fallbackCanvas.width, fallbackCanvas.height)
              fCtx.imageSmoothingEnabled = true
              fCtx.imageSmoothingQuality = 'high'
              fCtx.drawImage(canvas, 0, 0, fallbackCanvas.width, fallbackCanvas.height)
              fallbackCanvas.toBlob(
                (jpegBlob) => finalizeBlob(jpegBlob || blob, 'image/jpeg', 'jpg'),
                'image/jpeg',
                Math.min(quality, 0.75)
              )
              return
            }
          }

          const resolvedExt = blob.type === 'image/webp' ? 'webp' : (blob.type === 'image/jpeg' ? 'jpg' : outputExt)
          finalizeBlob(blob, blob.type || outputType, resolvedExt)
        },
        outputType,
        quality
      )
    }

    // Attempt 1: Fast hardware decoding via createImageBitmap
    if (typeof window !== 'undefined' && typeof window.createImageBitmap === 'function') {
      window.createImageBitmap(file)
        .then((bitmap) => {
          const w = bitmap.width
          const h = bitmap.height
          renderCanvas(w, h, (ctx, tw, th) => {
            ctx.drawImage(bitmap, 0, 0, tw, th)
          })
          bitmap.close?.()
        })
        .catch(() => {
          fallbackImage()
        })
    } else {
      fallbackImage()
    }

    // Attempt 2: HTML5 Image element fallback
    function fallbackImage() {
      const img = new Image()
      const objectUrl = URL.createObjectURL(file)

      img.onload = () => {
        URL.revokeObjectURL(objectUrl)
        const origWidth = img.naturalWidth || img.width
        const origHeight = img.naturalHeight || img.height
        renderCanvas(origWidth, origHeight, (ctx, tw, th) => {
          ctx.drawImage(img, 0, 0, tw, th)
        })
      }

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl)
        safeResolve(file)
      }

      img.src = objectUrl
    }
  })
}

/**
 * Compress a batch of image files in parallel and return summary statistics.
 *
 * @param {FileList|File[]} fileList
 * @param {Object} [options]
 * @returns {Promise<{ files: File[], totalOriginalSize: number, totalCompressedSize: number, savedBytes: number, savedPercent: number, compressedCount: number }>}
 */
export async function compressImageFiles(fileList, options = {}) {
  const rawFiles = Array.from(fileList || []).filter(Boolean)
  if (rawFiles.length === 0) {
    return {
      files: [],
      totalOriginalSize: 0,
      totalCompressedSize: 0,
      savedBytes: 0,
      savedPercent: 0,
      compressedCount: 0
    }
  }

  let totalOriginalSize = 0
  let totalCompressedSize = 0
  let compressedCount = 0

  const processed = await Promise.all(
    rawFiles.map(async (rawFile) => {
      const origSize = rawFile.size || 0
      totalOriginalSize += origSize
      try {
        const compressed = await compressImageFile(rawFile, options)
        const finalSize = compressed.size || origSize
        totalCompressedSize += finalSize
        if (finalSize < origSize) {
          compressedCount++
        }
        return compressed
      } catch {
        totalCompressedSize += origSize
        return rawFile
      }
    })
  )

  const savedBytes = Math.max(0, totalOriginalSize - totalCompressedSize)
  const savedPercent = totalOriginalSize > 0 ? Math.round((savedBytes / totalOriginalSize) * 100) : 0

  return {
    files: processed,
    totalOriginalSize,
    totalCompressedSize,
    savedBytes,
    savedPercent,
    compressedCount
  }
}
