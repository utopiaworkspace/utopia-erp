import React from 'react';
import {
  TextField, MenuItem, Button, Box, Typography
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
      const todayStr = dayjs().format('DD/MM/YYYY');
      onChange('date', todayStr); // sets the value into parent/state
      setValue(dayjs()); // update local state as well
    }
  }, []);
  

  const [customUnit, setCustomUnit] = useState('');

  const units = [
    "UTOPIA HOLIDAY SDN BHD", "SCAFFOLDING MALAYSIA SDN BHD (SMB)", "IBNU SINA CARE SDN BHD",
    "REV MOVE SDN BHD (RMB)", "REV MOVE UTARA SDN BHD (RMU)", "KAK KENDURI SDN BHD (KMB)",
    "ENCIK BEKU AIRCOND SDN BHD", "BUTIK GLAM & LUX SDN BHD", "PULSE PIALTES SDN BHD",
    "ANJAKAN STRATEGIK SDN BHD", "MIMPIAN ASTAKA SDN BHD", "MEKAR BUDI SDN BHD",
    "MUTIARA EMBUN SDN BHD", "MERRY ELDERLY CARE SDN BHD", "COLD TRUCK MALAYSIA SDN BHD",
    "MOBILE WHEELER SDN BHD", "OTHER"
  ];
  
  return (
    <Box display="flex" flexDirection="column" gap={2} mt={2} padding={2}>
      <Typography>Your Details</Typography>
      <TextField
        label="Name"
        fullWidth
        value={data.userName || ''} // Assuming `data.userName` contains the user's name
        disabled
      />
      <TextField
        label="Business Unit"
        select
        fullWidth
        value={data.unit}
        onChange={(e) => onChange('unit', e.target.value)}
        required
      >
        {[
          "UTOPIA HOLIDAY SDN BHD", "SCAFFOLDING MALAYSIA SDN BHD (SMB)", "IBNU SINA CARE SDN BHD",
          "REV MOVE SDN BHD (RMB)", "REV MOVE UTARA SDN BHD (RMU)", "KAK KENDURI SDN BHD (KMB)",
          "ENCIK BEKU AIRCOND SDN BHD", "BUTIK GLAM & LUX SDN BHD", "PULSE PIALTES SDN BHD",
          "ANJAKAN STRATEGIK SDN BHD", "MIMPIAN ASTAKA SDN BHD", "MEKAR BUDI SDN BHD",
          "MUTIARA EMBUN SDN BHD", "MERRY ELDERLY CARE SDN BHD", "COLD TRUCK MALAYSIA SDN BHD",
          "MOBILE WHEELER SDN BHD"
        ].map((unit) => (
          <MenuItem key={unit} value={unit}>{unit}</MenuItem>
        ))}
      </TextField>
      
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

      <Typography>Incident Details</Typography>
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
        required
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
          required
        />
      )}


      <TextField
        label="Invoice Number"
        fullWidth
        value={data.invoiceNum}
        onChange={(e) => onChange('invoiceNum', e.target.value)}
        required
      />

      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          sx={{ minWidth: "40%" }}
          label="Date of Incident"    
          value={value}
          maxDate={dayjs()}
          onChange={(newValue) => onChange('date', newValue ? newValue.format('DD/MM/YYYY') : '')}
          format='DD/MM/YYYY'
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
        onChange={(e) => onChange('responsibleDept', e.target.value)}
      >
        {["Operation", "Finance & Account", "Sales - Indoor", "Sales - Outdoor", "Customer Service", "HR - Generalist", "HR - Recruiter"].map((dept) => (
          <MenuItem key={dept} value={dept}>{dept}</MenuItem>
        ))}
      </TextField>

      <TextField
        label="Responsible Person"
        fullWidth
        value={data.responsibleName}
        onChange={(e) => onChange('responsibleName', e.target.value)}
        helperText="e.g. MUHAMMAD ALI BIN ABU BAKAR"
      />

      

      <Button variant="outlined" component="label" fullWidth>
        {data.file ? `File: ${data.file.name}` : "Incident Image or PDF"}
        <input
          accept="image/*,application/pdf"
          type="file"
          hidden
          onChange={onFileChange}
        />
      </Button>

      <TextField
        label="Description"
        fullWidth
        multiline
        rows={4}
        value={data.description}
        onChange={(e) => onChange('description', e.target.value)}
        required
        helperText="e.g. Sales team did not key in data into the prepared sheet"
      />

      <TextField
        label="Impact"
        fullWidth
        multiline
        rows={2}
        value={data.impact}
        onChange={(e) => onChange('impact', e.target.value)}
        helperText="e.g. Finance cannot trace overdue payments and missed the opportunity to chase the rental"
      />
    </Box>
  );
}
