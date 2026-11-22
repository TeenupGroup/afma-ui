<script>
  import { cn } from '../../lib/utils.js'
  import { Badge, Button, Input } from '../../Components/UI/index.js'
  import { Plus, X, ChevronDown } from 'lucide-svelte'

  let { value = $bindable(''), class: className = '' } = $props()

  const availableRules = [
    { key: 'required', label: 'اجباری', desc: 'فیلد نباید خالی باشد', needsParam: false },
    { key: 'nullable', label: 'اختیاری', desc: 'مقدار خالی قبول است', needsParam: false },
    { key: 'email', label: 'ایمیل', desc: 'فرمت ایمیل معتبر', needsParam: false },
    { key: 'url', label: 'لینک', desc: 'فرمت URL معتبر', needsParam: false },
    { key: 'numeric', label: 'عددی', desc: 'فقط عدد', needsParam: false },
    { key: 'integer', label: 'عدد صحیح', desc: 'عدد صحیح', needsParam: false },
    { key: 'boolean', label: 'بولین', desc: 'true/false', needsParam: false },
    { key: 'alpha', label: 'فقط حروف', desc: 'حروف الفبا', needsParam: false },
    { key: 'alpha_num', label: 'حروف و اعداد', desc: 'حروف و اعداد', needsParam: false },
    { key: 'min', label: 'حداقل', desc: 'حداقل مقدار/طول', needsParam: true, paramType: 'number', placeholder: 'مثال: ۳' },
    { key: 'max', label: 'حداکثر', desc: 'حداکثر مقدار/طول', needsParam: true, paramType: 'number', placeholder: 'مثال: ۲۵۵' },
    { key: 'digits', label: 'تعداد رقم', desc: 'دقیقاً چند رقم', needsParam: true, paramType: 'number', placeholder: 'مثال: ۱۰' },
    { key: 'between', label: 'بین', desc: 'بین دو مقدار', needsParam: true, paramType: 'range', placeholder: 'مثال: ۱,۱۰۰' },
    { key: 'confirmed', label: 'تکرار رمز', desc: 'تأیید مقدار', needsParam: false },
    { key: 'regex', label: 'الگو', desc: 'عبارت باقاعده', needsParam: true, paramType: 'text', placeholder: 'مثال: /^[a-z]+$/' },
  ]

  let activeRules = $state([])
  let showDropdown = $state(false)
  let editingParam = $state(null)
  let paramValue = $state('')

  function parseRules(str) {
    if (!str) return []
    return str.split('|').filter(Boolean).map(rule => {
      const [key, ...rest] = rule.split(':')
      return { key: key.trim(), param: rest.length ? rest.join(':').trim() : '' }
    })
  }

  function serializeRules(rules) {
    return rules.map(r => r.param ? `${r.key}:${r.param}` : r.key).join('|')
  }

  $effect(() => {
    const parsed = parseRules(value)
    const serialized = serializeRules(parsed)
    if (serialized !== value || activeRules.length === 0) {
      activeRules = parsed
    }
  })

  function syncToValue() {
    value = serializeRules(activeRules)
  }

  function addRule(rule) {
    if (activeRules.some(r => r.key === rule.key)) {
      showDropdown = false
      return
    }
    if (rule.needsParam) {
      editingParam = rule.key
      paramValue = ''
    } else {
      activeRules = [...activeRules, { key: rule.key, param: '' }]
      syncToValue()
    }
    showDropdown = false
  }

  function confirmParam() {
    if (editingParam && paramValue.trim()) {
      activeRules = [...activeRules, { key: editingParam, param: paramValue.trim() }]
      syncToValue()
    }
    editingParam = null
    paramValue = ''
  }

  function cancelParam() {
    editingParam = null
    paramValue = ''
  }

  function removeRule(key) {
    activeRules = activeRules.filter(r => r.key !== key)
    syncToValue()
  }

  function getRuleLabel(key) {
    return availableRules.find(r => r.key === key)?.label || key
  }

  function getRuleByKey(key) {
    return availableRules.find(r => r.key === key)
  }

  function handleParamKeydown(e) {
    if (e.key === 'Enter') { e.preventDefault(); confirmParam() }
    if (e.key === 'Escape') cancelParam()
  }

  let unusedRules = $derived(availableRules.filter(r => !activeRules.some(a => a.key === r.key)))
