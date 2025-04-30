import React from 'react';
import {
  TextField, MenuItem, Button, Box, Typography
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

interface Props {
  data: any;
  onChange: (field: string, value: any) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function IncidentForm({ data, onChange, onFileChange }: Props) {
  return (
    <Box display="flex" flexDirection="column" gap={2} mt={2} padding={2}>
      <TextField
        label="Business Unit"
        select
        fullWidth
        value={data.unit}
        onChange={(e) => onChange('unit', e.target.value)}
        required
      >
        {[
          "UTOPIA HOLIDAY SDN BHD", "SCAFFOLDING MALAYSIA SDN BHD", "IBNU SINA CARE SDN BHD",
          "REV MOVE SDN BHD", "REV MOVE UTARA SDN BHD", "KAK KENDURI SDN BHD",
          "ENCIK BEKU AIRCOND SDN BHD", "BUTIK GLAM & LUX SDN BHD", "PULSE PIALTES SDN BHD",
          "ANJAKAN STRATEGIK SDN BHD", "MIMPIAN ASTAKA SDN BHD", "MEKAR BUDI SDN BHD",
          "MUTIARA EMBUN SDN BHD", "MERRY ELDERLY CARE SDN BHD", "COLD TRUCK MALAYSIA SDN BHD",
          "MOBILE WHEELER SDN BHD"
        ].map((unit) => (
          <MenuItem key={unit} value={unit}>{unit}</MenuItem>
        ))}
      </TextField>

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
          label="Date"
          value={data.date ? dayjs(data.date, 'DD/MM/YYYY') : null}
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
        value={data.responsibleDept}
        onChange={(e) => onChange('responsibleDept', e.target.value)}
      />

      <TextField
        label="Responsible Person"
        fullWidth
        value={data.responsibleName}
        onChange={(e) => onChange('responsibleName', e.target.value)}
      />

      <Typography>Incident Details</Typography>

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
      />

      <TextField
        label="Impact"
        fullWidth
        multiline
        rows={2}
        value={data.impact}
        onChange={(e) => onChange('impact', e.target.value)}
      />
    </Box>
  );
}
