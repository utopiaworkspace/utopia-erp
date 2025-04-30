import React, { useState, useEffect } from 'react';
import {
  Typography, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Box, CircularProgress, LinearProgress, MenuItem
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useSession } from '../SessionContext';
import { Navigate } from 'react-router';
import { db } from '../firebase/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import dayjs from 'dayjs';
import submitIncident from '../Submit/SubmitIncident';
import IncidentDialog from '../components/IncidentDialog';
import IncidentFrom   from '../components/IncidentForm';
import IncidentForm from '../components/IncidentForm';

export default function IncidentPage() {
  const { session, loading } = useSession();
  const [open, setOpen] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogState, setDialogState] = useState<'confirm' | 'loading' | 'success'>('confirm');
  const [bankInfo, setBankInfo] = useState<any>(null);

  const [incidentData, setIncidentData] = useState({
    incidentId: '',
    unit: '',
    invoiceNum: '',
    responsibleName: '',
    responsibleDept: '',
    description: '',
    impact: '',
    date: '',
    file: null as File | null,
    email: session?.user?.email || '',
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

  if (loading) return <LinearProgress />;
  if (!session) return <Navigate to="/sign-in" />;

  const resetDialog = () => {
    setDialogState('confirm');
    setOpenDialog(false)
    setOpen(false)
    setIncidentData({
      incidentId: '',
      unit: '',
      invoiceNum: '',
      responsibleName: '',
      responsibleDept: '',
      description: '',
      impact: '',
      date: '',
      file: null,
      email: session?.user?.email || '',
    }); // Reset the form fields// optional: reset ticket ID
  };

  const handleChange = (field: string, value: any) => {
    setIncidentData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleChange('file', e.target.files[0]);
    }
  };

  const validateForm = () => {
    const { unit, invoiceNum, description, date } = incidentData;
    if (!unit || !invoiceNum || !description || !date) {
      alert('Please fill in all required fields.');
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

  const handleConfirmSubmit = async () => {
    setDialogState('loading');
    try {
      const response = await submitIncident(incidentData);
      if (response.success) {
       
        setDialogState('success');      
      } else {
        alert('Failed to submit incident. Please try again.');
        setOpenDialog(false);
      }
    } catch (error) {
      console.error('Submit Error:', error);
      alert('Unexpected error occurred.');
      setOpenDialog(false);
    }
  };



  return (
    <>
      <Button variant="contained" onClick={() => setOpen(true)}>
        Submit Incident Report
      </Button>

      <Dialog component="form" open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth onSubmit={handleFormSubmit}>
              <DialogTitle>Submit Incident Report</DialogTitle>
              <IncidentForm 
                    data={incidentData} 
                    onChange={handleChange} 
                    onFileChange={handleFileChange} 
                />
      
              <DialogActions>
                <Button onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" variant="contained">
                  Submit
                </Button>
              </DialogActions>
            </Dialog>

      

      <IncidentDialog
        open={openDialog}
        state={dialogState}
        onCancel={() => setOpenDialog(false)}
        onConfirm={handleConfirmSubmit}
        onCloseSuccess={resetDialog}
        ticketId={incidentData.incidentId}
      />
    </>
  );
}
