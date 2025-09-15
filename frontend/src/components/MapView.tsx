import { useEffect, useRef } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import OSM from 'ol/source/OSM';
import VectorSource from 'ol/source/Vector';
import { fromLonLat } from 'ol/proj';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import LineString from 'ol/geom/LineString';
import { Style, Circle as CircleStyle, Fill, Stroke, Text } from 'ol/style';
import { isEmpty as isExtentEmpty } from 'ol/extent';
import { defaults as defaultControls } from 'ol/control';
import 'ol/ol.css';

type Pt = { id: number; name: string; lat: number; lon: number };

export default function MapView({
  points,
  selectedId,
  routeCoords,
}: {
  points: Pt[];
  selectedId?: number;
  routeCoords?: [number, number][];
}) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapObj = useRef<Map | null>(null);

  const vectorSrc = useRef(new VectorSource());
  const vectorLayerRef = useRef<VectorLayer<VectorSource> | null>(null);

  const routeSrc = useRef(new VectorSource());
  const routeLayerRef = useRef<VectorLayer<VectorSource> | null>(null);

  // keep selectedId out of the init-effect closure
  const selectedIdRef = useRef<number | undefined>(selectedId);

  useEffect(() => {
    if (!mapRef.current) return;

    const base = new TileLayer({ source: new OSM() });

    const vector = new VectorLayer({
      source: vectorSrc.current,
      style: (f) => {
        const isSel = f.get('id') === selectedIdRef.current;
        return new Style({
          image: new CircleStyle({
            radius: isSel ? 7 : 4,
            fill: new Fill({ color: isSel ? '#D92D20' : '#2563EB' }),
            stroke: new Stroke({ color: '#fff', width: 1.5 }),
          }),
          text: new Text({
            text: String(f.get('name') ?? ''),
            offsetX: 10,
            font: '12px system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
            fill: new Fill({ color: '#1f2937' }),
            stroke: new Stroke({ color: 'rgba(255,255,255,0.85)', width: 3 }),
          }),
        });
      },
    });
    vectorLayerRef.current = vector;

    const routeLayer = new VectorLayer({
      source: routeSrc.current,
      style: new Style({ stroke: new Stroke({ color: '#16a34a', width: 4 }) }),
    });
    routeLayerRef.current = routeLayer;

    mapObj.current = new Map({
      target: mapRef.current,
      layers: [base, vector, routeLayer],
      controls: defaultControls({ zoom: true }),
      view: new View({ center: fromLonLat([55.27, 25.2]), zoom: 10 }),
    });

    // correct initial size after layout
    requestAnimationFrame(() => mapObj.current?.updateSize());

    // resize handling
    let ro: ResizeObserver | undefined;
    if ('ResizeObserver' in window && mapRef.current) {
      ro = new ResizeObserver(() => mapObj.current?.updateSize());
      ro.observe(mapRef.current);
    }
    const onWindowResize = () => mapObj.current?.updateSize();
    window.addEventListener('resize', onWindowResize);

    return () => {
      ro?.disconnect();
      window.removeEventListener('resize', onWindowResize);
      mapObj.current?.setTarget(undefined);
      mapObj.current = null;
    };
  }, []);

  // update ref + restyle markers when selection changes
  useEffect(() => {
    selectedIdRef.current = selectedId;
    vectorLayerRef.current?.changed();
  }, [selectedId]);

  // points update
  useEffect(() => {
    const src = vectorSrc.current;
    src.clear();
    src.addFeatures(
      points.map(
        (p) =>
          new Feature({
            geometry: new Point(fromLonLat([p.lon, p.lat])),
            id: p.id,
            name: p.name,
          })
      )
    );
    vectorLayerRef.current?.changed();
  }, [points]);

  // camera handling
  useEffect(() => {
    const map = mapObj.current;
    if (!map) return;
    const view = map.getView();

    if (selectedId != null) {
      const feat = vectorSrc.current.getFeatures().find((f) => f.get('id') === selectedId);
      if (feat) {
        const coord = (feat.getGeometry() as Point).getCoordinates();
        view.animate({ center: coord, zoom: Math.max(view.getZoom() ?? 10, 13), duration: 500 });
      }
    } else {
      const extent = vectorSrc.current.getExtent();
      if (!isExtentEmpty(extent)) {
        view.fit(extent, { padding: [40, 40, 40, 40], maxZoom: 12, duration: 500 });
      }
    }
  }, [selectedId, points]);

  // route drawing (single effect with abort)
  useEffect(() => {
    const src = routeSrc.current;
    src.clear();

    if (!routeCoords || routeCoords.length < 2) {
      routeLayerRef.current?.changed();
      return;
    }

    const drawLine = (lonlat: [number, number][]) => {
      const xy = lonlat.map(([lon, lat]) => fromLonLat([lon, lat]));
      const line = new LineString(xy);
      const feat = new Feature({ geometry: line });
      src.addFeature(feat);

      const map = mapObj.current;
      if (map) {
        const view = map.getView();
        const extent = line.getExtent();
        view.fit(extent, { padding: [40, 40, 40, 40], duration: 500, maxZoom: 14 });
      }
      routeLayerRef.current?.changed();
    };

    const ctrl = new AbortController();
    let cancelled = false;

    (async () => {
      try {
        const path = routeCoords.map(([lon, lat]) => `${lon},${lat}`).join(';');
        const url = `https://router.project-osrm.org/route/v1/driving/${path}?overview=full&geometries=geojson`;
        const res = await fetch(url, { signal: ctrl.signal });
        if (!res.ok) throw new Error(String(res.status));
        const json = await res.json();
        if (cancelled) return;
        const coords = json?.routes?.[0]?.geometry?.coordinates as [number, number][] | undefined;
        if (!coords || coords.length < 2) throw new Error('no geometry');
        drawLine(coords); // OSRM returns [lon,lat]
      } catch {
        if (!cancelled) drawLine(routeCoords);
      }
    })();

    return () => {
      cancelled = true;
      ctrl.abort();
    };
  }, [routeCoords]);

  return (
    <div
      ref={mapRef}
      style={{
        height: '100%',
        width: '100%',
        border: '1px solid #eee',
        borderRadius: 8,
        overflow: 'hidden',
      }}
    />
  );
}
