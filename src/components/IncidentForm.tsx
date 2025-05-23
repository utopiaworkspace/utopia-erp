import React from 'react';
import {
  TextField, MenuItem, Button, Box, Typography, Divider
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, {Dayjs} from 'dayjs';
import { useState, useEffect } from 'react';

interface Props {
  data: any;
  onChange: (field: string, value: any) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function IncidentForm({ data, onChange, onFileChange }: Props) {
  const [value, setValue] = React.useState<Dayjs | null>(dayjs());

  useEffect(() => {
    if (!data.date) {
      const todayStr = dayjs().format('DD-MM-YYYY');
      onChange('date', todayStr); // sets the value into parent/state
      setValue(dayjs()); // update local state as well
    }
  }, []);
  

  const [customUnit, setCustomUnit] = useState('');

  const units = [
    "Encik Beku", "Ibnu Sina", "SMB", "KMB", "RMB", "RMU", "OTHER"
  ];
  
  return (
    <Box display="flex" flexDirection="column" gap={2} mt={1} padding={2}>
      <Typography variant="h6">Your Information</Typography>
      <TextField
        label="Name"
        fullWidth
        value={data.userName || ''} // Assuming `data.userName` contains the user's name
        disabled
      />
      
      <TextField
        label="Your Department"
        fullWidth
        select
        value={data.dept}
        onChange={(e) => onChange('dept', e.target.value)}
      >
        {["Operation", "Finance & Account", "Sales - Indoor", "Sales - Outdoor", "Customer Service", "HR - Generalist", "HR - Recruiter"].map((dept) => (
          <MenuItem key={dept} value={dept}>{dept}</MenuItem>
        ))}
      </TextField>

      <Divider sx={{ my: 0.5 }} />

      <Typography variant="h6" mt={2}>Incident Information</Typography>
      <TextField
        label="Business Unit"
        select
        fullWidth
        value={data.responsibleUnit}
        onChange={(e) => {
          const value = e.target.value;
          onChange('responsibleUnit', value);
          if (value !== 'OTHER') {
            setCustomUnit('');
          }
        }}
        required // 这里设置为必填
      >
        {units.map((unit) => (
          <MenuItem key={unit} value={unit}>
            {unit}
          </MenuItem>
        ))}
      </TextField>

      {data.responsibleUnit === 'OTHER' && (
        <TextField
          label="Please specify unit"
          fullWidth
          value={customUnit}
          onChange={(e) => {
            setCustomUnit(e.target.value); // ✅ only update local state
            // Don't call onChange here; keep 'responsibleUnit' = 'OTHER'
          }}
          required // 这里设置为必填
        />
      )}
      <TextField
        label="Incident Type"
        select
        fullWidth
        value={data.incidentType}
        onChange={(e) => onChange('incidentType', e.target.value)}
        required // 这里设置为必填
        
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
        required // 这里设置为必填
        onChange={(e) => onChange('responsibleDept', e.target.value)}
      >
        {["Operation", "Finance & Account", "Sales - Indoor", "Sales - Outdoor", "Customer Service", "HR - Generalist", "HR - Recruiter", "Other"].map((dept) => (
          <MenuItem key={dept} value={dept}>{dept}</MenuItem>
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
        {data.file ? `File: ${data.file.name}` : "Upload Incident Image or PDF"}
        <input
          accept="image/*,application/pdf"
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
        required // 这里设置为必填
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
