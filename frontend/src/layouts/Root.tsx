import { NavLink, Outlet } from 'react-router-dom';

const linkStyle: React.CSSProperties = {
  padding: '8px 10px',
  borderRadius: 8,
  textDecoration: 'none',
  color: 'inherit',
};

export default function Root() {
  return (
    <div className="shell">
      <header className="site-header">
        <div className="container row">
          <div className="brand"><a href="/">Mini Portfolio</a></div>
          <nav className="nav">
            <NavLink
              to="/"
              end
              style={({ isActive }) => ({
                ...linkStyle,
                background: isActive ? 'var(--nav-active-bg)' : 'transparent',
              })}
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/countries"
              style={({ isActive }) => ({
                ...linkStyle,
                background: isActive ? 'var(--nav-active-bg)' : 'transparent',
              })}
            >
              Countries
            </NavLink>
            <NavLink
              to="/about"
              style={({ isActive }) => ({
                ...linkStyle,
                background: isActive ? 'var(--nav-active-bg)' : 'transparent',
              })}
            >
              About
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="container" style={{ padding: 24 }}>
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="container row">
          <span>© {new Date().getFullYear()} Your Name</span>
          <span style={{ opacity: 0.7 }}>React + TS + OpenLayers demo</span>
        </div>
      </footer>
    </div>
  );
}
