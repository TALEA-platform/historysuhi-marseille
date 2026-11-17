import {
  titleHighlightPattern as italianTitleHighlightPattern,
  titleSplitPattern as italianTitleSplitPattern,
  view2LayersWithoutValuesToggle,
  viewCopy as italianViewCopy,
  views as italianViews,
} from "../data/viewsCopy.js";
import {
  dataAvailability,
  deltaLayer as italianDeltaLayer,
  districtMetrics as italianDistrictMetrics,
  districts,
  rasterOverlays as italianRasterOverlays,
  view1Layers as italianView1Layers,
  view2Layers as italianView2Layers,
  view3Layers as italianView3Layers,
  yearlyStats,
  years,
} from "../data/layers.js";
import { normalizeLanguage } from "./config.js";

function isPlainObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) && !(value instanceof Set);
}

function mergeLocalized(baseValue, overrideValue) {
  if (overrideValue === undefined) return baseValue;
  if (!isPlainObject(baseValue) || !isPlainObject(overrideValue)) return overrideValue;

  const merged = { ...baseValue };
  for (const key of Object.keys(overrideValue)) {
    merged[key] = mergeLocalized(baseValue?.[key], overrideValue[key]);
  }
  return merged;
}

function localizeCollection(baseCollection, overrides = {}) {
  return Object.fromEntries(
    Object.entries(baseCollection).map(([key, value]) => [key, mergeLocalized(value, overrides[key])]),
  );
}

const englishViews = [
  { id: "v1", title: "Where it gets hot", subtitle: "Observed heat" },
  { id: "v2", title: "What is normal, what changed", subtitle: "2013-2026 history" },
  { id: "v3", title: "Why it gets hot here", subtitle: "Physical drivers" },
  { id: "v4", title: "Day and night", subtitle: "Cooling" },
  { id: "v5", title: "Zoom into districts", subtitle: "Area summaries" },
];

const englishViewCopy = {
  v1: {
    kicker: "View 1",
    title: "Where Marseille's surface heats up the most in summer.",
    note: "These maps show surfaces observed by satellite during the summer months: roads, roofs, paved areas and vegetation. They do not represent air temperature.",
  },
  v2: {
    kicker: "View 2",
    title: "What is normal, what has changed over time.",
    note: "This section distinguishes usual conditions, anomalies and heat persistence across 2013-2026.",
  },
  v3: {
    kicker: "View 3",
    title: "Why some areas accumulate more heat.",
    note: "This section focuses on the physical factors that help explain heat accumulation: greenery, materials and how surfaces reflect light.",
  },
  v4: {
    kicker: "View 4",
    title: "Where the city cools down, and where it holds heat.",
    note: "The day-night dataset is calculated for 2026 at 1 km resolution: useful for reading city zones, not individual buildings.",
  },
  v5: {
    kicker: "View 5",
    title: "A summary reading for districts and statistical areas.",
    note: "This view aggregates the main 2026 data so districts and statistical areas can be compared.",
  },
};

