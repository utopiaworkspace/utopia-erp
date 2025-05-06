import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase/firebaseConfig';
import { doc, onSnapshot } from 'firebase/firestore';
import { Typography, CircularProgress, Box } from '@mui/material';

export default function VehicleEventDetails() {
  const { vehicleEventId } = useParams(); // Retrieve the vehicleEventId from the URL
  const [eventDetails, setEventDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!vehicleEventId) return;

    const eventDocRef = doc(db, 'vehicle_event', vehicleEventId);

    // Subscribe to real-time updates for the specific event
    const unsubscribe = onSnapshot(eventDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        setEventDetails(docSnapshot.data());
      } else {
        console.error('Event not found');
        setEventDetails(null);
      }
      setLoading(false);
    }, (error) => {
      console.error('Error fetching event details:', error);
      setLoading(false);
    });

    // Cleanup subscription on component unmount
    return () => unsubscribe();
  }, [vehicleEventId]);

  if (loading) {
    return <CircularProgress />;
  }

  if (!eventDetails) {
    return <Typography variant="h6">Event not found</Typography>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Vehicle Event Details
      </Typography>
      <Typography>ID: {vehicleEventId}</Typography>
      <Typography>Model: {eventDetails.model}</Typography>
      <Typography>Start Date: {eventDetails.startDate}</Typography>
      <Typography>End Date: {eventDetails.endDate}</Typography>
      <Typography>Quantity: {eventDetails.quantity}</Typography>
    </Box>
  );
}