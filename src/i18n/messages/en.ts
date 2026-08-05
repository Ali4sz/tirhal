/**
 * English (en) UI chrome messages for Tirhal.
 *
 * These strings are interface chrome only. Curated, editorial tourism content
 * (governorate/attraction names, descriptions, sources) is intentionally kept
 * in the typed static repository, not here.
 *
 * `MessageSchema` is derived from this file and used to type-check the Arabic
 * bundle so the two locales never drift in shape.
 */

const en = {
  app: {
    name: 'Tirhal',
    tagline: 'Discover Syria',
  },
  localeSwitcher: {
    label: 'Language',
    // Locale option labels (each option shows its own language's name).
    en: 'English',
    ar: 'العربية',
  },
  map: {
    title: 'Map of Syria',
    instructions: 'Select a governorate to explore its attractions.',
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    resetView: 'Reset to Syria',
    loading: 'Loading map…',
    hover: 'Hovering: {name}',
    selected: 'Selected: {name}',
  },
  panel: {
    sheet: {
      explore: 'Explore',
    },
    mode: {
      overview: 'Syria overview',
      governorate: 'Governorate attractions',
      comingSoon: 'Governorate preview',
      attraction: 'Attraction story',
    },
    overview: {
      title: 'Welcome to Tirhal',
      intro:
        'Tirhal is a guide to the cultural and historical landmarks of Syria, mapped governorate by governorate.',
      howItWorks: 'How it works',
      step1: 'Select a governorate on the map.',
      step2: 'Browse the attractions published for it.',
      step3: 'Open one to see photos, and the best time to go.',
      hint: 'Four governorates are available today; more are on the way.',
      eyebrow: 'A living cultural atlas',
      prompt: 'Choose a place on the map to begin',
      coverage: '4 curated regions',
      regionList: 'Browse the atlas',
      available: 'Explore',
      soon: 'Soon',
    },
    governorate: {
      attractions: 'Attractions',
      back: 'Back to overview',
      area: 'Area',
      empty: 'No attractions published yet.',
    },
    comingSoon: {
      title: 'Coming soon',
      message: 'Curated attractions for {name} are being prepared. Check back later.',
      back: 'Back to overview',
      eyebrow: 'The atlas is growing',
    },
    attraction: {
      close: 'Close',
      locate: 'Locate on map',
      category: 'Category',
      source: 'Source',
      reviewedOn: 'Reviewed',
      visitors: 'Annual visitors',
      visitorsEstimate: 'estimated',
      visitorsProvisional: 'Provisional estimate — not yet verified.',
      bestTime: 'Best time to visit',
      story: 'Place story',
      sourceLink: 'Visit source',
    },
  },
  categories: {
    historical: 'Historical site',
    religious: 'Religious site',
    museum: 'Museum',
    nature: 'Nature',
    landmark: 'Landmark',
    market: 'Market',
    archaeology: 'Archaeological site',
  },
  a11y: {
    skipToMap: 'Skip to map',
    panelRegion: 'Information panel',
    mapRegion: 'Interactive map of Syria',
    drawerExpand: 'Expand information panel',
    drawerCollapse: 'Collapse information panel',
    monthsLabel: 'Recommended months',
    decorativePlaceholder: 'Decorative place illustration',
  },
}

export default en
export type MessageSchema = typeof en
