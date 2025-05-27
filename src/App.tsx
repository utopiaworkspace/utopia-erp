import * as React from 'react';
import { createTheme } from '@mui/material/styles';
import { grey } from '@mui/material/colors';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ReportIcon from '@mui/icons-material/Report';
import { ReactRouterAppProvider } from '@toolpad/core/react-router';
import SentimentSatisfiedIcon from '@mui/icons-material/SentimentSatisfied';
import { Outlet, useNavigate } from 'react-router';
import type { Navigation } from '@toolpad/core';
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler';
import CarRentalIcon from '@mui/icons-material/CarRental';
import EventIcon from '@mui/icons-material/Event';
import FeaturedPlayListIcon from '@mui/icons-material/FeaturedPlayList';
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
    kind: 'divider',
  },
  {
    segment: 'claims',
    title: 'Claims',
    icon: <ReceiptLongIcon />,
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
  {
    kind: 'divider',
  },
  // {
  //   segment: 'rmb',
  //   title: 'RMB',
  //   icon: <TwoWheelerIcon />,
  //   children: [
  //     {
  //       segment: 'vehicles',
  //       title: 'Vehicles',
  //       icon: <FeaturedPlayListIcon />,
  //       // pattern: 'vehicles{/:vehiclesId}*',
  //     },
  //     {
  //       segment: 'vehicles-dashboard',
  //       title: 'Vehicles Dashboard',
  //       icon: <CarRentalIcon />,
    
  //     },
  //     {
  //       segment: 'vehicles-events',
  //       title: 'Vehicles Events',
  //       icon: <EventIcon />,
    
  //     },
  //   ]
  // },
  
];

const BRANDING = {
  logo: <img src="/utopia-logo.png" alt="Utopia Logo" style={{ height: 40 }} />,
  title: 'Utopia',
};

const demoTheme = createTheme({
// 这里的配置决定了全局配色、圆角、字体等

  cssVariables: {
    colorSchemeSelector: 'data-toolpad-color-scheme',
  },
  colorSchemes: {
    light: {
      palette: {
        mode: 'light',
        primary: {
          main: '#009688', // Utopia green
          // previously using main: grey[800] // dark grey for buttons/text
        },
        secondary: {
          main: '#F57C00', // Utopia Orange
          // previously using main: grey[500] // medium grey
        },
        background: {
          default: '#FFFFFF',
          paper: '#F9F9F9',
        },
        text: {
          primary: '#212121',
          secondary: '#616161',
        },
      }
    },
    dark: {
      palette: {
        mode: 'dark',
        primary: {
          main: '#4DB6AC', // 暗色背景下的 Utopia Green 较浅色
          // previosly using main: grey[300], // light grey for contrast on dark bg
        },
        secondary: {
          main: '#FF9800', // 橙色点缀
          // previously using main: grey[500],
        },
        background: {
          default: '#121212',
          paper: '#1E1E1E',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#BDBDBD',
        },
      },
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 600,
      lg: 1200,
      xl: 1536,
    },
  },
  shape: { borderRadius: 12 },
  typography: {
  fontFamily: '"Segoe UI", "Roboto", "Arial", sans-serif',  // ✅ 主字体
  fontWeightRegular: 400, // ✅ 正文字体粗细
  fontWeightMedium: 500,
  fontWeightBold: 700,
  button: { // ✅ 按钮专属设定
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
},
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,           // 按钮圆角
          textTransform: 'none',     // 按钮文字不全大写
          fontWeight: 600,           // 按钮字体加粗
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,          // 卡片圆角
          boxShadow: '0 4px 24px #0001', // 卡片阴影
        },
      },
    },
  },
});

const AUTHENTICATION: Authentication = {
  signIn: signInWithGoogle,
  signOut: firebaseSignOut,
};

export default function App() {
  const [session, setSession] = React.useState<Session | null>(null);
  const [loading, setLoading] = React.useState(true);

  // ✅ 自动跳转 web.app → app.utopiagroup.com.my（仅 production 环境）
  React.useEffect(() => { // Run this effect once when the App loads
    if (
      import.meta.env.VITE_ENV === 'production' && // Only run in production environment
      window.location.hostname.includes('web.app') // Only if the domain contains 'web.app'
    ) {
      window.location.href = 'https://app.utopiagroup.com.my'; // Redirect to your main domain
    }
  }, []); // Empty array means this runs only once when the component mounts

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
      theme={demoTheme}
    >
      <SessionContext.Provider value={sessionContextValue}>
        <Outlet />
      </SessionContext.Provider>
    </ReactRouterAppProvider>
  );
}
