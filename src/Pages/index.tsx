import * as React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import LinearProgress from '@mui/material/LinearProgress';
import { Navigate, useLocation } from 'react-router';
import { useSession } from '../SessionContext';

export default function DashboardPage() {
  const { session, loading } = useSession();
  if (loading) {
    return <LinearProgress />;
  }
  if (!session) {
    return <Navigate to="/sign-in" state={{ from: location }} />;
  }
  const { user } = session;


  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh" p={2}>
      <Card sx={{ maxWidth: 600, width: '100%', p: 3, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            Welcome!
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontWeight: 'bold',
              backgroundColor: (theme) => theme.palette.action.selected,
              borderRadius: 1,
              px: 1.5,
              py: 0.5,
              display: 'inline-block',
            }}
          >
            {user.email}
          </Typography>


          <Typography variant="body1" sx={{ mt: 2 }}>
            This platform allows you to submit <strong>claims</strong> and <strong>incident reports</strong>.
            <br />
            Please use the menu to navigate to the appropriate page and begin the process.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
