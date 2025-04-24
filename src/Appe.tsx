import * as React from 'react';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ReportIcon from '@mui/icons-material/Report';
import { ReactRouterAppProvider } from '@toolpad/core/react-router';
import { Outlet, useNavigate } from 'react-router';
import type { Navigation } from '@toolpad/core';
import {
  firebaseSignOut,
  signInWithGoogle,
  onAuthStateChanged,
} from './firebase/auth';
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
    segment: 'claims',
    title: 'Claims',
    icon: <ReceiptLongIcon />,
  },
  {
    segment: 'incidents',
    title: 'Incident Management',
    icon: <ReportIcon />,
  },
  {
    segment: 'my-profile',
    title: 'My Profile',
    icon: <AccountCircleIcon />,
  },
];

const BRANDING = {
  title: 'Utopia',
};

const AUTHENTICATION: Authentication = {
  signIn: signInWithGoogle,
  signOut: firebaseSignOut,
};

export default function App() {
  const [session, setSession] = React.useState<Session | null>(null);
  const [loading, setLoading] = React.useState(true);

  const sessionContextValue = React.useMemo(
    () => ({
      session,
      setSession,
      loading,
    }),
    [session, loading],
  );

  React.useEffect(() => {
    // Returns an `unsubscribe` function to be called during teardown
    const unsubscribe = onAuthStateChanged((user: User | null) => {
      if (user) {
        setSession({
          user: {
            name: user.displayName || '',
            email: user.email || '',
            image: user.photoURL || '',
          },
        });
      } else {
        setSession(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <ReactRouterAppProvider
      navigation={NAVIGATION}
      branding={BRANDING}
      session={session}
      authentication={AUTHENTICATION}
    >
      <SessionContext.Provider value={sessionContextValue}>
        <Outlet />
      </SessionContext.Provider>
    </ReactRouterAppProvider>
  );
}
