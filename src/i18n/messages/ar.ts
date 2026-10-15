/**
 * Arabic (ar) UI chrome messages for Tirhal.
 *
 * Typed against `MessageSchema` (derived from the English bundle) so the two
 * locales are guaranteed to share the same key shape. Editorial tourism content
 * remains in the typed static repository, not here.
 */

import type { MessageSchema } from './en'

const ar: MessageSchema = {
  app: {
    name: 'تِرحال',
    tagline: 'اكتشف سوريا',
  },
  localeSwitcher: {
    label: 'اللغة',
    en: 'English',
    ar: 'العربية',
  },
  map: {
    title: 'خريطة سوريا',
    instructions: 'اختر محافظة لاستكشاف معالمها السياحية.',
    zoomIn: 'تكبير',
    zoomOut: 'تصغير',
    resetView: 'العودة إلى سوريا',
    loading: 'جارٍ تحميل الخريطة…',
    hover: 'تمرير فوق: {name}',
    selected: 'محدد: {name}',
  },
  search: {
    label: 'البحث عن معالم',
    placeholder: 'ابحث عن معلم…',
    clear: 'مسح البحث',
    noResults: 'لا توجد معالم مطابقة.',
    resultsLabel: 'النتائج: {count}',
  },
  panel: {
    sheet: {
      explore: 'استكشف',
    },
    mode: {
      overview: 'لمحة عن سوريا',
      governorate: 'معالم المحافظة',
      comingSoon: 'لمحة عن المحافظة',
      attraction: 'حكاية المعلم',
    },
    overview: {
      title: 'أهلاً بك في تِرحال',
      intro: 'تِرحال دليل إلى المعالم الثقافية والتاريخية في سوريا، مرسومة محافظةً محافظةً.',
      howItWorks: 'كيف يعمل',
      step1: 'اختر محافظة على الخريطة.',
      step2: 'استعرض المعالم المنشورة فيها.',
      step3: 'افتح أحدها لترى الصور وأفضل وقت للزيارة.',
      hint: 'أربع محافظات متاحة اليوم، والمزيد في الطريق.',
      eyebrow: 'أطلس ثقافي حيّ',
      prompt: 'اختر مكاناً على الخريطة لتبدأ',
      coverage: '٤ مناطق منتقى',
      regionList: 'تصفّح الأطلس',
      available: 'استكشف',
      soon: 'قريباً',
    },
    governorate: {
      attractions: 'المعالم السياحية',
      back: 'العودة إلى لمحة عامة',
      area: 'المساحة',
      empty: 'لا توجد معالم منشورة بعد.',
    },
    comingSoon: {
      title: 'قريبًا',
      message: 'يجري تجهيز معالم منسّقة لـ {name}. عُد لاحقًا.',
      back: 'العودة إلى لمحة عامة',
      eyebrow: 'الأطلس يكبر',
    },
    attraction: {
      close: 'إغلاق',
      locate: 'حدد الموقع على الخريطة',
      category: 'الفئة',
      source: 'المصدر',
      reviewedOn: 'تاريخ المراجعة',
      visitors: 'الزوار سنوياً',
      visitorsEstimate: 'تقديري',
      visitorsProvisional: 'تقدير مؤقت — لم يُتحقق منه بعد.',
      bestTime: 'أفضل وقت للزيارة',
      story: 'حكاية المكان',
      sourceLink: 'زيارة المصدر',
    },
  },
  categories: {
    historical: 'موقع تاريخي',
    religious: 'موقع ديني',
    museum: 'متحف',
    nature: 'طبيعة',
    landmark: 'معلم بارز',
    market: 'سوق',
    archaeology: 'موقع أثري',
  },
  a11y: {
    skipToMap: 'تخطَّ إلى الخريطة',
    panelRegion: 'لوحة المعلومات',
    mapRegion: 'خريطة تفاعلية لسوريا',
    drawerExpand: 'توسيع لوحة المعلومات',
    drawerCollapse: 'طيّ لوحة المعلومات',
    monthsLabel: 'الأشهر المقترحة',
    decorativePlaceholder: 'رسم زخرفي للمكان',
  },
}

export default ar
