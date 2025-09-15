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
    <main
      style={{
        display: 'grid',
        gridTemplateColumns: '260px 1fr',
        gap: 16,
        padding: 24,
        alignItems: 'start',
      }}
    >      
      <section>
        <h2>Map & List</h2>
        <div style={{ height: 420 }}>
        <MapView points={filtered} selectedId={selectedId} />
        </div>
        <ul>
          {filtered.map((p) => (
            <li
              key={p.id}
              onClick={() => dispatch(select(p.id))}
              style={{
                cursor: 'pointer',
                fontWeight: selectedId === p.id ? 700 : 400,
              }}
            >
              {p.name} — {p.city}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
