<script>
  import { Link } from '@inertiajs/svelte'
  import { ArrowLeft, Calendar, Eye } from 'lucide-svelte'
  import { storageUrl, FALLBACK_IMG, stripRichText, toPersianDigits } from '../../lib/utils.js'
  import { formatDate } from '../../lib/format.js'

  let {
    href = '#',
    image = '',
    title = '',
    excerpt = '',
    category = '',
    badge = '',
    date = null,
    views = null,
    meta = [],
    variant = 'card', // 'card' (vertical) | 'row' (horizontal)
    aspectRatio = 'video', // 'video' (16/9) | 'square' (1/1)
    class: customClass = ''
  } = $props()
</script>

{#if variant === 'row'}
  <!-- Row (horizontal) variant -->
  <Link
    {href}
    class="group flex items-center gap-4 sm:gap-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-300 transition-all p-3 sm:p-4 {customClass}"
    dir="rtl"
  >
    <!-- Thumbnail -->
    <div class="relative w-24 h-24 sm:w-32 sm:h-32 shrink-0 rounded-xl overflow-hidden bg-slate-100">
      {#if image}
        <img
          src={storageUrl(image)}
          alt={title}
          onerror={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMG }}
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      {:else}
        <div class="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600"></div>
      {/if}
      {#if badge}
        <span class="absolute bottom-2 start-2 bg-slate-900/80 backdrop-blur-sm text-white text-[11px] px-2 py-0.5 rounded-full font-medium">
          {badge}
        </span>
      {/if}
    </div>

    <!-- Content -->
    <div class="flex-1 min-w-0">
      {#if category}
        <span class="inline-block text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full mb-1.5 border border-blue-100">
          {category}
        </span>
      {/if}
      <h3 class="font-bold text-slate-800 text-sm sm:text-base leading-snug line-clamp-1 group-hover:text-blue-600 transition-colors">
        {title}
      </h3>
      {#if excerpt}
        <p class="text-xs sm:text-sm text-slate-500 mt-1 line-clamp-2 leading-relaxed">
          {stripRichText(excerpt)}
        </p>
      {/if}
      {#if (meta && meta.length > 0) || date || views !== null}
        <div class="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-slate-400">
          {#if date}
            <span class="inline-flex items-center gap-1">
              <Calendar class="w-3.5 h-3.5" />
              {formatDate(date)}
            </span>
          {/if}
          {#if views !== null && views !== undefined}
            <span class="inline-flex items-center gap-1">
              <Eye class="w-3.5 h-3.5" />
              {toPersianDigits(views)} بازدید
            </span>
          {/if}
          {#each meta as m}
            <span>{m}</span>
          {/each}
        </div>
      {/if}
    </div>

    <ArrowLeft class="w-5 h-5 text-slate-300 group-hover:text-blue-500 shrink-0 transition-colors" />
  </Link>
{:else}
  <!-- Card (vertical grid) variant -->
  <article
    class="group bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col {customClass}"
    dir="rtl"
  >
    <Link {href} class="block relative overflow-hidden bg-slate-100 {aspectRatio === 'square' ? 'aspect-square' : 'aspect-video'}">
      {#if image}
        <img
          src={storageUrl(image)}
          alt={title}
          onerror={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMG }}
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      {:else}
        <div class="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white/50">
          <span class="text-xs">بدون تصویر</span>
        </div>
      {/if}

      {#if category}
        <div class="absolute top-3 end-3">
          <span class="px-2.5 py-1 bg-white/95 backdrop-blur-md rounded-full text-xs font-bold text-slate-700 shadow-sm border border-slate-100">
            {category}
          </span>
        </div>
      {/if}

      {#if badge}
        <div class="absolute bottom-3 start-3">
          <span class="px-2.5 py-1 bg-slate-900/80 backdrop-blur-md rounded-full text-xs font-semibold text-white shadow-sm">
            {badge}
          </span>
        </div>
      {/if}
    </Link>

    <div class="p-5 flex-1 flex flex-col justify-between">
      <div>
        {#if date || views !== null}
          <div class="flex items-center gap-3 mb-2.5 text-slate-400 text-xs">
            {#if date}
              <span class="inline-flex items-center gap-1">
                <Calendar class="w-3.5 h-3.5" />
                {formatDate(date)}
              </span>
            {/if}
            {#if views !== null && views !== undefined}
              <span class="inline-flex items-center gap-1">
                <Eye class="w-3.5 h-3.5" />
                {toPersianDigits(views)} بازدید
              </span>
            {/if}
          </div>
        {/if}

        <Link {href} class="block group">
          <h3 class="font-bold text-slate-800 mb-2 line-clamp-2 text-base group-hover:text-blue-600 transition-colors leading-snug">
            {title}
          </h3>
        </Link>

        {#if excerpt}
          <p class="text-xs sm:text-sm text-slate-500 line-clamp-2 leading-relaxed mb-4">
            {stripRichText(excerpt)}
          </p>
        {/if}
      </div>

      <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-600 group-hover:text-blue-700">
        <span>مشاهده مطلب</span>
        <ArrowLeft class="w-4 h-4 transition-transform group-hover:-translate-x-1" />
      </div>
    </div>
  </article>
{/if}
