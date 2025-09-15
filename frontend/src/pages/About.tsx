export default function About() {
  return (
    <section>
      <h1>About this mini portfolio</h1>
      <p>
        This small app demonstrates a clean React + TypeScript + Vite setup with two interactive
        demos: a geo dashboard (OpenLayers map with list, search, and OSRM routing) and a Countries
        explorer (REST Countries API with URL-synced filters and a map preview).
      </p>
      <ul>
        <li>Stack: React 18, TypeScript, Vite, Redux Toolkit, OpenLayers.</li>
        <li>Features: client-side filtering, URL state, local caching, skeletons.</li>
        <li>A11y: focus styles, labels, semantic landmarks.</li>
      </ul>
      <p className="muted">
        The OSRM routing uses the public demo endpoint; for production consider hosting your own or
        using a commercial provider.
      </p>
    </section>
  );
}
