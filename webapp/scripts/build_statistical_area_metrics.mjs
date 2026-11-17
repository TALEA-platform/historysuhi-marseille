import fs from "node:fs/promises";
import { fromFile } from "geotiff";
import proj4 from "proj4";

const sourceGeojson = "data/webapp_vectors/districts_enriched_2026.geojson";
const statOutputPath = "src/data/statisticalAreas.js";
const districtOutputPath = "src/data/districts.js";

const rasters = {
  uhei: "data/webapp_rasters/UHEI_2026_summer_30m.tif",
  lst: "data/webapp_rasters/LST_2026_summer_30m.tif",
  anomaly: "data/webapp_rasters/anomaly_2026_summer_30m.tif",
  hotspot: "data/webapp_rasters/hotspot_temporal_2026_summer_30m.tif",
  persistence: "data/webapp_rasters/hotspot_temporal_persistence_2013_2026.tif",
};

const wgs84 = "EPSG:4326";
// Marseille (~5.4°E) sits in UTM zone 31N.
const utm = "+proj=utm +zone=31 +datum=WGS84 +units=m +no_defs";

function round(value, digits = 2) {
  return Number.isFinite(value) ? Number(value.toFixed(digits)) : null;
}

function slug(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function ringContains(point, ring) {
  const [x, y] = point;
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    const intersects = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi || Number.EPSILON) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
}

function polygonContains(point, polygon) {
  if (!ringContains(point, polygon[0])) return false;
  for (let i = 1; i < polygon.length; i += 1) {
    if (ringContains(point, polygon[i])) return false;
  }
  return true;
}

function geometryContains(point, polygons) {
  return polygons.some((polygon) => polygonContains(point, polygon));
}

function projectGeometry(geometry) {
  const polygons = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
  return polygons.map((polygon) =>
    polygon.map((ring) => ring.map(([lon, lat]) => proj4(wgs84, utm, [lon, lat]))),
  );
}

function geometryBounds(polygons) {
  const bounds = [Infinity, Infinity, -Infinity, -Infinity];
  for (const polygon of polygons) {
    for (const ring of polygon) {
      for (const [x, y] of ring) {
        bounds[0] = Math.min(bounds[0], x);
        bounds[1] = Math.min(bounds[1], y);
        bounds[2] = Math.max(bounds[2], x);
        bounds[3] = Math.max(bounds[3], y);
      }
    }
  }
  return bounds;
}

async function loadRaster(path) {
  const tiff = await fromFile(path);
  const image = await tiff.getImage();
  const [data] = await image.readRasters();
  const [originX, originY] = image.getOrigin();
  const [resX, resY] = image.getResolution();
  return {
    data,
    width: image.getWidth(),
    height: image.getHeight(),
    originX,
    originY,
    resX,
    resY,
    nodata: Number(image.getGDALNoData()),
  };
}

function validValue(value, nodata) {
  return Number.isFinite(value) && value !== nodata && value > -9000;
}

function pixelWindow(bounds, raster) {
  const [minX, minY, maxX, maxY] = bounds;
  const absY = Math.abs(raster.resY);
  return {
    colMin: Math.max(0, Math.floor((minX - raster.originX) / raster.resX) - 1),
    colMax: Math.min(raster.width - 1, Math.ceil((maxX - raster.originX) / raster.resX) + 1),
    rowMin: Math.max(0, Math.floor((raster.originY - maxY) / absY) - 1),
    rowMax: Math.min(raster.height - 1, Math.ceil((raster.originY - minY) / absY) + 1),
  };
}

function emptyAcc() {
  return Object.fromEntries(Object.keys(rasters).map((key) => [key, { sum: 0, count: 0, hit: 0 }]));
}

