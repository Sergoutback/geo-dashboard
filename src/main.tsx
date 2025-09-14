import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { store } from './store';

import Root from './layouts/Root';
import Dashboard from './pages/Dashboard';
import App from './App';

import './index.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />, // содержит <nav> и <Outlet/>
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'about', element: <App /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>,
);
