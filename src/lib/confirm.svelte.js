/**
 * Promise-based confirmation dialog state for the admin panel.
 *
 * Replaces native `confirm()` calls (which block the thread and can't
 * be styled) with the shared ConfirmDialog component:
 *
 *   if (await askConfirm({ message: 'حذف شود؟' })) router.delete(url)
 *
 * Mount <ConfirmHost /> once in AdminLayout; every askConfirm() call
 * opens it and resolves true/false on the user's choice.
 */

const state = $state({
  open: false,
  options: {},
  resolve: null,
})

export function getConfirmState() {
  return state
}

/**
 * Ask the user to confirm an action. Resolves true on confirm,
 * false on cancel/backdrop/Escape.
 *
 * @param {object} [options] - ConfirmDialog props: message, title,
 *   confirmLabel (or confirmText), cancelLabel (or cancelText),
 *   variant (or type, 'danger' default).
 * @returns {Promise<boolean>}
 */
export function askConfirm(options = {}) {
  if (state.open && state.resolve) {
    const previousResolve = state.resolve
    state.resolve = null
    previousResolve(false)
  }

  return new Promise((resolve) => {
    const {
      confirmLabel,
      confirmText,
      cancelLabel,
      cancelText,
      variant,
      type,
      ...rest
    } = options

    state.options = {
      title: 'تأیید عملیات',
      message: 'آیا از انجام این عمل اطمینان دارید؟',
      ...rest,
      confirmLabel: confirmLabel ?? confirmText ?? 'تأیید',
      cancelLabel: cancelLabel ?? cancelText ?? 'انصراف',
      variant: variant ?? type ?? 'danger',
    }
    state.resolve = resolve
    state.open = true
  })
}

/** Resolve the pending promise and close the dialog. */
export function settleConfirm(answer) {
  state.open = false
  const pendingResolve = state.resolve
  state.resolve = null
  pendingResolve?.(answer)
}
