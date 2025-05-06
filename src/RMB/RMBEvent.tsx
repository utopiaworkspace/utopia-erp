import React, { useState, useEffect } from 'react';
import {
  Typography, CircularProgress, Box, Card, CardContent,
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import { db } from '../firebase/firebaseConfig';
import { collection, getDocs, onSnapshot } from 'firebase/firestore';
import VehicleForm from '../components/VehicleForm';
import { DataGrid, GridColDef, useGridApiRef } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation

const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', hide: true },
  { field: 'startDate', headerName: 'Start Date', flex: 1 },
  { field: 'endDate', headerName: 'End Date', flex: 1 },
  { field: 'model', headerName: 'Model', flex: 1 },
  { field: 'quantity', headerName: 'Quantity', flex: 1 },
];

export default function RMBEvent() {
  const apiRef = useGridApiRef();
  const navigate = useNavigate(); // Initialize useNavigate for navigation

  const [vehicleModelCounts, setVehicleModelCounts] = useState<Record<string, number>>({});
  const [vehicleEvents, setVehicleEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false); // State to control the form dialog

  // Fetch initial data (vehicles and events)
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch all vehicles
        const vehiclesCollection = collection(db, 'vehicles');
        const vehiclesSnapshot = await getDocs(vehiclesCollection);
        const vehicles = vehiclesSnapshot.docs.map(doc => doc.data());

        // Calculate the sum of different models
        const modelCounts: Record<string, number> = {};
        vehicles.forEach(vehicle => {
          const model = vehicle.model || 'Unknown';
          modelCounts[model] = (modelCounts[model] || 0) + 1;
        });
        setVehicleModelCounts(modelCounts);

        // Fetch all events from vehicle_event collection
        const eventsCollection = collection(db, 'vehicle_event');
        const eventsSnapshot = await getDocs(eventsCollection);
        const events = eventsSnapshot.docs.map(doc => doc.data());
        setVehicleEvents(events);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []); // Runs once on component mount

  // Subscribe to real-time updates for vehicle_event
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'vehicle_event'), (snapshot) => {
      const vehicleRows = snapshot.docs.map((doc) => {
        const data = doc.data();

        return {
          id: doc.id,
          startDate: data.startDate ?? null,
          endDate: data.endDate ?? null,
          model: data.model ?? '',
          quantity: data.quantity ?? 0,
        };
      });
      console.log('Vehicle Rows:', vehicleRows); // Debugging line

      apiRef.current.setRows(vehicleRows); // Update rows in DataGrid
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, [apiRef]); // Runs whenever apiRef changes

  const handleOpen = () => {
    setOpen(true); // Open the form dialog
  };

  const handleClose = () => {
    setOpen(false); // Close the form dialog
  };

  // Handle row click to navigate to the details page
  const handleRowClick = (params: any) => {
    const eventId = params.row.id; // Get the ID of the clicked row
    navigate(`/vehicles-events/${eventId}`); // Navigate to the details page
  };

  return (
    <Box>
      <Button variant="contained" onClick={handleOpen} sx={{ mb: 3 }}>
        Submit Vehicle Event
      </Button>

      {/* Dialog for VehicleForm */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Submit Vehicle Event</DialogTitle>
        <DialogContent>
          <VehicleForm data={{}} onChange={() => {}} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6">Vehicle Model Counts</Typography>
          {Object.entries(vehicleModelCounts).map(([model, count]) => (
            <Typography key={model}>
              {model}: {count}
            </Typography>
          ))}
        </CardContent>
      </Card>

      <Box sx={{ height: 500, width: '100%' }}>
        <DataGrid
          apiRef={apiRef}
          columns={columns}
          loading={loading}
          onRowClick={handleRowClick} // Add onRowClick handler
        />
      </Box>
    </Box>
  );
}