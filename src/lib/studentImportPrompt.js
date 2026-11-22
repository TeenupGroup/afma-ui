export function studentImportPrompt(grades, classes) {
  const gradeNames = [...new Set(grades.map(grade => grade.name).filter(Boolean))]
  const classNames = classes.filter(item => item.name).map(item => ({ نام: item.name, پایه: item.grade || '' }))

  return `اطلاعات دانش‌آموزان را فقط از متن یا تصویر ارائه‌شده استخراج کن. خروجی فقط یک آرایه JSON معتبر باشد؛ بدون توضیح، Markdown یا کد اضافی.
هر ردیف فقط این کلیدها را داشته باشد: first_name، last_name، national_code، parent_name، phone، parent_phone، grade، field_of_study، class.
نام و نام خانوادگی را جداگانه بنویس. کد ملی را به صورت رشته ۱۰ رقمی و شماره همراه را به صورت رشته ۱۱ رقمی با صفر آغازین و ارقام انگلیسی بنویس. صفرهای ابتدایی را حفظ کن.
هیچ اطلاعاتی را حدس نزن یا جعل نکن؛ هر مقدار نامشخص را رشته خالی قرار بده. نام پایه و کلاس را فقط دقیقاً از فهرست زیر انتخاب کن. اگر تطبیق قطعی نیست، آن مقدار را خالی بگذار. کلاس جدید یا نام جایگزین نساز و پایه هر کلاس را رعایت کن.
پایه‌های مدرسه: ${gradeNames.length ? JSON.stringify(gradeNames) : 'پایه‌ای ثبت نشده؛ grade را خالی بگذار.'}
کلاس‌های مدرسه (نام و پایه): ${classNames.length ? JSON.stringify(classNames) : 'کلاسی ثبت نشده؛ class را خالی بگذار.'}`
}
