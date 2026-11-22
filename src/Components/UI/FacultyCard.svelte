<script>
  import { storageUrl } from '../../lib/utils.js'

  let {
    name = '',
    role = '',
    imageUrl = '',
    logoUrl = '',
    theme = 'light',
    accentColor = 'blue',
    bio = '',
    class: customClass = ''
  } = $props()

  const FALLBACK = 'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27160%27 height=%27160%27%3E%3Crect width=%27160%27 height=%27160%27 fill=%27%23f3f4f6%27/%3E%3Ctext x=%2780%27 y=%2780%27 text-anchor=%27middle%27 dominant-baseline=%27central%27 font-size=%2732%27 fill=%27%239ca3af%27%3E👤%3C/text%3E%3C/svg%3E'

  let cardEl = $state(null)

  function handleMouseMove(e) {
    if (!cardEl) return
    const rect = cardEl.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    const tiltX = (y - 0.5) * 10
    const tiltY = (0.5 - x) * 10
    cardEl.style.transform = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02,1.02,1.02)`
  }

  function handleMouseLeave() {
    if (!cardEl) return
    cardEl.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)'
  }

  const accentStyles = {
    blue: {
      bar: 'bg-gradient-to-r from-blue-500 to-indigo-500',
      roleLight: 'text-blue-600',
      roleDark: 'text-blue-300',
      borderHover: 'group-hover:border-blue-400 group-hover:shadow-blue-500/20'
    },
    emerald: {
      bar: 'bg-gradient-to-r from-emerald-500 to-teal-400',
      roleLight: 'text-emerald-600',
      roleDark: 'text-emerald-300',
      borderHover: 'group-hover:border-emerald-300 group-hover:shadow-emerald-500/15'
    },
    amber: {
      bar: 'bg-gradient-to-r from-amber-500 to-yellow-400',
      roleLight: 'text-amber-600',
      roleDark: 'text-amber-300',
      borderHover: 'group-hover:border-amber-300 group-hover:shadow-amber-500/15'
    },
    purple: {
      bar: 'bg-gradient-to-r from-purple-500 to-pink-500',
      roleLight: 'text-purple-600',
      roleDark: 'text-purple-300',
      borderHover: 'group-hover:border-purple-300 group-hover:shadow-purple-500/15'
    }
  }

  let selectedAccent = $derived(accentStyles[accentColor] || accentStyles.blue)
</script>

<div
  bind:this={cardEl}
  role="presentation"
  onmousemove={handleMouseMove}
  onmouseleave={handleMouseLeave}
  class="group relative rounded-3xl overflow-hidden cursor-default transition-transform duration-300 ease-out {customClass}"
  style="transform-style: preserve-3d;"
>
  <div class="relative rounded-3xl overflow-hidden transition-all duration-500 {
    theme === 'dark'
      ? 'bg-gradient-to-b from-white/[0.08] to-white/[0.02] backdrop-blur-2xl border border-white/[0.1] group-hover:border-white/[0.25] group-hover:shadow-2xl'
      : 'bg-gradient-to-b from-slate-50 to-white border border-slate-200/90 shadow-sm group-hover:shadow-xl'
  } {selectedAccent.borderHover}">

    <!-- Image Container with Aspect Ratio -->
    <div class="aspect-[4/5] relative overflow-hidden bg-slate-100/50">
      <div class="absolute inset-0 {
        theme === 'dark'
          ? 'bg-gradient-to-t from-gray-950 via-gray-900/30 to-transparent'
          : 'bg-gradient-to-t from-white via-white/20 to-transparent'
      } z-10 pointer-events-none"></div>

      <img
        src={storageUrl(imageUrl) || FALLBACK}
        alt={name}
        loading="lazy"
        onerror={(e) => { e.target.onerror = null; e.target.src = FALLBACK }}
        class="w-full h-full object-contain p-4 transition-transform duration-700 group-hover:scale-105"
      />

      <!-- Organization Logo Badge -->
      {#if logoUrl}
        <div class="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/95 backdrop-blur-md shadow-md border border-slate-200 p-1.5 flex items-center justify-center">
          <img
            src={logoUrl}
            alt="لوگو"
            class="w-full h-full object-contain"
            onerror={(e) => { e.target.style.display = 'none' }}
          />
        </div>
      {/if}

      <!-- Name & Role Overlay -->
      <div class="absolute bottom-0 inset-x-0 p-6 z-20 text-center">
        <h3 class="text-lg sm:text-xl font-bold {
          theme === 'dark' ? 'text-white drop-shadow-md' : 'text-slate-900'
        }">
          {name}
        </h3>
        {#if role}
          <p class="mt-1 text-xs sm:text-sm font-medium {
            theme === 'dark' ? selectedAccent.roleDark : selectedAccent.roleLight
          } drop-shadow-sm">
            {role}
          </p>
        {/if}
        {#if bio}
          <p class="mt-2 text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {bio}
          </p>
        {/if}
      </div>
    </div>

    <!-- Bottom Accent Line -->
    <div class="h-1 w-0 group-hover:w-full transition-all duration-500 {selectedAccent.bar}"></div>
  </div>
</div>
