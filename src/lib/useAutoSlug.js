/**
 * Auto-slug composable for Svelte 5 forms.
 *
 * Usage:
 *   let { sourceInput, slugInput } = useAutoSlug(form, 'title', 'slug')
 *
 * Template:
 *   <input value={form.title} oninput={sourceInput} />
 *   <input value={form.slug} oninput={slugInput} />
 *
 * - When the source field changes, the slug auto-generates (lowercased, hyphenated).
 * - Once the user manually edits the slug field, auto-generation stops
 *   (slugManuallyEdited flag flips to true on the first manual slug edit).
 * - Passing an initial slug value (e.g. from an existing record) does NOT trigger
 *   the manual-edit flag — the slug still auto-generates until the user types in it.
 */

/**
 * Convert any text to a URL-safe slug.
 */
export function slugify(text) {
  if (!text) return ''
  return text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9آ-ی\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * Create event handlers for an auto-slug pair.
 *
 * @param {object} form — a Svelte 5 $state() object
 * @param {string} sourceField — key in `form` that drives slug generation (e.g. 'title')
 * @param {string} slugField — key in `form` that receives the generated slug (e.g. 'slug')
 * @returns {{ sourceInput: (e: Event) => void, slugInput: (e: Event) => void }}
 */
export function useAutoSlug(form, sourceField = 'title', slugField = 'slug') {
  let slugManuallyEdited = false

  function sourceInput(e) {
    form[sourceField] = e.target.value
    if (!slugManuallyEdited) {
      form[slugField] = slugify(form[sourceField])
    }
  }

  function slugInput(e) {
    form[slugField] = e.target.value
    slugManuallyEdited = true
  }

  return { sourceInput, slugInput }
}