const englishLayerOverrides = {
  view1Layers: {
    lst: {
      title: "Where the surface heats up the most",
      subtitle: "Surface temperature in the selected year",
      description:
        "Shows the surface temperature observed in the selected year. It is a direct reading: it indicates how hot roads, roofs, paved areas and vegetation appear in summer satellite observations.",
      explanation:
        "Use it to understand where the surface temperature is highest in absolute terms. A road or a roof can have a surface temperature much higher than the air temperature people breathe (satellite-observed surface data).",
      details: [
        "Blue and green indicate surfaces with lower temperatures; orange and red indicate surfaces with very high temperatures.",
        "This map lets you compare different years with the Compare slider.",
        "It differs from the second layer because here you read the temperature value itself, not the relationship with the city's annual average.",
        "Hatched areas mean data not available: at that location the satellite did not collect valid summer observations in the selected year.",
      ],
      legendTitle: "Surface temperature",
      legend: ["among the least hot", "less hot", "mid-range", "hot", "very hot", "among the hottest"],
      noDataLabel: "No data",
      noDataDescription:
        "At this location the satellite did not collect valid summer observations in the selected year, so the map leaves it as no data.",
      method: "Summer median LST, Landsat 8/9, 30 m resolution.",
    },
    zspat: {
      title: "Areas where the temperature differs from the average",
      subtitle: "How much a place differs from the urban average in the same year",
      description:
        "This map shows by how much a point's temperature is above or below Marseille's average **in the same year**. It does not show the absolute value of the surface temperature.",
      explanation:
        "Use it to read internal imbalances across the city: blue means below the city's annual average, white roughly in line, red above the city's annual average.",
      details: [
        "Different years are not compared directly here: each year is recalibrated to its own urban average.",
        "An area can appear red even in a non-extreme year if its temperature is above the rest of the city's average in that year.",
        "Use it to understand differences between districts and urban zones within the same selected year.",
        "Hatched areas mean data not available: at that location the satellite did not collect valid summer observations in the selected year.",
      ],
      valueInfo:
        "When you enable values, the number is not a temperature. It is a **standardized deviation**: 0 means close to the city's annual average, positive values indicate areas with temperature above the average, negative values areas with temperature below the average.",
      legendTitle: "Compared with the city",
      legend: ["well below average", "below average", "in line", "above average", "well above average"],
      noDataLabel: "No data",
      noDataDescription:
        "At this location the satellite did not collect valid summer observations in the selected year, so the map leaves it as no data.",
      method: "Year-by-year spatial z-score.",
    },
  },
  view2Layers: {
    anomaly: {
      title: "How much 2026 differs from the usual temperature",
      subtitle: "How much 2026 differs from this area's usual temperature",
      description:
        "Shows where 2026 behaved differently from the usual pattern across 2013-2026. It does not answer 'where is it hottest?', but rather 'where was 2026 **anomalous compared with its own history**?'.",
      explanation:
        "Blue indicates places with temperature below their usual pattern, white places in line, red places with temperature above their usual pattern. Each point is compared with its own history, not with the rest of the city.",
      details: [
        "A location that is usually hot can appear white if in 2026 it behaved as usual.",
        "A place that is not especially hot in absolute terms can appear red if in 2026 its temperature was above its own history.",
      ],
      inspectNote: "Here the value indicates the difference between 2026 and the usual behaviour of the same location.",
      legendTitle: "Departure from normal",
      legend: [
        "below the usual",
        "slightly below",
        "in line",
        "slightly above",
        "above the usual",
        "well above",
      ],
      method: "",
    },
    climatology: {
      title: "Usual temperature",
      subtitle: "Historical mean 2013-2026: the reference for reading the other layers",
      description:
        "Shows the **historical mean** of surface temperature across summers 2013-2026. It is the baseline map for View 2: it helps you see where the mean surface temperature is normally high or low.",
      explanation:
        "Read it as the usual behaviour of the surface. An industrial area, a large parking lot or parts of the historic centre can show a high surface temperature here even when they are not anomalous: that means the temperature is recurrently high.",
      details: [
        "It differs from the layer in View 1: here you are not reading a selected year, but an average across 14 summers.",
        "It helps separate usual heat from anomalous heat.",
      ],
      moreInfo: [
        "If an area shows a high temperature on this map it means that area tends to have a high surface temperature across the 2013-2026 series.",
        "This map is the starting point for understanding the following maps: first you see the average behaviour, then you read where heat is chronic or anomalous.",
      ],
      inspectNote: "Computed on the observed surface.",
      legendTitle: "Historical mean 2013-2026",
      legend: ["historically lowest", "low", "intermediate", "high", "very high", "historically among the highest"],
    },
    persistenceTemporal: {
      title: "Areas often anomalous",
      subtitle: "Places that heated beyond their usual pattern in several years",
      description:
        "This map shows how many times an area was **anomalous compared with its own history**. It does not look for places that are always hot: it looks for places that, in some years, become hotter than they usually are.",
      explanation:
        "An area can be very hot yet show few anomalies if it is hot in almost the same way every year. A central urban area, for example, can be constantly hot but vary little from year to year.",
      details: [
        "The number indicates in how many summers that point was anomalous compared with itself.",
        "Rare anomalies do not automatically mean low temperatures: they can also indicate stable, consistently high temperatures.",
        "The highest value observed in this dataset is 5 years: not all 14 summers produced anomalies in the same location.",
      ],
      moreInfo: [
        "Read this map together with **Chronically hot areas**. If an area has few anomalies but many chronic years, it is probably a stable critical area rather than a temporary exception.",
        "If an area has many anomalies but is not chronic, it may be a place whose behaviour changes in specific years.",
      ],
      inspectNote: "Few anomalies do not necessarily mean low temperatures: also check the chronically hot areas layer.",
      legendTitle: "Anomaly persistence",
      legend: ["0 years", "1 year", "2 years", "3 years", "4 years", "5 years"],
      numericLegend: ["0", "1", "2", "3", "4", "5 years"],
      legendStops: [
        { label: "0 years", color: "#fffdf0", accessibleColor: "#f7fcf0" },
        { label: "1 year", color: "#fee391", accessibleColor: "#ccebc5" },
        { label: "2 years", color: "#fec44f", accessibleColor: "#7bccc4" },
        { label: "3 years", color: "#fe9929", accessibleColor: "#43a2ca" },
        { label: "4 years", color: "#e31a1c", accessibleColor: "#0868ac" },
        { label: "5 years", color: "#b10026", accessibleColor: "#00204d" },
      ],
    },
    persistenceStructural: {
      title: "Chronically hot areas",
      subtitle: "Places that rank among the city's areas with the highest surface temperature in many years",
      description:
        "Shows how many times each point ranked within the **top 5% of areas with the highest surface temperature** in Marseille. Here 'chronic' means a repeated critical condition in urban space, year after year.",
      explanation:
        "Use it to identify places that often have the highest surface temperature in the city, even when they are not anomalous compared with their own history.",
      details: [
        "The number can reach 14 because the display covers 14 summers, from 2013 to 2026.",
        "Compare it with 'Chronic heat and anomalous heat' to understand whether a critical condition is stable, recurring or both.",
      ],
      moreInfo: [
        "To understand why an area is chronic, move to View 3 and look at vegetation and how reflective the surfaces are: little greenery and dark or absorbent surfaces often help explain the pattern.",
      ],
      followUps: [
        { label: "Go to Vegetation presence", view: "v3", stateKey: "view3Layer", layer: "ndvi" },
        { label: "Go to Reflective surfaces", view: "v3", stateKey: "view3Layer", layer: "albedo" },
      ],
      inspectNote: "",
      legendTitle: "Structural persistence",
      legend: ["0 years", "1 year", "2-4 years", "5-8 years", "9-12 years", "13-14 years"],
      numericLegend: ["0", "1", "2-4", "5-8", "9-12", "13-14 years"],
      legendStops: [
        { label: "0 years", color: "#fffdf0", accessibleColor: "#f7fcf0" },
        { label: "1 year", color: "#fee391", accessibleColor: "#ccebc5" },
        { label: "2-4 years", color: "#fec44f", accessibleColor: "#7bccc4" },
        { label: "5-8 years", color: "#fc4e2a", accessibleColor: "#43a2ca" },
        { label: "9-12 years", color: "#bd0026", accessibleColor: "#0868ac" },
        { label: "13-14 years", color: "#800026", accessibleColor: "#00204d" },
      ],
    },
    chronicVsAnomalous2025: {
      title: "Chronic heat and 2026 anomalies",
      subtitle: "Separates long-term critical areas from those that emerged in 2026",
      description:
        "Crosses the top 5% of surface temperatures in 2026 with anomalies in the same year. It helps distinguish long-standing critical areas from those that emerged in the latest available year.",
      explanation:
        "Orange indicates chronic heat; purple indicates a 2026 anomaly; the darker colour indicates both conditions in the same location.",
      details: [
        "Chronic means that the point falls within the **top 5% of areas with the highest surface temperature** of the selected year (2026).",
        "Anomalous 2026 means that in 2026 the point was **anomalous compared with its own history**.",
        "The both class marks places that were already critical and in 2026 also behaved outside the norm.",
      ],
      inspectNote: "This class combines two readings: structural heat compared with the city and the 2026 anomaly compared with the point's own history.",
      legendTitle: "4 classes",
      legend: ["no critical pattern", "chronic", "2026 anomaly", "chronic and anomalous"],
    },
    structuralVsTemporal: {
      title: "Chronic heat and anomalous heat",
      subtitle: "Separates places that are always hot from those often anomalous",
      description:
        "Crosses, for the full 2013-2026 period, how many times an area ranked in the **top 5% of areas with the highest surface temperature** and how many times it was **anomalous compared with its own history**.",
      explanation:
        "",
      details: [
        "Orange increases with the years of chronic heat.",
        "Purple increases with the years of anomalous heat.",
        "Where the two conditions coexist, the colour is mixed: it signals both structural criticality and recurring anomalies.",
        "Chronic reaches 14 years because the series covers 14 summers. Anomalous reaches 5 years because that is the maximum currently present in the anomaly persistence dataset.",
      ],
      moreInfo: [
        "Low anomaly does not necessarily mean low temperatures. It can also indicate a place that is always hot and stable, such as some parts of the historic centre.",
        "If you see a lot of orange and little purple, the issue is mainly structural. If you see a lot of purple, the behaviour changes more often relative to local history.",
        "To understand the physical causes, explore View 3: vegetation, reflective surfaces and materials help explain why an area holds or accumulates heat.",
      ],
      followUps: [
        { label: "Go to Vegetation presence", view: "v3", stateKey: "view3Layer", layer: "ndvi" },
        { label: "Go to Reflective surfaces", view: "v3", stateKey: "view3Layer", layer: "albedo" },
      ],
      inspectNote: "",
      legendTitle: "Chronic/anomalous intensity",
      legend: ["chronic: 1-14 years", "anomalous: 1-5 years", "both: mixed colours"],
    },
  },
  view3Layers: {
    uhei: {
      title: "Overall heat exposure",
      subtitle: "Where high surface temperature, little vegetation and dark surfaces show up together",
      description:
        "Shows where three conditions overlap in the same place: higher surface temperatures, limited vegetation and surfaces that reflect little sunlight. When all three meet, overall heat exposure is higher — not because any single cause is enough on its own, but because they reinforce each other.",
      explanation:
        "It is the guiding layer in View 3. Use it to identify where interventions should be integrated: not only trees, not only materials, but a combination of factors.",
      details: [
        "Higher values indicate greater overall exposure to high surface temperatures.",
        "It is not a health or social measure: it describes physical conditions observed by satellite.",
        "Read it together with the vegetation and albedo layers to understand which factor weighs more.",
      ],
      valueInfo:
        "This value is a **synthetic index, not a temperature in °C**. The number combines surface temperature, limited vegetation and poorly reflective surfaces: higher values indicate physical conditions that are more exposed to heat.",
      legendTitle: "Heat exposure",
      legend: ["very favorable", "favorable", "intermediate", "exposed", "very exposed"],
    },
    ndvi: {
      title: "Vegetation presence",
      subtitle: "Helps identify where greenery can contribute more to heat mitigation",
      description:
        "Shows where vegetation is more present. In practical terms it helps identify parks, tree lines, agricultural areas and places where greenery can help mitigate heat.",
      explanation:
        "Beige means little observable vegetation, dark green means denser and healthier vegetation.",
      details: [
        "This is a satellite index: it separates vegetated surfaces from mineral or built surfaces.",
      ],
      valueInfo:
        "This is a **vegetation index**, not a percentage and not a temperature. In this reading it ranges from 0 to 1: close to 0 means little observable greenery, close to 1 means more present and healthier vegetation.",
      legendTitle: "Vegetation",
      legend: ["little vegetation", "intermediate vegetation", "dense vegetation"],
    },
    albedo: {
      title: "More reflective and more absorbent surfaces",
      subtitle: "Useful for separating more reflective surfaces from those that absorb more heat",
      description:
        "Indicates how much surfaces reflect sunlight instead of absorbing it as heat. Dark surfaces tend to accumulate more heat; more reflective surfaces can help reduce it.",
      explanation:
        "The colour scale highlights differences in reflectance: small differences can help read roofs, paved areas and urban materials. Values outside the legend limits keep the colour of the corresponding endpoint.",
      details: [
        "Lower values indicate more absorbent surfaces; higher values more reflective surfaces.",
        "High albedo alone is not enough to solve heat: vegetation, ventilation, shade and materials all matter.",
      ],
      valueInfo:
        "Albedo is the **share of sunlight reflected** by the surface, not a temperature. A value of 0.20 means roughly 20% of light is reflected: lower values indicate more absorbent surfaces.",
      legend: ["absorbent", "intermediate", "reflective"],
    },
    hvi: {
      title: "Surface temperature and lack of vegetation",
      subtitle: "Helps show where additional greenery could make a bigger difference",
      description:
        "A deeper-reading layer: it combines surface temperature and lack of greenery. It is useful when you want to see where vegetation could have the greatest impact.",
      explanation:
        "Red means high temperature with little vegetation; blue means lower temperature and greener. It does not replace the overall heat exposure index: it explains one of its components.",
      details: [
        "Use it to read the relationship between surface temperature and vegetation.",
        "It is more useful for reasoning about mitigation priorities than for describing a temperature.",
      ],
      valueInfo:
        "This is a **comparative index**, not a measure in °C. Positive values indicate situations where high surface temperature and limited vegetation weigh more; negative values indicate conditions with lower temperatures or more vegetation.",
      legendTitle: "Temperature and vegetation",
      legend: ["low and green", "intermediate", "high and low vegetation"],
    },
    hri: {
      title: "Surface temperature and poorly reflective surfaces",
      subtitle: "Helps read the weight of roofs, pavements and materials that absorb heat",
      description:
        "A deeper-reading layer: it combines surface temperature and poorly reflective surfaces. It helps show where materials, roofs and pavements may contribute to heat.",
      explanation:
        "Red means high temperature with dark or absorbent surfaces; blue means lower temperature and more reflective. It does not replace the overall heat exposure index: it explains one of its components.",
      details: [
        "Use it to read the relationship between surface temperature and absorbent materials.",
        "It supports reasoning about pavements, roofs, paved areas and mineral surfaces.",
      ],
      valueInfo:
        "This is a **comparative index**, not a temperature. Positive values indicate high temperature associated with poorly reflective surfaces; negative values indicate lower temperatures or more reflective surfaces.",
      legendTitle: "Temperature and surfaces",
      legend: ["low temp., reflective", "intermediate", "high temp., absorbent"],
    },
  },
  deltaLayer: {
    title: "Difference between day and night",
    subtitle: "Where the surface temperature drops a lot at night and where it tends to stay high",
    description:
      "Shows how much temperature changes between day and night on the observed surface. A high value means the surface is much hotter by day than at night; a low value means it changes less.",
    explanation:
      "This map does not simply say where it is hottest. It helps read the daily behaviour of surfaces. The centre can cool around the average at night, but during the day it can absorb a lot of heat because it has many absorbent surfaces. Hills can show a lower difference because their temperature is already lower and they accumulate less heat to lose.",
    details: [
      "Provisional 2026 data: the MODIS composite starting on 29 August is not included.",
      "The grid is coarser than the Landsat layers: each cell represents a broad area of about 1 km.",
      "A low value should not automatically be read as a problem: it can indicate a place that stays warm, but also a place that does not heat up much during the day.",
    ],
    moreInfo: [
      "To read it well you need to keep two questions together: how much the area heats up during the day and how much it changes overnight.",
      "That is why this view should be read alongside the daytime heat maps and the physical drivers: vegetation, albedo and materials help explain why different areas behave differently.",
    ],
    inspectNote: ".",
    legendTitle: "Cooling",
    legend: ["little cooling", "medium", "strong cooling"],
    noDataLabel: "No data",
    noDataDescription:
      "There is no valid day-night difference value at this point, so the cell is shown as no data.",
  },
  districtMetrics: {
    uhei: {
      label: "Heat exposure",
      description: "Summary of overall heat exposure.",
      valueInfo:
        "It is the **mean synthetic index of the selected area**, not a temperature and not a direct measure of health risk. It summarizes three physical conditions: **surface temperature**, **vegetation presence** and **the ability of surfaces to reflect light**. The number has no unit: it is mainly used to compare selected areas with one another. Higher values indicate a less favorable combination; lower values do not mean there is no heat, only that average conditions are less critical.",
    },
    lst: {
      label: "Surface temperature",
      description: "Mean surface temperature.",
      valueInfo:
        "It is the **mean surface temperature** of the selected area, expressed in °C. It describes how much roofs, roads, paved areas and vegetation observed by satellite heat up.",
    },
    anomaly: {
      label: "Departure from normal",
      description: "How much 2026 differs from the area's usual behaviour.",
      valueInfo:
        "It is the **mean 2026 departure** from the usual behaviour of the same selected area. It is measured in °C because it compares two surface temperatures. A positive value means the area's temperature was above its usual pattern in 2026; a negative value means it was below the usual pattern. It does not say whether the area is hot in absolute terms: it says how much 2026 diverged from its own history.",
    },
    hotspotPercent: {
      label: "Surface with thermal anomaly",
      description: "Percentage of the area's surface with a thermal anomaly in the analysed year compared with the historical average.",
      valueInfo:
        "It is the **percentage of the selected area's surface** with a thermal anomaly in the analysed year compared with the historical average. It is not a temperature and it does not say how many people are exposed: it measures how much surface is involved. A high value means the phenomenon is widespread; a low value can indicate more localized anomalies.",
    },
  },
  rasterOverlays: {
    temporalHotspot: {
      title: "Exceptionally hot areas",
    },
  },
};

