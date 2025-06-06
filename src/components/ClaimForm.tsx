import React from 'react';
import {
  TextField, MenuItem, Button, Box, Typography, Divider, IconButton, Dialog, DialogContent, DialogTitle, Snackbar, Alert
} from '@mui/material';
import { AddCircleOutline, RemoveCircleOutline } from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { onBlurFormatAmount, formatAmountWithComma } from '../utils/formatters';

// Receipt type for each receipt item
interface Receipt {
  date: string;
  description: string;
  amount: string;
  file: File | null;
}

// Props for the presentation component
// All data and actions are passed from parent (container) component
interface Props {
  data: {
    claimType: string;
    benefitType: string;
    unit: string;
    fullName: string;
    phoneNumber: string;
    icNum: string;
    receipts: Receipt[];
    totalAmount: number;
  };
  onChange: (field: string, value: any) => void;
  onReceiptChange: (index: number, field: string, value: any) => void;
  onFileChange: (index: number, file: File | null) => void;
  addReceipt: () => void;
  removeReceipt: (index: number) => void;
  // Dialog and Snackbar control are also passed from parent
  dialogOpen?: boolean;
  onDialogClose?: () => void;
  snackbarOpen?: boolean;
  onSnackbarClose?: () => void;
}

// Presentation component: only responsible for UI and user input
// No side effects, no routing, no global state
export default function ClaimForm({
  data,
  onChange,
  onReceiptChange,
  onFileChange,
  addReceipt,
  removeReceipt,
  dialogOpen = false,
  onDialogClose,
  snackbarOpen = false,
  onSnackbarClose
}: Props) {
  // Only render UI, all logic is handled by parent
  return (
    <Box display="flex" flexDirection="column" gap={2} mt={2} padding={2}>
      {/* Claim type selection */}
      <TextField
        label="Claim Type"
        select
        fullWidth
        value={data.claimType}
        onChange={e => onChange('claimType', e.target.value)}
        required
      >
        <MenuItem value="General">General</MenuItem>
        <MenuItem value="Benefit">Benefit</MenuItem>
      </TextField>

      {/* Benefit type only shown if claimType is Benefit */}
      {data.claimType === 'Benefit' && (
        <TextField
          label="Benefit Type"
          select
          fullWidth
          value={data.benefitType}
          onChange={e => onChange('benefitType', e.target.value)}
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

      {/* Company selection */}
      <TextField
        label="Company Name"
        select
        fullWidth
        value={data.unit}
        onChange={e => onChange('unit', e.target.value)}
        required
      >
        {/* Company options */}
        {[
          "UTOPIA HOLIDAY SDN BHD",
          "SCAFFOLDING MALAYSIA SDN BHD",
          "IBNU SINA CARE SDN BHD",
          "REV MOVE SDN BHD",
          "REV MOVE UTARA SDN BHD",
          "KAK KENDURI SDN BHD",
          "ENCIK BEKU AIRCOND SDN BHD",
          "BUTIK GLAM & LUX SDN BHD",
          "PULSE PILATES SDN BHD",
          "ANJAKAN STRATEGIK SDN BHD",
          "MIMPIAN ASTAKA SDN BHD",
          "MEKAR BUDI SDN BHD",
          "MUTIARA EMBUN SDN BHD",
          "MERRY ELDERLY CARE SDN BHD",
          "COLD TRUCK MALAYSIA SDN BHD",
          "MOBILE WHEELER SDN BHD",
          "⚠️ DON'T SELECT - FOR TESTING PURPOSES"
        ].map((unit) => (
          <MenuItem key={unit} value={unit}>
            {unit}
          </MenuItem>
        ))}
      </TextField>

      {/* User info fields */}
      <TextField
        label="Full Name"
        fullWidth
        value={data.fullName}
        onChange={(e) => {
          onChange('fullName', e.target.value);
          setIsDirty(true);
        }}
        required
        helperText="ℹ️ e.g. MUHAMMAD AHMAD BIN ABU BAKAR"
      />
      <TextField
        label="Phone Number"
        fullWidth
        value={data.phoneNumber}
        onChange={(e) => {
          onChange('phoneNumber', e.target.value);
          setIsDirty(true);
        }}
        required
        helperText="ℹ️ Must start with 6, numbers only, no '-' symbol or spaces. e.g. 60123456789"
      />
      <TextField
        label="IC Number/Passport Number"
        fullWidth
        value={data.icNum}
        onChange={(e) => {
          onChange('icNum', e.target.value);
          setIsDirty(true);
        }}
        required
        helperText="ℹ️ Numbers only, no '-' symbol or spaces. e.g. 021012145041 or A12345678"
      />

      {/* Receipts section */}
      <Typography variant="h6" mt={3}>Receipts</Typography>
      {data.receipts.map((receipt, index) => (
        <Box key={index} display="flex" flexDirection="column" gap={1} mt={1}>
          <Box display="flex" gap={2} alignItems="center">
            {/* Date picker for receipt date */}
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Receipt Date"
                value={receipt.date ? dayjs(receipt.date, 'DD-MM-YYYY') : null}
                onChange={date =>
                  onReceiptChange(index, 'date', date ? date.format('DD-MM-YYYY') : '')
                }
                format="DD-MM-YYYY"
                maxDate={dayjs()}
                slotProps={{ textField: { required: true } }}
              />
            </LocalizationProvider>
            {/* Amount input, only number allowed */}
            <TextField
              label="Amount (RM)"
              type="number"
              value={receipt.amount}
              onChange={(e) => {
                onReceiptChange(index, 'amount', e.target.value);
                setIsDirty(true);
              }}
              onBlur={(e) => {
                onReceiptChange(index, 'amount', onBlurFormatAmount(e.target.value));
                setIsDirty(true);
              }}
              required
              inputProps={{ min: 1, step: "0.01" }}
            />
            {/* Remove receipt button */}
            <IconButton
              onClick={() => {
                removeReceipt(index);
                setIsDirty(true);
              }}
              disabled={data.receipts.length === 1}
            >
              <RemoveCircleOutline />
            </IconButton>
          </Box>
          {/* File upload for receipt */}
          <Button
            variant="outlined"
            component="label"
            fullWidth
          >
            {receipt.file ? `File: ${receipt.file.name}` : "Upload Receipt (Image or PDF)"}
            <input
              accept="image/*,application/pdf"
              capture="environment"
              type="file"
              hidden
              onChange={(e) => {
                onFileChange(index, e.target.files?.[0] || null);
                setIsDirty(true);
              }}
            />
          </Button>
          {/* Description for receipt */}
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={2}
            value={receipt.description}
            onChange={(e) => {
              onReceiptChange(index, 'description', e.target.value);
              setIsDirty(true);
            }}
            required
            helperText="ℹ️ e.g. Grab - Meeting at Ibnu Sina Warehouse on xx/xx/xxxx"
          />
          {index < data.receipts.length - 1 && <Divider />}
        </Box>
      ))}
      {/* Add more receipts button */}
      <Button
        startIcon={<AddCircleOutline />}
        onClick={() => {
          addReceipt();
          setIsDirty(true);
        }}
        sx={{
          mt: 1,
          py: 1.2,
          borderRadius: 2,
          fontWeight: 600,
          textTransform: 'none',
          borderColor: 'primary.main',
          color: 'primary.main',
          border: '1px solid',
          '&:hover': {
            backgroundColor: 'primary.main',
            color: '#fff',
          },
        }}
        variant="outlined"
      >
        Add More Receipt
      </Button>
      {/* Total amount display, formatted with comma */}
      <Typography align="right" fontWeight="bold" mt={2}>
        Total Amount: RM {formatAmountWithComma(data.totalAmount)}
      </Typography>
      {/* Dialog for form actions, controlled by parent */}
      <Dialog
        open={dialogOpen}
        onClose={onDialogClose}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Submit a New Claim</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2}>
            <Typography variant="h6">Receipts</Typography>
            {data.receipts.map((receipt, index) => (
              <Box key={index} display="flex" flexDirection="column" gap={1}>
                {/* Receipt fields for dialog, can be customized */}
              </Box>
            ))}
          </Box>
        </DialogContent>
      </Dialog>
      {/* Snackbar for warning, controlled by parent */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={onSnackbarClose}
      >
        <Alert
          severity="warning"
          action={
            <Button color="inherit" size="small" onClick={onSnackbarClose}>
              Confirm
            </Button>
          }
        >
          Are you sure you want to close the form? Unsaved changes will be lost.
        </Alert>
      </Snackbar>
    </Box>
  );
}