import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store';
import { setItems, setFilter, select } from '../store';
import { fetchPlaces } from '../api/fetchPlaces';
import MapView from '../components/MapView';

export default function Dashboard() {
  const dispatch = useDispatch();
  const { items, filter, selectedId } = useSelector((s: RootState) => s.geo);

  useEffect(() => {
    fetchPlaces().then((data) => dispatch(setItems(data)));
  }, [dispatch]);

  useEffect(() => {
    const saved = localStorage.getItem('filter');
    if (saved) dispatch(setFilter(saved));
  }, [dispatch]);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return items;
    return items.filter((p) => (p.name + ' ' + p.city).toLowerCase().includes(q));
  }, [items, filter]);

  return (
    <main style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 16, padding: 24 }}>
      <aside>
        <h2>Filters</h2>
        <input
          value={filter}
          onChange={(e) => {
            const v = e.target.value;
            dispatch(setFilter(v));
            localStorage.setItem('filter', v);
          }}
          placeholder="Search…"
          style={{ width: '100%', padding: 8 }}
        />
        <ul style={{ marginTop: 16 }}>
          {filtered.map((p) => (
            <li key={p.id} style={{ cursor: 'pointer' }} onClick={() => dispatch(select(p.id))}>
              {p.name} — {p.city} {selectedId === p.id ? '⭐' : ''}
            </li>
          ))}
        </ul>
      </aside>
      <section>
        <h2>Map & List</h2>
        <MapView points={filtered} />
      </section>
    </main>
  );
}
