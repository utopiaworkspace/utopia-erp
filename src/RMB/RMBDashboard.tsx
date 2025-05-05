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
import { onSnapshot, collection } from 'firebase/firestore';
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
];

export default function RMBDashboard() {
  const apiRef = useGridApiRef();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'vehicles'), (snapshot) => {
      const vehicleRows = snapshot.docs.map((doc) => {
        const data = doc.data();

        return {
          id: doc.id,
          plateNumber: data.plateNumber ?? '',
          location: data.location ?? '',
          type: data.type ?? '',
          gps: data.gps ?? false,
          roadTaxExpiry: data.roadTaxExpiry ?? null,
          model: data.model ?? '',
        };
      });
      console.log('Vehicle Rows:', vehicleRows); // Debugging line

      apiRef.current.setRows(vehicleRows);
      setLoading(false);
    });

    return () => unsubscribe();
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
