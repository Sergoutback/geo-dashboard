import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store';
import { setItems, setFilter, select } from '../store';
import { fetchPlaces } from '../api/fetchPlaces';
import MapView from '../components/MapView';

export default function Dashboard() {
  const dispatch = useDispatch();
  const { items, filter, selectedId } = useSelector((s: RootState) => s.geo);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // route: chosen ids in click order
  const [routeIds, setRouteIds] = useState<number[]>([]);
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]); // [lon, lat]

  // load items
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await fetchPlaces();
        dispatch(setItems(data));
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load places');
      } finally {
        setLoading(false);
      }
    })();
  }, [dispatch]);

  // restore filter
  useEffect(() => {
    const saved = localStorage.getItem('filter');
    dispatch(setFilter(saved ?? ''));
  }, [dispatch]);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return items;
    return items.filter((p) => (p.name + ' ' + p.city).toLowerCase().includes(q));
  }, [items, filter]);

  const toggleRoute = (id: number) => {
    setRouteIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const buildRoute = () => {
    const seq = routeIds
      .map((id) => filtered.find((p) => p.id === id))
      .filter(Boolean) as typeof filtered;
    const coords = seq.map((p) => [p.lon, p.lat] as [number, number]);
    setRouteCoords(coords);
  };

  const clearRoute = () => {
    setRouteIds([]);
    setRouteCoords([]);
  };

  return (
    <section>
      <h1 style={{ margin: '0 0 16px' }}>Map &amp; List</h1>

      <div className="controls-col" style={{ maxWidth: 520, marginBottom: 12 }}>
        <input
          value={filter}
          onChange={(e) => {
            const v = e.target.value;
            dispatch(setFilter(v));
            localStorage.setItem('filter', v);
          }}
          placeholder="Search places…"
          aria-label="Search places"
          className="input"
        />
        <span className="muted">Showing {filtered.length} / {items.length}</span>
        <div className="list-actions">
          <button className="pill" onClick={buildRoute} disabled={routeIds.length < 2}>
            Build route ({routeIds.length})
          </button>
          <button className="pill" onClick={clearRoute} disabled={!routeIds.length}>
            Clear route
          </button>
        </div>
      </div>

      {loading && <div className="skeleton-map" />}
      {error && <p className="error">Error: {error}</p>}

      {!loading && !error && (
        <div className="dash-grid">
          {/* left column */}
          <aside className="dash-col">
            <ul className="list">
              {filtered.map((p) => {
                const active = routeIds.includes(p.id);
                return (
                  <li
                    key={p.id}
                    className={selectedId === p.id ? 'list-item active' : 'list-item'}
                    title="Click to focus on map"
                    style={{ display: 'flex', gap: 8, alignItems: 'start' }}
                  >
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={() => toggleRoute(p.id)}
                      title="Add to route"
                      style={{ marginTop: 4 }}
                    />
                    <div
                      role="button"
                      onClick={() => dispatch(select(p.id))}
                      style={{ cursor: 'pointer' }}
                    >
                      <strong>{p.name}</strong>
                      <div className="muted">{p.city}</div>
                    </div>
                  </li>
                );
              })}
            </ul>
            {filtered.length === 0 && <div className="empty">No places. Change the search.</div>}
          </aside>

          {/* right column */}
          <div className="map-panel dash-col">
            <MapView
              points={filtered}
              selectedId={selectedId ?? undefined}
              routeCoords={routeCoords}
            />
          </div>
        </div>
      )}
    </section>
  );
}
