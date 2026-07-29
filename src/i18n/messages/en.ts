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
    overview: {
      title: 'Explore Syria',
      intro:
        'Choose a governorate from the map to discover its cultural and historical attractions.',
      hint: 'Tip: pick a region on the map or from the list.',
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
    },
    attraction: {
      close: 'Close',
      locate: 'Locate on map',
      category: 'Category',
      source: 'Source',
      reviewedOn: 'Reviewed',
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
  },
}

export default en
export type MessageSchema = typeof en
