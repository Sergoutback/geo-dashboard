import { useState } from 'react';

export default function App() {
  const [count, setCount] = useState(0);
  return (
    <main style={{ padding: 24, fontFamily: 'system-ui' }}>
      <h1>Geo Dashboard</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount((c) => c + 1)}>Increment</button>
    </main>
  );
}
