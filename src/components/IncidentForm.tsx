import React from 'react'; // Import React library
import {
  TextField, MenuItem, Button, Box, Typography, Divider
} from '@mui/material'; // Import Material UI components
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'; // Import date picker provider
import { DatePicker } from '@mui/x-date-pickers/DatePicker'; // Import date picker component
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'; // Import Dayjs adapter for date picker
import dayjs, {Dayjs} from 'dayjs'; // Import dayjs for date handling
import { useState, useEffect } from 'react'; // Import React hooks

interface Props {
  data: any; // Data object for form values
  onChange: (field: string, value: any) => void; // Function to handle field changes
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void; // Function to handle file upload
}

export default function IncidentForm({ data, onChange, onFileChange }: Props) {
  const [value, setValue] = React.useState<Dayjs | null>(dayjs()); // State for date picker value

  useEffect(() => {
    if (!data.date) { // If no date is set yet
      const todayStr = dayjs().format('DD-MM-YYYY'); // Get today's date as string
      onChange('date', todayStr); // Set date in parent/state
      setValue(dayjs()); // Set local date picker state
    }
  }, []);

  const [customUnit, setCustomUnit] = useState(''); // State for custom business unit

  const units = [
    "Encik Beku", "Ibnu Sina", "SMB", "KMB", "RMB", "RMU", "Other"
  ]; // List of business units

  return (
    <Box display="flex" flexDirection="column" gap={2} mt={1} padding={2}>
      <Typography variant="h6">Your Information</Typography>

      <TextField
        label="Name"
        fullWidth
        value={data.userName || ''} // Show user's name (read-only)
        disabled
      />

      <TextField
        label="Your Department"
        fullWidth
        select
        value={data.dept}
        onChange={(e) => onChange('dept', e.target.value)} // Update department
        sx={{ mb: 0.5 }}
      >
        {["Operation", "Finance & Account", "Indoor Sales", "Outdoor Agent", "Customer Service", "HR Generalist", "HR Recruiter", "Website & Creative", "Sales & Marketing", "Maintenance", "Other"].map((dept) => (
          <MenuItem key={dept} value={dept}>
            {dept}
          </MenuItem>
        ))}
      </TextField>

      <Divider sx={{ my: 0.2 }} /> {/* Divider for visual separation */}

      <Typography variant="h6" mt={2}>Incident Information</Typography> 

      <TextField
        label="Business Unit"
        select
        fullWidth
        value={data.responsibleUnit}
        onChange={(e) => {
          const value = e.target.value;
          onChange('responsibleUnit', value); // Update business unit
          if (value !== 'Other') {
            setCustomUnit(''); // Clear custom unit if not "Other"
          }
        }}
        required
      >
        {units.map((unit) => (
          <MenuItem key={unit} value={unit}>
            {unit}
          </MenuItem>
        ))}
      </TextField>

    
            
        {false && data.responsibleUnit === "Other" && (
          <TextField
            label="Please specify business unit"
            fullWidth
            value={customUnit}
            onChange={(e) => {
              setCustomUnit(e.target.value);
              onChange('customUnit', e.target.value);
            }}
            required
          />
        )}
        
      <TextField
        label="Incident Type"
        select
        fullWidth
        value={data.incidentType}
        onChange={(e) => onChange('incidentType', e.target.value)}
        required
      >
        <MenuItem value="Internal Staff Issue">Internal Staff Issue</MenuItem>
        <MenuItem value="Customer Complaint">Customer Complaint</MenuItem>
        <MenuItem value="After Sales Service">After Sales Problem</MenuItem>
        <MenuItem value="Other">Other</MenuItem>
      </TextField>

      <TextField
        label="Severity Level"
        select
        fullWidth
        value={data.severityLevel}
        onChange={(e) => onChange('severityLevel', e.target.value)}
      >
        <MenuItem value="Low">Low</MenuItem>
        <MenuItem value="Medium">Medium</MenuItem>
        <MenuItem value="High">High</MenuItem>
      </TextField>

      <TextField
        label="Invoice Number"
        fullWidth
        value={data.invoiceNum}
        onChange={(e) => onChange('invoiceNum', e.target.value)}
      />

      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          sx={{ minWidth: "40%" }}
          label="Date of Incident"
          value={value}
          maxDate={dayjs()}
          onChange={(newValue) => onChange('date', newValue ? newValue.format('DD-MM-YYYY') : '')}
          format='DD-MM-YYYY'
          slotProps={{
            textField: { required: true },
          }}
        />
      </LocalizationProvider>

      <TextField
        label="Responsible Department"
        fullWidth
        select
        value={data.responsibleDept}
        required
        onChange={(e) => onChange('responsibleDept', e.target.value)}
      >
        {[
          "Operation",
          "Finance & Account",
          "Indoor Sales",
          "Outdoor Agent",
          "Customer Service",
          "HR Generalist",
          "HR Recruiter",
          "Website & Creative",
          "Maintenance",
          "Other", // Updated options
        ].map((dept) => (
          <MenuItem key={dept} value={dept}>
            {dept}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        label="Responsible Person"
        fullWidth
        value={data.responsibleName}
        onChange={(e) => onChange('responsibleName', e.target.value)}
        helperText="ℹ️ e.g. Ahmad"
      />

      <Button variant="outlined" component="label" fullWidth>
        {data.file ? `File: ${data.file.name}` : "Upload Incident Image"}
        <input
          accept="image/*"
          type="file"
          hidden
          onChange={onFileChange}
        />
      </Button>

      <TextField
        label="Description of Incident"
        fullWidth
        multiline
        rows={4}
        value={data.description}
        onChange={(e) => onChange('description', e.target.value)}
        required
        helperText="ℹ️ e.g. Indoor did not key in data into the prepared sheet"
      />

      <TextField
        label="Impact of Incident"
        fullWidth
        multiline
        rows={2}
        value={data.impact}
        onChange={(e) => onChange('impact', e.target.value)}
        helperText="ℹ️ e.g. Finance cannot trace overdue payments and missed the opportunity to chase the rental"
      />
    </Box>
  );
}
