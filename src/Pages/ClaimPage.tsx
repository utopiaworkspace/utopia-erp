import React, { useState, useEffect } from 'react';
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
import { useSession } from '../SessionContext';
import LinearProgress from '@mui/material/LinearProgress';
import { Navigate, useLocation } from 'react-router';
import { CircularProgress } from '@mui/material';
import { db } from '../firebase/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';


export default function ClaimPage() {
  const { session, loading } = useSession();
  const [bankInfo, setBankInfo] = useState<any>(null);
  
  if (loading) {
    return <LinearProgress />;
  }
  if (!session) {
    return <Navigate to="/sign-in" state={{ from: location }} />;
  }
  const { user } = session;

  const currentDate = dayjs(); // Get the current date using dayjs
  
  const [dialogState, setDialogState] = useState<'confirm' | 'loading' | 'success'>('confirm');
  const [openDialog, setOpenDialog] = useState(false);

  const [open, setOpen] = useState(false);
  const [claimData, setClaimData] = useState({
    claimId: '',
    claimType: '',
    benefitType: '',
    unit: '',
    fullName: '',
    email: user.email,
    phoneNumber: '',
    totalAmount: 0,
    receiptCount: 0,
    receipts: [{ date: '', description: '', amount: '', file: null }]
  });
  useEffect(() => {
    const fetchBankInfo = async () => {
      if (session?.user?.email) {
        const bankRef = doc(db, 'bankinfo', session.user.email);
        const bankDoc = await getDoc(bankRef);
        if (bankDoc.exists()) {
          setBankInfo(bankDoc.data());
        } else {
          setBankInfo(null); // No bank info found
        }
      }
    };

    fetchBankInfo();
  }, [session?.user?.email]);

  
  

  const handleOpen = () => {
    if (!bankInfo.bankNum) {
      alert('Please update your bank information before submitting a claim.');
      return;
    }
    setOpen(true);
  };

  const handleDialogClose = () => {
    resetDialog();
  };

  const handleChange = (field: string, value: any) => {
    setClaimData((prev) => ({
      ...prev,
      [field]: value,
      ...(field === 'claimType' && value === 'General' ? { benefitType: '' } : {}), // Clear benefitType if claimType is empty
    }));
  };


  const handleReceiptChange = (index: number, field: string, value: any) => {
    const updatedReceipts = [...claimData.receipts];
    updatedReceipts[index][field] = value;
    
    const total = updatedReceipts.reduce((sum, receipt) => {
      const amount = parseFloat(receipt.amount);
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
  
    setClaimData(prev => ({ 
      ...prev, 
      receipts: updatedReceipts,
      receiptCount: updatedReceipts.length,
      totalAmount: total, // <-- set total together
    }));
  };
  
  const addReceipt = () => {
    const newReceipts = [...claimData.receipts, { date: '', description: '', amount: '', file: null }];
  
    const total = newReceipts.reduce((sum, receipt) => {
      const amount = parseFloat(receipt.amount);
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
  
    setClaimData(prev => ({ 
      ...prev, 
      receipts: newReceipts,
      receiptCount: newReceipts.length,
      totalAmount: total,
    }));
  }; 
  
  const removeReceipt = (index: number) => {
    const newReceipts = claimData.receipts.filter((_, i) => i !== index);
  
    const total = newReceipts.reduce((sum, receipt) => {
      const amount = parseFloat(receipt.amount);
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
  
    setClaimData(prev => ({ 
      ...prev, 
      receipts: newReceipts,
      receiptCount: newReceipts.length,
      totalAmount: total,
    }));
  };

  const handleConfirmSubmit = async () => {
    setDialogState('loading');
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
      setDialogState('confirm');
      setOpenDialog(false);
      return;
    }
  
    try {
      const response = await submitClaim(claimData);
      console.log('Response from submitClaim:', response);
      
      if (response.success) {
        setClaimData(prev => ({ ...prev, claimId: response.claimId }));
        setDialogState('success');
  
      } else {
        alert('Failed to submit claim. Please try again.');
      }
    } catch (error) {
      console.error('Error during claim submission:', error);
      alert('An unexpected error occurred. Please try again.');
      setOpenDialog(false);
    }
  
    console.log('Submitting claim:', claimData);
    setOpen(false);
  };  

  const resetDialog = () => {
    setDialogState('confirm');
    setOpenDialog(false);
    setClaimData({
      claimId: '',
      claimType: '',
      benefitType: '',
      unit: '',
      fullName: '',
      email: user.email,
      phoneNumber: '',
      totalAmount: 0,
      receiptCount: 0,
      receipts: [{ date: '', description: '', amount: '', file: null }]
    });
  };

  const validateForm = () => {
    const requiredFields = ['unit', 'claimType', 'fullName', 'phoneNumber'];
    
    // Check if all required fields are filled
    for (const field of requiredFields) {
      if (!claimData[field]) {
        alert(`${field.charAt(0).toUpperCase() + field.slice(1)} is required.`);
        return false;
      }
    }
  
    // Validate Receipts
    const missingReceiptFields = claimData.receipts.some((receipt) => (
      !receipt.date || !receipt.amount || !receipt.description || !receipt.file
    ));
  
    if (missingReceiptFields) {
      alert("Please fill out all receipt fields and upload a file for each receipt.");
      return false;
    }
  
    return true;
  };
  
  
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
      setOpenDialog(true);
    }
  };

  return (
    <>
      {/* <Typography variant="h5" gutterBottom>
        Welcome to the Claims!
      </Typography> */}
      <Button variant="contained" onClick={handleOpen}>
        Submit Claim
      </Button>
      
      <Dialog component="form" open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth onSubmit={handleFormSubmit}>
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
                required
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
                required
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
                helperText="e.g. JOHN DOE"
                required
              />
              <TextField
                label="Phone Number"
                fullWidth
                value={claimData.phoneNumber}
                onChange={(e) => handleChange('phoneNumber', e.target.value)}
                helperText="e.g. 60123456789"
                required
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
                          value={receipt.date ? dayjs(receipt.date, 'DD-MM-YYYY') : null}
                          maxDate={currentDate}
                          onChange={(newValue) => {
                            handleReceiptChange(index, 'date', newValue ? newValue.format('DD-MM-YYYY') : '');
                          }}
                          format="DD-MM-YYYY"
                          // renderInput={(params) => <TextField {...params} />}
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
          <Button type='submit' variant="contained">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
      {/* Confirmation and Success Dialog */}
      <Dialog open={openDialog} onClose={handleDialogClose}>
        {dialogState === 'confirm' && (
          <>
            <DialogTitle>Confirm Submit</DialogTitle>
            <DialogContent>
              <Typography>
                Are you sure you want to submit the claim? 
                <br />
                Total Amount: RM {claimData.totalAmount.toFixed(2)}
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
              <Button onClick={handleConfirmSubmit} variant="contained" color="primary">
                Confirm
              </Button>
            </DialogActions>
          </>
        )}

        {dialogState === 'loading' && (
          <DialogContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Submitting...</Typography>
          </DialogContent>
        )}
        {dialogState === 'success' && (
          <>
            <DialogTitle>Success</DialogTitle>
            <DialogContent>
              <Typography>
                Your claim has been successfully submitted!
                <br />
                Your Claim ID is {claimData.claimId}. Please keep it for your records.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDialogClose} variant="contained" color="primary">
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </>
  );
}
