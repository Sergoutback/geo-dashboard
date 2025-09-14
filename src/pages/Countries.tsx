import { useEffect, useMemo, useState } from 'react';

type Country = {
  cca2: string;
  name: { common: string };
  region: string;
  population: number;
  flags: { svg?: string; png?: string; alt?: string };
};

const API =
  'https://restcountries.com/v3.1/all?fields=name,cca2,region,flags,population';

export default function Countries() {
  const [data, setData] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [q, setQ] = useState('');
  const [region, setRegion] = useState('All');

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(API, { signal: ctrl.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as Country[];
        
        json.sort((a, b) => a.name.common.localeCompare(b.name.common));
        setData(json);
        setError(null);
      } catch (e: unknown) {
  
    if (e instanceof DOMException && e.name === 'AbortError') return;      
      const msg = e instanceof Error ? e.message : 'Failed to load';
      setError(msg);
    }
    finally {
        setLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, []);

  const regions = useMemo(() => {
  const set = new Set<string>(data.map(c => c.region).filter(Boolean) as string[]);
  return ['All', ...Array.from(set).sort()];
}, [data]);

useEffect(() => {
  const ctrl = new AbortController();
  (async () => {
    try {
      setLoading(true);
      const res = await fetch(API, { signal: ctrl.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as Country[];
      json.sort((a, b) => a.name.common.localeCompare(b.name.common));
      setData(json);
      setError(null);
    } catch (e: unknown) {
      if (e instanceof DOMException && e.name === 'AbortError') return;
      const msg = e instanceof Error ? e.message : 'Failed to load';
      setError(msg);
    } finally {
      setLoading(false);
    }
  })();
  return () => ctrl.abort();
}, []);


  const filtered = useMemo(() => {
    const qn = q.trim().toLowerCase();
    return data.filter((c) => {
      const byRegion = region === 'All' || c.region === region;
      const byName =
        !qn || c.name.common.toLowerCase().includes(qn);
      return byRegion && byName;
    });
  }, [data, q, region]);

  return (
    <main style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 16 }}>Countries</h2>
      
      <div
        style={{
          display: 'flex',
          gap: 12,
          flexWrap: 'wrap',
          marginBottom: 16,
          alignItems: 'center',
        }}
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name…"
          aria-label="Search countries"
          style={{
            padding: 8,
            minWidth: 220,
            border: '1px solid #ddd',
            borderRadius: 6,
          }}
        />
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          aria-label="Filter by region"
          style={{ padding: 8, border: '1px solid #ddd', borderRadius: 6 }}
        >
          {regions.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>

        <span style={{ marginLeft: 'auto', color: '#666' }}>
          Showing {filtered.length} / {data.length}
        </span>
      </div>
      
      {loading && <p>Loading countries…</p>}
      {error && (
        <p style={{ color: 'crimson' }}>
          Error: {error}. Try refresh (Ctrl+R).
        </p>
      )}
      
      {!loading && !error && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 16,
          }}
        >
          {filtered.map((c) => (
            <article
              key={c.cca2}
              style={{
                border: '1px solid #eee',
                borderRadius: 10,
                overflow: 'hidden',
                background: '#fff',
                boxShadow:
                  '0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)',
              }}
            >
              {c.flags?.svg || c.flags?.png ? (
                <img
                  src={c.flags.svg ?? c.flags.png!}
                  alt={c.flags.alt ?? `${c.name.common} flag`}
                  style={{
                    width: '100%',
                    height: 120,
                    objectFit: 'cover',
                    display: 'block',
                    background: '#f7f7f7',
                  }}
                  loading="lazy"
                />
              ) : null}
              <div style={{ padding: 12 }}>
                <h3 style={{ margin: '0 0 6px' }}>{c.name.common}</h3>
                <div style={{ fontSize: 14, color: '#555' }}>
                  <div>Region: {c.region || '—'}</div>
                  <div>
                    Population:{' '}
                    {c.population.toLocaleString(undefined)}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
