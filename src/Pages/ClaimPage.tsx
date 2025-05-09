import React, { useState, useEffect, use } from 'react';
import {
  Typography, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, MenuItem, Grid, IconButton, Card, CardContent
} from '@mui/material';
import { AddCircleOutline, RemoveCircleOutline } from '@mui/icons-material';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, { Dayjs } from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { submitClaim } from '../Submit/SubmitClaim';
import { useSession } from '../SessionContext';
import LinearProgress from '@mui/material/LinearProgress';
import { Navigate, useLocation } from 'react-router';
import { CircularProgress } from '@mui/material';
import { db } from '../firebase/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import ClaimDialog from '../components/ClaimDialog';
import ClaimForm from '../components/ClaimForm';


export default function ClaimPage() {
  const { session, loading } = useSession();
  const [bankInfo, setBankInfo] = useState<any>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [teamInfo, setTeamInfo] = useState<any>(null);
  
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
    icNum: '',
    totalAmount: 0,
    receiptCount: 0,
    receipts: [{ date: '', description: '', amount: '', file: null }]
  });
  useEffect(() => {
    const fetchInfo = async () => {
      if (session?.user?.email) {
        const bankRef = doc(db, 'bankinfo', session.user.email);
        const userRef = doc(db, 'users', session.user.email);
        const teamRef = doc(db, 'teaminfo', session.user.email);
        const bankDoc = await getDoc(bankRef);
        const userDoc = await getDoc(userRef);
        const teamDoc = await getDoc(teamRef);
        if (bankDoc.exists()) {
          setBankInfo(bankDoc.data());
        } else {
          setBankInfo(null); // No bank info found
        }
        if (userDoc.exists()) {
          setUserInfo(userDoc.data());
          claimData.fullName = userDoc.data().fullName || ''; 
          claimData.phoneNumber = userDoc.data().phoneNum || ''; 
          claimData.icNum = userDoc.data().icNum || '';
        } else {
          setUserInfo(null); // No bank info found
        }
        if (teamDoc.exists()) {
          setTeamInfo(teamDoc.data());
        } else {
          setTeamInfo(null); // No bank info found
        }
      }
    };

    fetchInfo();
  }, [session?.user?.email]);

  
  

  const handleOpen = () => {
    if (!bankInfo || !userInfo) {
      alert('Please update your personal information before submitting a claim.');
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
    setOpen(false); // Add this to close the form dialog
    setClaimData({
      claimId: '',
      claimType: '',
      benefitType: '',
      unit: '',
      fullName: userInfo?.fullName || '', // Use userInfo state to set the full name
      email: user.email,
      phoneNumber: userInfo?.phoneNum || '', // Use userInfo state to set the phone number
      icNum: userInfo?.icNum || '', // Use userInfo state to set the IC number
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
    console.log(claimData);
    e.preventDefault();
    if (validateForm()) {
      setOpenDialog(true);
    }
  };

  return (
    <>
      
      <Card sx={{ maxWidth: 600, width: '100%', p: 3, boxShadow: 3, mx: 'auto', my: 4 }}>
        <CardContent>
          <Typography variant="body1" color="text.secondary">
          Use this page to submit a reimbursement claim.
          <br />
          Click the button below to complete the form and upload any necessary receipts. The form accommodates both <strong>general</strong> and <strong>benefit</strong> claims.
          </Typography>
        </CardContent>
      </Card>

      
      <Button variant="contained" onClick={handleOpen}>
        Submit Claim
      </Button>
      
      <Dialog component="form" open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth onSubmit={handleFormSubmit}>
        <DialogTitle>Submit a New Claim</DialogTitle>
        <ClaimForm
          data={claimData}
          onChange={handleChange}
          onReceiptChange={handleReceiptChange}
          onFileChange={(index, file) => handleReceiptChange(index, 'file', file)}
          addReceipt={addReceipt}
          removeReceipt={removeReceipt}
          
        />
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button type='submit' variant="contained">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
      {/* Confirmation and Success Dialog */}
      <ClaimDialog
        open={openDialog}
        state={dialogState}
        onCancel={() => setOpenDialog(false)}
        onConfirm={handleConfirmSubmit}
        onCloseSuccess={resetDialog} // Add this line
        claimId={claimData.claimId}
        totalAmount={claimData.totalAmount}
        receiptCount={claimData.receiptCount}
        />

      
    </>
  );
}
