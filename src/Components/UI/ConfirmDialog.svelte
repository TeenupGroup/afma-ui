<script>
  import Modal from './Modal.svelte'
  import Button from './Button.svelte'
  import { AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-svelte'

  let {
    open = $bindable(false),
    title = 'تأیید عملیات',
    message = 'آیا از انجام این عمل اطمینان دارید؟',
    confirmLabel = 'تأیید',
    cancelLabel = 'انصراف',
    variant = 'warning', // 'info' | 'warning' | 'success' | 'danger'
    loading = false,
    onconfirm = null,
    oncancel = null,
    class: className = '',
  } = $props()

  const variants = {
    info: {
      icon: Info,
      iconBg: 'bg-blue-100 text-blue-600',
      buttonVariant: 'primary',
    },
    warning: {
      icon: AlertTriangle,
      iconBg: 'bg-amber-100 text-amber-600',
      buttonVariant: 'amber',
    },
    success: {
      icon: CheckCircle,
      iconBg: 'bg-emerald-100 text-emerald-600',
      buttonVariant: 'emerald',
    },
    danger: {
      icon: XCircle,
      iconBg: 'bg-rose-100 text-rose-600',
      buttonVariant: 'rose',
    },
  }

  let currentVariant = $derived(variants[variant] || variants.danger)
  let IconComponent = $derived(currentVariant.icon)

  function handleConfirm() {
    if (onconfirm) onconfirm()
  }

  function handleCancel() {
    open = false
    if (oncancel) oncancel()
  }
</script>

<Modal bind:open size="sm" variant="dialog" onclose={handleCancel} class={className}>
  <div class="flex flex-col items-center text-center p-2" dir="rtl">
    <div class="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 {currentVariant.iconBg}">
      <IconComponent class="w-7 h-7" />
    </div>

    <h3 class="text-base sm:text-lg font-bold text-slate-800 mb-2">{title}</h3>
    <p class="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">{message}</p>

    <div class="flex items-center gap-3 w-full">
      <Button
        type="button"
        variant="ghost"
        class="flex-1"
        data-testid="confirm-dialog-cancel"
        disabled={loading}
        onclick={handleCancel}
      >
        {cancelLabel}
      </Button>
      <Button
        type="button"
        variant={currentVariant.buttonVariant}
        class="flex-1"
        data-testid="confirm-dialog-confirm"
        {loading}
        disabled={loading}
        onclick={handleConfirm}
      >
        {confirmLabel}
      </Button>
    </div>
  </div>
</Modal>
