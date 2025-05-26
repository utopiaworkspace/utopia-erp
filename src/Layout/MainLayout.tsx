import * as React from 'react'; // Import React library
import LinearProgress from '@mui/material/LinearProgress'; // Import loading bar component
import { Outlet, Navigate, useLocation } from 'react-router'; // Import routing tools
import { DashboardLayout } from '@toolpad/core/DashboardLayout'; // Import dashboard layout
import { PageContainer } from '@toolpad/core/PageContainer'; // Import page container
import { useSession } from '../SessionContext'; // Import custom hook for user session

export default function Layout() {
  const { session, loading } = useSession(); // Get user session and loading status
  const location = useLocation(); // Get current page location

  if (loading) { // If still checking login status
    return (
      <div style={{ width: '100%' }}>
        <LinearProgress /> // Show a loading bar
      </div>
    );
  }

  if (!session) { // If user is not logged in
    // Prepare redirect URL to come back after login
    const redirectTo = `/sign-in?callbackUrl=${encodeURIComponent(location.pathname)}`;

    return <Navigate to={redirectTo} replace />; // Redirect to login page
  }

  return (
    <DashboardLayout> // Main dashboard layout
      <PageContainer> // Container for page content
        <Outlet /> // Show the current page here
      </PageContainer>
    </DashboardLayout>
  );
}
