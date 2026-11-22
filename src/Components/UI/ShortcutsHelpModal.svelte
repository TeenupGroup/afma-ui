<script>
  import { Modal, Button } from './index.js'
  import { getShortcutsHelpState, closeShortcutsHelp } from '../../lib/shortcuts.svelte.js'
  import { Keyboard, Command, Sparkles, X } from 'lucide-svelte'

  let isOpen = $derived(getShortcutsHelpState())

  const shortcutsList = [
    {
      keys: ['Ctrl', 'K'],
      macKeys: ['⌘', 'K'],
      description: 'باز کردن پالت فرمان و جستجوی سریع',
      category: 'ناوبری عمومی',
    },
    {
      keys: ['Ctrl', 'Z'],
      macKeys: ['⌘', 'Z'],
      description: 'بازگردانی آخرین عملیات (Undo)',
      category: 'اقدامات سریع',
    },
    {
      keys: ['/'],
      description: 'فوکوس فوری روی کادر جستجو',
      category: 'ناوبری عمومی',
    },
    {
      keys: ['?'],
      description: 'نمایش همین پنجره راهنمای کلیدها',
      category: 'راهنما',
    },
    {
      keys: ['Esc'],
      description: 'بستن پنجره‌ها، لغو انتخاب گروهی و پالت فرمان',
      category: 'اقدامات سریع',
    },
    {
      keys: ['j', 'k'],
      description: 'حرکت سریع سطر بعدی / قبلی در جدول‌ها',
      category: 'کار با جداول',
    },
  ]
</script>

<Modal
  open={isOpen}
  onclose={closeShortcutsHelp}
  title="کلیدهای میانبر صفحه کلید"
  size="md"
>
  <div class="space-y-4 text-right font-sans" dir="rtl">
    <p class="text-xs text-slate-500 leading-relaxed">
      با استفاده از کلیدهای میانبر می‌توانید بدون نیاز به ماوس با حداکثر سرعت در سامانه کار کنید:
    </p>

    <div class="divide-y divide-slate-100 rounded-2xl border border-slate-100 overflow-hidden bg-slate-50/50">
      {#each shortcutsList as sc}
        <div class="flex items-center justify-between p-3 text-xs">
          <span class="font-bold text-slate-700">{sc.description}</span>
          <div class="flex items-center gap-1 shrink-0 mr-3">
            {#each sc.keys as k}
              <kbd class="px-2 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 text-[11px] font-black shadow-2xs">
                {k}
              </kbd>
            {/each}
          </div>
        </div>
      {/each}
    </div>

    <div class="flex justify-end pt-2">
      <Button variant="secondary" size="sm" onclick={closeShortcutsHelp}>
        متوجه شدم (Esc)
      </Button>
    </div>
  </div>
</Modal>
