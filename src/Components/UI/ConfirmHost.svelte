<script>
  import ConfirmDialog from './ConfirmDialog.svelte'
  import { getConfirmState, settleConfirm } from '../../lib/confirm.svelte.js'

  const state = getConfirmState()
</script>

<ConfirmDialog
  bind:open={state.open}
  title={state.options.title ?? 'تأیید عملیات'}
  message={state.options.message ?? ''}
  confirmLabel={state.options.confirmLabel ?? state.options.confirmText ?? 'تأیید'}
  cancelLabel={state.options.cancelLabel ?? state.options.cancelText ?? 'انصراف'}
  variant={state.options.variant ?? state.options.type ?? 'danger'}
  onconfirm={() => settleConfirm(true)}
  oncancel={() => settleConfirm(false)}
/>
