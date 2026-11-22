/**
 * Brand Constants for frontend components.
 * Matches App\Constants\SchoolName in PHP.
 */
export const BRANDS = {
  'farhang-mahan': {
    full_name: 'موسسه فرهنگ ماهان',
    short_name: 'فرهنگ ماهان',
    school_name: 'هنرستان کشاورزی فرهنگ ماهان',
    header_name: 'فرهنگ ماهان',
    footer_name: 'هنرستان فرهنگ ماهان',
    slogan: 'هنرستان ؛ چون دانشگاه زمانبره',
    description: 'آموزش حرفه‌ای کشاورزی با رویکرد عملی و تخصصی',
    domain: 'farmahan.ir',
    phone: '۰۲۱-۲۲۸۶۳۸۲۷',
    default_address: 'استان هرمزگان، شهرستان بشاگرد، بخش مرکزی، دهستان جکدان، روستای شهرک مطهر، جنب زمین ورزشی (هنرستان فرهنگ ماهان بشاگرد)',
  },
  'farhang-aliaj': {
    full_name: 'هنرستان فرهنگ فولاژ',
    short_name: 'فرهنگ فولاژ',
    school_name: 'هنرستان فرهنگ فولاژ',
    header_name: 'فرهنگ فولاژ',
    footer_name: 'هنرستان فرهنگ فولاژ',
    description: 'نخستین هنرستان صنعت محور غیر انتفاعی خیری',
    domain: 'foolazhths.ir',
    phone: '',
    default_address: 'یزد، شهرستان اشکذر، بلوار دانشگاه، خیابان نگین، خیابان خیرین (هنرستان فرهنگ فولاژ)',
  },
}

export const BRAND_SCHOOLS = {
  'farhang-mahan': [
    {
      id: 'bashagard',
      slug: 'bashagard',
      name: 'هنرستان کشاورزی فرهنگ ماهان بشاگرد',
      short_name: 'بشاگرد',
      address: 'استان هرمزگان، شهرستان بشاگرد، بخش مرکزی، دهستان جکدان، روستای شهرک مطهر، جنب زمین ورزشی',
      phone: '۰۲۱-۲۲۸۶۳۸۲۷',
      domain: 'farmahan.ir',
      postal_code: '',
      is_school: true,
    },
    {
      id: 'bahokalat',
      slug: 'bahokalat',
      name: 'هنرستان کشاورزی فرهنگ ماهان باهوکلات',
      short_name: 'باهوکلات',
      address: 'استان سیستان و بلوچستان، چابهار، شهرستان دشتیاری، بخش باهوکلات، روستای باهوکلات',
      phone: '۰۹۳۹۹۰۵۹۲۹۲',
      domain: 'farmahan.ir',
      postal_code: '۹۹۷۷۱۱۶۳۴۸',
      is_school: true,
    },
    {
      id: 'goharkooh',
      slug: 'goharkooh',
      name: 'هنرستان کشاورزی فرهنگ ماهان گوهرکوه',
      short_name: 'گوهرکوه',
      address: 'استان سیستان و بلوچستان، شهرستان تفتان، بخش گوهرکوه',
      phone: '۰۲۱-۲۲۸۶۳۸۲۷',
      domain: 'farmahan.ir',
      postal_code: '',
      is_school: true,
    },
    {
      id: 'poldasht',
      slug: 'poldasht',
      name: 'هنرستان فرهنگ ماهان پلدشت',
      short_name: 'پلدشت',
      address: 'استان آذربایجان غربی، شهرستان پلدشت',
      phone: '۰۹۱۴۸۶۴۸۹۵۸',
      domain: 'farmahan.ir',
      postal_code: '',
      is_school: true,
    },
    {
      id: 'qasreshirin',
      slug: 'qasr-shirin',
      name: 'هنرستان فرهنگ ماهان قصرشیرین',
      short_name: 'قصر شیرین',
      address: 'استان کرمانشاه، شهرستان قصرشیرین',
      phone: '۰۹۱۸۳۳۰۷۶۱۸',
      domain: 'farmahan.ir',
      postal_code: '',
      is_school: true,
    },
    {
      id: 'mirjaveh',
      slug: 'mirjaveh',
      name: 'هنرستان فرهنگ ماهان میرجاوه',
      short_name: 'میرجاوه',
      address: 'استان سیستان و بلوچستان، شهرستان میرجاوه',
      phone: '۰۲۱-۲۲۸۶۳۸۲۷',
      domain: 'farmahan.ir',
      postal_code: '',
      is_school: true,
    },
    {
      id: 'central',
      slug: 'central',
      name: 'دفتر مرکزی موسسه فرهنگ ماهان',
      short_name: 'دفتر مرکزی',
      address: 'تهران، دفتر مرکزی موسسه فرهنگ ماهان',
      phone: '۰۲۱-۲۲۸۶۳۸۲۷',
      domain: 'farmahan.ir',
      postal_code: '',
      is_school: false,
    },
  ],
  'farhang-aliaj': [
    {
      id: 'foolazh',
      slug: 'ashkezar',
      name: 'هنرستان فرهنگ فولاژ',
      short_name: 'اشکذر',
      address: 'یزد، شهرستان اشکذر، بلوار دانشگاه، خیابان نگین، خیابان خیرین (هنرستان فرهنگ فولاژ)',
      phone: '۰۳۵-۳۲۷۲۹۰۰۰',
      domain: 'foolazhths.ir',
      postal_code: '',
      is_school: true,
    },
  ],
  'khalij-fars': [],
}

