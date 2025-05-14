import React, { useState, useEffect } from 'react';
import {
  DataGrid,
  GridColDef,
  useGridApiRef,
} from '@mui/x-data-grid';
import {
  Typography,
  Box,
} from '@mui/material';
import { onSnapshot, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig'; // adjust path to your Firebase config
import { useSession } from '../SessionContext';

const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', hide: true },
  { field: 'plateNumber', headerName: 'Plate Number', flex: 1 },
  { field: 'location', headerName: 'Location', flex: 1 },
  { field: 'type', headerName: 'Type', flex: 1 },
  { field: 'gps', headerName: 'GPS', type: 'boolean' },
  {
    field: 'roadTaxExpiry',
    headerName: 'Road Tax Expiry',
    type: 'date',
    valueGetter: (params) => {
      const expiry = params?.row?.roadTaxExpiry;
      return expiry?.toDate ? expiry.toDate() : expiry ?? null;
    },
    flex: 1,
  },
  { field: 'model', headerName: 'Model', flex: 1 },
  { field: 'status', headerName: 'Status', flex: 1  },
];

export default function RMBDashboard() {
  const apiRef = useGridApiRef();
  const [loading, setLoading] = useState(true);

  // Realtime sync on vehicles
  useEffect(() => {
    const unsubscribeVehicles = onSnapshot(collection(db, 'vehicles'), async (vehicleSnapshot) => {
      // Fetch all vehicle events once
      const eventSnapshot = await getDocs(collection(db, 'vehicle_event'));
      const events = eventSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const today = new Date();
  
      const vehicleRows = vehicleSnapshot.docs.map((doc) => {
        const data = doc.data();
        const plate = data.plateNumber;
  
        // Get all events for this vehicle
        const vehicleEvents = events.filter(event => event.plateNum === plate);
  
        // Determine status logic
        let status = 'available';

        const isOverdue = (event) => {
          const endDate = new Date(event.endDate);
          const isClosed = event?.status === 'closed';
          return endDate < today && !isClosed;
        };
  
        // Priority-based status check (adjust order of precedence as needed)
        const isActive = (event) => {
          const startDate = new Date(event.startDate);
          const endDate = new Date(event.endDate);
          return startDate <= today && today <= endDate;
        };
  
        if (vehicleEvents.some(e => e.type_event === 'service' && isActive(e))) {
          const isAnyOverdue = vehicleEvents.some(e => e.type_event === 'service' && isOverdue(e));
          status = isAnyOverdue ? 'in-service-overdue' : 'in-service';
        
        } else if (vehicleEvents.some(e => e.type_event === 'reserved' && isActive(e))) {
          const isAnyOverdue = vehicleEvents.some(e => e.type_event === 'reserved' && isOverdue(e));
          status = isAnyOverdue ? 'reserved-overdue' : 'reserved';
        
        } else if (vehicleEvents.some(e => e.type_event === 'order' && isActive(e))) {
          const isAnyOverdue = vehicleEvents.some(e => e.type_event === 'order' && isOverdue(e));
          status = isAnyOverdue ? 'occupied-overdue' : 'occupied';
        
        } else if (vehicleEvents.some(e => isOverdue(e))) {
          // Catch-all if any event is overdue but not currently active
          status = 'overdue';
        }
  
        return {
          id: doc.id,
          plateNumber: plate ?? '',
          location: data.location ?? '',
          type: data.type ?? '',
          gps: data.gps ?? false,
          roadTaxExpiry: data.roadTaxExpiry ?? null,
          model: data.model ?? '',
          status,
        };
      });
  
      apiRef.current.setRows(vehicleRows);
      setLoading(false);
    });
  
    return () => unsubscribeVehicles(); // Cleanup on unmount
  }, [apiRef]);
  


  return (
    <>
      <Typography variant="h5" gutterBottom>
        RMB Dashboard
      </Typography>

      <Box sx={{ height: 500, width: '100%' }}>
        <DataGrid
          apiRef={apiRef}
          columns={columns}
        //   rows={[]} // rows are managed via apiRef
          loading={loading}
          showToolbar
        //   slots={{
        //     toolbar: undefined, // or add GridToolbar if needed
        //   }}
        />
      </Box>
    </>
  );
}
