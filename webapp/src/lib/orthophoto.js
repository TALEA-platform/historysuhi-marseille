import { MARSEILLE_CITY_BOUNDS } from "./mapBounds.js";

const ORTHOPHOTO_SOURCES = Object.freeze({
  2025: {
    layer: "HR.ORTHOIMAGERY.ORTHOPHOTOS",
    matrixSet: "PM_6_19",
    format: "image/jpeg",
    label: "current HR orthophoto layer",
  },
});

export const AVAILABLE_ORTHOPHOTO_YEARS = Object.freeze(Object.keys(ORTHOPHOTO_SOURCES).map(Number));
export const EARLIEST_ORTHOPHOTO_YEAR = AVAILABLE_ORTHOPHOTO_YEARS[0];
export const LATEST_ORTHOPHOTO_YEAR = AVAILABLE_ORTHOPHOTO_YEARS[AVAILABLE_ORTHOPHOTO_YEARS.length - 1];
export const ORTHOPHOTO_AVAILABLE_YEARS_LABEL = "current HR orthophoto layer";

const ORTHOPHOTO_BOUNDS = Object.freeze([
  MARSEILLE_CITY_BOUNDS[0][0],
  MARSEILLE_CITY_BOUNDS[0][1],
  MARSEILLE_CITY_BOUNDS[1][0],
  MARSEILLE_CITY_BOUNDS[1][1],
]);

function getMatrixZoomRange(matrixSet) {
  const match = /^PM_(\d+)_(\d+)$/.exec(matrixSet);
  if (!match) return { minzoom: 0, maxzoom: 20 };
  return {
    minzoom: Number(match[1]),
    maxzoom: Number(match[2]),
  };
}

function normalizeOrthophotoYear(year) {
  const numericYear = Number(year);
  return Number.isFinite(numericYear) ? Math.round(numericYear) : LATEST_ORTHOPHOTO_YEAR;
}

export function resolveOrthophotoYear(requestedYear = LATEST_ORTHOPHOTO_YEAR) {
  const year = normalizeOrthophotoYear(requestedYear);
  if (year <= EARLIEST_ORTHOPHOTO_YEAR) return EARLIEST_ORTHOPHOTO_YEAR;

  const exactYear = AVAILABLE_ORTHOPHOTO_YEARS.find((item) => item === year);
  if (exactYear) return exactYear;

  const nextAvailableYear = AVAILABLE_ORTHOPHOTO_YEARS.find((item) => item > year);
  return nextAvailableYear || LATEST_ORTHOPHOTO_YEAR;
}

export function getOrthophotoConfig(requestedYear = LATEST_ORTHOPHOTO_YEAR) {
  const year = resolveOrthophotoYear(requestedYear);
  const source = ORTHOPHOTO_SOURCES[year];
  const zoomRange = getMatrixZoomRange(source.matrixSet);
  return {
    year,
    tiles: [
      `https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=${source.layer}&STYLE=normal&FORMAT=${source.format}&TILEMATRIXSET=${source.matrixSet}&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}`,
    ],
    attribution: `Géoplateforme IGN · ${source.label}`,
    bounds: ORTHOPHOTO_BOUNDS,
    minzoom: zoomRange.minzoom,
    maxzoom: zoomRange.maxzoom,
  };
}
