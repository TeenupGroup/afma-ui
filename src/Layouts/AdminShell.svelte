<script>
  import { Link, page, router } from '@inertiajs/svelte'
  import { cn, persianDigits, toPersianDigits } from '../lib/utils.js'
  import { Alert, Button, ToastHost, ConfirmHost } from '../Components/UI/index.js'
  import {
    Menu, X, Search, ChevronDown, LogOut, Settings, User,
    ChevronLeft, ChevronRight, Home, Clock, Globe, Shield, ExternalLink, AlertCircle
  } from 'lucide-svelte'

  let {
    brandTitle = 'پنل مدیریت',
    brandSubtitle = 'سامانه یکپارچه',
    brandHref = '/dashboard',
    brandIcon: BrandIcon = Shield,
    brandLogoUrl = '',
    brandGradient = 'from-blue-600 to-indigo-700',
    homeHref = '/',
    homeLabel = 'مشاهده سایت',
    logoutHref = '/logout',
    useInertiaLogout = true,
    navGroups = [],
    ssoSystems = [],
    ssoTitle = 'ورود یکپارچه به سامانه‌ها (SSO)',
    profileHref = null,
    settingsHref = null,
    user = null,
    flash = {},
    title = '',
    subtitle = '',
    headerIcon: HeaderIcon = null,
    headerBadge = '',
    breadcrumbs = [],
    actions = undefined,
    topbarActions = undefined,
    noticeBanner = '',
    footerText = '',
    showSearch = false,
    searchPlaceholder = 'جستجو...',
    onsearch = undefined,
    theme = undefined,
    ontoggletheme = undefined,
    children = undefined,
  } = $props()

  let sidebarOpen = $state(false)
  let sidebarCollapsed = $state(false)
  let profileMenuOpen = $state(false)
  let loggingOut = $state(false)
  let searchQuery = $state('')
  let currentTime = $state('')
  let currentDate = $state('')

  let currentPath = $derived(((page.url ?? '/dashboard').split('?')[0].replace(/\/+$/, '')) || '/')
  let resolvedUser = $derived(user ?? page.props.auth?.user ?? null)
  let resolvedFlash = $derived(flash && Object.keys(flash).length > 0 ? flash : (page.props.flash ?? {}))

  $effect(() => {
    if (page.url) {
      sidebarOpen = false
      profileMenuOpen = false
    }
  })

  $effect(() => {
    const serverTimestamp = page.props.currentDate?.timestamp
    const serverOffsetMs = serverTimestamp ? (serverTimestamp * 1000 - Date.now()) : 0

    const updateClock = () => {
      const targetTime = new Date(Date.now() + serverOffsetMs)
      try {
        const timeStr = new Intl.DateTimeFormat('fa-IR', {
          timeZone: 'Asia/Tehran',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }).format(targetTime)

        const dateStr = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
          timeZone: 'Asia/Tehran',
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        }).format(targetTime)

        currentTime = toPersianDigits(timeStr)
        currentDate = toPersianDigits(dateStr)
      } catch {
        currentTime = toPersianDigits(
          String(targetTime.getHours()).padStart(2, '0') + ':' +
          String(targetTime.getMinutes()).padStart(2, '0')
        )
      }
    }

    updateClock()
    const timer = setInterval(updateClock, 30000)
    return () => clearInterval(timer)
  })

  function isItemActive(href, exact = false) {
    const cleanHref = href.replace(/\/+$/, '') || '/'
    if (exact) return currentPath === cleanHref
    return currentPath === cleanHref || currentPath.startsWith(cleanHref + '/')
  }

  function handleLogout() {
    if (useInertiaLogout) {
      loggingOut = true
      router.post(logoutHref, {}, {
        onFinish: () => {
          loggingOut = false
        },
      })
      return
    }
    const form = document.createElement('form')
    form.method = 'POST'
    form.action = logoutHref
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content
    if (csrfToken) {
      const input = document.createElement('input')
      input.type = 'hidden'
      input.name = '_token'
      input.value = csrfToken
      form.appendChild(input)
    }
    document.body.appendChild(form)
    form.submit()
  }

  function handleClickOutside(event) {
    if (profileMenuOpen && !event.target.closest('.afma-profile-menu')) {
      profileMenuOpen = false
    }
  }

  function handleKeydown(event) {
    if (event.key === 'Escape') {
      if (sidebarOpen) sidebarOpen = false
      if (profileMenuOpen) profileMenuOpen = false
    }
  }

  function submitSearch(event) {
    if (event.key === 'Enter' && onsearch) {
      onsearch(searchQuery)
    }
  }

  let userDisplayName = $derived(resolvedUser?.name || resolvedUser?.full_name || 'کاربر')
  let userInitials = $derived(resolvedUser?.initials || userDisplayName?.[0] || '؟')
  let userRoleLabel = $derived(resolvedUser?.role_label || 'مدیر')