const englishTitlePatterns = {
  highlight: /^(Marseille|surface|normal|changed|time|heat|city|districts|statistical|areas|summer)$/i,
  split: /(Marseille|surface|normal|changed|time|heat|city|districts|statistical|areas|summer)/gi,
};

const frenchViews = [
  { id: "v1", title: "Zones les plus chaudes", subtitle: "Chaleur observée" },
  { id: "v2", title: "Normalité et changements", subtitle: "Historique 2013-2026" },
  { id: "v3", title: "Pourquoi la chaleur s'accumule", subtitle: "Facteurs physiques" },
  { id: "v4", title: "Jour et nuit", subtitle: "Refroidissement" },
  { id: "v5", title: "Explorer les quartiers", subtitle: "Synthèses territoriales" },
];

const frenchViewCopy = {
  v1: {
    kicker: "Vue 1",
    title: "Où la surface de Marseille chauffe le plus en été.",
    note: "Ces cartes montrent les surfaces observées par satellite pendant les mois d'été : routes, toitures, zones minérales et végétation. Elles ne représentent pas la température de l'air.",
  },
  v2: {
    kicker: "Vue 2",
    title: "Ce qui est habituel, ce qui a changé dans le temps.",
    note: "Cette section distingue les conditions habituelles, les anomalies et la persistance de la chaleur sur 2013-2026.",
  },
  v3: {
    kicker: "Vue 3",
    title: "Pourquoi certaines zones accumulent plus de chaleur.",
    note: "Cette section se concentre sur les facteurs physiques qui aident à expliquer l'accumulation de chaleur : végétation, matériaux et capacité des surfaces à réfléchir la lumière.",
  },
  v4: {
    kicker: "Vue 4",
    title: "Où la ville se refroidit, et où elle garde la chaleur.",
    note: "Le jeu de données jour-nuit est calculé pour 2026 à une résolution de 1 km : il sert à lire de grands secteurs urbains, pas des bâtiments individuels.",
  },
  v5: {
    kicker: "Vue 5",
    title: "Une lecture synthétique des quartiers et arrondissements.",
    note: "Cette vue agrège les principales données 2026 afin de comparer les quartiers et les arrondissements.",
  },
};

