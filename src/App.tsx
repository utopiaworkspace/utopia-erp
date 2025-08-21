import * as React from 'react';
import { createTheme } from '@mui/material/styles';
import { grey } from '@mui/material/colors';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ReportIcon from '@mui/icons-material/Report';
import { ReactRouterAppProvider } from '@toolpad/core/react-router';
import { Outlet } from 'react-router';
import type { Navigation } from '@toolpad/core';
import { History } from '@mui/icons-material';
import { supabase } from "./supabase/supabaseClient";

import SessionContext, { type Session } from './SessionContext';

const NAVIGATION: Navigation = [
  {
    kind: 'header',
    title: 'Main items',
  },
  {
    title: 'Dashboard',
    icon: <DashboardIcon />,
  },
  {
    kind: 'divider',
  },
  {
    segment: 'claims',
    title: 'Claims',
    icon: <ReceiptLongIcon />,
  },
  {
    segment: 'claims-tracking',
    title: 'Claim Tracking',
    icon: <History />,
  },
  {
    segment: 'incidents',
    title: 'Incident Report',
    icon: <ReportIcon />,
  },
  {
    segment: 'my-profile',
    title: 'My Profile',
    icon: <AccountCircleIcon />,
  },
];

const BRANDING = {
  logo: <img src="/utopia-logo.png" alt="Utopia Logo" style={{ height: 40 }} />,
  title: 'Utopia',
};

const demoTheme = createTheme({
  cssVariables: {
    colorSchemeSelector: 'data-toolpad-color-scheme',
  },
  colorSchemes: {
    light: {
      palette: {
        mode: 'light',
        primary: { main: '#009688' },
        secondary: { main: '#F57C00' },
        background: { default: '#FFFFFF', paper: '#F9F9F9' },
        text: { primary: '#212121', secondary: '#616161' },
      },
    },
    dark: {
      palette: {
        mode: 'dark',
        primary: { main: '#4DB6AC' },
        secondary: { main: '#FF9800' },
        background: { default: '#121212', paper: '#1E1E1E' },
        text: { primary: '#FFFFFF', secondary: '#BDBDBD' },
      },
    },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: '"Segoe UI", "Roboto", "Arial", sans-serif',
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    button: {
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 24px #0001',
        },
      },
    },
  },
});

// ✅ Replacing Firebase with Supabase authentication
const AUTHENTICATION = {
  signIn: async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });

    if (error) {
      console.error('Supabase sign-in error:', error.message);
    }
  },
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Supabase sign-out error:', error.message);
    }
  },
};

export default function App() {
  const [session, setSession] = React.useState<Session | null>(null);
  const [loading, setLoading] = React.useState(true);

  // ✅ Redirect from web.app → app.utopiagroup.com.my (only in production)
  React.useEffect(() => {
    if (
      import.meta.env.VITE_ENV === 'production' &&
      window.location.hostname.includes('web.app')
    ) {
      window.location.href = 'https://app.utopiagroup.com.my';
    }
  }, []);

  // ✅ Track Supabase auth state
  React.useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, sessionData) => {
      if (sessionData?.user) {
        const { user } = sessionData;
        setSession({
          user: {
            name: user.user_metadata?.full_name || '',
            email: user.email || '',
            image: user.user_metadata?.avatar_url || '',
          },
        });
      } else {
        setSession(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const sessionContextValue = React.useMemo(
    () => ({ session, setSession, loading }),
    [session, loading]
  );

  return (
    <ReactRouterAppProvider
      navigation={NAVIGATION}
      branding={BRANDING}
      session={session}
      authentication={AUTHENTICATION}
      theme={demoTheme}
    >
      <SessionContext.Provider value={sessionContextValue}>
        <Outlet />
      </SessionContext.Provider>
    </ReactRouterAppProvider>
  );
}
