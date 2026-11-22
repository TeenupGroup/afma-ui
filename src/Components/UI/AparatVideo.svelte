<script>
  import { ExternalLink, Play } from 'lucide-svelte'

  let {
    videoId = '',
    coverUrl = '',
    title = 'ویدئوی پیوست',
    buttonLabel = 'پخش ویدئو از آپارات',
    description = 'با انتخاب پخش، ویدئو از سرور آپارات بارگذاری می‌شود.',
    class: classProp = '',
    className = '',
    ...rest
  } = $props()

  let activeVideoId = $state(null)

  const playing = $derived(Boolean(videoId) && activeVideoId === videoId)
  const encodedVideoId = $derived(videoId ? encodeURIComponent(videoId) : '')
  const extraClass = $derived([classProp, className].filter(Boolean).join(' '))
</script>

{#if videoId}
  <section
    dir="rtl"
    class="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 space-y-3 [.dark_&]:border-slate-800 [.dark_&]:bg-slate-900 {extraClass}"
    {...rest}
  >
    {#if title}
      <h2 class="text-base font-extrabold text-slate-900 [.dark_&]:text-slate-100">{title}</h2>
    {/if}

    {#if playing}
      <div class="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-950">
        <iframe
          {title}
          src={`https://www.aparat.com/video/video/embed/videohash/${encodedVideoId}/vt/frame`}
          class="h-full w-full border-0"
          allowfullscreen
        ></iframe>
      </div>
    {:else}
      <div class="relative flex aspect-video w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-xl border border-slate-200/80 bg-slate-100 p-6 text-center [.dark_&]:border-slate-700 [.dark_&]:bg-slate-800/80">
        {#if coverUrl}
          <img
            src={coverUrl}
            alt=""
            aria-hidden="true"
            width="800"
            height="450"
            loading="lazy"
            class="absolute inset-0 h-full w-full object-cover opacity-25"
          />
        {/if}
        <button
          type="button"
          onclick={() => (activeVideoId = videoId)}
          class="relative z-10 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-blue-700 transition-colors cursor-pointer"
        >
          <Play class="h-4 w-4 fill-current" aria-hidden="true" />
          <span>{buttonLabel}</span>
        </button>
        {#if description}
          <p class="relative z-10 text-xs text-slate-600 [.dark_&]:text-slate-300">{description}</p>
        {/if}
      </div>
    {/if}

    <p class="text-xs text-slate-500 [.dark_&]:text-slate-400">
      در صورت عدم بارگذاری پخش‌کننده،
      <a
        href={`https://www.aparat.com/v/${encodedVideoId}`}
        target="_blank"
        rel="noreferrer"
        class="inline-flex items-center gap-1 font-bold text-blue-600 hover:underline [.dark_&]:text-blue-400"
      >
        <span>ویدئو را مستقیماً در آپارات مشاهده کنید</span>
        <ExternalLink class="h-3 w-3" aria-hidden="true" />
      </a>
    </p>
  </section>
{/if}
