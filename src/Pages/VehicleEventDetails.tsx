import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase/firebaseConfig';
import { doc, getDoc, setDoc, onSnapshot, updateDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import { Typography, CircularProgress, Box, TextField, Button, MenuItem } from '@mui/material';
import { useSession } from '../SessionContext';

export default function VehicleEventDetails() {
  const { session } = useSession(); // Get session data
  const [userData, setUserData] = useState<any>(null); // State to store user data
  const { vehicleEventId } = useParams(); // Retrieve the vehicleEventId from the URL
  console.log('Vehicle Event ID:', vehicleEventId); // Debugging line
  const navigate = useNavigate(); // For navigation after deletion
  const [eventDetails, setEventDetails] = useState<any>({
    model: '',
    startDate: '',
    endDate: '',
    quantity: '',
    plateNum: '',
    type_event: '',
    cust_name: '',
    assigned: '',
  });
  const [loading, setLoading] = useState(true);
  const [plateNumbers, setPlateNumbers] = useState<string[]>([]); // State for plate numbers dropdown

  const { user } = session;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRef = doc(db, 'users', user.email);
        const userDoc = await getDoc(userRef);
        const userInfo = userDoc.data();
        setUserData(userInfo);
        console.log('User Info:', userInfo); // Debugging line
    
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    fetchData(); // Fetch user data when the component mounts
  }, [user.email]); // Fetch user data when the component mounts or user email changes
      

  useEffect(() => {
    if (!vehicleEventId) return;

    const eventDocRef = doc(db, 'vehicle_event', vehicleEventId);

    // Subscribe to real-time updates for the specific event
    const unsubscribe = onSnapshot(eventDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const eventData = docSnapshot.data();
        setEventDetails(eventData);

        // Fetch plate numbers for the same model
        if (eventData.model) {
          fetchPlateNumbers(eventData.model);
        }
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

  const fetchPlateNumbers = async (model: string) => {
    try {
      const vehiclesCollection = collection(db, 'vehicles');
      const vehiclesSnapshot = await getDocs(vehiclesCollection);
      const vehicles = vehiclesSnapshot.docs
        .map((doc) => doc.data())
        .filter((vehicle) => vehicle.model === model)
        .map((vehicle) => vehicle.plateNumber);
      setPlateNumbers(vehicles);
    } catch (error) {
      console.error('Error fetching plate numbers:', error);
    }
  };

  const handleChange = (field: string, value: string) => {
    setEventDetails((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!vehicleEventId) return;
  
    const eventDocRef = doc(db, 'vehicle_event', vehicleEventId);
  
    try {
      // Get existing event data
      const eventSnapshot = await getDoc(eventDocRef);
      const existingData = eventSnapshot.data();
  
      // Determine if 'assigned' needs to be set
      const assignedPerson = existingData?.assigned || userData?.shortName || '';
  
      // Merge current event details with the assigned person (only if not already set)
      const updatedEvent = {
        ...eventDetails,
        assigned: assignedPerson,
      };
  
      console.log('Updated Event Details:', updatedEvent); // Debugging line
  
      await setDoc(eventDocRef, updatedEvent, { merge: true });
  
      alert('Event updated successfully!');
    } catch (error) {
      console.error('Error updating event:', error);
      alert('Failed to update event.');
    }
  };
  

  const handleDelete = async () => {
    if (!vehicleEventId) return;

    const eventDocRef = doc(db, 'vehicle_event', vehicleEventId);

    try {
      await deleteDoc(eventDocRef); // Delete Firestore document
      alert('Event deleted successfully!');
      navigate('/rmb/vehicles-events'); // Navigate back to the events list
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event.');
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (!eventDetails) {
    return <Typography variant="h6">Event not found</Typography>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Edit Vehicle Event
      </Typography>
      <Box display="flex" flexDirection="column" gap={2} mt={2}>
        <TextField
          label="Model"
          value={eventDetails.model}
          onChange={(e) => handleChange('model', e.target.value)}
          fullWidth
        />
        <TextField
          label="Start Date"
          value={eventDetails.startDate}
          onChange={(e) => handleChange('startDate', e.target.value)}
          fullWidth
        />
        <TextField
          label="End Date"
          value={eventDetails.endDate}
          onChange={(e) => handleChange('endDate', e.target.value)}
          fullWidth
        />
        <TextField
          label="Quantity"
          type="number"
          value={eventDetails.quantity}
          onChange={(e) => handleChange('quantity', e.target.value)}
          fullWidth
        />
        <TextField
          label="Plate Number"
          select
          value={eventDetails.plateNum}
          onChange={(e) => handleChange('plateNum', e.target.value)}
          fullWidth
        >
          {plateNumbers.map((plateNum) => (
            <MenuItem key={plateNum} value={plateNum}>
              {plateNum}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Type of Event"
          value={eventDetails.type_event}
          onChange={(e) => handleChange('type_event', e.target.value)}
          fullWidth>
          <MenuItem value="order">Order</MenuItem>
          <MenuItem value="repair">repair</MenuItem>
          <MenuItem value="service">Service</MenuItem>
        </TextField>
        <TextField
          label="Customer Name"
          value={eventDetails.cust_name}
          onChange={(e) => handleChange('cust_name', e.target.value)}
          fullWidth
        />
        <TextField
          label="Assigned Person"
          name="assigned"
          value={eventDetails.assigned || userData?.shortName || ''} // Use eventDetails.assigned if it exists, fallback to userData.shortName
          onChange={(e) => handleChange('assigned', e.target.value)} // Update eventDetails.assigned
          fullWidth
          disabled
        />
        <Box display="flex" gap={2}>
          <Button variant="contained" color="primary" onClick={handleSubmit}>
            Save Changes
          </Button>
          <Button variant="contained" color="error" onClick={handleDelete}>
            Delete Event
          </Button>
        </Box>
      </Box>
    </Box>
  );
}