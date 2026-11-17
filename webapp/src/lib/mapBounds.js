export const MARSEILLE_CITY_BOUNDS = [
  [5.22873166, 43.16962157],
  [5.53254336, 43.39105653],
];

export function expandBounds(bounds, { xMultiplier = 1, yMultiplier = xMultiplier } = {}) {
  const [[minLng, minLat], [maxLng, maxLat]] = bounds;
  const centerLng = (minLng + maxLng) / 2;
  const centerLat = (minLat + maxLat) / 2;
  const halfWidth = ((maxLng - minLng) * xMultiplier) / 2;
  const halfHeight = ((maxLat - minLat) * yMultiplier) / 2;

  return [
    [centerLng - halfWidth, centerLat - halfHeight],
    [centerLng + halfWidth, centerLat + halfHeight],
  ];
}

export const MARSEILLE_MAX_PAN_BOUNDS = expandBounds(MARSEILLE_CITY_BOUNDS, {
  xMultiplier: 4.5,
  yMultiplier: 3.75,
});
