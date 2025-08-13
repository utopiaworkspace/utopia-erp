import * as React from 'react';
import * as ReactDOM from 'react-dom/client';

import { createBrowserRouter, RouterProvider } from 'react-router';
import App from './App';
import Layout from './Layout/MainLayout';
import DashboardPage from './Pages';
import MyProfile from './Pages/MyProfile';
import SignInPage from './SignIn/SignIn'; // Import the sign-in page
import RMBDashboard from './RMB/RMBDashboard';
import IncidentPage from './Pages/IncidentPage';
import ClaimPage from './Pages/ClaimPage';
import RMBList from './RMB/RMBList';
import VehicleDashboardLayout from './Layout/ChildLayout';
import ChildLayout from './Layout/ChildLayout';
import RMBEvent from './RMB/RMBEvent';
import VehicleEventDetails from './Pages/VehicleEventDetails';
import ClaimTrackingPage from './Pages/ClaimTracking';


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
            path: '/claims-tracking',
            Component: ClaimTrackingPage,
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
            path: '/rmb',
            Component: ChildLayout,
            children: [
              {
                path: 'vehicles',
                children: [
                  {
                  index: true,
                  Component: RMBList,
                  },
                  {
                  path: 'new', // /vehicles/new
                  Component: RMBList,
                  },
                  {
                  path: ':vehicleId', // /vehicles/:vehicleId
                  Component: RMBList,
                  },
                  {
                  path: ':vehicleId/edit', // /vehicles/:vehicleId/edit
                  Component: RMBList,
                  },
                ],
              },
              {
                path: 'vehicles-dashboard', // /rmb/vehicles-dashboard
                Component: RMBDashboard,
              },
              {
                path: 'vehicles-events',
                children: [
                  {
                    index: true,
                    Component: RMBEvent,
                  },
                  {
                    path: ':vehicleEventId', // /rmb/vehicles-events/:vehicleEventId
                    Component: VehicleEventDetails,
                  },
                ],
              },
            ],
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