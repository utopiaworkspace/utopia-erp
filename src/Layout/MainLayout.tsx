import * as React from 'react'; // Import React library
import LinearProgress from '@mui/material/LinearProgress'; // Import loading bar component
import { Outlet, Navigate, useLocation } from 'react-router-dom'; // ✅ Correct import from react-router-dom
import { DashboardLayout } from '@toolpad/core/DashboardLayout'; // Import dashboard layout
import { PageContainer } from '@toolpad/core/PageContainer'; // Import page container
import { useSession } from '../SessionContext'; // Import custom hook for user session

export default function Layout() {
  const { session, loading } = useSession(); // Get user session and loading status
  const location = useLocation(); // Get current page location

  if (loading) { // If still checking login status
    return (
      <div style={{ width: '100%' }}>
        <LinearProgress /> {/* Show a loading bar */}
      </div>
    );
  }

  if (!session) { // If user is not logged in
    // Prepare redirect URL to come back after login
    const redirectTo = `/sign-in?callbackUrl=${encodeURIComponent(location.pathname)}`;

    return <Navigate to={redirectTo} replace />; // Redirect to login page
  }

  return (
    <>
      {/* Show this orange badge only in staging environment */}
      {import.meta.env.VITE_ENV === 'staging' && (
        <div
          style={{
            position: 'fixed', // Fix the badge position
            top: 70, // 70px from the top
            right: 16, // 16px from the right
            background: 'orange', // Orange background
            color: 'white', // White text
            padding: '6px 12px', // Padding inside the badge
            borderRadius: '6px', // Rounded corners
            zIndex: 9999, // Show above other elements
            fontWeight: 'bold', // Bold text
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)', // Shadow for better look
          }}
        >
          🧪 Staging Environment {/* Text: Staging Environment */}
        </div>
      )}

      <DashboardLayout> {/* Main dashboard layout */}
        <PageContainer> {/* Container for page content */}
          <Outlet /> {/* Show the current page here */}
        </PageContainer>
      </DashboardLayout>
    </>
  );
}
