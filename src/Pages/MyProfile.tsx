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
  Autocomplete,
  Checkbox,
  MenuItem,
} from '@mui/material';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { Navigate, useLocation } from 'react-router';
import { useSession } from '../SessionContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { upsertUserInfo } from '../Submit/SubmitInfo';

export default function MyProfile() {
  const { session, loading } = useSession();
  const location = useLocation();
  const [userData, setUserData] = useState<any>(null);
  const [bankInfo, setBankInfo] = useState<any>(null);
  const [teamInfo, setTeamInfo] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogState, setDialogState] = useState<'confirm' | 'loading' | 'success'>('confirm');

  const [errors, setErrors] = useState<any>({});

  const isValidPhone = (value: string) => /^6\d{10,11}$/.test(value);
  const phoneError = userData?.phoneNum && !isValidPhone(userData.phoneNum);

  const isValidIC = (value: string) => /^[A-Z0-9]{6,12}$/.test(value);
  const icError = userData?.icNum && !isValidIC(userData.icNum);

  const isValidBankNum = (value: string) => /^\d{6,20}$/.test(value);
  const bankNumError = bankInfo?.bankNum && !isValidBankNum(bankInfo.bankNum);

  const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
  const checkedIcon = <CheckBoxIcon fontSize="small" />;
  const units = [
    "UTOPIA HOLIDAY SDN BHD", "SCAFFOLDING MALAYSIA SDN BHD (SMB)", "IBNU SINA CARE SDN BHD",
    "REV MOVE SDN BHD (RMB)", "REV MOVE UTARA SDN BHD (RMU)", "KAK KENDURI SDN BHD (KMB)",
    "ENCIK BEKU AIRCOND SDN BHD", "BUTIK GLAM & LUX SDN BHD", "PULSE PILATES SDN BHD",
    "ANJAKAN STRATEGIK SDN BHD", "MIMPIAN ASTAKA SDN BHD", "MEKAR BUDI SDN BHD",
    "MUTIARA EMBUN SDN BHD", "MERRY ELDERLY CARE SDN BHD", "COLD TRUCK MALAYSIA SDN BHD",
    "MOBILE WHEELER SDN BHD", "OTHER"
  ];
  const depts = [
    "Operation",
    "Finance & Account",
    "Indoor Sales",
    "Outdoor Agent",
    "Customer Service",
    "HR Generalist",
    "HR Recruiter",
    "Website & Creative",
    "Sales & Marketing", 
    "Maintenance",
    "Top Management"
  ];

  if (loading) return <LinearProgress />;
  if (!session) return <Navigate to="/sign-in" state={{ from: location }} />;

  const { user } = session;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRef = doc(db, 'users', user.email);
        const userDoc = await getDoc(userRef);

        const bankRef = doc(db, 'bankinfo', user.email);
        const bankDoc = await getDoc(bankRef);

        const teamRef = doc(db, 'teaminfo', user.email);
        const teamDoc = await getDoc(teamRef);

        setUserData(userDoc.exists() ? userDoc.data() : {});
        setBankInfo(bankDoc.exists() ? bankDoc.data() : {});
        setTeamInfo(teamDoc.exists() ? teamDoc.data() : {});
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [user.email]);

  const handleUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'phoneNum') {
      const digits = value.replace(/\D/g, '');
      if (digits === '' || /^6\d{0,11}$/.test(digits)) {
        setUserData((prev) => ({ ...prev, [name]: digits }));
      }
      return;
    }

    if (name === 'icNum') {
      const cleaned = value.replace(/[^A-Z0-9]/gi, '').toUpperCase();
      setUserData((prev) => ({ ...prev, [name]: cleaned }));
      return;
    }

    if (name === 'bankNum') {
      const digits = value.replace(/\D/g, '');
      setUserData((prev) => ({ ...prev, [name]: digits }));
      return;
    }

    if (name === 'fullName') {
      const upper = value.toUpperCase();
      setUserData((prev) => ({ ...prev, [name]: upper }));
      return;
    }

    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBankChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'bankNum') {
      const digitsOnly = value.replace(/\D/g, '');
      setBankInfo({ ...bankInfo, [name]: digitsOnly });
    } else if (name === 'bankHolder') {
      setBankInfo({ ...bankInfo, [name]: value.toUpperCase() });
    } else {
      setBankInfo({ ...bankInfo, [name]: value });
    }
  };

  const handleTeamChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTeamInfo({ ...teamInfo, [e.target.name]: e.target.value });
  };

  const validateFields = () => {
    const newErrors: any = {};
    if (!userData.fullName) newErrors.fullName = true;
    if (!userData.icNum || !isValidIC(userData.icNum)) newErrors.icNum = true;
    if (!userData.phoneNum || !isValidPhone(userData.phoneNum)) newErrors.phoneNum = true;
    if (!bankInfo.bankHolder) newErrors.bankHolder = true;
    if (!bankInfo.bankName) newErrors.bankName = true;
    if (!bankInfo.bankNum || !isValidBankNum(bankInfo.bankNum)) newErrors.bankNum = true;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateFields()) {
      alert('Please fill in all required fields.');
      setOpenDialog(false);
      return;
    }

    setDialogState('loading');
    try {
      if (userData) await setDoc(doc(db, 'users', user.email), userData, { merge: true });
      if (bankInfo) await setDoc(doc(db, 'bankinfo', user.email), bankInfo, { merge: true });
      if (teamInfo) await setDoc(doc(db, 'teaminfo', user.email), teamInfo, { merge: true });

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
      setOpenDialog(false);
      setTimeout(() => setDialogState('confirm'), 500);
    } else {
      setOpenDialog(false);
    }
  };

  return (
    <div>
      <Box component="form" sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h6">Personal Information</Typography>

        <TextField label="Full Name" name="fullName" value={userData?.fullName || ''} onChange={handleUserChange} fullWidth required helperText="ℹ️ e.g. MUHAMMAD AHMAD BIN ABU BAKAR" />
        <TextField label="Short Name" name="shortName" value={userData?.shortName || ''} onChange={handleUserChange} fullWidth helperText="ℹ️ e.g. Ahmad" />
        <TextField label="Email" name="gmail" value={user.email || ''} onChange={handleUserChange} fullWidth disabled />
        <TextField 
          label="IC No. / Passport No." 
          name="icNum" 
          value={userData?.icNum || ''} 
          onChange={handleUserChange} 
          fullWidth error={!!icError} 
          helperText={
            icError 
              ? "❌ Invalid IC/Passport format. Only A-Z and 0-9, 6 to 12 characters." 
              : "ℹ️ e.g. 021012145041 or A17492711. No '-' symbol or spaces."} />

        <TextField
          label="Phone Number"
          name="phoneNum"
          value={userData?.phoneNum || ''}
          onChange={handleUserChange}
          fullWidth
          inputProps={{ inputMode: 'numeric', maxLength: 12, pattern: '6[0-9]{10,11}' }}
          error={!!phoneError}
          helperText={
            phoneError
              ? "❌ Must start with 6 and contain 11 or 12 digits only."
              : "ℹ️ Numbers only, no '-' symbol or spaces. e.g. 60123456789 or 601234567890"
          }
        />

        <Typography variant="h6">Team Information</Typography>
        <Autocomplete
          multiple
          options={units}
          disableCloseOnSelect
          getOptionLabel={(option) => option}
          value={teamInfo.units || []}
          onChange={(_, newValue) => setTeamInfo({ ...teamInfo, units: newValue })}
          renderOption={(props, option, { selected }) => (
            <li {...props}>
              <Checkbox icon={icon} checkedIcon={checkedIcon} style={{ marginRight: 8 }} checked={selected} />
              {option}
            </li>
          )}
          style={{ width: '100%' }}
          renderInput={(params) => (
            <TextField {...params} label="Company Name" placeholder="Select company" />
          )}
        />
        <TextField select label="Department" value={teamInfo.dept || ''} onChange={(e) => setTeamInfo({ ...teamInfo, dept: e.target.value })} placeholder="Select a department" fullWidth>
          {depts.map((dept) => (
            <MenuItem key={dept} value={dept}>{dept}</MenuItem>
          ))}
        </TextField>
        <TextField label="Position" name="position" value={teamInfo?.position || ''} onChange={handleTeamChange} fullWidth helperText="ℹ️ e.g. Executive, Team Leader, Technician, Driver, etc." />

        <Typography variant="h6">Bank Information</Typography>
        <TextField label="Bank Account Holder Name" name="bankHolder" value={bankInfo?.bankHolder || ''} onChange={handleBankChange} fullWidth />
        <TextField label="Bank Name" name="bankName" value={bankInfo?.bankName || ''} onChange={handleBankChange} fullWidth />
        <TextField
          label="Bank Account Number"
          name="bankNum"
          value={bankInfo?.bankNum || ''}
          onChange={handleBankChange}
          fullWidth
          error={!!bankNumError}
          helperText={
            bankNumError
              ? "❌ Bank number must be 6 to 20 digits."
              : "ℹ️ Numbers only. No '-' symbol, spaces, or special characters. e.g. 123456789012"
          }
    />


        <Button variant="contained" color="primary" onClick={() => setOpenDialog(true)} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </Box>

      <Dialog open={openDialog} onClose={handleDialogClose}>
        {dialogState === 'confirm' && (
          <>
            <DialogTitle>Confirm Changes</DialogTitle>
            <DialogContent>
              <Typography>Are you sure you want to save these changes?</Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
              <Button onClick={handleSave} variant="contained" color="primary">Confirm</Button>
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
              <Button onClick={handleDialogClose} variant="contained" color="primary">Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </div>
  );
}
