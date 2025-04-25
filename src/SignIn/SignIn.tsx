import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import SentimentSatisfiedIcon from '@mui/icons-material/SentimentSatisfied';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import AppTheme from '../SharedTheme/AppTheme';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import ColorModeSelect from '../SharedTheme/ColorModeSelect';
import { GoogleIcon, SitemarkIcon } from './components/CustomIcons';
import { useSession, type Session } from '../SessionContext';
import {
  signInWithGoogle,
  signInWithGithub,
  signInWithCredentials,
} from '../firebase/auth'; // Import your Google login function
// import { useNavigate } from 'react-router-dom'; // Import useNavigate for routing
import { Navigate, useNavigate } from 'react-router';

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: 'auto',
  [theme.breakpoints.up('sm')]: {
    maxWidth: '450px',
  },
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
  ...theme.applyStyles('dark', {
    boxShadow:
      'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
  }),
}));

const SignInContainer = styled(Stack)(({ theme }) => ({
  height: 'calc((1 - var(--template-frame-height, 0)) * 100dvh)',
  minHeight: '100%',
  padding: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(4),
  },
  '&::before': {
    content: '""',
    display: 'block',
    position: 'absolute',
    zIndex: -1,
    inset: 0,
    backgroundImage:
      'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
    backgroundRepeat: 'no-repeat',
    ...theme.applyStyles('dark', {
      backgroundImage:
        'radial-gradient(at 50% 50%, hsla(210, 5.30%, 29.80%, 0.50), hsl(220, 30%, 5%))',
    }),
  },
}));

export default function SignIn(props: { disableCustomTheme?: boolean }) {
  const navigate = useNavigate(); // Hook for navigation
  const { session, setSession, loading } = useSession();
  
  if (session) {
    return <Navigate to="/" />;
  }

  const handleLogin = async () => {
    try {
      let result;
      result = await signInWithGoogle();
      const user = result.user;
      // alert('Welcome, ' + user.displayName);
      if (result?.success && result?.user) {
        // Convert Firebase user to Session format
        const userSession: Session = {
          user: {
            name: result.user.displayName || '',
            email: result.user.email || '',
            image: result.user.photoURL || '',
          },
        };
        setSession(userSession);
        // Redirect to the homepage after login
        navigate('/dashboard/');
        return {};
      }

      
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <SignInContainer>
        <ColorModeSelect sx={{ position: 'fixed', top: '1rem', right: '1rem' }} />
        <Card>
          {/* Logo and Title; replce with your own logo */}
          <SentimentSatisfiedIcon/>
          <Typography
            component="h1"
            variant="h4"
            sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
          >
            Sign In
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={handleLogin}
              startIcon={<GoogleIcon />}
            >
              Sign in with Google
            </Button>
          </Box>
        </Card>
      </SignInContainer>
    </AppTheme>
  );
}