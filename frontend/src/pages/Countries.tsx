import { useEffect, useMemo, useState, useDeferredValue, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import MapView from '../components/MapView';

type Country = {
  cca2: string;
  name: { common: string };
  region: string;
  population: number;
  flags: { svg?: string; png?: string; alt?: string };
  latlng?: [number, number]; // [lat, lon]
};

const API =
  'https://restcountries.com/v3.1/all?fields=name,cca2,region,flags,population,latlng';

export default function Countries() {
  const [data, setData] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [sp, setSp] = useSearchParams();
  const [q, setQ] = useState(sp.get('q') ?? '');
  const [region, setRegion] = useState(sp.get('region') ?? 'All');
  const dq = useDeferredValue(q);

  const [selected, setSelected] = useState<Country | null>(null);
  const sideRef = useRef<HTMLDivElement | null>(null);

  async function fetchAll(signal?: AbortSignal) {
    setLoading(true);
    try {
      const res = await fetch(API, { signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as Country[];
      json.sort((a, b) => a.name.common.localeCompare(b.name.common));
      setData(json);
      localStorage.setItem('countries_cache_v1', JSON.stringify(json));
      setError(null);
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return;
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }
  
  useEffect(() => {
    const cached = localStorage.getItem('countries_cache_v1');
    if (cached) {
      try {
        const arr = JSON.parse(cached) as Country[];
        arr.sort((a, b) => a.name.common.localeCompare(b.name.common));
        setData(arr);
        setLoading(false);
      } catch { /* ignore */ }
    }

    const ctrl = new AbortController();
    fetchAll(ctrl.signal);
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const regions = useMemo(() => {
    const set = new Set<string>(data.map((c) => c.region).filter(Boolean) as string[]);
    return ['All', ...Array.from(set).sort()];
  }, [data]);
  
  useEffect(() => {
    const next = new URLSearchParams(sp);

    if (dq) {
      next.set('q', dq);
    } else {
      next.delete('q');
    }

    if (region !== 'All') {
      next.set('region', region);
    } else {
      next.delete('region');
    }

    setSp(next, { replace: true });
  }, [dq, region]);

  const filtered = useMemo(() => {
    const qn = dq.trim().toLowerCase();
    return data.filter((c) => {
      const passRegion = region === 'All' || c.region === region;
      const passName = !qn || c.name.common.toLowerCase().includes(qn);
      return passRegion && passName;
    });
  }, [data, dq, region]);

  return (
    <section>
      <h1 style={{ margin: '0 0 16px' }}>Countries</h1>

      <div className="controls-row">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name…"
          aria-label="Search countries"
          className="input"
          style={{ minWidth: 220 }}
        />
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          aria-label="Filter by region"
          className="input"
        >
          {regions.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>

        <button className="btn" onClick={() => fetchAll()}>
          Refresh from API
        </button>

        <span className="muted" style={{ marginLeft: 'auto' }}>
          Showing {filtered.length} / {data.length}
        </span>
      </div>

      {loading && <SkeletonGrid count={8} />}
      {error && <p className="error">Error: {error}. Try refresh (Ctrl/Cmd+R).</p>}

      {!loading && !error && (
        <div className="countries-layout">
          <div className="grid">
            {filtered.map((c) => (
              <article
                key={c.cca2}
                className="card"
                onClick={() => {
                  setSelected(c);                  
                  setTimeout(() => sideRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
                }}
                style={{ cursor: 'pointer' }}
                title="Show on map"
              >
                {c.flags?.svg || c.flags?.png ? (
                  <img
                    src={c.flags.svg ?? c.flags.png!}
                    alt={c.flags.alt ?? `${c.name.common} flag`}
                    className="card-img"
                    loading="lazy"
                  />
                ) : null}
                <div className="card-body">
                  <h3 className="card-title">{c.name.common}</h3>
                  <div className="card-meta">
                    <div>Region: {c.region || '—'}</div>
                    <div>Population: {c.population.toLocaleString()}</div>
                  </div>
                </div>
              </article>
            ))}
            {filtered.length === 0 && (
              <div className="empty">Nothing found. Try another query or region.</div>
            )}
          </div>

          <aside ref={sideRef} className="country-map-card">
            <h3 style={{ marginTop: 0 }}>On the map</h3>
            <div className="map-panel">
              <MapView
                points={
                  selected?.latlng
                    ? [{
                        id: 1,
                        name: selected.name.common,
                        lat: selected.latlng[0],
                        lon: selected.latlng[1],
                      }]
                    : []
                }
                selectedId={1}
              />
            </div>
            <div className="muted" style={{ marginTop: 8 }}>
              {selected
                ? `Selected: ${selected.name.common} ${selected.latlng ? `(${selected.latlng[0].toFixed(2)}, ${selected.latlng[1].toFixed(2)})` : ''}`
                : 'Click a country card to preview its location.'}
            </div>
          </aside>
        </div>
      )}
    </section>
  );
}

function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card skeleton">
          <div className="skeleton-img" />
          <div className="card-body">
            <div className="sk-line" />
            <div className="sk-line short" />
          </div>
        </div>
      ))}
    </div>
  );
}
