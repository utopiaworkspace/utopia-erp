import React, { useState, useEffect, use } from 'react';
import {
  Typography, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, MenuItem, Grid, IconButton, Card, CardContent, Snackbar, Alert
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
 
  const [dialogState, setDialogState] = useState<'confirm' | 'loading' | 'success' | 'error'>('confirm');
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
    bankHolder: '',
    bankName: '',
    bankNum: '',
    totalAmount: 0,
    receiptCount: 0,
    receipts: [{ date: '', description: '', amount: '', file: null }]
  });
  const [submitTimestamp, setSubmitTimestamp] = useState<string>("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);

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
          claimData.bankHolder = bankDoc.data().bankHolder || '';
          claimData.bankName = bankDoc.data().bankName || '';
          claimData.bankNum = bankDoc.data().bankNum || '';
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

  const handleDialogClose = (event, reason) => {
    if (isDirty) {
      setShowLeaveDialog(true); // 弹出确认提示
    } else {
      setOpenDialog(false); // 直接关闭
    }
  };

  const handleChange = (field: string, value: any) => {
    setClaimData((prev) => ({
      ...prev,
      [field]: value,
      ...(field === 'claimType' && value === 'General' ? { benefitType: '' } : {}), // Clear benefitType if claimType is empty
    }));
    setIsDirty(true);
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
    setIsDirty(true);
  };
 
  const addReceipt = () => {
    if (claimData.receipts.length >= 50) {
      alert('You can only add up to 50 receipts.');
      return;
    }
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
    setIsDirty(true);
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
    setIsDirty(true);
  };

  const handleConfirmSubmit = async () => {
    setDialogState('loading');
    setSubmitTimestamp(dayjs().format('YYYY-MM-DD HH:mm:ss'));
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
        setErrorMessage(response.message || 'Failed to submit claim.');
        setDialogState('error');
      }
    } catch (error: any) {
      console.error('Error during claim submission:', error);
      setErrorMessage(error.message || 'An unexpected error occurred. Please try again or contact admin.');
      setDialogState('error');
    }
 
    console.log('Submitting claim:', claimData);
    setOpen(false);
  };  

  const resetDialog = () => {
    setOpenDialog(false);
    setOpen(false);
    setClaimData({
      claimId: '',
      claimType: '',
      benefitType: '',
      unit: '',
      fullName: userInfo?.fullName || '',
      email: user.email,
      phoneNumber: userInfo?.phoneNum || '',
      icNum: userInfo?.icNum || '',
      bankHolder: bankInfo?.bankHolder || '',
      bankName: bankInfo?.bankName || '',
      bankNum: bankInfo?.bankNum || '',
      totalAmount: 0,
      receiptCount: 0,
      receipts: [{ date: '', description: '', amount: '', file: null }]
    });
    setIsDirty(false);
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
 
  const handleFormSubmit = (e) => {
    e.preventDefault();
    setDialogState('confirm'); // 进入确认状态
    setOpenDialog(true);       // 打开弹窗
  };

  const handleFileChange = (index: number, file: File) => {
    const updatedReceipts = [...claimData.receipts];
    updatedReceipts[index].file = file;
    setClaimData(prev => ({
      ...prev,
      receipts: updatedReceipts,
    }));
    setIsDirty(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleOpenDialog = () => {
    setDialogState('confirm');
    setOpenDialog(true);
  };

  const handleLeaveConfirm = () => {
    setOpenDialog(false);
    setShowLeaveDialog(false);
    setIsDirty(false);
    resetDialog();
  };

  const handleLeaveCancel = () => {
    setShowLeaveDialog(false);
  };

  return (
    <>
      <Card sx={{ maxWidth: 600, width: '100%', p: 3, boxShadow: 3, mx: 'auto', my: 4 }}>
        <CardContent>
          <Typography variant="body1" color="text.secondary" component="div">
            This page allows you to submit a reimbursement claim, such as:
            <ul style={{ paddingLeft: 20, marginTop: 8 }}>
              <li>General Claim: For general expenses.</li>
              <li>Benefit Claim: For specific benefits provided by the company.</li>
            </ul>
            <br />
            📌 Phase 1: Submission only. History and tracking will be added soon.
            <br /><br />
            <strong>Steps:</strong>
            <ol style={{ paddingLeft: 20, margin: 0 }}>
              <li>Snap and upload your receipts here.</li>
              <li>Paste the original receipts on an A4 paper.</li>
              <li>
                At the top of the paper, clearly write:
                <ul style={{ paddingLeft: 20, marginTop: 4 }}>
                  <li>Full Name</li>
                  <li>Company Name</li>
                  <li>Claim ID</li>
                </ul>
              </li>
              <li>Submit the A4 paper with the original receipts to the Finance Department (Mailbox at Utopia Main Office).</li>
            </ol>
            <br />
            After submission, a <strong>Claim ID</strong> will be shown.
            <br />
            <span style={{ color: '#d97706', fontWeight: 600 }}>📸 Please screenshot and save it</span>
            <br />
            <span style={{ color: '#d32f2f', fontWeight: 600 }}>🚫 No original receipt = No process</span>
          </Typography>
        </CardContent>
      </Card>
      <Button variant="contained" onClick={handleOpen}>
        Submit Claim
      </Button>
     
      <Dialog component="form" open={open} onClose={handleDialogClose} maxWidth="md" fullWidth onSubmit={handleFormSubmit}>
        <DialogTitle>Submit a New Claim</DialogTitle>
        <ClaimForm
          data={claimData}
          onChange={handleChange}
          onReceiptChange={handleReceiptChange}
          onFileChange={handleFileChange}
          addReceipt={addReceipt}
          removeReceipt={removeReceipt}
          dialogOpen={openDialog}
          onDialogClose={handleDialogClose}
          snackbarOpen={snackbarOpen}
          onSnackbarClose={handleSnackbarClose}
        />
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button type='submit' variant="contained">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
      <ClaimDialog
        open={openDialog}
        state={dialogState}
        claimId={claimData.claimId}
        totalAmount={Number(claimData.totalAmount) || 0}
        receiptCount={claimData.receipts?.length || 0}
        submitTimestamp={submitTimestamp}
        errorMessage={errorMessage}
        onCancel={() => setOpenDialog(false)}
        onConfirm={handleConfirmSubmit}
        onCloseSuccess={resetDialog}
      />
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert severity="warning">
          Are you sure you want to close the form? Unsaved changes will be lost.
        </Alert>
      </Snackbar>
      <Dialog
        open={showLeaveDialog}
        onClose={handleLeaveCancel}
      >
        <DialogTitle>Confirm Leave</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to close? Your data will be lost.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleLeaveCancel}>Cancel</Button>
          <Button onClick={handleLeaveConfirm} color="error">Leave</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}











