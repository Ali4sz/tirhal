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
  panel: {
    overview: {
      title: 'استكشف سوريا',
      intro: 'اختر محافظة من الخريطة لاكتشاف معالمها الثقافية والتاريخية.',
      hint: 'تلميح: اختر منطقة على الخريطة أو من القائمة.',
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
    },
    attraction: {
      close: 'إغلاق',
      locate: 'حدد الموقع على الخريطة',
      category: 'الفئة',
      source: 'المصدر',
      reviewedOn: 'تاريخ المراجعة',
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
  },
}

export default ar
