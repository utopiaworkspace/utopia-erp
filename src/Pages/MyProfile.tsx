import React, { useState, useEffect } from 'react';
import {
  Typography,
  LinearProgress,
  TextField,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import { Navigate, useLocation } from 'react-router';
import { useSession } from '../SessionContext';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { upsertUserInfo } from '../Submit/SubmitInfo';

export default function MyProfile() {
  const { session, loading } = useSession();
  const location = useLocation();
  const [userData, setUserData] = useState<any>(null);
  const [bankInfo, setBankInfo] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogState, setDialogState] = useState<'confirm' | 'loading' | 'success'>('confirm');

  if (loading) {
    return <LinearProgress />;
  }

  if (!session) {
    return <Navigate to="/sign-in" state={{ from: location }} />;
  }

  const { user } = session;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRef = doc(db, 'users', user.email);
        const userDoc = await getDoc(userRef);

        const bankRef = doc(db, 'bankinfo', user.email);
        const bankDoc = await getDoc(bankRef);

        setUserData(userDoc.exists() ? userDoc.data() : {});
        setBankInfo(bankDoc.exists() ? bankDoc.data() : {});
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [user.email]);

  const handleUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleBankChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBankInfo({ ...bankInfo, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setDialogState('loading');
    try {
      if (userData) {
        await setDoc(doc(db, 'users', user.email), userData, { merge: true });
      }
      if (bankInfo) {
        await setDoc(doc(db, 'bankinfo', user.email), bankInfo, { merge: true });
      }

      if (userData && bankInfo) {
        const payload = {
          action: 'upsert_userinfo',
          email: user.email,
          phoneNum: userData.phoneNum || '',
          fullName: userData.fullName || '',
          icNum: userData.icNum || '',
          bankName: bankInfo.bankName || '',
          bankNum: bankInfo.bankNum || '',
          bankHolder: bankInfo.bankHolder || '',
        };

        console.log('Submitting payload:', payload);

        await upsertUserInfo(payload);
      }

      setDialogState('success');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
      setOpenDialog(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDialogClose = () => {
    if (dialogState === 'success') {
      setOpenDialog(false); // Close the dialog
      setTimeout(() => {
        setDialogState('confirm'); // Reset dialogState to 'confirm'
      }, 500); // Delay of 1 second
    } else {
      setOpenDialog(false); // Close the dialog immediately for other states
    }
  };

  return (
    <div>
      <Box component="form" sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h6">User Information</Typography>
        <TextField
          label="Full Name"
          name="fullName"
          value={userData?.fullName || ''}
          onChange={handleUserChange}
          fullWidth
          helperText="e.g. JOHN DOE"
        />
        <TextField
          label="Short Name"
          name="shortName"
          value={userData?.shortName || ''}
          onChange={handleUserChange}
          fullWidth
        />
        <TextField
          label="Email"
          name="gmail"
          value={user.email || ''}
          onChange={handleUserChange}
          fullWidth
          disabled
        />
        <TextField
          label="IC No."
          name="icNum"
          value={userData?.icNum || ''}
          onChange={handleUserChange}
          fullWidth
          helperText="e.g. 021121-10-9012"
        />
        <TextField
          label="Phone Number"
          name="phoneNum"
          value={userData?.phoneNum || ''}
          onChange={handleUserChange}
          fullWidth
          helperText="e.g. 60123456789"
        />

        <Typography variant="h6">Bank Information</Typography>
        <TextField
          label="Bank Holder"
          name="bankHolder"
          value={bankInfo?.bankHolder || ''}
          onChange={handleBankChange}
          fullWidth
        />
        <TextField
          label="Bank Name"
          name="bankName"
          value={bankInfo?.bankName || ''}
          onChange={handleBankChange}
          fullWidth
        />
        <TextField
          label="Bank Number"
          name="bankNum"
          value={bankInfo?.bankNum || ''}
          onChange={handleBankChange}
          fullWidth
          helperText="Without spaces. e.g. 123456789012"
        />

        <Button
          variant="contained"
          color="primary"
          onClick={() => setOpenDialog(true)}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </Box>

      {/* Confirmation and Success Dialog */}
      <Dialog open={openDialog} onClose={handleDialogClose}>
        {dialogState === 'confirm' && (
          <>
            <DialogTitle>Confirm Changes</DialogTitle>
            <DialogContent>
              <Typography>Are you sure you want to save these changes?</Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
              <Button onClick={handleSave} variant="contained" color="primary">
                Confirm
              </Button>
            </DialogActions>
          </>
        )}
        {dialogState === 'loading' && (
          <DialogContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Saving changes...</Typography>
          </DialogContent>
        )}
        {dialogState === 'success' && (
          <>
            <DialogTitle>Success</DialogTitle>
            <DialogContent>
              <Typography>Your profile has been updated successfully!</Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDialogClose} variant="contained" color="primary">
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </div>
  );
}