</script>

<div class={cn("space-y-3", className)}>
  <!-- Active rules as chips -->
  {#if activeRules.length > 0}
    <div class="flex flex-wrap gap-2">
      {#each activeRules as rule (rule.key)}
        <Badge color="indigo" size="md" class="gap-1.5">
          {getRuleLabel(rule.key)}
          {#if rule.param}
            <span class="text-indigo-500 font-sans text-xs bg-indigo-100 px-1.5 py-0.5 rounded">{rule.param}</span>
          {/if}
          <button type="button" onclick={() => removeRule(rule.key)} class="p-0.5 hover:bg-indigo-200 rounded transition-colors cursor-pointer" aria-label="حذف قانون {getRuleLabel(rule.key)}">
            <X class="w-3.5 h-3.5" />
          </button>
        </Badge>
      {/each}
    </div>
  {/if}

  <!-- Inline param editor -->
  {#if editingParam}
    {@const rule = getRuleByKey(editingParam)}
    <div class="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
      <span class="text-sm text-amber-800 font-medium whitespace-nowrap">
        مقدار «{rule?.label || editingParam}»:
      </span>
      <Input
        class="flex-1"
        size="sm"
        type={rule?.paramType === 'number' ? 'number' : 'text'}
        bind:value={paramValue}
        onkeydown={handleParamKeydown}
        placeholder={rule?.placeholder || ''}
        min={rule?.paramType === 'number' ? '0' : undefined}
        inputClass="bg-white border-amber-300 focus:border-amber-500 focus:ring-amber-500/20"
        dir="ltr"
        autofocus
      />
      <Button type="button" variant="amber" size="sm" onclick={confirmParam}>تأیید</Button>
      <Button type="button" variant="ghost" size="sm" class="text-amber-700 hover:bg-amber-100" onclick={cancelParam}>لغو</Button>
    </div>
  {/if}

  <!-- Add rule dropdown -->
  <div class="relative">
    <Button
      type="button"
      variant="outline"
      size="sm"
      class="border-dashed text-slate-600 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/50"
      onclick={() => showDropdown = !showDropdown}
      aria-expanded={showDropdown}
    >
      <Plus class="w-4 h-4" />
      افزودن قانون
      <ChevronDown class={cn("w-4 h-4 transition-transform", showDropdown && "rotate-180")} />
    </Button>

    {#if showDropdown}
      <div class="absolute z-10 mt-2 w-full max-w-lg bg-white border border-slate-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
        {#if unusedRules.length === 0}
          <p class="px-4 py-3 text-sm text-slate-500">همه قوانین اضافه شده‌اند</p>
        {:else}
          {#each unusedRules as rule}
            <button type="button" onclick={() => addRule(rule)}
              class="w-full flex items-start gap-3 px-4 py-2.5 text-right hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 cursor-pointer">
              <div class="flex-1">
                <span class="text-sm font-medium text-slate-800">{rule.label}</span>
                {#if rule.needsParam}
                  <span class="mr-1 text-xs text-slate-400">(نیاز به مقدار)</span>
                {/if}
                <p class="text-xs text-slate-500 mt-0.5">{rule.desc}</p>
              </div>
              <code class="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded font-mono shrink-0 mt-0.5" dir="ltr">{rule.key}</code>
            </button>
          {/each}
        {/if}
      </div>
    {/if}
  </div>

  <!-- Hidden input to store raw value -->
  <input type="hidden" {value} />
</div>
