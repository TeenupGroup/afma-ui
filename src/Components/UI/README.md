# Unified UI Primitives Library (`@/Components/UI`)

این پوشه شامل مؤلفه‌ها و ابزارک‌های پایه رابط کاربری (UI Primitives) سامانه است. تمام کامپوننت‌ها به صورت بومی با **Svelte 5 Runes**، سازگار با چیدمان راست‌به‌چپ (RTL)، تایپوگرافی فارسی استاندارد و الگوهای دسترس‌پذیری پیاده‌سازی شده‌اند.

### کامپوننت‌های موجود:
- **`Switch.svelte`**: سوییچ تعاملی استاندارد و سازگار با RTL (پشتیبانی از ۳ سایز، ۷ رنگ و چیدمان‌های `inline` و `row`).
- **`Button.svelte`**: دکمه چندریختی (پشتیبانی از `<button>` و `<Link>` اینرشیا)، مدیریت حالت لودینگ (`loading`)، آیکون‌های ابتدا/انتها و پالت رنگی کامل (`primary`, `emerald`, `amber`, `rose`, `sky`, `slate`, `danger` و...).
- **`Card.svelte`**: کانتینر کارت با انواع تم‌ها (`default`, `muted`, `flat`, `elevated`, `glass`)، فاصله‌گذاری، افکت شناوری (`hoverable`) و اسنیپت‌های هدر و فوتر.
- **`Badge.svelte`**: نشان‌ها و وضعیت‌های یکپارچه با تنوع رنگی و انواع نمایشی (`subtle`, `solid`, `outline`, `dot`).
- **`Modal.svelte`**: مدال مدرن Svelte 5 با اسنیپت‌های مجزا برای `header`، `children`، `footer`، مدیریت قفل اسکرول بدنه، بستن با کلید Escape و کلیک روی پس‌زمینه.
- **`StatsCard.svelte`**: کارت آمار و شاخص‌ها با قالب‌بندی خودکار اعداد فارسی (`toPersianDigits`)، روند تغییرات (`trend`)، اسکلت لودینگ و رندرینگ پویای آیکون‌های لوسید بدون هشدارهای Svelte 5.
- **`EmptyState.svelte`**: کامپوننت حالت خالی با پشتیبانی از آیکون‌های پویا و دکمه‌های عملیاتی یا لینک‌های ناوبری.
- **`Input.svelte`**: ورودی متن/عدد با پشتیبانی از نرمال‌سازی خودکار ارقام فارسی (`numeric`)، آیکون‌های ابتدا/انتها و پیام خطای اعتبارسنجی.
- **`Select.svelte`**: سلکت‌باکس با فلش سفارشی راست‌چین، پشتیبانی از آرایه گزینه‌ها یا اسنیپت `children`.
- **`Textarea.svelte`**: متن چندخطی با ارتفاع قابل تنظیم و نمایش خطا.
- **`Checkbox.svelte`**: چک‌باکس استاندارد با پشتیبانی از حالت سه‌حالته (`indeterminate`)، برچسب و توضیحات دوبعدی.
- **`Alert.svelte`**: کادر پیام با حالت‌های `success` / `error` / `warning` / `info` / `neutral`، پشتیبانی از آیکون پیش‌فرض، عنوان، توضیح، اسنیپت محتوای دلخواه و قابلیت حذف (`dismissible`).
- **`Toast.svelte` & `ToastHost.svelte`**: سیستم یکپارچه اعلان و توست؛ بدون نیاز به تکرار کد در صفحات، با پشتیبانی از استور واکنشی `@/lib/toast.svelte.js` و شنود خودکار پیام‌های فلش اینرشیا (`page.props.flash`).
- **`Tabs.svelte`**: تب‌ها و ناوبری بخش‌های صفحه منطبق با قانون سفت‌وسخت عدم اسکرول افقی (چیدمان ریسپانسیو `wrap` و `grid` با اعداد فارسی).
- **`Skeleton.svelte`**: اسکلت بارگذاری متحرک برای متون، کارت‌ها، جداول، آواتارها و دکمه‌ها (`LoadingSkeleton`).
- **`SearchInput.svelte`**: ورودی جستجو با قابلیت تاخیر در تایپ (`debounce`)، آیکون جستجو، دکمه پاک‌کردن سریع و نرمال‌سازی فارسی (`SearchFilter`).
- **`ConfirmDialog.svelte` & `ConfirmHost.svelte`**: دیالوگ‌های تاییدیه پرومیس‌محور یکپارچه همراه با هاست گلوبال (`askConfirm`).
- **`Spinner.svelte`**: اسپینر بارگذاری استاندارد با سایزهای `xs` تا `xl` و رنگ‌های متنوع.
- **`Progress.svelte`**: نوار پیشرفت با نمایش درصد فارسی، رنگ‌بندی و اندازه‌های گوناگون.
- **`Pagination.svelte`**: صفحه‌بندی استاندارد لاراول/اینرشیا با اعداد فارسی، دکمه‌های راست‌چین و حفظ وضعیت اسکرول.
- **`Table.svelte` + `TableHead` / `TableBody` / `Tr` / `Th` / `Td`**: اجزای جدول معنایی (semantic).
- **`FileUpload.svelte`**: آپلودگر یکپارچه فایل و تصویر با پیش‌نمایش و فشرده‌سازی خودکار.
- **`RichEditor.svelte`**: ویرایشگر متن غنی (TipTap + Markdown) یکپارچه.
- **`TaskProgressModal.svelte`**: مدال پیشرفت و مانیتورینگ تسک‌های سنگین سرور به صورت ناهمگام.
- **`JalaliDatePicker.svelte` & `PersianTimePicker.svelte`**: انتخابگر تاریخ شمسی و زمان فارسی.

### نحوه استفاده سریع:
```svelte
<script>
  import { Switch, Button, Card, Badge, Tabs, SearchInput, ToastHost } from '@/Components/UI'
  import { toast } from '@/lib/toast.svelte.js'
  import { Plus, Users } from 'lucide-svelte'

  let isEnabled = $state(true)
  let activeTab = $state('active')
  let search = $state('')

  const tabs = [
    { id: 'active', label: 'فعال', count: 12 },
    { id: 'archived', label: 'بایگانی‌شده', count: 3 }
  ]

  function notify() {
    toast.success('تنظیمات با موفقیت ذخیره شدند')
  }
</script>

<Card title="داشبورد" description="مدیریت وضعیت سامانه">
  <div class="space-y-4">
    <Tabs bind:active={activeTab} {tabs} variant="pills" />
    <SearchInput bind:value={search} placeholder="جستجوی اعضا..." />
    <div class="flex items-center gap-4">
      <Switch bind:checked={isEnabled} color="emerald" label="فعال‌سازی سرویس" />
      <Button variant="emerald" icon={Plus} onclick={notify}>
        اعمال تغییرات
      </Button>
    </div>
  </div>
</Card>
```
