# @teenup/afma-ui

کتابخانه مشترک کامپوننت‌های رابط کاربری و پنل مدیریت اکوسیستم **شبکه افما** بر پایه **Svelte 5 (Runes) + Tailwind CSS v4 + Inertia.js v3**.

## نصب در پروژه‌ها

### از طریق گیت‌هاب (برای سرور و Production)
در فایل `package.json` هر پروژه اضافه کنید:
```json
"dependencies": {
  "@teenup/afma-ui": "github:TeenupGroup/afma-ui#main"
}
```
و سپس اجرا کنید:
```bash
npm install
```

### اتصال همزمان محلی در زمان توسعه (HMR زنده)
در `vite.config.js` پروژه می‌توانید alias زیر را قرار دهید تا تغییرات `afma-ui` در لحظه در پروژه دیده شود:
```js
resolve: {
  alias: {
    '@teenup/afma-ui': fileURLToPath(new URL('../afma-ui/src', import.meta.url)),
  }
}
```

### اسکن کلاس‌های Tailwind CSS v4
در فایل `resources/css/app.css` پروژه اضافه کنید:
```css
@source '../../node_modules/@teenup/afma-ui/src/**/*.svelte';
```
و فونت و استایل پایه را ایمپورت کنید:
```css
@import '@teenup/afma-ui/styles/afma-ui.css';
```

## محتویات پکیج
- **۷۰+ کامپوننت پایه UI**: `Button`، `Card`، `StatsCard`، `Badge`، `Modal`، `Drawer`، `Input`، `Select`، `Textarea`، `Checkbox`، `Switch`، `Tabs`، `Alert`، `ToastHost`، `ConfirmHost`، `EmptyState`، `Pagination`، `Progress`، `Skeleton`، `Table`، `PageHeader`، `SearchInput` و...
- **کامپوننت‌های پنل مدیریت**: `AdminShell`، `DataTable`، `OfficialLetterhead`، `JalaliDatePicker`، `PersianTimePicker`، `RichEditor` (`@teenup/afma-ui/rich-editor`)
- **ابزارهای فارسی و کمکی**: `toPersianDigits`، `persianDigits`، `formatJalali`، `fmtDate`، `toast`، `askConfirm`، `cn`، `apiFetch`
