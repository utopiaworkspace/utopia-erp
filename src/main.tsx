import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';
import App from './Appe';
import Layout from './Layout/Dashboard';
import DashboardPage from './Pages';
import ClaimPage from './Pages/ClaimPage';
import MyProfile from './Pages/MyProfile';
import IncidentPage from './Pages/IncidentPage';
import SignInPage from './SignIn/SignIn'; // Import the sign-in page

const router = createBrowserRouter([
  {
    Component: App,
    children: [
      {
        path: '/',
        Component: Layout,
        children: [
          {
            path: '/',
            Component: DashboardPage,
          },
          {
            path: '/claims',
            Component: ClaimPage,
          },
          {
            path: '/incidents',
            Component: IncidentPage,
          },
          {
            path: '/my-profile',
            Component: MyProfile,
          },
        ],
      },
      {
        path: '/sign-in',
        Component: SignInPage,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);