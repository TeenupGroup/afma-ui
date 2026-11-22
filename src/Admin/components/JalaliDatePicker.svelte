<script>
  import { cn, toPersianDigits, toEnglishDigits, persianInputHandler } from '../../lib/utils.js'
  import { gregorianToJalali, jalaliToGregorian } from '../../utils/jalali.js'
  import { Button } from '../../Components/UI/index.js'
  import { ChevronLeft, ChevronRight, Calendar, Clock, X } from 'lucide-svelte'

  let { 
    value = $bindable(null),
    stringValue = $bindable(''),
    jalaliValue = $bindable(''),
    outputType = 'iso', // 'iso' | 'jalali'
    placeholder = 'تاریخ را انتخاب کنید',
    disabled = false,
    clearable = true,
    timePicker = false,
    range = false,
    rangeValue = $bindable([null, null]),
    minDate = null,
    maxDate = null,
    disabledDates = [],
    format = 'YYYY/MM/DD',
    onchange = null,
    class: className = ''
  } = $props()

  function dateToISO(date) {
    if (!date) return ''
    const d = (date instanceof Date) ? date : parseDateInput(date)
    if (!d || isNaN(d.getTime())) return ''
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const dNum = String(d.getDate()).padStart(2, '0')
    if (timePicker) {
      const h = String(d.getHours()).padStart(2, '0')
      const min = String(d.getMinutes()).padStart(2, '0')
      return `${y}-${m}-${dNum} ${h}:${min}`
    }
    return `${y}-${m}-${dNum}`
  }

  function dateToJalali(date) {
    if (!date) return ''
    const d = (date instanceof Date) ? date : parseDateInput(date)
    if (!d || isNaN(d.getTime())) return ''
    const [jy, jm, jd] = gregorianToJalali(d.getFullYear(), d.getMonth() + 1, d.getDate())
    const yStr = String(jy)
    const mStr = String(jm).padStart(2, '0')
    const dStr = String(jd).padStart(2, '0')
    if (timePicker) {
      const h = String(d.getHours()).padStart(2, '0')
      const min = String(d.getMinutes()).padStart(2, '0')
      return `${yStr}/${mStr}/${dStr} ${h}:${min}`
    }
    return `${yStr}/${mStr}/${dStr}`
  }

  function parseDateInput(raw) {
    if (!raw) return null
    if (raw instanceof Date) return isNaN(raw.getTime()) ? null : raw
    const s = toEnglishDigits(String(raw).trim())
    if (!s) return null

    // Check if input matches YYYY/MM/DD or YYYY-MM-DD pattern
    const match = s.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})(?:[T\s](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?$/)
    if (match) {
      const y = parseInt(match[1], 10)
      const m = parseInt(match[2], 10)
      const d = parseInt(match[3], 10)
      const h = parseInt(match[4] || '0', 10)
      const min = parseInt(match[5] || '0', 10)
      const sec = parseInt(match[6] || '0', 10)

      // If year is in Jalali range (1300..1500), convert from Jalali to Gregorian
      if (y >= 1300 && y <= 1500) {
        const [gy, gm, gd] = jalaliToGregorian(y, m, d)
        const parsed = new Date(gy, gm - 1, gd, h, min, sec)
        return isNaN(parsed.getTime()) ? null : parsed
      }

      // If Gregorian year (> 1500), construct in local timezone to avoid UTC midnight shifts
      if (y > 1500) {
        const parsed = new Date(y, m - 1, d, h, min, sec)
        return isNaN(parsed.getTime()) ? null : parsed
      }
    }

    const d = new Date(s.includes('T') ? s : s.replace(' ', 'T'))
    return isNaN(d.getTime()) ? null : d
  }

  function sameDay(a, b) {
    if (!a || !b) return false
    const da = (a instanceof Date) ? a : parseDateInput(a)
    const db = (b instanceof Date) ? b : parseDateInput(b)
    if (!da || !db) return false
    return da.getFullYear() === db.getFullYear()
      && da.getMonth() === db.getMonth()
      && da.getDate() === db.getDate()
  }

  function syncTime() {
    if (!value || !timePicker) return
    const d = new Date(value)
    d.setHours(Number(selectedHour) || 0, Number(selectedMinute) || 0, 0, 0)
    value = d
    stringValue = outputType === 'jalali' ? dateToJalali(d) : dateToISO(d)
    jalaliValue = dateToJalali(d)
    if (onchange) onchange(d)
  }

  // Only clear value when stringValue transitions empty (don't wipe bind:value-only usage)
  let hadStringValue = false
  $effect(() => {
    if (stringValue) {
      hadStringValue = true
      const d = parseDateInput(stringValue)
      if (d) {
        value = d
        jalaliValue = dateToJalali(d)
        if (timePicker) {
          selectedHour = d.getHours()
          selectedMinute = d.getMinutes()
        }
      }
    } else if (jalaliValue) {
      const d = parseDateInput(jalaliValue)
      if (d) {
        value = d
        if (!stringValue) {
          stringValue = outputType === 'jalali' ? dateToJalali(d) : dateToISO(d)
        }
        if (timePicker) {
          selectedHour = d.getHours()
          selectedMinute = d.getMinutes()
        }
      }
    } else if (hadStringValue) {
      value = null
      jalaliValue = ''
      hadStringValue = false
    } else if (value && typeof value === 'string') {
      const d = parseDateInput(value)
      if (d) {
        value = d
        if (!stringValue) stringValue = outputType === 'jalali' ? dateToJalali(d) : dateToISO(d)
        jalaliValue = dateToJalali(d)
      }
    } else if (value instanceof Date && !isNaN(value.getTime())) {
      jalaliValue = dateToJalali(value)
      if (!stringValue) {
        stringValue = outputType === 'jalali' ? dateToJalali(value) : dateToISO(value)
      }
    }
  })

  // Jalali months
  const jalaliMonths = [
    'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
  ]

  // Jalali day names
  const jalaliDayNames = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج']

  // State
  let isOpen = $state(false)
  let currentMonth = $state(0)
  let currentYear = $state(0)
  let selectedHour = $state(0)
  let selectedMinute = $state(0)
  let viewMode = $state('days') // 'days', 'months', 'years'
  let yearRangeStart = $state(0)
  let hoverDate = $state(null)

  // Persian digits conversion
  const toPersianNum = toPersianDigits

  // Get days in Jalali month
  function getDaysInMonth(year, month) {
    if (month <= 6) return 31
    if (month <= 11) return 30
    // Check for leap year
    const remainder = year % 33
    if ([1, 5, 9, 13, 17, 22, 26, 30].includes(remainder)) return 30
    return 29
  }

  // Get first day of month (0 = Saturday in Jalali)
  function getFirstDayOfMonth(year, month) {
    const [gy, gm, gd] = jalaliToGregorian(year, month, 1)
    const date = new Date(gy, gm - 1, gd)
    return (date.getDay() + 1) % 7 // Adjust for Saturday start
  }

  // Generate calendar days
  function generateCalendarDays(year, month) {
    const daysInMonth = getDaysInMonth(year, month)
    const firstDay = getFirstDayOfMonth(year, month)
    const days = []

    // Previous month days
    const prevMonth = month === 1 ? 12 : month - 1
    const prevYear = month === 1 ? year - 1 : year
    const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth)

    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        day: daysInPrevMonth - i,
        month: prevMonth,
        year: prevYear,
        isCurrentMonth: false,
        isPrevMonth: true
      })
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        month: month,
        year: year,
        isCurrentMonth: true,
        isPrevMonth: false
      })
    }

    // Next month days
    const remaining = 42 - days.length
    const nextMonth = month === 12 ? 1 : month + 1
    const nextYear = month === 12 ? year + 1 : year

    for (let i = 1; i <= remaining; i++) {
      days.push({
        day: i,
        month: nextMonth,
        year: nextYear,
        isCurrentMonth: false,
        isPrevMonth: false
      })
    }

    return days
  }

  // Initialize with current date or value
  function initialize() {
    if (value) {
      const date = (value instanceof Date) ? value : parseDateInput(value)
      if (date && !isNaN(date.getTime())) {
        const [jy, jm, jd] = gregorianToJalali(date.getFullYear(), date.getMonth() + 1, date.getDate())
        currentYear = jy
        currentMonth = jm
        if (timePicker) {
          selectedHour = date.getHours()
          selectedMinute = date.getMinutes()
        }
      }
    } else {
      const now = new Date()
      const [jy, jm] = gregorianToJalali(now.getFullYear(), now.getMonth() + 1, now.getDate())
      currentYear = jy
      currentMonth = jm
    }
    yearRangeStart = currentYear - (currentYear % 12)
  }

  // Navigate to previous month
  function prevMonth() {
    if (currentMonth === 1) {
      currentMonth = 12
      currentYear--
    } else {
      currentMonth--
    }
  }

  // Navigate to next month
  function nextMonth() {
    if (currentMonth === 12) {
      currentMonth = 1
      currentYear++
    } else {
      currentMonth++
    }
  }

  // Navigate to previous year
  function prevYear() {
    currentYear--
    yearRangeStart = currentYear - (currentYear % 12)
  }

  // Navigate to next year
  function nextYear() {
    currentYear++
    yearRangeStart = currentYear - (currentYear % 12)
  }

  // Select a date
  function selectDate(day) {
    if (day.isPrevMonth) {
      prevMonth()
    } else if (!day.isCurrentMonth) {
      nextMonth()
    }

    const [gy, gm, gd] = jalaliToGregorian(day.year, day.month, day.day)
    let selectedDate = new Date(gy, gm - 1, gd)
    
    if (timePicker) {
      selectedDate.setHours(selectedHour, selectedMinute)
    }

    if (range) {
      if (!rangeValue[0] || (rangeValue[0] && rangeValue[1])) {
        rangeValue = [selectedDate, null]
      } else {
        if (selectedDate < rangeValue[0]) {
          rangeValue = [selectedDate, rangeValue[0]]
        } else {
          rangeValue = [rangeValue[0], selectedDate]
        }
        isOpen = false
      }
    } else {
      value = selectedDate
      stringValue = outputType === 'jalali' ? dateToJalali(selectedDate) : dateToISO(selectedDate)
      jalaliValue = dateToJalali(selectedDate)
      isOpen = false
    }

    if (onchange) {
      onchange(range ? rangeValue : value)
    }
  }

  // Clear selection
  function clear() {
    if (range) {
      rangeValue = [null, null]
    } else {
      value = null
      stringValue = ''
      jalaliValue = ''
    }
    if (onchange) {
      onchange(null)
    }
  }

  // Check if a date is selected (date-only; ignore time so timePicker highlight works)
  function isSelected(day) {
    const [gy, gm, gd] = jalaliToGregorian(day.year, day.month, day.day)
    const date = new Date(gy, gm - 1, gd)
    if (range) {
      if (!rangeValue[0]) return false
      return sameDay(date, rangeValue[0]) || sameDay(date, rangeValue[1])
    }
    if (!value) return false
    return sameDay(date, value)
  }

  // Check if a date is in range
  function isInRange(day) {
    if (!range || !rangeValue[0] || !rangeValue[1]) return false
    const [gy, gm, gd] = jalaliToGregorian(day.year, day.month, day.day)
    const date = new Date(gy, gm - 1, gd)
    return date > rangeValue[0] && date < rangeValue[1]
  }

  // Check if a date is disabled
  function isDateDisabled(day) {
    const [gy, gm, gd] = jalaliToGregorian(day.year, day.month, day.day)
    const date = new Date(gy, gm - 1, gd)
    
    if (minDate && date < minDate) return true
    if (maxDate && date > maxDate) return true
    if (disabledDates.some(d => d.getTime() === date.getTime())) return true
    
    return false
  }

  // Check if a date is today
  function isToday(day) {
    const now = new Date()
    const [todayJy, todayJm, todayJd] = gregorianToJalali(now.getFullYear(), now.getMonth() + 1, now.getDate())
    return day.year === todayJy && day.month === todayJm && day.day === todayJd
  }

  // Format date for display
  function formatDate(date) {
    if (!date) return ''
    const d = (date instanceof Date) ? date : parseDateInput(date)
    if (!d || isNaN(d.getTime())) return ''
    const [jy, jm, jd] = gregorianToJalali(d.getFullYear(), d.getMonth() + 1, d.getDate())
    let result = format
      .replace('YYYY', toPersianNum(jy))
      .replace('MM', toPersianNum(jm).padStart(2, '۰'))
      .replace('DD', toPersianNum(jd).padStart(2, '۰'))
    
    if (timePicker) {
      result += ' ' + toPersianNum(selectedHour).padStart(2, '۰') + ':' + toPersianNum(selectedMinute).padStart(2, '۰')
    }
    
    return result
  }

  // Select month
  function selectMonth(month) {
    currentMonth = month
    viewMode = 'days'
  }

  // Select year
  function selectYear(year) {
    currentYear = year
    viewMode = 'months'
  }

  // Toggle view mode
  function toggleViewMode() {
    if (viewMode === 'days') {
      viewMode = 'months'
    } else if (viewMode === 'months') {
      viewMode = 'years'
      yearRangeStart = currentYear - (currentYear % 12)
    } else {
      viewMode = 'days'
    }
  }

  // Generate years for year view
  function generateYears() {
    const years = []
    for (let i = yearRangeStart; i < yearRangeStart + 12; i++) {
      years.push(i)
    }
    return years
  }

  // Handle keyboard navigation
  function handleKeydown(event) {
    if (!isOpen) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        isOpen = true
        initialize()
      }
      return
    }

    switch (event.key) {
      case 'Escape':
        isOpen = false
        break
      case 'ArrowRight':
        event.preventDefault()
        prevMonth()
        break
      case 'ArrowLeft':
        event.preventDefault()
        nextMonth()
        break
      case 'ArrowUp':
        event.preventDefault()
        prevYear()
        break
      case 'ArrowDown':
        event.preventDefault()
        nextYear()
        break
    }
  }

  // Initialize on mount
  $effect(() => {
    if (isOpen) {
      initialize()
    }
  })

  // Compute calendar days
  let calendarDays = $derived(generateCalendarDays(currentYear, currentMonth))
  let years = $derived(generateYears())
