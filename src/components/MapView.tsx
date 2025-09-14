import { useEffect, useRef } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import OSM from 'ol/source/OSM';
import VectorSource from 'ol/source/Vector';
import { fromLonLat } from 'ol/proj';
import { Feature } from 'ol';
import Point from 'ol/geom/Point';
import { Style, Circle as CircleStyle, Fill, Stroke, Text } from 'ol/style';
import 'ol/ol.css';

type Pt = { id:number; name:string; lat:number; lon:number };

export default function MapView({ points }: { points: Pt[] }) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapObj = useRef<Map | null>(null);
  const vectorSrc = useRef(new VectorSource());
  
  useEffect(() => {
    if (!mapRef.current) return;

    const base = new TileLayer({
      source: new OSM({        
        attributions:
          '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap contributors</a>',
      }),
    });

    const vector = new VectorLayer({
      source: vectorSrc.current,
      style: (f) =>
        new Style({
          image: new CircleStyle({
            radius: 4,
            fill: new Fill({ color: '#1f76d1' }),
            stroke: new Stroke({ color: '#fff', width: 1.5 }),
          }),
          text: new Text({
            text: String(f.get('name') ?? ''),
            offsetX: 10,
            offsetY: 0,
            font: '12px system-ui, sans-serif',
            fill: new Fill({ color: '#222' }),
            stroke: new Stroke({ color: 'rgba(255,255,255,0.8)', width: 3 }),
          }),
        }),
    });

    mapObj.current = new Map({
      target: mapRef.current,
      layers: [base, vector],
      view: new View({
        center: fromLonLat([55.27, 25.20]),
        zoom: 10,
      }),
    });

    return () => {
      mapObj.current?.setTarget(undefined);
      mapObj.current = null;
    };
  }, []);
  
  useEffect(() => {
    const src = vectorSrc.current;
    src.clear();

    const feats = points.map((p) => {
      const feat = new Feature({
        geometry: new Point(fromLonLat([p.lon, p.lat])),
        id: p.id,
        name: p.name,
      });
      return feat;
    });

    src.addFeatures(feats);
  }, [points]);

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
