import React, { useState } from 'react';
import {
  Typography, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, MenuItem, Grid, IconButton
} from '@mui/material';
import { AddCircleOutline, RemoveCircleOutline } from '@mui/icons-material';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, { Dayjs } from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { PickerValue } from '@mui/x-date-pickers/internals';
import { submitClaim } from '../Submit/SubmitClaim';

export default function OrdersPage() {

  const currentDate = dayjs(); // Get the current date using dayjs
  
  const [open, setOpen] = useState(false);
  const [claimData, setClaimData] = useState({
    claimType: '',
    benefitType: '',
    unit: '',
    fullName: '',
    phoneNumber: '',
    totalAmount: 0,
    receipts: [{ date: '', description: '', amount: '', file: null }]
  });

  const handleChange = (field: string, value: any) => {
    setClaimData((prev) => ({
      ...prev,
      [field]: value,
      ...(field === 'claimType' && value === 'General' ? { benefitType: '' } : {}), // Clear benefitType if claimType is empty
    }));
  };

  const updateTotalAmount = (receipts: typeof claimData.receipts) => {
    const total = receipts.reduce((sum, receipt) => {
      const amount = parseFloat(receipt.amount);
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
  
    setClaimData(prev => ({ ...prev, totalAmount: total }));
  };
  
  

  const handleReceiptChange = (index: number, field: string, value: any) => {
    const updatedReceipts = [...claimData.receipts];
    updatedReceipts[index][field] = value;
    updateTotalAmount(updatedReceipts);
    setClaimData(prev => ({ ...prev, receipts: updatedReceipts }));
  };
  

  const addReceipt = () => {
    const newReceipts = [...claimData.receipts, { date: '', description: '', amount: '', file: null }];
    updateTotalAmount(newReceipts);
    setClaimData({ ...claimData, receipts: newReceipts });
  };
  
  const removeReceipt = (index: number) => {
    const newReceipts = claimData.receipts.filter((_, i) => i !== index);
    updateTotalAmount(newReceipts);
    setClaimData({ ...claimData, receipts: newReceipts });
  };
  

  const handleSubmit = async () => {
    console.log('Claim Data:', claimData);
    const isEmpty = (val: any) => val === null || val === '' || val === undefined;
  
    const missingReceipts = claimData.receipts.some((receipt) => (
      isEmpty(receipt.date) ||
      isEmpty(receipt.amount) ||
      isEmpty(receipt.description) ||
      !receipt.file
    ));
  
    if (
      isEmpty(claimData.claimType) ||
      isEmpty(claimData.unit) ||
      isEmpty(claimData.fullName) ||
      isEmpty(claimData.phoneNumber) ||
      missingReceipts
    ) {
      alert("Please fill out all required fields and upload a file for each receipt.");
      return;
    }
  
    try {
      const response = await submitClaim(claimData);
  
      if (response.success) {
        alert('Claim submitted successfully!');
      } else {
        alert('Failed to submit claim. Please try again.');
      }
    } catch (error) {
      console.error('Error during claim submission:', error);
      alert('An unexpected error occurred. Please try again.');
    }
  
    console.log('Submitting claim:', claimData);
    setOpen(false);
  };
  

  function setDateValue(newValue: PickerValue): void {
    if (newValue) {
      const updatedReceipts = [...claimData.receipts];
      updatedReceipts[updatedReceipts.length - 1].date = newValue.toString();
      setClaimData({ ...claimData, receipts: updatedReceipts });
    }
  }

 

  return (
    <>
      {/* <Typography variant="h5" gutterBottom>
        Welcome to the Claims!
      </Typography> */}
      <Button variant="contained" onClick={() => setOpen(true)}>
        Submit Claim
      </Button>
      
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Submit a New Claim</DialogTitle>
        <DialogContent dividers>
          <Box display="flex" flexDirection="column" gap={2}>
            {/* Claim Info */}
            <Box display="flex" gap={2}>
              <TextField
                label="Claim Type"
                select
                fullWidth
                value={claimData.claimType}
                onChange={(e) => handleChange('claimType', e.target.value)}
              >
                <MenuItem value="General">General</MenuItem>
                <MenuItem value="Benefit">Benefit</MenuItem>
              </TextField>
              <TextField
                label="Unit"
                select
                fullWidth
                value={claimData.unit}
                onChange={(e) => handleChange('unit', e.target.value)}
              >
                <MenuItem value="UTOPIA HOLIDAY SDN BHD">UTOPIA HOLIDAY SDN BHD</MenuItem>
                <MenuItem value="SCAFFOLDING MALAYSIA SDN BHD">SCAFFOLDING MALAYSIA SDN BHD</MenuItem>
                <MenuItem value="IBNU SINA CARE SDN BHD">IBNU SINA CARE SDN BHD</MenuItem>
                <MenuItem value="REV MOVE SDN BHD">REV MOVE SDN BHD</MenuItem>
                <MenuItem value="REV MOVE UTARA SDN BHD">REV MOVE UTARA SDN BHD</MenuItem>
                <MenuItem value="KAK KENDURI SDN BHD">KAK KENDURI SDN BHD</MenuItem>
                <MenuItem value="ENCIK BEKU AIRCOND SDN BHD">ENCIK BEKU AIRCOND SDN BHD</MenuItem>
                <MenuItem value="BUTIK GLAM & LUX SDN BHD">BUTIK GLAM & LUX SDN BHD</MenuItem>
                <MenuItem value="PULSE PIALTES SDN BHD">PULSE PIALTES SDN BHD</MenuItem>
                <MenuItem value="ANJAKAN STRATEGIK SDN BHD">ANJAKAN STRATEGIK SDN BHD</MenuItem>
                <MenuItem value="MIMPIAN ASTAKA SDN BHD">MIMPIAN ASTAKA SDN BHD</MenuItem>
                <MenuItem value="MEKAR BUDI SDN BHD">MEKAR BUDI SDN BHD</MenuItem>
                <MenuItem value="MUTIARA EMBUN SDN BHD">MUTIARA EMBUN SDN BHD</MenuItem>
                <MenuItem value="MERRY ELDERLY CARE SDN BHD">MERRY ELDERLY CARE SDN BHD</MenuItem>
                <MenuItem value="COLD TRUCK MALAYSIA SDN BHD">COLD TRUCK MALAYSIA SDN BHD</MenuItem>
                <MenuItem value="MOBILE WHEELER SDN BHD">MOBILE WHEELER SDN BHD</MenuItem>
              </TextField>
            </Box>
            {/* Conditional Benefit Type Field */}
            {claimData.claimType === 'Benefit' && (
              <Box display="flex" gap={2}>
                <TextField
                  label="Benefit Type"
                  select
                  fullWidth
                  value={claimData.benefitType || ''}
                  onChange={(e) => handleChange('benefitType', e.target.value)}
                >
                  <MenuItem value="OUT-PATIENT (SELF)">OUT-PATIENT (SELF)</MenuItem>
                  <MenuItem value="OUT-PATIENT (SPOUSE & CHILDREN)">OUT-PATIENT (SPOUSE & CHILDREN)</MenuItem>
                  <MenuItem value="SPORTS">SPORTS</MenuItem>
                  <MenuItem value="WELLNESS">WELLNESS</MenuItem>
                  <MenuItem value="FAMILY TREAT">FAMILY TREAT</MenuItem>
                  <MenuItem value="MOTOR SUBSIDY">MOTOR SUBSIDY</MenuItem>
                  <MenuItem value="FAREWELL">FAREWELL</MenuItem>
                </TextField>
              </Box>  
            )}
            <Box display="flex" gap={2}>
              <TextField
                label="Full Name"
                fullWidth
                value={claimData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
              />
              <TextField
                label="Phone Number"
                fullWidth
                value={claimData.phoneNumber}
                onChange={(e) => handleChange('phoneNumber', e.target.value)}
              />
            </Box>

            {/* Receipt Section Title */}
            <Typography variant="h6" gutterBottom>
              Receipts
            </Typography>

            {/* Receipts */}
            {claimData.receipts.map((receipt, index) => (
              <React.Fragment key={index}>
                <Box  display="flex" flexDirection="column" gap={2}>
                  <Box display="flex" gap={2} alignItems="center">
                    {/* <Box display="inline-flex"> */}
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        sx={{ minWidth: "40%" }}
                        label="Date"
                        value={receipt.date ? dayjs(receipt.date) : null}
                        maxDate={currentDate}
                        onChange={(newValue) =>
                          handleReceiptChange(index, 'date', newValue ? newValue.toISOString() : '')
                        }
                      />

                      </LocalizationProvider>
                    {/* </Box> */}
                    <TextField
                      label="Amount (RM)"
                      type="number"
                      fullWidth
                      value={receipt.amount}
                      onChange={(e) => handleReceiptChange(index, 'amount', e.target.value)}
                    />
                    <IconButton onClick={() => removeReceipt(index)} disabled={claimData.receipts.length === 1}>
                      <RemoveCircleOutline />
                    </IconButton>
                  </Box>
                  <Box>
                    <Button variant="outlined" component="label" fullWidth>
                      {receipt.file ? `File: ${receipt.file.name}` : "Upload File"}
                      <input
                        type="file"
                        hidden
                        onChange={(e) =>
                          handleReceiptChange(index, 'file', e.target.files?.[0] || null)
                        }
                      />
                    </Button>
                  </Box>  
                  <Box>
                    <TextField
                      label="Description"
                      fullWidth
                      multiline
                      rows={4} // Set the number of visible rows
                      value={receipt.description}
                      onChange={(e) => handleReceiptChange(index, 'description', e.target.value)}
                    />
                  </Box>
                </Box>
                {/* Add a Divider between receipts */}
                {index < claimData.receipts.length - 1 && <Divider sx={{ my: 2 }} />}
              </React.Fragment>
            ))}

            <Button startIcon={<AddCircleOutline />} onClick={addReceipt}>
              Add Receipt
            </Button>
            <Typography variant="subtitle1" fontWeight="bold" alignSelf="flex-end" mt={2}>
              Total Amount (RM): {claimData.totalAmount.toFixed(2)}
            </Typography>

          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
