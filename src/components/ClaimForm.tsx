import React from 'react';
import {
  TextField, MenuItem, Button, Box, Typography, Divider, IconButton
} from '@mui/material';
import { AddCircleOutline, RemoveCircleOutline } from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';


interface Receipt {
  date: string;
  description: string;
  amount: string;
  file: File | null;
}

interface Props {
  data: {
    claimType: string;
    benefitType: string;
    unit: string;
    fullName: string;
    phoneNumber: string;
    receipts: Receipt[];
    totalAmount: number;
  };
  onChange: (field: string, value: any) => void;
  onReceiptChange: (index: number, field: string, value: any) => void;
  onFileChange: (index: number, file: File | null) => void;
  addReceipt: () => void;
  removeReceipt: (index: number) => void;
}

export default function ClaimForm({
  data,
  onChange,
  onReceiptChange,
  onFileChange,
  addReceipt,
  removeReceipt
}: Props) {
  return (
    <Box display="flex" flexDirection="column" gap={2} mt={2} padding={2}>
      <TextField
        label="Claim Type"
        select
        fullWidth
        value={data.claimType}
        onChange={(e) => onChange('claimType', e.target.value)}
        required
      >
        <MenuItem value="General">General</MenuItem>
        <MenuItem value="Benefit">Benefit</MenuItem>
      </TextField>

      {data.claimType === 'Benefit' && (
        <TextField
          label="Benefit Type"
          select
          fullWidth
          value={data.benefitType}
          onChange={(e) => onChange('benefitType', e.target.value)}
          required
        >
          <MenuItem value="OUT-PATIENT (SELF)">OUT-PATIENT (SELF)</MenuItem>
          <MenuItem value="OUT-PATIENT (SPOUSE & CHILDREN)">OUT-PATIENT (SPOUSE & CHILDREN)</MenuItem>
          <MenuItem value="SPORTS">SPORTS</MenuItem>
          <MenuItem value="WELLNESS">WELLNESS</MenuItem>
          <MenuItem value="FAMILY TREAT">FAMILY TREAT</MenuItem>
          <MenuItem value="MOTOR SUBSIDY">MOTOR SUBSIDY</MenuItem>
          <MenuItem value="FAREWELL">FAREWELL</MenuItem>
        </TextField>
      )}

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
        label="Full Name"
        fullWidth
        value={data.fullName}
        onChange={(e) => onChange('fullName', e.target.value)}
        required
        helperText="e.g. JOHN DOE"
      />

      <TextField
        label="Phone Number"
        fullWidth
        value={data.phoneNumber}
        onChange={(e) => onChange('phoneNumber', e.target.value)}
        required
        helperText="e.g. 60123456789"
      />

      <Typography variant="h6" mt={3}>Receipts</Typography>

      {data.receipts.map((receipt, index) => (
        <Box key={index} display="flex" flexDirection="column" gap={1} mt={1}>
          <Box display="flex" gap={2} alignItems="center">
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Date"
                value={receipt.date ? dayjs(receipt.date, 'DD/MM/YYYY') : null}
                onChange={(date) =>
                  onReceiptChange(index, 'date', date ? date.format('DD/MM/YYYY') : '')
                }
                maxDate={dayjs()}
                slotProps={{ textField: { required: true } }}
              />
            </LocalizationProvider>

            <TextField
              label="Amount (RM)"
              type="number"
              value={receipt.amount}
              onChange={(e) => onReceiptChange(index, 'amount', e.target.value)}
              required
            />

            <IconButton
              onClick={() => removeReceipt(index)}
              disabled={data.receipts.length === 1}
            >
              <RemoveCircleOutline />
            </IconButton>
          </Box>

          <Button
            variant="outlined"
            component="label"
            fullWidth
          >
            {receipt.file ? `File: ${receipt.file.name}` : "Upload Receipt (Image or PDF)"}
            <input
              accept="image/*,application/pdf"
              type="file"
              hidden
              onChange={(e) => onFileChange(index, e.target.files?.[0] || null)}
              
            />
          </Button>

          <TextField
            label="Description"
            fullWidth
            multiline
            rows={2}
            value={receipt.description}
            onChange={(e) => onReceiptChange(index, 'description', e.target.value)}
            required
          />

          {index < data.receipts.length - 1 && <Divider />}
        </Box>
      ))}

      <Button startIcon={<AddCircleOutline />} onClick={addReceipt}>
        Add Another Receipt
      </Button>

      <Typography align="right" fontWeight="bold" mt={2}>
        Total Amount: RM {data.totalAmount.toFixed(2)}
      </Typography>
    </Box>
  );
}