let _adminSchoolScope = null

export function hydrateBrandsFromSettings(siteSettings) {
  if (!siteSettings) return
  if (siteSettings.brandsConfigMap && typeof siteSettings.brandsConfigMap === 'object') {
    for (const [brandKey, cfg] of Object.entries(siteSettings.brandsConfigMap)) {
      if (cfg && typeof cfg === 'object') {
        BRANDS[brandKey] = { ...(BRANDS[brandKey] || {}), ...cfg }
      }
    }
  }
  if (siteSettings.brandSchoolsMap && typeof siteSettings.brandSchoolsMap === 'object') {
    for (const [brandKey, list] of Object.entries(siteSettings.brandSchoolsMap)) {
      if (Array.isArray(list)) {
        BRAND_SCHOOLS[brandKey] = list
      }
    }
  }
}

export function setAdminSchoolScope(auth, siteSettings = null) {
  if (siteSettings) {
    hydrateBrandsFromSettings(siteSettings)
  }
  if (!auth || auth.guard !== 'admin') {
    _adminSchoolScope = null
    return
  }
  _adminSchoolScope = {
    isSuperAdmin: !!auth.isSuperAdmin,
    school: auth.user?.school || null,
  }
}

export function getSchoolsForBrand(brandKey) {
  const all = BRAND_SCHOOLS[brandKey] || []
  if (
    _adminSchoolScope &&
    !_adminSchoolScope.isSuperAdmin &&
    _adminSchoolScope.school &&
    _adminSchoolScope.school !== 'all'
  ) {
    const raw = String(_adminSchoolScope.school).trim()
    const matched = all.filter(
      (s) =>
        s.id === raw ||
        s.slug === raw ||
        s.short_name === raw ||
        s.name === raw ||
        `هنرستان ${s.short_name}` === raw ||
        raw.includes(s.short_name) ||
        (s.id === 'foolazh' && raw.includes('فولاژ'))
    )
    return matched
  }
  return all
}

export function getTeachingSchoolsForBrand(brandKey) {
  return getSchoolsForBrand(brandKey).filter((s) => s.is_school !== false)
}

export function hasMultipleSchools(brandKey) {
  return getTeachingSchoolsForBrand(brandKey).length > 1
}

export function getDefaultSchoolSlug(brandKey) {
  const schools = getTeachingSchoolsForBrand(brandKey)
  return schools.length === 1 ? schools[0].slug : ''
}

export function getDefaultSchoolName(brandKey) {
  const schools = getTeachingSchoolsForBrand(brandKey)
  return schools.length === 1 ? schools[0].name : ''
}

export function getSchoolSlugOptions(brandKey) {
  return getTeachingSchoolsForBrand(brandKey).map((s) => ({
    value: s.slug,
    label: s.short_name || s.name,
  }))
}

export function getSchoolNameOptions(brandKey) {
  return getTeachingSchoolsForBrand(brandKey).map((s) => ({
    value: s.short_name || s.name,
    label: s.short_name || s.name,
  }))
}

export function getBrandConfig(brandKey) {
  return BRANDS[brandKey] || BRANDS['farhang-mahan']
}

export function getBrandName(brandKey) {
  return BRANDS[brandKey]?.short_name || 'فرهنگ ماهان'
}
