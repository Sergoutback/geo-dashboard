import { Link, Outlet } from 'react-router-dom';

export default function Root() {
  return (
    <div>
      <nav style={{ padding: 12, borderBottom: '1px solid #eee' }}>
        <Link to="/" style={{ marginRight: 12 }}>Dashboard</Link>
        <Link to="/about">About</Link>
      </nav>
      <Outlet />
    </div>
  );
}
