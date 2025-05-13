import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { createTheme } from '@mui/material/styles';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DriveEtaIcon from '@mui/icons-material/DriveEta';
import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { useDemoRouter } from '@toolpad/core/internal';
import RMBList from '../RMB/RMBList'; // <- your CRUD component
import { PageContainer } from '@toolpad/core/PageContainer';
import { Outlet } from 'react-router';



export default function RMBLayout() {

  return (
    
     
        <Outlet />
    
    
  );
}
