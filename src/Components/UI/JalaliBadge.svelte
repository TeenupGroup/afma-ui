<script>
  import { Clock, Calendar, AlertCircle, CheckCircle2 } from 'lucide-svelte'
  import { toPersianDigits, jalaliToGregorian, gregorianToJalali } from '../../lib/utils.js'
  import { cn } from '../../lib/utils.js'

  let {
    date = '',
    time = '',
    mode = 'badge', // 'badge' | 'relative' | 'deadline' | 'full'
    prefix = '',
    variant = 'auto', // 'auto' | 'neutral' | 'urgent' | 'success'
    size = 'sm', // 'xs' | 'sm' | 'md'
    icon = true,
    class: className = '',
    ...rest
  } = $props()

  // Parse date into standard Date object
  const parsed = $derived.by(() => {
    if (!date) return null
    const s = String(date).trim()
    const match = s.match(/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})/)
    if (!match) return null

    const y = Number(match[1])
    const m = Number(match[2])
    const d = Number(match[3])

    let gy = y, gm = m, gd = d
    if (y < 1700) {
      [gy, gm, gd] = jalaliToGregorian(y, m, d)
    }

    let hh = 0, mm = 0
    if (time) {
      const tMatch = String(time).match(/^(\d{1,2}):(\d{1,2})/)
      if (tMatch) {
        hh = Number(tMatch[1])
        mm = Number(tMatch[2])
      }
    }

    const dt = new Date(gy, gm - 1, gd, hh, mm, 0)
    return Number.isNaN(dt.getTime()) ? null : { date: dt, jy: y < 1700 ? y : null, jm: m, jd: d }
  })

  // Format Persian date
  const formattedJalali = $derived.by(() => {
    if (!parsed) return toPersianDigits(date || '—')
    try {
      const fmt = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
      const dStr = fmt.format(parsed.date)
      if (time) {
        return `${toPersianDigits(dStr)} ساعت ${toPersianDigits(time)}`
      }
      return toPersianDigits(dStr)
    } catch {
      return toPersianDigits(date)
    }
  })

  // Calculate deadline / relative status
  const relativeStatus = $derived.by(() => {
    if (!parsed) return { text: '', isExpired: false, isUrgent: false, color: 'slate' }
    const now = Date.now()
    const target = parsed.date.getTime()
    const diff = target - now
    const oneDay = 24 * 60 * 60 * 1000

    if (diff < 0) {
      const pastDays = Math.floor(-diff / oneDay)
      return {
        text: pastDays === 0 ? 'امروز به پایان رسید' : `${toPersianDigits(pastDays)} روز پیش منقضی شد`,
        isExpired: true,
        isUrgent: false,
        color: 'rose',
      }
    }

    const remainingDays = Math.floor(diff / oneDay)
    const remainingHours = Math.floor((diff % oneDay) / (60 * 60 * 1000))

    if (remainingDays === 0) {
      return {
        text: remainingHours <= 0 ? 'کمتر از یک ساعت مانده' : `${toPersianDigits(remainingHours)} ساعت مانده`,
        isExpired: false,
        isUrgent: true,
        color: 'amber',
      }
    }

    if (remainingDays === 1) {
      return {
        text: 'فردا مهلت دارد',
        isExpired: false,
        isUrgent: true,
        color: 'amber',
      }
    }

    return {
      text: `${toPersianDigits(remainingDays)} روز مانده`,
      isExpired: false,
      isUrgent: false,
      color: 'slate',
    }
  })

  const effectiveColor = $derived.by(() => {
    if (variant !== 'auto') {
      if (variant === 'urgent') return 'rose'
      if (variant === 'success') return 'emerald'
      return 'slate'
    }
    return relativeStatus.color
  })

  const colorStyles = {
    slate: 'bg-slate-100 text-slate-700 border-slate-200/80',
    amber: 'bg-amber-50 text-amber-700 border-amber-200/70',
    rose: 'bg-rose-50 text-rose-700 border-rose-200/70',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200/70',
  }

  const sizeStyles = {
    xs: 'px-1.5 py-0.5 text-[10px] gap-1',
    sm: 'px-2 py-0.5 text-xs gap-1.5',
    md: 'px-2.5 py-1 text-xs gap-1.5',
  }
</script>

<span
  class={cn(
    'inline-flex items-center rounded-xl border font-sans font-bold select-none transition-colors',
    sizeStyles[size] || sizeStyles.sm,
    colorStyles[effectiveColor] || colorStyles.slate,
    className
  )}
  dir="rtl"
  {...rest}
>
  {#if icon}
    {#if relativeStatus.isExpired}
      <AlertCircle class="w-3.5 h-3.5 text-rose-500 shrink-0" />
    {:else if relativeStatus.isUrgent}
      <Clock class="w-3.5 h-3.5 text-amber-500 shrink-0" />
    {:else}
      <Calendar class="w-3.5 h-3.5 text-slate-400 shrink-0" />
    {/if}
  {/if}

  {#if prefix}
    <span class="opacity-75 font-medium">{prefix}</span>
  {/if}

  {#if mode === 'relative' || mode === 'deadline'}
    <span>{relativeStatus.text || formattedJalali}</span>
  {:else if mode === 'full'}
    <span>{formattedJalali} ({relativeStatus.text})</span>
  {:else}
    <span>{formattedJalali}</span>
  {/if}
</span>
