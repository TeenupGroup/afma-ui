<script>
  import { router } from '@inertiajs/svelte'
  import {
    Search, CalendarCheck, BookOpen, Users, GraduationCap,
    Send, Award, Clock, ArrowRight, CornerDownLeft, Sparkles,
    FileText, CheckSquare, Plus, Bell, X, Compass
  } from 'lucide-svelte'
  import { toPersianDigits } from '../../lib/utils.js'
  import { apiFetch } from '../../lib/api.js'

  let {
    type = 'teacher', // 'principal' | 'teacher' | 'student' | 'admin'
  } = $props()

  let open = $state(false)
  let query = $state('')
  let selectedIndex = $state(0)
  let serverResults = $state([])
  let isLoading = $state(false)
  let inputEl = $state(null)
  let debounceTimer = null

  // Base navigation & quick action items per role
  const baseActions = $derived.by(() => {
    const common = [
      {
        id: 'msg_new',
        title: 'ارسال پیام جدید',
        category: 'عملیات سریع',
        icon: Send,
        href: `/panel/${type}/messages/create`,
        badge: 'اقدام',
      },
      {
        id: 'inbox',
        title: 'صندوق پیام‌ها و مکاتبات',
        category: 'ناوبری سریع',
        icon: Bell,
        href: `/panel/${type}/messages`,
      },
    ]

    if (type === 'teacher') {
      return [
        {
          id: 'gradebook',
          title: 'دفتر نمرات و فعالیت‌های کلاسی',
          category: 'ناوبری سریع',
          icon: Award,
          href: '/panel/teacher/academics',
        },
        {
          id: 'assignments',
          title: 'تکالیف و تمرین‌ها',
          category: 'ناوبری سریع',
          icon: FileText,
          href: '/panel/teacher/assignments',
        },
        {
          id: 'exam_builder',
          title: 'طراحی آزمون و بانک سوالات',
          category: 'ناوبری سریع',
          icon: Sparkles,
          href: '/panel/teacher/exams',
        },
        {
          id: 'karnameh',
          title: 'کارنامه و گزارش تحصیلی',
          category: 'ناوبری سریع',
          icon: BookOpen,
          href: '/panel/teacher/karnameh',
        },
        ...common,
      ]
    }

    if (type === 'principal') {
      return [
        {
          id: 'teachers',
          title: 'مدیریت و لیست پرسنل و هنرآموزان',
          category: 'ناوبری سریع',
          icon: Users,
          href: '/panel/principal/personnel?tab=list',
        },
        {
          id: 'teacher_create',
          title: 'ثبت‌نام پرسنل و همکار جدید',
          category: 'عملیات سریع',
          icon: Plus,
          href: '/panel/principal/personnel?tab=manual-registration',
          badge: 'جدید',
        },
        {
          id: 'students',
          title: 'مدیریت و ثبت‌نام هنرجویان',
          category: 'ناوبری سریع',
          icon: GraduationCap,
          href: '/panel/principal/students',
        },
        ...common,
      ]
    }

    // Student role
    return [
      {
        id: 'academics',
        title: 'وضعیت تحصیلی و نمرات من',
        category: 'ناوبری سریع',
        icon: Award,
        href: '/panel/student/academics',
      },
      {
        id: 'assignments_student',
        title: 'تکالیف در انتظار ارسال',
        category: 'ناوبری سریع',
        icon: FileText,
        href: '/panel/student/assignments',
      },
      {
        id: 'timetable',
        title: 'برنامه هفتگی کلاسی',
        category: 'ناوبری سریع',
        icon: Clock,
        href: '/panel/student/timetable',
      },
      ...common,
    ]
  })

  // Filter local actions by query
  const filteredActions = $derived.by(() => {
    const q = query.trim().toLowerCase()
    if (!q) return baseActions
    return baseActions.filter(a =>
      a.title.toLowerCase().includes(q) || a.category.toLowerCase().includes(q)
    )
  })

  // Combined total list
  const allItems = $derived([...filteredActions, ...serverResults])

  // Reset index on list change
  $effect(() => {
    if (selectedIndex >= allItems.length) {
      selectedIndex = Math.max(0, allItems.length - 1)
    }
  })

  // Focus input when opened
  $effect(() => {
    if (open) {
      setTimeout(() => inputEl?.focus(), 50)
    }
  })

  // Global Keyboard Listener for Ctrl+K
  $effect(() => {
    if (typeof window === 'undefined') return

    const onKeydown = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault()
        openPalette()
      } else if (e.key === 'Escape' && open) {
        closePalette()
      }
    }

    const onOpenPalette = () => {
      openPalette()
    }

    window.addEventListener('keydown', onKeydown)
    window.addEventListener('open-command-palette', onOpenPalette)

    return () => {
      window.removeEventListener('keydown', onKeydown)
      window.removeEventListener('open-command-palette', onOpenPalette)
    }
  })

  export function openPalette() {
    open = true
    query = ''
    serverResults = []
    selectedIndex = 0
  }

  export function closePalette() {
    open = false
    query = ''
    serverResults = []
  }

  function handleInput() {
    selectedIndex = 0
    clearTimeout(debounceTimer)
    const q = query.trim()
    if (q.length < 2) {
      serverResults = []
      isLoading = false
      return
    }

    isLoading = true
    debounceTimer = setTimeout(async () => {
      try {
        const res = await apiFetch(`/panel/${type}/search?q=${encodeURIComponent(q)}`)
        if (Array.isArray(res)) {
          serverResults = res.map((item, i) => ({
            id: `server_${i}_${item.id || i}`,
            title: item.title || item.name || item.full_name || 'نتیجه جستجو',
            category: item.type_label || 'نتایج سیستم',
            href: item.url || item.href || '#',
            icon: item.icon === 'student' ? GraduationCap : item.icon === 'teacher' ? Users : Compass,
            badge: item.subtitle || null,
          }))
        } else {
          serverResults = []
        }
      } catch {
        serverResults = []
      } finally {
        isLoading = false
      }
    }, 250)
  }

  function handleKeydown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (allItems.length > 0) {
        selectedIndex = (selectedIndex + 1) % allItems.length
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (allItems.length > 0) {
        selectedIndex = (selectedIndex - 1 + allItems.length) % allItems.length
      }
    } else if (e.key === 'Enter') {
      e.preventDefault()
      selectItem(allItems[selectedIndex])
    }
  }

  function selectItem(item) {
    if (!item || !item.href || item.href === '#') return
    closePalette()
    router.visit(item.href, {
      preserveScroll: false,
      preserveState: false,
    })
  }