</script>

<svelte:window onclick={handleClickOutside} onkeydown={handleKeydown} />

{#snippet sidebarInner(collapsed, onNavigate)}
  <div class="flex flex-col h-full">
    <!-- Brand Header -->
    <div class={cn(
      'p-4 border-b border-slate-100 flex items-center',
      collapsed ? 'lg:justify-center' : 'gap-3 justify-between'
    )}>
      <Link href={brandHref} onclick={onNavigate} class="flex items-center gap-3 min-w-0">
        {#if brandLogoUrl}
          <img
            src={brandLogoUrl}
            alt={brandTitle}
            class="w-10 h-10 rounded-xl object-contain bg-white border border-slate-200/80 p-1 shrink-0 shadow-xs"
          />
        {:else}
          <div class={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm bg-gradient-to-br text-white',
            brandGradient
          )}>
            <BrandIcon class="w-5 h-5" />
          </div>
        {/if}
        {#if !collapsed}
          <div class="flex-1 min-w-0">
            <h2 class="text-sm font-black text-slate-800 truncate">{brandTitle}</h2>
            <p class="text-[11px] text-slate-500 font-medium truncate mt-0.5">{brandSubtitle}</p>
          </div>
        {/if}
      </Link>

      {#if onNavigate}
        <Button
          variant="ghost"
          size="sm"
          onclick={onNavigate}
          aria-label="بستن منو"
          icon={X}
          class="lg:hidden p-2 hover:bg-slate-100"
        />
      {/if}
    </div>

    <!-- Navigation Groups -->
    <nav class="flex-1 overflow-y-auto p-3 space-y-3" aria-label="ناوبری پنل مدیریت">
      {#each navGroups as group (group.label)}
        {@const GroupIcon = group.icon}
        {@const groupHasActive = group.items.some((item) => isItemActive(item.href, item.exact))}
        <details class="group" open={group.defaultOpen !== false || groupHasActive}>
          <summary
            onclick={() => {
              if (sidebarCollapsed) sidebarCollapsed = false
            }}
            class={cn(
              'flex min-h-10 cursor-pointer list-none items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold hover:bg-slate-50 transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 [&::-webkit-details-marker]:hidden',
              groupHasActive ? 'text-blue-700' : 'text-slate-500 hover:text-slate-800',
              collapsed && 'lg:justify-center lg:px-0'
            )}
            title={group.label}
          >
            {#if GroupIcon}
              <GroupIcon class="w-4.5 h-4.5 shrink-0" />
            {/if}
            {#if !collapsed}
              <span class="flex-1 truncate">{group.label}</span>
              <ChevronDown class="w-3.5 h-3.5 shrink-0 transition-transform duration-150 group-open:rotate-180" />
            {/if}
          </summary>

          {#if !collapsed}
            <div class="space-y-1 mt-1 pr-1">
              {#each group.items as item (item.href)}
                {@const active = isItemActive(item.href, item.exact)}
                {@const ItemIcon = item.icon}
                <Link
                  href={item.href}
                  onclick={onNavigate}
                  aria-current={active ? 'page' : undefined}
                  class={cn(
                    'flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all',
                    active
                      ? 'bg-blue-50 text-blue-700 font-bold shadow-2xs border border-blue-100'
                      : 'text-slate-600 font-medium hover:bg-slate-50 hover:text-slate-900'
                  )}
                >
                  {#if ItemIcon}
                    <ItemIcon class={cn('w-4 h-4 shrink-0', active ? 'text-blue-600' : 'text-slate-400')} />
                  {/if}
                  <span class="flex-1 truncate">{item.label}</span>
                  {#if item.badge}
                    <span class="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-indigo-100 text-indigo-700">
                      {toPersianDigits(item.badge)}
                    </span>
                  {/if}
                </Link>
              {/each}
            </div>
          {/if}
        </details>
      {/each}

      {#if ssoSystems.length > 0}
        <details class="group pt-2 border-t border-slate-100" open>
          <summary
            onclick={() => {
              if (sidebarCollapsed) sidebarCollapsed = false
            }}
            class={cn(
              'flex min-h-10 cursor-pointer list-none items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-800 [&::-webkit-details-marker]:hidden',
              collapsed && 'lg:justify-center lg:px-0'
            )}
            title={ssoTitle}
          >
            <Globe class="w-4.5 h-4.5 shrink-0" />
            {#if !collapsed}
              <span class="flex-1 truncate">{ssoTitle}</span>
              <ChevronDown class="w-3.5 h-3.5 shrink-0 transition-transform duration-150 group-open:rotate-180" />
            {/if}
          </summary>

          {#if !collapsed}
            <div class="space-y-1 mt-1 pr-1">
              {#each ssoSystems as sys (sys.key)}
                <a
                  href={sys.href}
                  target={sys.is_current ? undefined : '_blank'}
                  rel={sys.is_current ? undefined : 'noopener noreferrer'}
                  onclick={onNavigate}
                  class="flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                >
                  <span class="truncate flex items-center gap-1.5">
                    <span>{sys.short_fa}</span>
                    {#if !sys.is_current}
                      <ExternalLink class="w-3 h-3 text-slate-400" />
                    {/if}
                  </span>
                  <span class={cn(
                    'w-2 h-2 rounded-full shrink-0',
                    sys.health_status === 'healthy' ? 'bg-emerald-500' :
                    sys.health_status === 'degraded' ? 'bg-amber-500' : 'bg-rose-500'
                  )}></span>
                </a>
              {/each}
            </div>
          {/if}
        </details>
      {/if}
    </nav>

    <!-- User Footer -->
    {#if resolvedUser}
      <div class={cn('p-3 border-t border-slate-100 bg-slate-50/40', collapsed && 'lg:flex lg:justify-center')}>
        {#if !collapsed}
          <div class="flex items-center gap-3 px-3 py-2 mb-2 bg-white rounded-xl border border-slate-200/70 shadow-2xs">
            <div class="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-xs">
              {userInitials}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-xs font-bold text-slate-800 truncate">{userDisplayName}</p>
              <p class="text-[11px] text-slate-500 truncate mt-0.5">
                {userRoleLabel}
                {#if !resolvedUser.is_external_tenant && resolvedUser.hierarchy_rank}
                  · سطح {toPersianDigits(resolvedUser.hierarchy_rank)}
                {/if}
              </p>
            </div>
          </div>
          <div class="flex gap-2">
            {#if settingsHref}
              <Link
                href={settingsHref}
                onclick={onNavigate}
                class="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-slate-600 bg-white hover:bg-slate-100 border border-slate-200/70 rounded-xl transition-colors"
              >
                <Settings class="w-3.5 h-3.5" />
                <span>تنظیمات</span>
              </Link>
            {/if}
            <Button
              variant="rose"
              size="sm"
              loading={loggingOut}
              onclick={handleLogout}
              icon={LogOut}
              class="flex-1 !text-rose-600 !bg-rose-50 hover:!bg-rose-100 border border-rose-200/60"
            >
              خروج
            </Button>
          </div>
        {:else}
          <div class="hidden lg:flex flex-col items-center gap-2">
            <div class="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
              {userInitials}
            </div>
            <Button
              variant="ghost"
              size="sm"
              loading={loggingOut}
              onclick={handleLogout}
              icon={LogOut}
              title="خروج"
              aria-label="خروج"
              class="p-2 !text-rose-600 hover:!bg-rose-50"
            />
          </div>
        {/if}
      </div>
    {/if}
  </div>
{/snippet}

<div class="min-h-screen bg-slate-50 text-slate-800 print:bg-white print:min-h-0" dir="rtl" use:persianDigits>
  <!-- Mobile Backdrop -->
  {#if sidebarOpen}
    <div
      class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden print:hidden"
      onclick={() => (sidebarOpen = false)}
      onkeydown={() => {}}
      role="button"
      tabindex="-1"
      aria-label="بستن منو"
    ></div>
  {/if}

  <!-- Desktop Fixed Sidebar -->
  <aside class={cn(
    'print:hidden fixed top-0 right-0 h-full bg-white border-l border-slate-200/80 z-50 transition-all duration-300 overflow-hidden shadow-lg lg:shadow-none',
    sidebarOpen ? 'w-72' : 'w-0 lg:w-72',
    sidebarCollapsed && 'lg:w-16'
  )}>
    {@render sidebarInner(sidebarCollapsed, () => { if (sidebarOpen) sidebarOpen = false })}
  </aside>

  <!-- Main Rail -->
  <div class={cn(
    'transition-all duration-300 print:mr-0 print:p-0 print:w-full',
    sidebarCollapsed ? 'lg:mr-16' : 'lg:mr-72'
  )}>
    <!-- Topbar -->
    <header class="print:hidden bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 shadow-2xs">
      <div class="h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 w-full"></div>
      <div class="flex items-center justify-between px-4 lg:px-6 h-14">
        <div class="flex items-center gap-2.5">
          <Button
            variant="ghost"
            size="sm"
            onclick={() => (sidebarOpen = !sidebarOpen)}
            aria-label="باز کردن منو"
            aria-expanded={sidebarOpen}
            icon={Menu}
            class="lg:hidden p-2 hover:bg-slate-100"
          />
          <Button
            variant="ghost"
            size="sm"
            onclick={() => (sidebarCollapsed = !sidebarCollapsed)}
            title={sidebarCollapsed ? 'باز کردن سایدبار' : 'جمع کردن سایدبار'}
            aria-label={sidebarCollapsed ? 'باز کردن سایدبار' : 'جمع کردن سایدبار'}
            icon={sidebarCollapsed ? ChevronLeft : ChevronRight}
            class="hidden lg:inline-flex p-2 hover:bg-slate-100"
          />
          {#if homeHref}
            <Link
              href={homeHref}
              class="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-700 bg-slate-50 hover:bg-blue-50/70 px-3 py-1.5 rounded-xl border border-slate-200/80 transition-colors"
            >
              <Home class="w-3.5 h-3.5 text-blue-600" />
              <span>{homeLabel}</span>
            </Link>
          {/if}
        </div>

        <div class="flex items-center gap-2.5">
          {#if currentTime}
            <div
              class="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 tabular-nums select-none shadow-2xs"
              title="ساعت و تاریخ رسمی سیستم (تهران)"
            >
              <Clock class="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span class="font-bold text-slate-800">{currentTime}</span>
              {#if currentDate}
                <span class="hidden lg:inline text-slate-300">|</span>
                <span class="hidden lg:inline text-slate-500">{currentDate}</span>
              {/if}
            </div>
          {/if}

          {#if showSearch}
            <div class="relative hidden lg:block">
              <Search class="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                bind:value={searchQuery}
                onkeydown={submitSearch}
                class="w-56 pl-4 pr-9 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          {/if}

          {#if topbarActions}
            {@render topbarActions()}
          {/if}

          {#if resolvedUser}
            <div class="relative afma-profile-menu">
              <button
                type="button"
                onclick={() => (profileMenuOpen = !profileMenuOpen)}
                aria-expanded={profileMenuOpen}
                aria-label="منوی حساب کاربری"
                class="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 border border-transparent hover:border-slate-200/70 transition-colors cursor-pointer"
              >
                <span class="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-2xs">
                  {userInitials}
                </span>
                <span class="hidden sm:block text-xs font-bold text-slate-700 max-w-32 truncate">
                  {userDisplayName}
                </span>
                <ChevronDown class="w-4 h-4 text-slate-400" />
              </button>

              {#if profileMenuOpen}
                <div class="absolute left-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200/80 py-2 z-50">
                  <div class="px-4 py-2 border-b border-slate-100">
                    <p class="text-xs font-black text-slate-800 truncate">{userDisplayName}</p>
                    <p class="text-[11px] text-slate-500 truncate mt-0.5">{userRoleLabel}</p>
                  </div>
                  {#if homeHref}
                    <Link
                      href={homeHref}
                      class="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <Home class="w-3.5 h-3.5 text-slate-400" />
                      <span>{homeLabel}</span>
                    </Link>
                  {/if}
                  {#if profileHref}
                    <Link
                      href={profileHref}
                      class="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <User class="w-3.5 h-3.5 text-slate-400" />
                      <span>پروفایل و دسترسی‌ها</span>
                    </Link>
                  {/if}
                  {#if settingsHref}
                    <Link
                      href={settingsHref}
                      class="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <Settings class="w-3.5 h-3.5 text-slate-400" />
                      <span>تنظیمات</span>
                    </Link>
                  {/if}
                  <hr class="my-1 border-slate-100" />
                  <Button
                    variant="ghost"
                    size="sm"
                    loading={loggingOut}
                    onclick={handleLogout}
                    icon={LogOut}
                    class="w-full !justify-start !text-rose-600 hover:!bg-rose-50 rounded-none"
                  >
                    خروج از حساب کاربری
                  </Button>
                </div>
              {/if}
            </div>
          {/if}
        </div>
      </div>
    </header>

    <!-- Breadcrumbs -->
    {#if breadcrumbs.length > 0}
      <div class="print:hidden px-4 lg:px-6 py-2 bg-white border-b border-slate-100">
        <nav class="flex items-center gap-2 text-xs font-bold" aria-label="مسیر صفحه">
          <Link href={brandHref} class="text-slate-400 hover:text-blue-600 transition-colors">
            <Home class="w-3.5 h-3.5" />
          </Link>
          {#each breadcrumbs as crumb, i (crumb.label + i)}
            <ChevronLeft class="w-3.5 h-3.5 text-slate-300" />
            {#if crumb.href && i < breadcrumbs.length - 1}
              <Link href={crumb.href} class="text-slate-500 hover:text-blue-600 transition-colors">
                {crumb.label}
              </Link>
            {:else}
              <span class="text-slate-800">{crumb.label}</span>
            {/if}
          {/each}
        </nav>
      </div>
    {/if}

    <!-- Main Content Area -->
    <main id="workspace-main" class="p-4 lg:p-6 space-y-6 print:p-0 print:m-0 max-w-7xl mx-auto">
      {#if noticeBanner}
        <div class="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3 shadow-2xs print:hidden">
          <AlertCircle class="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div class="text-xs sm:text-sm font-medium leading-relaxed">{noticeBanner}</div>
        </div>
      {/if}

      <!-- Integrated Page Header Card (fmah Dashboard pattern) -->
      {#if title || actions}
        <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
          <div class="flex items-center gap-3.5 min-w-0">
            {#if HeaderIcon}
              <div class="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <HeaderIcon class="w-5 h-5" />
              </div>
            {/if}
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                {#if title}
                  <h1 class="text-lg sm:text-xl font-black text-slate-800 tracking-tight">{title}</h1>
                {/if}
                {#if headerBadge}
                  <span class="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-100 text-[11px] font-bold">
                    {headerBadge}
                  </span>
                {/if}
              </div>
              {#if subtitle}
                <p class="text-xs sm:text-sm text-slate-500 mt-0.5">{subtitle}</p>
              {/if}
            </div>
          </div>

          {#if actions}
            <div class="flex flex-wrap items-center gap-2 shrink-0">
              {@render actions()}
            </div>
          {/if}
        </div>
      {/if}

      <!-- Flash Messages -->
      {#if resolvedFlash?.success}
        <Alert variant="success">{resolvedFlash.success}</Alert>
      {/if}
      {#if resolvedFlash?.error}
        <Alert variant="error">{resolvedFlash.error}</Alert>
      {/if}
      {#if resolvedFlash?.info}
        <Alert variant="info">{resolvedFlash.info}</Alert>
      {/if}
      {#if resolvedFlash?.issued_token}
        <Alert variant="warning" title="کلید دسترسی صادرشده (فقط یک‌بار نمایش داده می‌شود):">
          <code class="block mt-1.5 p-2.5 rounded-xl bg-white border border-amber-200 text-xs text-slate-800 break-all select-all" dir="ltr">
            {resolvedFlash.issued_token}
          </code>
        </Alert>
      {/if}

      {#if children}
        {@render children()}
      {/if}

      {#if footerText}
        <footer class="mt-8 pt-4 pb-2 text-center text-xs text-slate-400 border-t border-slate-200/70 print:hidden">
          {footerText}
        </footer>
      {/if}
    </main>
  </div>

  <ToastHost />
  <div class="print:hidden">
    <ConfirmHost />
  </div>
</div>
