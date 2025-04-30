import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';
import App from './App';
import Layout from './Layout/Dashboard';
import DashboardPage from './Pages';
import MyProfile from './Pages/MyProfile';
import SignInPage from './SignIn/SignIn'; // Import the sign-in page
import RMBDashboard from './RMB/RMBDashboard';
import IncidentPage from './Pages/IncidentPage';
import ClaimPage from './Pages/ClaimPage';


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
          {
            path: '/rmb-dashboard',
            Component: RMBDashboard,
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