</script>

<div class={cn("relative", className)} dir="rtl">
  <!--
  Trigger: the clickable field is a real button element and the clear control is
  a SIBLING button element. They used to be nested (a role="button" span inside
  the trigger button), which is invalid interactive nesting. The shared
  border/ring lives on this wrapper div so it still looks like one input.
-->
<div
    class={cn(
      "w-full flex items-center justify-between gap-2 px-3 py-2 text-sm border rounded-xl transition-all",
      "bg-white hover:border-gray-400 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500",
      disabled ? "opacity-50 cursor-not-allowed bg-gray-50" : "",
      isOpen ? "border-blue-500 ring-2 ring-blue-500/20" : "border-gray-300"
    )}
  >
    <button
      type="button"
      {disabled}
      data-testid="date-picker-trigger"
      onclick={() => { isOpen = !isOpen; if (isOpen) initialize() }}
      onkeydown={handleKeydown}
      class="flex-1 flex items-center gap-2 text-right focus:outline-none"
      aria-haspopup="dialog"
      aria-expanded={isOpen}
    >
      <Calendar class="w-4 h-4 text-gray-400 shrink-0" />
      {#if range && rangeValue[0]}
        <span class="text-gray-800">
          {formatDate(rangeValue[0])}
          {#if rangeValue[1]}
            <span class="text-gray-400 mx-1">تا</span>
            {formatDate(rangeValue[1])}
          {/if}
        </span>
      {:else if value}
        <span class="text-gray-800">{formatDate(value)}</span>
      {:else}
        <span class="text-gray-400">{placeholder}</span>
      {/if}
    </button>
    <div class="flex items-center gap-1 shrink-0">
      {#if clearable && (value || (range && rangeValue[0]))}
        <Button
          type="button"
          variant="ghost"
          size="xs"
          class="p-1 text-gray-400 hover:text-gray-600"
          data-testid="date-picker-clear"
          title="پاک کردن"
          aria-label="پاک کردن"
          onclick={() => clear()}
        >
          <X class="w-3.5 h-3.5" />
        </Button>
      {/if}
      <ChevronLeft class="w-4 h-4 text-gray-400" />
    </div>
  </div>

  <!-- Calendar dropdown -->
  {#if isOpen}
    <div
      class="absolute z-50 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 p-4 w-72"
      role="dialog"
      data-testid="date-picker-dialog"
      aria-label="تقویم"
    >
      <!-- Header -->
      <div class="flex items-center justify-between mb-4">
        <Button
          type="button"
          variant="ghost"
          size="xs"
          class="p-1.5"
          aria-label={viewMode === 'years' ? '۱۲ سال قبل' : 'سال قبل'}
          onclick={viewMode === 'years' ? () => yearRangeStart -= 12 : prevYear}
        >
          <ChevronRight class="w-4 h-4 text-gray-600" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          class="px-3 py-1.5 font-medium"
          onclick={toggleViewMode}
        >
          {#if viewMode === 'days'}
            {jalaliMonths[currentMonth - 1]} {toPersianNum(currentYear)}
          {:else if viewMode === 'months'}
            {toPersianNum(currentYear)}
          {:else}
            {toPersianNum(yearRangeStart)} - {toPersianNum(yearRangeStart + 11)}
          {/if}
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="xs"
          class="p-1.5"
          aria-label={viewMode === 'years' ? '۱۲ سال بعد' : 'سال بعد'}
          onclick={viewMode === 'years' ? () => yearRangeStart += 12 : nextYear}
        >
          <ChevronLeft class="w-4 h-4 text-gray-600" />
        </Button>
      </div>

      <!-- Month navigation (only in days view) -->
      {#if viewMode === 'days'}
        <div class="flex items-center justify-between mb-3">
          <Button
            type="button"
            variant="ghost"
            size="xs"
            class="p-1.5"
            aria-label="ماه قبل"
            onclick={prevMonth}
          >
            <ChevronRight class="w-4 h-4 text-gray-600" />
          </Button>
          <span class="text-sm font-medium text-gray-700">
            {jalaliMonths[currentMonth - 1]}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="xs"
            class="p-1.5"
            aria-label="ماه بعد"
            onclick={nextMonth}
          >
            <ChevronLeft class="w-4 h-4 text-gray-600" />
          </Button>
        </div>
      {/if}

      <!-- Content based on view mode -->
      {#if viewMode === 'days'}
        <!-- Day names -->
        <div class="grid grid-cols-7 gap-1 mb-2">
          {#each jalaliDayNames as dayName}
            <div class="text-center text-xs font-medium text-gray-500 py-1">
              {dayName}
            </div>
          {/each}
        </div>

        <!-- Calendar days -->
        <div class="grid grid-cols-7 gap-1">
          {#each calendarDays as day}
            {@const disabled = isDateDisabled(day)}
            {@const selected = isSelected(day)}
            {@const inRange = isInRange(day)}
            {@const today = isToday(day)}
            
            <button
              type="button"
              {disabled}
              data-testid="date-picker-day"
              data-day={day.day}
              data-current-month={day.isCurrentMonth}
              onclick={() => !disabled && selectDate(day)}
              onmouseenter={() => hoverDate = day}
              onmouseleave={() => hoverDate = null}
              class={cn(
                "relative w-9 h-9 flex items-center justify-center text-sm rounded-lg transition-all",
                !day.isCurrentMonth && "text-gray-300",
                day.isCurrentMonth && !disabled && !selected && "text-gray-700 hover:bg-gray-100",
                disabled && "opacity-50 cursor-not-allowed",
                selected && "bg-blue-600 text-white hover:bg-blue-700",
                inRange && !selected && "bg-blue-50",
                today && !selected && "ring-2 ring-blue-500/20",
                range && rangeValue[0] && !rangeValue[1] && hoverDate === day && !disabled && "bg-blue-50"
              )}
            >
              {toPersianNum(day.day)}
              {#if today && !selected}
                <div class="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full"></div>
              {/if}
            </button>
          {/each}
        </div>
      {:else if viewMode === 'months'}
        <!-- Months grid -->
        <div class="grid grid-cols-3 gap-2">
          {#each jalaliMonths as month, i}
            <button
              type="button"
              onclick={() => selectMonth(i + 1)}
              class={cn(
                "py-2 px-3 text-sm rounded-lg transition-all",
                currentMonth === i + 1 
                  ? "bg-blue-600 text-white" 
                  : "hover:bg-gray-100 text-gray-700"
              )}
            >
              {month}
            </button>
          {/each}
        </div>
      {:else}
        <!-- Years grid -->
        <div class="grid grid-cols-3 gap-2">
          {#each years as year}
            <button
              type="button"
              onclick={() => selectYear(year)}
              class={cn(
                "py-2 px-3 text-sm rounded-lg transition-all",
                currentYear === year 
                  ? "bg-blue-600 text-white" 
                  : "hover:bg-gray-100 text-gray-700"
              )}
            >
              {toPersianNum(year)}
            </button>
          {/each}
        </div>
      {/if}

      <!-- Time picker -->
      {#if timePicker && viewMode === 'days'}
        <div class="mt-3 pt-3 border-t border-gray-100">
          <div class="flex items-center justify-center gap-2">
            <Clock class="w-4 h-4 text-gray-400" />
            <div class="flex items-center gap-1">
              <input
                type="text"
                inputmode="numeric"
                maxlength="2"
                data-testid="date-picker-minute"
                value={toPersianNum(selectedMinute)}
                oninput={(e) => {
                  persianInputHandler(e)
                  const num = parseInt(toEnglishDigits(e.target.value)) || 0
                  selectedMinute = Math.min(59, Math.max(0, num))
                  syncTime()
                }}
                class="w-12 text-center text-sm border border-gray-300 rounded-lg py-1 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <span class="text-gray-500">:</span>
              <input
                type="text"
                inputmode="numeric"
                maxlength="2"
                data-testid="date-picker-hour"
                value={toPersianNum(selectedHour)}
                oninput={(e) => {
                  persianInputHandler(e)
                  const num = parseInt(toEnglishDigits(e.target.value)) || 0
                  selectedHour = Math.min(23, Math.max(0, num))
                  syncTime()
                }}
                class="w-12 text-center text-sm border border-gray-300 rounded-lg py-1 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      {/if}

      <!-- Today button -->
      <div class="mt-3 pt-3 border-t border-gray-100">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          class="w-full"
          data-testid="date-picker-today"
          onclick={() => {
            const now = new Date()
            const [jy, jm, jd] = gregorianToJalali(now.getFullYear(), now.getMonth() + 1, now.getDate())
            currentYear = jy
            currentMonth = jm
            selectDate({ day: jd, month: jm, year: jy, isCurrentMonth: true })
          }}
        >
          امروز
        </Button>
      </div>
    </div>
  {/if}
</div>