function accumulate(feature, loaded, acc) {
  const polygons = projectGeometry(feature.geometry);
  const bounds = geometryBounds(polygons);
  const reference = loaded.uhei;
  const window = pixelWindow(bounds, reference);
  for (let row = window.rowMin; row <= window.rowMax; row += 1) {
    const y = reference.originY + (row + 0.5) * reference.resY;
    for (let col = window.colMin; col <= window.colMax; col += 1) {
      const x = reference.originX + (col + 0.5) * reference.resX;
      if (!geometryContains([x, y], polygons)) continue;
      const index = row * reference.width + col;
      for (const [key, raster] of Object.entries(loaded)) {
        const value = raster.data[index];
        if (!validValue(value, raster.nodata)) continue;
        acc[key].sum += value;
        acc[key].count += 1;
        if (key === "hotspot" && value > 0.5) acc[key].hit += 1;
      }
    }
  }
}

function summarise(acc) {
  return {
    uhei: acc.uhei.count ? round(acc.uhei.sum / acc.uhei.count, 2) : null,
    lst: acc.lst.count ? round(acc.lst.sum / acc.lst.count, 1) : null,
    anomaly: acc.anomaly.count ? round(acc.anomaly.sum / acc.anomaly.count, 2) : null,
    hotspotPercent: acc.hotspot.count ? round((acc.hotspot.hit / acc.hotspot.count) * 100, 1) : null,
    persistenceMean: acc.persistence.count ? round(acc.persistence.sum / acc.persistence.count, 1) : null,
  };
}

// Build the arrondissement id used by layers.js (e.g. "Marseille 1er Arrondissement"
// -> "marseille-1er-arrondissement"). Slug normalises diacritics + casing.
function districtId(arrondissementName) {
  return slug(arrondissementName);
}

const geojson = JSON.parse(await fs.readFile(sourceGeojson, "utf8"));
const loaded = Object.fromEntries(
  await Promise.all(Object.entries(rasters).map(async ([key, path]) => [key, await loadRaster(path)])),
);

const statisticalAreas = [];
const districtAcc = new Map();

for (const feature of geojson.features) {
  const properties = feature.properties || {};
  const quartierName = properties.area_statistica || properties.nom_qua || properties.NOM_QUA;
  const arrondissement = properties.quartiere || properties.nom_co || properties.NOM_CO;
  if (!quartierName) continue;

  const featureAcc = emptyAcc();
  accumulate(feature, loaded, featureAcc);
  const stats = summarise(featureAcc);

  statisticalAreas.push({
    id: `quart-${slug(quartierName)}`,
    code: properties.DEPCO || properties.depco || null,
    name: quartierName,
    quartiere: arrondissement || null,
    ...stats,
  });

  if (arrondissement) {
    let bucket = districtAcc.get(arrondissement);
    if (!bucket) {
      bucket = emptyAcc();
      districtAcc.set(arrondissement, bucket);
    }
    for (const key of Object.keys(rasters)) {
      bucket[key].sum += featureAcc[key].sum;
      bucket[key].count += featureAcc[key].count;
      bucket[key].hit += featureAcc[key].hit;
    }
  }
}

const districts = Array.from(districtAcc.entries())
  .map(([name, acc]) => ({
    id: districtId(name),
    name,
    ...summarise(acc),
  }))
  .sort((a, b) => {
    const na = Number((a.name.match(/(\d+)/) || [])[1] || 0);
    const nb = Number((b.name.match(/(\d+)/) || [])[1] || 0);
    return na - nb;
  });

statisticalAreas.sort((a, b) => (b.uhei ?? -Infinity) - (a.uhei ?? -Infinity));

await fs.writeFile(
  statOutputPath,
  `export const statisticalAreas = ${JSON.stringify(statisticalAreas, null, 2)};\n`,
  "utf8",
);
await fs.writeFile(
  districtOutputPath,
  `export const districts = ${JSON.stringify(districts, null, 2)};\n`,
  "utf8",
);

console.log(`Wrote ${statisticalAreas.length} quartiers to ${statOutputPath}`);
console.log(`Wrote ${districts.length} arrondissements to ${districtOutputPath}`);