const frenchLayerOverrides = {
  view1Layers: {
    lst: {
      title: "Où la surface chauffe le plus",
      subtitle: "Température de surface pour l'année sélectionnée",
      description:
        "Montre la température de surface observée pendant l'année sélectionnée. C'est une lecture directe : elle indique à quel point routes, toitures, zones minérales et végétation apparaissent chaudes dans les observations satellitaires estivales.",
      explanation:
        "Utilisez cette couche pour comprendre où la température de surface est la plus élevée en valeur absolue. Une route ou une toiture peut avoir une température de surface beaucoup plus élevée que la température de l'air respiré.",
      details: [
        "Le bleu et le vert indiquent des surfaces moins chaudes ; l'orange et le rouge indiquent des surfaces très chaudes.",
        "Cette carte permet de comparer différentes années avec le curseur Comparer.",
        "Elle diffère de la deuxième couche : ici on lit la valeur de température elle-même, pas son écart à la moyenne annuelle de la ville.",
        "Les zones hachurées signalent une donnée non disponible : le satellite n'a pas collecté d'observations estivales valides à cet endroit pour l'année sélectionnée.",
      ],
      legendTitle: "Température de surface",
      legend: ["parmi les moins chaudes", "moins chaud", "intermédiaire", "chaud", "très chaud", "parmi les plus chaudes"],
      noDataLabel: "Aucune donnée",
      noDataDescription:
        "À cet endroit, le satellite n'a pas collecté d'observations estivales valides pour l'année sélectionnée ; la carte n'affiche donc pas de valeur.",
      method: "Médiane estivale LST, Landsat 8/9, résolution 30 m.",
    },
    zspat: {
      title: "Écart à la moyenne urbaine",
      subtitle: "À quel point un lieu diffère de la moyenne de la ville la même année",
      description:
        "Cette carte montre de combien la température d'un point est supérieure ou inférieure à la moyenne de Marseille **la même année**. Elle ne montre pas la valeur absolue de la température de surface.",
      explanation:
        "Utilisez-la pour lire les déséquilibres internes à la ville : bleu sous la moyenne annuelle de la ville, blanc proche de la moyenne, rouge au-dessus.",
      details: [
        "Les années ne sont pas comparées directement ici : chaque année est recalibrée sur sa propre moyenne urbaine.",
        "Une zone peut apparaître rouge même pendant une année non extrême si sa température est supérieure au reste de la ville cette année-là.",
        "Elle aide à comprendre les différences entre arrondissements, quartiers et secteurs urbains au sein d'une même année.",
      ],
      valueInfo:
        "Quand les valeurs sont activées, le nombre n'est pas une température. C'est un **écart standardisé** : 0 signifie proche de la moyenne annuelle de la ville, les valeurs positives indiquent une température au-dessus de la moyenne, les valeurs négatives au-dessous.",
      legendTitle: "Comparé à la ville",
      legend: ["nettement sous la moyenne", "sous la moyenne", "dans la moyenne", "au-dessus", "nettement au-dessus"],
      noDataLabel: "Aucune donnée",
      noDataDescription:
        "À cet endroit, le satellite n'a pas collecté d'observations estivales valides pour l'année sélectionnée ; la carte n'affiche donc pas de valeur.",
      method: "Z-score spatial calculé année par année.",
    },
  },
  view2Layers: {
    anomaly: {
      title: "Écart de 2026 à la température habituelle",
      subtitle: "À quel point 2026 diffère du comportement habituel de cette zone",
      description:
        "Montre où 2026 s'écarte du comportement habituel observé entre 2013 et 2026. La question n'est pas « où fait-il le plus chaud ? », mais « où 2026 a-t-elle été **anomale par rapport à sa propre histoire** ? ».",
      explanation:
        "Le bleu indique des lieux plus frais que leur comportement habituel, le blanc des lieux proches de celui-ci, le rouge des lieux plus chauds. Chaque point est comparé à sa propre histoire, pas au reste de la ville.",
      details: [
        "Un lieu habituellement chaud peut apparaître blanc si 2026 s'est comportée comme d'habitude.",
        "Un lieu pas particulièrement chaud en valeur absolue peut apparaître rouge si sa température 2026 dépasse sa propre histoire.",
      ],
      inspectNote: "Ici, la valeur indique la différence entre 2026 et le comportement habituel du même lieu.",
      legendTitle: "Écart à la normale",
      legend: ["sous l'habituel", "légèrement sous", "dans la normale", "légèrement au-dessus", "au-dessus", "nettement au-dessus"],
    },
    climatology: {
      title: "Température habituelle",
      subtitle: "Moyenne historique 2013-2026 : la référence pour lire les autres couches",
      description:
        "Montre la **moyenne historique** de la température de surface sur les étés 2013-2026. C'est la carte de référence de la Vue 2 : elle aide à voir où la température moyenne de surface est normalement haute ou basse.",
      explanation:
        "Lisez-la comme le comportement habituel de la surface. Une zone industrielle, un grand parking ou une partie du centre peut être chaude ici même sans anomalie : cela signifie que la température y est régulièrement élevée.",
      details: [
        "Contrairement à la couche de la Vue 1, on ne lit pas une année donnée mais une moyenne sur 14 étés.",
        "Elle aide à distinguer la chaleur habituelle de la chaleur anormale.",
      ],
      legendTitle: "Moyenne historique 2013-2026",
      legend: ["historiquement la plus basse", "basse", "intermédiaire", "élevée", "très élevée", "historiquement parmi les plus élevées"],
    },
    persistenceTemporal: {
      title: "Zones souvent anormales",
      subtitle: "Lieux qui dépassent leur comportement habituel plusieurs années",
      description:
        "Cette carte montre combien de fois une zone a été **anormale par rapport à sa propre histoire**. Elle ne cherche pas les lieux toujours chauds, mais ceux qui deviennent parfois plus chauds que d'habitude.",
      explanation:
        "Une zone peut être très chaude et montrer peu d'anomalies si elle est chaude presque de la même façon chaque année.",
      details: [
        "Le nombre indique pendant combien d'étés ce point a été anormal par rapport à lui-même.",
        "Peu d'anomalies ne signifie pas forcément une faible température : cela peut aussi indiquer une chaleur élevée mais stable.",
        "La valeur maximale observée ici est de 5 ans : les 14 étés n'ont pas tous produit des anomalies au même endroit.",
      ],
      legendTitle: "Persistance des anomalies",
      legend: ["0 an", "1 an", "2 ans", "3 ans", "4 ans", "5 ans"],
      numericLegend: ["0", "1", "2", "3", "4", "5 ans"],
    },
    persistenceStructural: {
      title: "Zones chroniquement chaudes",
      subtitle: "Lieux classés de nombreuses années parmi les surfaces les plus chaudes de la ville",
      description:
        "Montre combien de fois chaque point appartient au **top 5 % des surfaces les plus chaudes** de Marseille. Ici, « chronique » signifie une condition critique répétée dans l'espace urbain.",
      explanation:
        "Utilisez-la pour identifier les lieux qui présentent souvent les températures de surface les plus élevées de la ville, même s'ils ne sont pas anormaux par rapport à leur propre histoire.",
      details: [
        "Le nombre peut atteindre 14, car la série couvre 14 étés de 2013 à 2026.",
        "Comparez cette couche avec « Chaleur chronique et chaleur anormale » pour voir si la criticité est stable, récurrente ou les deux.",
      ],
      followUps: [
        { label: "Aller à Présence de végétation", view: "v3", stateKey: "view3Layer", layer: "ndvi" },
        { label: "Aller à Surfaces réfléchissantes", view: "v3", stateKey: "view3Layer", layer: "albedo" },
      ],
      legendTitle: "Persistance structurelle",
      legend: ["0 an", "1 an", "2-4 ans", "5-8 ans", "9-12 ans", "13-14 ans"],
      numericLegend: ["0", "1", "2-4", "5-8", "9-12", "13-14 ans"],
    },
    chronicVsAnomalous2025: {
      title: "Chaleur chronique et anomalies 2026",
      subtitle: "Distingue les zones critiques de long terme de celles apparues en 2026",
      description:
        "Croise la chaleur chronique sur plusieurs années avec l'anomalie 2026. Cette lecture distingue les zones critiques anciennes de celles qui émergent dans la dernière année disponible.",
      explanation:
        "L'orange indique une chaleur chronique ; le violet une anomalie 2026 ; la couleur la plus sombre indique les deux conditions au même endroit.",
      details: [
        "Chronique signifie que le point appartient au **top 5 % des surfaces les plus chaudes** de l'année sélectionnée (2026).",
        "Anomalie 2026 signifie qu'en 2026 le point a été **anormal par rapport à sa propre histoire**.",
        "La classe « les deux » marque des lieux déjà critiques qui se sont aussi comportés hors norme en 2026.",
      ],
      legendTitle: "4 classes",
      legend: ["aucun motif critique", "chronique", "anomalie 2026", "chronique et anormal"],
    },
    structuralVsTemporal: {
      title: "Chaleur chronique et chaleur anormale",
      subtitle: "Distingue les lieux toujours chauds de ceux souvent anormaux",
      description:
        "Croise, pour 2013-2026, le nombre d'années où une zone se classe dans le **top 5 % des surfaces les plus chaudes** et le nombre d'années où elle est **anormale par rapport à sa propre histoire**.",
      details: [
        "L'orange augmente avec les années de chaleur chronique.",
        "Le violet augmente avec les années de chaleur anormale.",
        "Quand les deux conditions coexistent, la couleur est mélangée : elle signale à la fois une criticité structurelle et des anomalies récurrentes.",
      ],
      followUps: [
        { label: "Aller à Présence de végétation", view: "v3", stateKey: "view3Layer", layer: "ndvi" },
        { label: "Aller à Surfaces réfléchissantes", view: "v3", stateKey: "view3Layer", layer: "albedo" },
      ],
      legendTitle: "Intensité chronique/anormale",
      legend: ["chronique : 1-14 ans", "anormale : 1-5 ans", "les deux : couleurs mélangées"],
    },
  },
  view3Layers: {
    uhei: {
      title: "Exposition globale à la chaleur",
      subtitle: "Là où forte température de surface, faible végétation et surfaces sombres se cumulent",
      description:
        "Montre où trois conditions se superposent : températures de surface plus élevées, végétation limitée et surfaces qui réfléchissent peu la lumière solaire. Quand elles se cumulent, l'exposition globale à la chaleur augmente.",
      explanation:
        "C'est la couche de synthèse de la Vue 3. Elle aide à repérer où les interventions doivent combiner plusieurs leviers : végétation, matériaux et réflectance.",
      legendTitle: "Exposition à la chaleur",
      legend: ["très favorable", "favorable", "intermédiaire", "exposé", "très exposé"],
    },
    ndvi: {
      title: "Présence de végétation",
      subtitle: "Aide à repérer où le végétal peut contribuer davantage à l'atténuation de la chaleur",
      description:
        "Montre où la végétation est davantage présente : parcs, alignements d'arbres, zones agricoles et lieux où le végétal peut aider à réduire la chaleur.",
      explanation: "Le beige indique peu de végétation observable ; le vert foncé une végétation plus dense et en meilleure santé.",
      legendTitle: "Végétation",
      legend: ["peu de végétation", "végétation intermédiaire", "végétation dense"],
    },
    albedo: {
      title: "Surfaces plus réfléchissantes et plus absorbantes",
      subtitle: "Utile pour distinguer les surfaces qui réfléchissent de celles qui absorbent davantage la chaleur",
      description:
        "Indique dans quelle mesure les surfaces réfléchissent la lumière solaire au lieu de l'absorber sous forme de chaleur. Les surfaces sombres accumulent davantage de chaleur ; les surfaces plus réfléchissantes peuvent aider à la réduire.",
      explanation:
        "L'échelle utilise des quantiles, car l'albédo varie peu à Marseille : de petites différences peuvent néanmoins aider à lire toitures, sols minéraux et matériaux urbains.",
      legend: ["absorbant", "intermédiaire", "réfléchissant"],
    },
    hvi: {
      title: "Température de surface et manque de végétation",
      subtitle: "Montre où un apport de végétation pourrait avoir le plus d'effet",
      description:
        "Cette couche combine température de surface et manque de végétation. Elle est utile pour voir où la végétation pourrait peser le plus dans les priorités d'atténuation.",
      explanation:
        "Le rouge indique une température élevée avec peu de végétation ; le bleu une température plus faible et davantage de végétation.",
      legendTitle: "Température et végétation",
      legend: ["bas et vert", "intermédiaire", "élevé et peu végétalisé"],
    },
    hri: {
      title: "Température de surface et surfaces peu réfléchissantes",
      subtitle: "Aide à lire le poids des toitures, sols et matériaux qui absorbent la chaleur",
      description:
        "Cette couche combine température de surface et surfaces peu réfléchissantes. Elle montre où matériaux, toitures et sols minéraux peuvent contribuer à la chaleur.",
      explanation:
        "Le rouge indique une température élevée avec des surfaces sombres ou absorbantes ; le bleu une température plus basse et des surfaces plus réfléchissantes.",
      legendTitle: "Température et surfaces",
      legend: ["temp. basse, réfléchissant", "intermédiaire", "temp. haute, absorbant"],
    },
  },
  deltaLayer: {
    title: "Différence entre jour et nuit",
    subtitle: "Où la température de surface baisse beaucoup la nuit et où elle reste élevée",
    description:
      "Montre de combien la température change entre le jour et la nuit sur la surface observée. Une valeur élevée signifie que la surface est beaucoup plus chaude le jour que la nuit ; une valeur faible signifie qu'elle varie moins.",
    explanation:
      "Cette carte ne dit pas simplement où il fait le plus chaud. Elle aide à lire le comportement quotidien des surfaces.",
    legendTitle: "Refroidissement",
    legend: ["faible refroidissement", "moyen", "fort refroidissement"],
    noDataLabel: "Aucune donnée",
    noDataDescription: "Aucune valeur jour-nuit valide n'est disponible à cet endroit.",
  },
  districtMetrics: {
    uhei: {
      label: "Exposition à la chaleur",
      description: "Synthèse de l'exposition globale à la chaleur.",
    },
    lst: {
      label: "Température de surface",
      description: "Température moyenne de surface.",
    },
    anomaly: {
      label: "Écart à la normale",
      description: "À quel point 2026 diffère du comportement habituel de la zone.",
    },
    hotspotPercent: {
      label: "Surface avec anomalie thermique",
      description: "Pourcentage de la surface de la zone présentant une anomalie thermique l'année analysée par rapport à la moyenne historique.",
    },
  },
  rasterOverlays: {
    temporalHotspot: {
      title: "Zones exceptionnellement chaudes",
    },
  },
};

