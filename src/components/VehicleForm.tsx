import React, { useState, useEffect } from 'react';
import {
  TextField, MenuItem, Button, Box, Typography,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { db } from '../firebase/firebaseConfig';
import { collection, getDocs, addDoc } from 'firebase/firestore';

export default function VehicleForm({ data, onChange }: any) {
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [availability, setAvailability] = useState<boolean | null>(null);
  const [availableCount, setAvailableCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        // Fetch all vehicles to get unique models
        const vehiclesCollection = collection(db, 'vehicles');
        const vehiclesSnapshot = await getDocs(vehiclesCollection);
        const vehicles = vehiclesSnapshot.docs.map(doc => doc.data());
        const uniqueModels = Array.from(new Set(vehicles.map(vehicle => vehicle.model || 'Unknown')));
        setModels(uniqueModels);
      } catch (error) {
        console.error('Error fetching vehicle models:', error);
      }
    };

    fetchModels();
  }, []);

  // Function to check availability based on selected model and dates; currently only check dates.
  // need to check availability based on the status also(1. available, 2. ready for pickup/pending)
  const checkAvailability = async () => {
    if (!selectedModel || !startDate || !endDate || quantity <= 0) {
      alert('Please select a model, specify both start and end dates, and enter a valid quantity.');
      return;
    }

    if (startDate.isAfter(endDate)) {
      alert('Start date cannot be later than the end date.');
      return;
    }

    try {
      // Fetch events for the selected model
      const eventsCollection = collection(db, 'vehicle_event');
      const eventsSnapshot = await getDocs(eventsCollection);
      const events = eventsSnapshot.docs.map(doc => doc.data());

      // Fetch all vehicles of the selected model
      const vehiclesCollection = collection(db, 'vehicles');
      const vehiclesSnapshot = await getDocs(vehiclesCollection);
      const vehicles = vehiclesSnapshot.docs
        .map(doc => doc.data())
        .filter(vehicle => vehicle.model === selectedModel);

      const totalAvailable = vehicles.length;

      // Check if the selected dates overlap with any existing events
      const unavailableCount = events.reduce((count, event) => {
        if (event.model !== selectedModel) return count;
        const eventStart = dayjs(event.startDate, 'YYYY-MM-DD');
        const eventEnd = dayjs(event.endDate, 'YYYY-MM-DD');
        if (!(endDate.isBefore(eventStart) || startDate.isAfter(eventEnd))) {
          return count + (event.quantity || 0); // Add the quantity reserved in the event
        }
        return count;
      }, 0);

      const available = totalAvailable - unavailableCount;
      setAvailableCount(available);
      setAvailability(available >= quantity);
    } catch (error) {
      console.error('Error checking availability:', error);
    }
  };

  const handleSubmit = async () => {
    if (!selectedModel || !startDate || !endDate || availability === null || quantity <= 0) {
      alert('Please complete the form and check availability before submitting.');
      return;
    }

    if (startDate.isAfter(endDate)) {
      alert('Start date cannot be later than the end date.');
      return;
    }

    if (!availability) {
      alert(`The selected model is not available for the specified dates. Available: ${availableCount}`);
      return;
    }

    try {
      // Submit the vehicle event
      const eventsCollection = collection(db, 'vehicle_event');
      await addDoc(eventsCollection, {
        model: selectedModel,
        startDate: startDate.format('YYYY-MM-DD'),
        endDate: endDate.format('YYYY-MM-DD'),
        quantity,
      });
      alert('Vehicle event submitted successfully!');
    } catch (error) {
      console.error('Error submitting vehicle event:', error);
      alert('Failed to submit vehicle event.');
    }
  };

  return (
    <Box display="flex" flexDirection="column" gap={2} mt={2} padding={2}>
      <TextField
        label="Select Model"
        select
        fullWidth
        value={selectedModel}
        onChange={(e) => setSelectedModel(e.target.value)}
        sx={{ mb: 2 }}
      >
        {models.map((model) => (
          <MenuItem key={model} value={model}>
            {model}
          </MenuItem>
        ))}
      </TextField>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          label="Start Date"
          value={startDate}
          format='DD-MM-YYYY'
          onChange={(newValue) => {
            if (endDate && newValue && newValue.isAfter(endDate)) {
              alert('Start date cannot be later than the end date.');
              return;
            }
            setStartDate(newValue);
          }}
          renderInput={(params) => <TextField {...params} fullWidth sx={{ mb: 2 }} />}
        />
        <DatePicker
          label="End Date"
          value={endDate}
          format='DD-MM-YYYY'
          onChange={(newValue) => {
            if (startDate && newValue && newValue.isBefore(startDate)) {
              alert('End date cannot be earlier than the start date.');
              return;
            }
            setEndDate(newValue);
          }}
          renderInput={(params) => <TextField {...params} fullWidth sx={{ mb: 2 }} />}
        />
      </LocalizationProvider>
      <TextField
        label="Quantity"
        type="number"
        fullWidth
        value={quantity}
        onChange={(e) => setQuantity(Number(e.target.value))}
        sx={{ mb: 2 }}
      />
      <Button variant="contained" onClick={checkAvailability} sx={{ mb: 2 }}>
        Check Availability
      </Button>
      {availability !== null && (
        <Typography variant="body1" color={availability ? 'green' : 'red'} sx={{ mb: 2 }}>
          {availability
            ? `The selected model is available. Available: ${availableCount}`
            : `The selected model is not available. Available: ${availableCount}`}
        </Typography>
      )}
      <Button variant="contained" color="primary" onClick={handleSubmit}>
        Submit
      </Button>
    </Box>
  );
}