</script>

{#if open}
  <!-- Backdrop -->
  <div
    class="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-150"
    onclick={closePalette}
    role="presentation"
  ></div>

  <!-- Command Palette Modal -->
  <div
    class="fixed inset-x-4 top-[12%] sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 z-[101] w-full max-w-xl rounded-2xl bg-white/95 border border-slate-200/90 shadow-2xl backdrop-blur-xl overflow-hidden text-right font-sans animate-in zoom-in-95 duration-150"
    role="dialog"
    aria-modal="true"
    aria-label="پالت فرمان و جستجوی سریع"
    dir="rtl"
  >
    <!-- Header / Search Input -->
    <div class="relative flex items-center border-b border-slate-100 px-4 py-3.5">
      <Search class="w-5 h-5 text-slate-400 shrink-0 ml-3" />
      <input
        bind:this={inputEl}
        bind:value={query}
        oninput={handleInput}
        onkeydown={handleKeydown}
        type="text"
        placeholder="جستجوی صفحه، نام هنرجو، اقدام یا دستور..."
        class="w-full bg-transparent text-sm font-bold text-slate-800 placeholder-slate-400 outline-none"
      />
      {#if query}
        <button
          type="button"
          onclick={() => { query = ''; serverResults = []; }}
          class="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X class="w-4 h-4" />
        </button>
      {/if}
      <span class="mr-2 hidden sm:inline-flex items-center px-2 py-0.5 rounded-lg border border-slate-200 bg-slate-50 text-[10px] font-bold text-slate-400">
        Esc
      </span>
    </div>

    <!-- Results List -->
    <div class="max-h-[380px] overflow-y-auto p-2 space-y-1">
      {#if allItems.length === 0}
        <div class="py-10 text-center text-slate-400">
          <p class="text-sm font-medium">موردی متناسب با «{query}» یافت نشد.</p>
          <p class="text-xs text-slate-400 mt-1">می‌توانید عنوان بخش یا نام افراد را جستجو کنید.</p>
        </div>
      {:else}
        {#each allItems as item, idx (item.id)}
          {@const isSelected = idx === selectedIndex}
          {@const Icon = item.icon || Compass}
          <button
            type="button"
            onclick={() => selectItem(item)}
            onmouseenter={() => selectedIndex = idx}
            class="w-full flex items-center justify-between p-2.5 rounded-xl text-right transition-colors cursor-pointer {
              isSelected
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-50'
            }"
          >
            <div class="flex items-center gap-3 min-w-0">
              <div class="p-2 rounded-lg {isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'} shrink-0">
                <Icon class="w-4 h-4" />
              </div>
              <div class="min-w-0 text-right">
                <p class="text-xs sm:text-sm font-bold truncate leading-tight">
                  {item.title}
                </p>
                <p class="text-[10px] font-medium mt-0.5 {isSelected ? 'text-indigo-200' : 'text-slate-400'}">
                  {item.category}
                </p>
              </div>
            </div>

            <div class="flex items-center gap-2 shrink-0 mr-3">
              {#if item.badge}
                <span class="text-[10px] px-2 py-0.5 rounded-full font-bold {
                  isSelected
                    ? 'bg-white/20 text-white'
                    : 'bg-indigo-50 text-indigo-700'
                }">
                  {item.badge}
                </span>
              {/if}
              {#if isSelected}
                <CornerDownLeft class="w-3.5 h-3.5 text-white/80" />
              {/if}
            </div>
          </button>
        {/each}
      {/if}
    </div>

    <!-- Footer Hints -->
    <div class="flex items-center justify-between border-t border-slate-100 bg-slate-50/80 px-4 py-2.5 text-[11px] font-medium text-slate-400">
      <div class="flex items-center gap-4">
        <span class="flex items-center gap-1">
          <kbd class="px-1 py-0.5 rounded bg-white border border-slate-200 text-[10px] shadow-2xs font-bold text-slate-600">↑↓</kbd>
          حرکت
        </span>
        <span class="flex items-center gap-1">
          <kbd class="px-1 py-0.5 rounded bg-white border border-slate-200 text-[10px] shadow-2xs font-bold text-slate-600">↵</kbd>
          انتخاب
        </span>
      </div>
      <div class="flex items-center gap-1 text-indigo-600 font-bold">
        <Sparkles class="w-3.5 h-3.5" />
        <span>پالت فرمان Antigravity</span>
      </div>
    </div>
  </div>
{/if}
