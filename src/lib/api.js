/**
 * Shared HTTP client for frontend → backend communication.
 *
 * Consolidates the repeated `csrf-token` meta lookup and the standard
 * JSON / XHR header set that was hand-rolled across dozens of components.
 *
 * IMPORTANT (cross-cutting contract): this module only adds a shared
 * transport. It does NOT change the wire format or the HTTP contract.
 * Existing components keep working unchanged.
 */

/**
 * Read the Laravel CSRF token from the <meta name="csrf-token"> tag.
 * Returns '' when the tag is missing (e.g. non-browser / SSR) so callers
 * can still build a request without throwing.
 *
 * @returns {string}
 */
export function csrf() {
  return document.querySelector('meta[name="csrf-token"]')?.content || ''
}

/**
 * Build the standard header object for a JSON API request, including the
 * CSRF token. Kept minimal and identical to the headers previously copied
 * into each component (Content-Type, X-CSRF-TOKEN, Accept, X-Requested-With).
 *
 * @param {object} [extra] - additional headers to merge on top.
 * @returns {Record<string, string>}
 */
export function jsonHeaders(extra = {}) {
  return {
    'Content-Type': 'application/json',
    'X-CSRF-TOKEN': csrf(),
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    ...extra,
  }
}

/**
 * Thin wrapper around fetch() with the standard Pol-Event/Panel JSON headers
 * and consistent JSON parsing + error handling.
 *
 * Behaviour (matches the helper previously duplicated in PolEvent/Index.svelte):
 * - Throws an Error with the server's `message` (or a status fallback) on
 *   non-2xx responses, so callers can `catch` uniformly.
 * - Returns the parsed JSON body on success.
 *
 * @param {string} url
 * @param {object} [options]
 * @param {string} [options.method='GET']
 * @param {object|null} [options.body] - when provided it is JSON.stringify'd.
 * @param {Record<string,string>} [options.headers] - extra headers to merge.
 * @returns {Promise<any>}
 */
export async function apiFetch(url, { method = 'GET', body = null, headers = {} } = {}) {
  const options = {
    method,
    headers: jsonHeaders(headers),
  }
  if (body !== null) options.body = JSON.stringify(body)

  const res = await fetch(url, options)
  const text = await res.text()

  let data
  try {
    data = JSON.parse(text)
  } catch (e) {
    if (!res.ok) throw new Error(`Server returned ${res.status}: ${text.substring(0, 100)}`)
    data = {}
  }

  if (!res.ok) {
    throw new Error(data?.message || `Server returned ${res.status}`)
  }

  return data
}
