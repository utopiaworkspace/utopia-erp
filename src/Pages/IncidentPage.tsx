import React, { useState, useEffect } from 'react';
import {
  Typography, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Box, CircularProgress
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, { Dayjs } from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useSession } from '../SessionContext';
import { Navigate } from 'react-router';
import LinearProgress from '@mui/material/LinearProgress';
import { db } from '../firebase/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import MenuItem from '@mui/material/MenuItem';
import submitIncident from '../Submit/SubmitIncident';

export default function IncidentPage() {
  const { session, loading } = useSession();
  const [open, setOpen] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogState, setDialogState] = useState<'confirm' | 'loading' | 'success'>('confirm');
  const [bankInfo, setBankInfo] = useState<any>(null);
  const currentDate = dayjs(); 

  const user = session?.user || { email: '' };

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
    email: user.email,
  });

  useEffect(() => {
    if (session?.user?.email) {
      setIncidentData(prev => ({
        ...prev,
        
        email: session.user.email,
      }));

      const fetchBankInfo = async () => {
        const bankRef = doc(db, 'bankinfo', session.user.email);
        const bankDoc = await getDoc(bankRef);
        if (bankDoc.exists()) {
          setBankInfo(bankDoc.data());
        } else {
          setBankInfo(null);
        }
      };

      fetchBankInfo();
    }
  }, [session?.user?.email]);

  if (loading) return <LinearProgress />;
  if (!session) return <Navigate to="/sign-in" />;

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

  const handleSubmit = async () => {
    setDialogState('loading');
    try {
      const response = await submitIncident(incidentData);
      if (response.success) {
        setIncidentData(prev => ({ ...prev, ticketId: response.incidentId }));
        setDialogState('success');
      } else {
        alert('Failed to submit incident. Please try again.');
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

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Submit Incident Report</DialogTitle>
        <DialogContent dividers>
          <Box display="flex" flexDirection="column" gap={2} mt={2}>

            <TextField
              label="Business Unit"
              select
              fullWidth
              value={incidentData.unit}
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
            <TextField
              label="Invoice Number"
              fullWidth
              value={incidentData.invoiceNum}
              onChange={(e) => handleChange('invoiceNum', e.target.value)}
            />
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                sx={{ minWidth: "40%" }}
                label="Date"
                value={incidentData.date ? dayjs(incidentData.date) : null}
                maxDate={dayjs()} // Ensure the date picker can't go beyond today's date
                onChange={(newValue) => handleChange('date', newValue ? newValue.format('DD-MM-YYYY') : '')}
                renderInput={(params) => <TextField {...params} />}
              />
            </LocalizationProvider>

            <TextField
              label="Responsible Department"
              fullWidth
              value={incidentData.responsibleDept}
              onChange={(e) => handleChange('responsibleDept', e.target.value)}
            />
            <TextField
              label="Responsible Person"
              fullWidth
              value={incidentData.responsibleName}
              onChange={(e) => handleChange('responsibleName', e.target.value)}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={4}
              value={incidentData.description}
              onChange={(e) => handleChange('description', e.target.value)}
            />
            <TextField
              label="Impact"
              fullWidth
              multiline
              rows={2}
              value={incidentData.impact}
              onChange={(e) => handleChange('impact', e.target.value)}
            />
            <Button variant="contained" component="label">
              Upload File
              <input type="file" hidden onChange={handleFileChange} />
            </Button>
            {incidentData.file && (
              <Typography variant="body2" mt={1}>
                Selected File: {incidentData.file.name}
              </Typography>
            )}
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={() => setOpenDialog(true)} variant="contained">
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm and Status Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        {dialogState === 'confirm' && (
          <>
            <DialogTitle>Confirm Submit</DialogTitle>
            <DialogContent>
              <Typography>Are you sure you want to submit this incident report?</Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
              <Button onClick={handleSubmit} variant="contained" color="primary">
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
                Your incident report has been successfully submitted!
                <br />
                Your Ticket ID is {incidentData.incidentId}. Please keep it for your records.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)} variant="contained" color="primary">
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </>
  );
}
