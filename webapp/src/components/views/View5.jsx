import { useCallback, useMemo, useRef } from "react";
import { Layers } from "lucide-react";
import { useAppStore } from "../../store/appStore.js";
import { statisticalAreas } from "../../data/statisticalAreas.js";
import { districts } from "../../data/districts.js";
import { useI18n } from "../../i18n/useI18n.js";
import { ViewIntro } from "../layout/ViewIntro.jsx";
import { ContextBanner } from "../layout/ContextBanner.jsx";
import { PanelCard } from "../ui/PanelCard.jsx";
import { LayerOption } from "../ui/LayerOption.jsx";
import { RichText } from "../ui/RichText.jsx";
import { DistrictMapCard } from "../map/DistrictMapCard.jsx";
import { DistrictTable } from "../panels/DistrictTable.jsx";
import { DistrictDetail, MetricInfo } from "../panels/DistrictDetail.jsx";
import { AreaFinder } from "../panels/AreaFinder.jsx";

const FINDER_ANCHOR_ID = "view5-area-finder";

// View 5 — district / statistical-area aggregation.
// The aggregation toggle swaps the dataset under the same metric chooser; the selected entity
// id is reset to the first item so we never end up showing a card for an entity that is no
// longer in the dataset.

export function View5() {
  const { data, language } = useI18n();
  const view5Metric = useAppStore((state) => state.view5Metric);
  const view5Aggregation = useAppStore((state) => state.view5Aggregation);
  const selectedDistrictId = useAppStore((state) => state.selectedDistrictId);
  const setState = useAppStore((state) => state.setState);

  const metric = data.districtMetrics[view5Metric];
  const entities = view5Aggregation === "statistical" ? statisticalAreas : districts;
  const mapRef = useRef(null);
  const handleZoomToFeature = useCallback((featureId) => {
    mapRef.current?.flyTo?.(featureId);
  }, []);

  // Sort descending by the active metric, treating missing values as -Infinity so they sink.
  // useMemo prevents resorting on unrelated re-renders (sorting ~90 items is cheap but the
  // child table relies on identity for selection effects).
  const sorted = useMemo(
    () => [...entities].sort((a, b) => (b[view5Metric] ?? -Infinity) - (a[view5Metric] ?? -Infinity)),
    [entities, view5Metric],
  );
  const selected = entities.find((entity) => entity.id === selectedDistrictId) || null;
  const rank = selected ? sorted.findIndex((entity) => entity.id === selected.id) + 1 : 0;
  const copy = language !== "it"
    ? {
      metricDetail: selected ? `${selected.name} · 2026` : "Pick an area to read its 2026 value",
      missingValue: "n/a",
      bannerLabel: "2026 data",
      bannerValue: view5Aggregation === "statistical" ? "111 quartiers" : "16 arrondissements",
      bannerText:
        "This view aggregates **2026** summer data for Marseille's official **111 quartiers** and their **16 arrondissements**.",
      panelTitle: "2026 reading",
      aggregationAria: "Reading unit",
      districts: "Arrondissements",
      statisticalAreas: "Quartiers",
      statisticalHelp: "You are reading Marseille quartiers: smaller official units inside each arrondissement.",
      districtHelp: "You are reading Marseille arrondissements: broader averages that are easier to compare.",
      inspectHelp:
        "To choose an area from the map, enable **Inspect** in the controls below the map and then click the district or statistical area.",
    }
    : {
      metricDetail: selected ? `${selected.name} · 2026` : "Scegli una zona per leggere il valore 2026",
      missingValue: "n.d.",
      bannerLabel: "Dati 2026",
      bannerValue: view5Aggregation === "statistical" ? "111 quartiers" : "16 arrondissements",
      bannerText:
        "Questa sezione aggrega i dati estivi **2026** per i **111 quartiers** ufficiali di Marsiglia e i loro **16 arrondissements**.",
      panelTitle: "Lettura 2026",
      aggregationAria: "Unità di lettura",
      districts: "Arrondissements",
      statisticalAreas: "Quartiers",
      statisticalHelp: "Sono visualizzati i quartiers di Marsiglia: unità ufficiali più piccole dentro ogni arrondissement.",
      districtHelp: "Sono visualizzati gli arrondissements di Marsiglia: medie più ampie e facili da confrontare.",
      inspectHelp:
        "Per scegliere una zona dalla mappa, attiva **Ispeziona** nei controlli sotto la mappa e poi clicca il quartiere o l'area statistica.",
    };

  return (
    <>
      <ViewIntro
        id="v5"
        metric={{
          label: metric.label,
          value: `${selected?.[view5Metric] ?? copy.missingValue}${metric.unit}`,
          detail: copy.metricDetail,
        }}
      />
      <ContextBanner
        label={copy.bannerLabel}
        value={copy.bannerValue}
        text={copy.bannerText}
      />
      <div className="main-grid">
        <div className="map-stack">
          <DistrictMapCard
            ref={mapRef}
            aggregation={view5Aggregation}
            entities={entities}
            metricKey={view5Metric}
            selectedId={selected?.id}
            infoTargetId="view5-info"
            finderAnchorId={FINDER_ANCHOR_ID}
            onSelect={(id) => {
              setState({ selectedDistrictId: id });
            }}
          />
          <AreaFinder id={FINDER_ANCHOR_ID} onZoomToFeature={handleZoomToFeature} />
          <DistrictTable
            sorted={sorted}
            metricKey={view5Metric}
            selectedId={selected?.id}
            aggregation={view5Aggregation}
            onSelect={(id) => {
              setState({ selectedDistrictId: id });
              handleZoomToFeature(id);
            }}
          />
        </div>
        <aside className="side-panel">
          <PanelCard id="view5-info" className="info-target" title={copy.panelTitle} icon={<Layers size={16} />}>
            <div className="aggregation-toggle" role="group" aria-label={copy.aggregationAria}>
              <button
                type="button"
                className={view5Aggregation === "district" ? "active" : ""}
                aria-pressed={view5Aggregation === "district"}
                onClick={() => setState({ view5Aggregation: "district", selectedDistrictId: null })}
              >
                {copy.districts}
              </button>
              <button
                type="button"
                className={view5Aggregation === "statistical" ? "active" : ""}
                aria-pressed={view5Aggregation === "statistical"}
                onClick={() => setState({ view5Aggregation: "statistical", selectedDistrictId: null })}
              >
                {copy.statisticalAreas}
              </button>
            </div>
            <p className="panel-help">
              {view5Aggregation === "statistical"
                ? copy.statisticalHelp
                : copy.districtHelp}
            </p>
            <RichText as="p" className="panel-help" text={copy.inspectHelp} />
            {Object.entries(data.districtMetrics).map(([key, item]) => (
              <LayerOption
                key={key}
                selected={view5Metric === key}
                title={item.label}
                body={item.description}
                onClick={() => setState({ view5Metric: key })}
              />
            ))}
            <MetricInfo metric={metric} />
          </PanelCard>
          {selected && (
            <DistrictDetail
              district={selected}
              rank={rank}
              metricKey={view5Metric}
              aggregation={view5Aggregation}
            />
          )}
        </aside>
      </div>
    </>
  );
}

