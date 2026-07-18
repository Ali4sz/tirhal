#!/usr/bin/env node
/**
 * Processes .ref/syr_adm1_osm.geojson into src/assets/geo/syria-admin1.json.
 *
 * What it does:
 *   - Keeps only the 14 Syrian governorate Polygon/MultiPolygon features
 *   - Remaps OSM ISO3166-2 codes + tags to the OCHA-compatible schema the app expects
 *   - Computes centroid (bbox midpoint of largest part) and area (shoelace) for each feature
 *   - Rounds coordinates to 5 decimal places (~1 m precision) and deduplicates
 *     consecutive identical vertices produced by the rounding
 *
 * Usage:  node scripts/clean-osm-geojson.js
 *
 * Attribution note: output data is © OpenStreetMap contributors (ODbL).
 * Add "© OpenStreetMap contributors" somewhere visible in the app UI.
 */

import fs   from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ROOT = path.resolve(__dirname, '..');
const SRC  = path.join(ROOT, '.ref',  'syr_adm1_osm.geojson');
const OUT  = path.join(ROOT, 'src', 'assets', 'geo', 'syria-admin1.json');

// ISO3166-2 → OCHA pcode + canonical names (English spellings kept from existing file)
const CROSSWALK = {
  'SY-DI': { pcode: 'SY01', en: 'Damascus',       ar: 'دمشق'          },
  'SY-HL': { pcode: 'SY02', en: 'Aleppo',          ar: 'حلب'           },
  'SY-RD': { pcode: 'SY03', en: 'Rural Damascus',  ar: 'ريف دمشق'      },
  'SY-HI': { pcode: 'SY04', en: 'Homs',            ar: 'حمص'           },
  'SY-HM': { pcode: 'SY05', en: 'Hama',            ar: 'حماة'          },
  'SY-LA': { pcode: 'SY06', en: 'Lattakia',        ar: 'اللاذقية'      },
  'SY-ID': { pcode: 'SY07', en: 'Idleb',           ar: 'إدلب'          },
  'SY-HA': { pcode: 'SY08', en: 'Al-Hasakeh',      ar: 'الحسكة'        },
  'SY-DY': { pcode: 'SY09', en: 'Deir-ez-Zor',     ar: 'دير الزور'     },
  'SY-TA': { pcode: 'SY10', en: 'Tartous',         ar: 'طرطوس'         },
  'SY-RA': { pcode: 'SY11', en: 'Ar-Raqqa',        ar: 'الرقة'         },
  'SY-DR': { pcode: 'SY12', en: "Dar'a",           ar: 'درعا'          },
  'SY-SU': { pcode: 'SY13', en: 'As-Sweida',       ar: 'السويداء'      },
  'SY-QU': { pcode: 'SY14', en: 'Quneitra',        ar: 'القنيطرة'      },
};

const PRECISION = 5; // decimal places ≈ 1.1 m at the equator
const FACTOR    = 10 ** PRECISION;

function roundCoord(n) {
  return Math.round(n * FACTOR) / FACTOR;
}

function roundRing(ring) {
  const out = [];
  for (const [x, y] of ring) {
    const rx = roundCoord(x);
    const ry = roundCoord(y);
    const prev = out[out.length - 1];
    if (prev && prev[0] === rx && prev[1] === ry) continue; // skip duplicate
    out.push([rx, ry]);
  }
  // Re-close if the ring was closed (GeoJSON requires first === last)
  if (out.length > 1) {
    const first = out[0], last = out[out.length - 1];
    if (first[0] !== last[0] || first[1] !== last[1]) out.push([first[0], first[1]]);
  }
  return out;
}

function roundGeometry(geom) {
  if (geom.type === 'Polygon') {
    return { type: 'Polygon', coordinates: geom.coordinates.map(roundRing) };
  }
  if (geom.type === 'MultiPolygon') {
    return { type: 'MultiPolygon', coordinates: geom.coordinates.map(p => p.map(roundRing)) };
  }
  return geom;
}

// Shoelace formula: area in degrees²  →  km²  (approximate, good enough for metadata)
function ringAreaDeg2(ring) {
  let s = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    s += (ring[j][0] + ring[i][0]) * (ring[j][1] - ring[i][1]);
  }
  return Math.abs(s / 2);
}

