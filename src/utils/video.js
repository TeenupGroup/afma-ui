/**
 * Convert Aparat video URL to embed URL
 * Input:  https://www.aparat.com/v/trcmdfw
 * Output: https://www.aparat.com/video/video/embed/videohash/trcmdfw/vt/frame
 * Also handles raw hash strings and various URL formats
 */
export function getAparatEmbedUrl(url) {
    if (!url) return null;
    const trimmed = url.trim();

    // Already an embed URL — use as-is
    if (trimmed.includes('aparat.com/video/video/embed')) {
        return trimmed;
    }

    // Extract video hash from /v/xxxxx format
    const match = trimmed.match(/aparat\.com\/v\/([a-zA-Z0-9]+)/);
    if (match) {
        return `https://www.aparat.com/video/video/embed/videohash/${match[1]}/vt/frame`;
    }

    // If it's just a hash (alphanumeric string), use it directly
    if (/^[a-zA-Z0-9]+$/.test(trimmed)) {
        return `https://www.aparat.com/video/video/embed/videohash/${trimmed}/vt/frame`;
    }

    // If it's a full URL but not matching patterns, return as-is
    return trimmed;
}

/**
 * Check if a URL is a direct video file (mp4, webm, ogg, etc.)
 * vs an embeddable platform URL (Aparat, YouTube, etc.)
 */
export function isDirectVideoUrl(url) {
    if (!url) return false;
    const trimmed = url.trim().toLowerCase();
    return /\.(mp4|webm|ogg|mov|m4v|avi)(\?[^]*)?$/i.test(trimmed);
}

/**
 * Inspect a video file's metadata (duration in seconds, dimensions) in the browser before upload.
 *
 * @param {File} file
 * @returns {Promise<{ duration: number, width: number, height: number }>}
 */
export function getVideoMetadata(file) {
    return new Promise((resolve) => {
        if (!file || typeof window === 'undefined') {
            resolve({ duration: 0, width: 0, height: 0 });
            return;
        }

        const video = document.createElement('video');
        video.preload = 'metadata';

        let resolved = false;
        const cleanup = () => {
            if (video.src) {
                try {
                    URL.revokeObjectURL(video.src);
                } catch {}
                video.src = '';
            }
        };

        const timeout = setTimeout(() => {
            if (!resolved) {
                resolved = true;
                cleanup();
                resolve({ duration: 0, width: 0, height: 0 });
            }
        }, 6000);

        video.onloadedmetadata = () => {
            if (!resolved) {
                resolved = true;
                clearTimeout(timeout);
                const data = {
                    duration: typeof video.duration === 'number' && !isNaN(video.duration) ? video.duration : 0,
                    width: video.videoWidth || 0,
                    height: video.videoHeight || 0,
                };
                cleanup();
                resolve(data);
            }
        };

        video.onerror = () => {
            if (!resolved) {
                resolved = true;
                clearTimeout(timeout);
                cleanup();
                resolve({ duration: 0, width: 0, height: 0 });
            }
        };

        video.src = URL.createObjectURL(file);
    });
}

/**
 * Format duration seconds into mm:ss format.
 *
 * @param {number} seconds
 * @returns {string}
 */
export function formatVideoDuration(seconds) {
    if (!seconds || seconds <= 0 || isNaN(seconds)) return '0:00';
    const total = Math.round(seconds);
    const m = Math.floor(total / 60);
    const s = total % 60;
    const padS = s < 10 ? `0${s}` : `${s}`;
    return `${m}:${padS}`;
}
