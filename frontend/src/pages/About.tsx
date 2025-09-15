export default function About() {
  return (
    <main className="container" style={{ padding: 24 }}>
      <h1 style={{ marginTop: 0 }}>About this mini-portfolio</h1>

      <section className="grid" style={{ marginTop: 16 }}>
        <article className="card">
          <div className="card-body">
            <h2 className="card-title">What it does</h2>
            <p className="card-meta">
              • Dashboard: map + list with route building (OSRM + fallback).<br />
              • Countries: searchable catalog with caching and URL params.<br />
              • Clean layout: sticky header, responsive grid, safe map column.
            </p>
          </div>
        </article>

        <article className="card">
          <div className="card-body">
            <h2 className="card-title">Tech stack</h2>
            <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.6 }}>
              <li>React + React Router</li>
              <li>Redux</li>
              <li>Vite</li>
              <li>OpenLayers</li>
              <li>REST Countries API</li>
            </ul>
          </div>
        </article>

        <article className="card">
          <div className="card-body">
            <h2 className="card-title">Highlights</h2>
            <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.6 }}>
              <li>Route building with camera fit</li>
              <li>ResizeObserver + rAF for reliable map sizing</li>
              <li>Local caching + URL params on Countries</li>
              <li>Responsive layout with safe map column</li>
            </ul>
          </div>
        </article>
      </section>
    </main>
  );
}