function geometryAreaKm2(geom) {
  const KM_PER_DEG_LAT = 111.32;
  const KM_PER_DEG_LON = KM_PER_DEG_LAT * Math.cos(35.0 * Math.PI / 180); // Syria ~35°N
  let deg2 = 0;
  if (geom.type === 'Polygon') {
    deg2 = ringAreaDeg2(geom.coordinates[0]);
    for (let i = 1; i < geom.coordinates.length; i++) deg2 -= ringAreaDeg2(geom.coordinates[i]);
  } else if (geom.type === 'MultiPolygon') {
    for (const poly of geom.coordinates) {
      deg2 += ringAreaDeg2(poly[0]);
      for (let i = 1; i < poly.length; i++) deg2 -= ringAreaDeg2(poly[i]);
    }
  }
  return Math.round(deg2 * KM_PER_DEG_LAT * KM_PER_DEG_LON * 100) / 100;
}

// Bounding-box centroid of the largest polygon part (by vertex count)
function computeCentroid(geom) {
  const outerRings = geom.type === 'Polygon'
    ? [geom.coordinates[0]]
    : geom.coordinates.map(p => p[0]);
  const ring = outerRings.reduce((a, b) => (a.length >= b.length ? a : b));
  const lons = ring.map(c => c[0]);
  const lats = ring.map(c => c[1]);
  const lon = Math.round(((Math.min(...lons) + Math.max(...lons)) / 2) * 10000) / 10000;
  const lat = Math.round(((Math.min(...lats) + Math.max(...lats)) / 2) * 10000) / 10000;
  return { lon, lat };
}

// ── Main ─────────────────────────────────────────────────────────────────────

const src = JSON.parse(fs.readFileSync(SRC, 'utf8'));

const features = src.features
  .filter(f => {
    const iso = f.properties?.['ISO3166-2'] ?? '';
    const gt  = f.geometry?.type ?? '';
    return iso.startsWith('SY') && (gt === 'Polygon' || gt === 'MultiPolygon');
  })
  .map(f => {
    const iso = f.properties['ISO3166-2'];
    const cw  = CROSSWALK[iso];
    if (!cw) { console.warn('⚠  No crosswalk entry for', iso, '— skipped'); return null; }

    const geom  = roundGeometry(f.geometry);
    const { lon, lat } = computeCentroid(geom);
    const area  = geometryAreaKm2(geom);

    return {
      type: 'Feature',
      id:   cw.pcode,
      properties: {
        adm1_name:     cw.en,
        adm1_name1:    cw.ar,
        adm1_name2:    null,
        adm1_name3:    null,
        adm1_pcode:    cw.pcode,
        adm0_name:     'Syrian Arab Republic',
        adm0_name1:    'الجمهورية العربية السورية',
        adm0_name2:    null,
        adm0_name3:    null,
        adm0_pcode:    'SY',
        valid_on:      '2025-01-01',
        valid_to:      null,
        area_sqkm:     area,
        version:       'osm-2025',
        lang:          'en',
        lang1:         'ar',
        lang2:         null,
        lang3:         null,
        adm1_ref_name: cw.en,
        center_lat:    lat,
        center_lon:    lon,
      },
      geometry: geom,
    };
  })
  .filter(Boolean);

if (features.length !== 14) {
  console.error(`✗ Expected 14 features, got ${features.length}. Aborting — output not written.`);
  process.exit(1);
}

fs.writeFileSync(OUT, JSON.stringify({ type: 'FeatureCollection', features }), 'utf8');

const inKB  = Math.round(fs.statSync(SRC).size / 1024);
const outKB = Math.round(fs.statSync(OUT).size / 1024);
console.log(`Input:  ${inKB} KB  (${src.features.length} features)`);
console.log(`Output: ${outKB} KB  (${features.length} features)  →  ${OUT}`);
console.log('');
features.sort((a, b) => a.id.localeCompare(b.id)).forEach(f => {
  const g = f.geometry;
  let v = 0;
  if (g.type === 'Polygon')      g.coordinates.forEach(r => (v += r.length));
  if (g.type === 'MultiPolygon') g.coordinates.forEach(p => p.forEach(r => (v += r.length)));
  console.log(`  ${f.id}  ${f.properties.adm1_name.padEnd(18)}  ${String(v).padStart(7)} verts`);
});
console.log('\n✓ Done. Remember to add "© OpenStreetMap contributors" to the app UI (ODbL).');
