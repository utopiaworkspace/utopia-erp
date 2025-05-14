import React, { useState, useEffect } from 'react';
import {
  Typography, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Box, CircularProgress, LinearProgress, MenuItem, Card, CardContent
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
  const [userInfo, setUserInfo] = useState<any>(null);
  const [teamInfo, setTeamInfo] = useState<any>(null);

  const [incidentData, setIncidentData] = useState({
    incidentId: '',
    incidentType: '',
    severityLevel: 'Low',
    invoiceNum: '',
    email: session?.user?.email || '',
    userName: userInfo?.shortName || '',
    unit: '',
    dept: teamInfo?.dept || '',
    phoneNum: userInfo?.phoneNum || '',
    responsibleName: '',
    responsibleDept: '',
    description: '',
    impact: '',
    date: '',
    file: null as File | null,
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
          const data = userDoc.data();
          setUserInfo(data);
          console.log(data);
          setIncidentData(prev => ({
            ...prev,
            userName: data.shortName || '', // Assuming shortName is the field for user's name
            phoneNum: data.phoneNum || '', // Assuming phoneNum is the field for user's phone number
          }));
        } else {
          setUserInfo(null); // No bank info found
        }
        if (teamDoc.exists()) {
          const data = teamDoc.data();
          console.log(data);
          setTeamInfo(data);
          setIncidentData(prev => ({
            ...prev,
            dept: data.dept || '', // Assuming dept is the field for user's department
          }));
        } else {
          setTeamInfo(null); // No team info found
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

  if (loading) return <LinearProgress />;
  if (!session) return <Navigate to="/sign-in" />;

  const resetDialog = () => {
    setDialogState('confirm');
    setOpenDialog(false);
    setOpen(false);
    setIncidentData({
      incidentId: '',
      invoiceNum: '',
      incidentType: '',
      severityLevel: 'Low',
      email: session?.user?.email || '',
      userName: userInfo?.shortName || '',
      unit: '',
      dept: incidentData?.dept,
      phoneNum: userInfo?.phoneNum || '',
      responsibleName: '',
      responsibleDept: '',
      description: '',
      impact: '',
      date: incidentData?.date,
      file: null,
    });
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
    if (!date) {
      alert('Please fill in the incident date.');
      return false;
    }
    return true;
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    console.log(incidentData);
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
      <Card sx={{ maxWidth: 600, width: '100%', p: 3, boxShadow: 3, mx: 'auto', my: 4 }}>
        <CardContent>
          <Typography variant="body1" color="text.secondary">
          Use this page to submit an <strong>incident report</strong>.
          <br />
          Click the button below to complete the form and provide all relevant details.
          </Typography>
        </CardContent>
      </Card>
      <Button variant="contained" onClick={handleOpen}>
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
