<script>
  import { Bell, CheckCircle } from 'lucide-svelte'
  import { Button } from './index.js'
  import { persianInputHandler, toEnglishDigits, cn } from '../../lib/utils.js'

  let {
    title = 'از اطلاعیه‌های ما باخبر شوید!',
    subtitle = 'اطلاعیه‌های مهم، تاریخ آزمون‌ها و رویدادهای آموزشی را زودتر دریافت کنید.',
    onsubmit = null,
    class: className = '',
  } = $props()

  let name = $state('')
  let phone = $state('')
  let isSubmitting = $state(false)
  let isSuccess = $state(false)
  let errorMessage = $state('')

  async function handleSubmit(e) {
    e.preventDefault()
    const cleanPhone = toEnglishDigits(phone).replace(/\D/g, '')

    if (!cleanPhone || cleanPhone.length < 10) {
      errorMessage = 'لطفاً شماره تلفن همراه معتبر وارد نمایید.'
      return
    }

    errorMessage = ''
    isSubmitting = true

    try {
      if (onsubmit) {
        await onsubmit({ name, phone: cleanPhone })
      } else {
        // Default simulated feedback
        await new Promise((resolve) => setTimeout(resolve, 800))
      }
      isSuccess = true
      name = ''
      phone = ''
      setTimeout(() => {
        isSuccess = false
      }, 5000)
    } catch {
      errorMessage = 'خطایی در ثبت اطلاعات رخ داد. لطفاً مجدداً تلاش نمایید.'
    } finally {
      isSubmitting = false
    }
  }
</script>

<section class={cn('py-16 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white', className)} dir="rtl">
  <div class="max-w-2xl mx-auto px-5 text-center">
    <div class="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-orange-500/20 border border-white/10">
      <Bell class="w-8 h-8 text-white" />
    </div>

    <h2 class="text-2xl sm:text-3xl font-black text-white mb-3 tracking-tight">
      {title}
    </h2>
    <p class="text-slate-300 text-sm sm:text-base mb-8 max-w-lg mx-auto leading-relaxed">
      {subtitle}
    </p>

    {#if isSuccess}
      <div class="bg-emerald-500/20 border border-emerald-500/40 rounded-2xl p-4 text-emerald-300 flex items-center justify-center gap-2 max-w-md mx-auto animate-fadeIn">
        <CheckCircle class="w-5 h-5 shrink-0" />
        <span class="text-sm font-medium">شماره شما با موفقیت در سامانه اطلاع‌رسانی ثبت شد.</span>
      </div>
    {:else}
      <form onsubmit={handleSubmit} class="space-y-3">
        <div class="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
          <input
            type="text"
            bind:value={name}
            placeholder="نام و نام خانوادگی (اختیاری)"
            class="flex-1 px-4 py-3.5 rounded-xl bg-white/10 border border-white/15 text-white placeholder:text-slate-400 font-sans text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
          />
          <input
            type="tel"
            bind:value={phone}
            oninput={persianInputHandler}
            placeholder="شماره موبایل (مثال: ۰۹۱۲...)"
            required
            dir="ltr"
            class="flex-1 px-4 py-3.5 rounded-xl bg-white/10 border border-white/15 text-white placeholder:text-slate-400 font-sans text-sm text-center outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
          />
        </div>

        {#if errorMessage}
          <p class="text-xs text-rose-400 text-center">{errorMessage}</p>
        {/if}

        <div class="max-w-lg mx-auto pt-1">
          <Button
            type="submit"
            variant="amber"
            size="lg"
            loading={isSubmitting}
            disabled={isSubmitting}
            icon={Bell}
            class="w-full sm:w-auto px-8 !bg-gradient-to-r !from-amber-500 !to-orange-500 hover:!from-amber-600 hover:!to-orange-600 !text-slate-950 font-bold shadow-lg shadow-orange-500/25"
          >
            عضویت در خبرنامه پیامکی
          </Button>
        </div>
      </form>
    {/if}
  </div>
</section>