const frenchTitlePatterns = {
  highlight: /^(Marseille|surface|normale|changements|temps|chaleur|ville|quartiers|arrondissements|été)$/i,
  split: /(Marseille|surface|normale|changements|temps|chaleur|ville|quartiers|arrondissements|été)/gi,
};

const localizedData = {
  fr: {
    views: frenchViews,
    viewCopy: frenchViewCopy,
    titlePatterns: frenchTitlePatterns,
    view2LayersWithoutValuesToggle,
    years,
    yearlyStats,
    view1Layers: localizeCollection(localizeCollection(italianView1Layers, englishLayerOverrides.view1Layers), frenchLayerOverrides.view1Layers),
    view2Layers: localizeCollection(localizeCollection(italianView2Layers, englishLayerOverrides.view2Layers), frenchLayerOverrides.view2Layers),
    view3Layers: localizeCollection(localizeCollection(italianView3Layers, englishLayerOverrides.view3Layers), frenchLayerOverrides.view3Layers),
    deltaLayer: mergeLocalized(mergeLocalized(italianDeltaLayer, englishLayerOverrides.deltaLayer), frenchLayerOverrides.deltaLayer),
    districtMetrics: localizeCollection(localizeCollection(italianDistrictMetrics, englishLayerOverrides.districtMetrics), frenchLayerOverrides.districtMetrics),
    districts,
    dataAvailability,
    rasterOverlays: localizeCollection(localizeCollection(italianRasterOverlays, englishLayerOverrides.rasterOverlays), frenchLayerOverrides.rasterOverlays),
  },
  it: {
    views: italianViews,
    viewCopy: italianViewCopy,
    titlePatterns: {
      highlight: italianTitleHighlightPattern,
      split: italianTitleSplitPattern,
    },
    view2LayersWithoutValuesToggle,
    years,
    yearlyStats,
    view1Layers: italianView1Layers,
    view2Layers: italianView2Layers,
    view3Layers: italianView3Layers,
    deltaLayer: italianDeltaLayer,
    districtMetrics: italianDistrictMetrics,
    districts,
    dataAvailability,
    rasterOverlays: italianRasterOverlays,
  },
  en: {
    views: englishViews,
    viewCopy: englishViewCopy,
    titlePatterns: englishTitlePatterns,
    view2LayersWithoutValuesToggle,
    years,
    yearlyStats,
    view1Layers: localizeCollection(italianView1Layers, englishLayerOverrides.view1Layers),
    view2Layers: localizeCollection(italianView2Layers, englishLayerOverrides.view2Layers),
    view3Layers: localizeCollection(italianView3Layers, englishLayerOverrides.view3Layers),
    deltaLayer: mergeLocalized(italianDeltaLayer, englishLayerOverrides.deltaLayer),
    districtMetrics: localizeCollection(italianDistrictMetrics, englishLayerOverrides.districtMetrics),
    districts,
    dataAvailability,
    rasterOverlays: localizeCollection(italianRasterOverlays, englishLayerOverrides.rasterOverlays),
  },
};

export function getLocalizedData(language) {
  return localizedData[normalizeLanguage(language)];
}
