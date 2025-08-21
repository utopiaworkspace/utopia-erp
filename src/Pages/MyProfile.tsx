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
import { Navigate, useLocation } from 'react-router-dom';
import { useSession } from '../SessionContext';
import { supabase } from '../supabase/supabaseClient';
import { upsertUserInfo } from '../Submit/SubmitInfo';

type UserData = {
  fullName?: string;
  shortName?: string;
  phoneNum?: string;
  icNum?: string;
};
type BankInfo = {
  bankName?: string;
  bankNum?: string;
  bankHolder?: string;
};
type TeamInfo = {
  units?: string[];
  dept?: string;
  position?: string;
};

export default function MyProfile() {
  const { session, loading } = useSession();
  const location = useLocation();

  // NEW: hold a guaranteed UID so we never send "undefined" to uuid columns
  const [uid, setUid] = useState<string | null>(null);

  const [userData, setUserData] = useState<UserData>({});
  const [bankInfo, setBankInfo] = useState<BankInfo>({});
  const [teamInfo, setTeamInfo] = useState<TeamInfo>({});
  const [isSaving, setIsSaving] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogState, setDialogState] = useState<'confirm' | 'loading' | 'success'>('confirm');
  const [errors, setErrors] = useState<any>({});

  const isValidPhone = (value: string) => /^6\d{10,11}$/.test(value);
  const isValidIC = (value: string) => /^[A-Z0-9]{6,12}$/.test(value);
  const isValidBankNum = (value: string) => /^\d{6,20}$/.test(value);

  if (loading) return <LinearProgress />;
  if (!session) return <Navigate to="/sign-in" state={{ from: location }} />;

  const { user } = session; // still useful for email, but we fetch uid from supabase.auth below

  const phoneError = userData?.phoneNum && !isValidPhone(userData.phoneNum);
  const icError = userData?.icNum && !isValidIC(userData.icNum);
  const bankNumError = bankInfo?.bankNum && !isValidBankNum(bankInfo.bankNum);

  const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
  const checkedIcon = <CheckBoxIcon fontSize="small" />;

  const units = [
    'UTOPIA HOLIDAY SDN BHD', 'SCAFFOLDING MALAYSIA SDN BHD (SMB)', 'IBNU SINA CARE SDN BHD',
    'REV MOVE SDN BHD (RMB)', 'REV MOVE UTARA SDN BHD (RMU)', 'KAK KENDURI SDN BHD (KMB)',
    'ENCIK BEKU AIRCOND SDN BHD', 'ENCIK BEKU AIRCOND N9 SDN BHD', 'ENCIK BEKU AIRCOND SELATAN SDN BHD',
    'BUTIK GLAM & LUX SDN BHD', 'PULSE PILATES SDN BHD',
    'ANJAKAN STRATEGIK SDN BHD', 'MIMPIAN ASTAKA SDN BHD', 'MEKAR BUDI SDN BHD',
    'MUTIARA EMBUN SDN BHD', 'MERRY ELDERLY CARE SDN BHD', 'COLD TRUCK MALAYSIA SDN BHD',
    'MOBILE WHEELER SDN BHD', 'ENCIK SKYLIFT & CRANE SDN BHD', 'OTHER',
  ];
  const depts = [
    'Operation', 'Finance & Account', 'Indoor Sales', 'Outdoor Agent', 'Customer Service',
    'HR Generalist', 'HR Recruiter', 'Website & Creative', 'Sales & Marketing', 'Maintenance', 'Top Management',
  ];
  const banks = [
    'AFFIN BANK', 'ALLIANCE BANK', 'AMBANK', 'BANK ISLAM', 'BANK RAKYAT', 'BANK MUAMALAT',
    'BSN (BANK SIMPANAN NASIONAL)', 'CIMB BANK', 'GX BANK', 'HONG LEONG BANK', 'HSBC BANK', 'MAYBANK',
    'PUBLIC BANK', 'RHB BANK', 'TOUCH N GO', 'UOB (UNITED OVERSEAS BANK)',
  ];

  // NEW: fetch uid once auth is ready; prevents "invalid input syntax for uuid: undefined"
  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) throw error;
        setUid(data.user?.id ?? null);
      } catch (e) {
        console.error('Failed to get Supabase user:', e);
        setUid(null);
      }
    })();
  }, []);

  // -----------------------------
  // READ-ONLY FETCH (Firebase-like)
  // -----------------------------
  useEffect(() => {
    if (!uid) return; // ⛔ don’t hit DB until we have a real UUID

    const fetchProfile = async () => {
      try {
        // OLD (auto-insert on .single() error) — CAUSES RLS & uuid issues:
        // const { data, error } = await supabase
        //   .from('profiles')
        //   .select('*')
        //   .eq('id', userId)
        //   .single();
        // if (error && error.code === 'PGRST116') { /* insert empty row */ }

        // NEW: read-only fetch; tolerate "not found"; no auto-insert in effect
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', uid)
          .maybeSingle();

        if (error) throw error;

        // Map snake_case → camelCase for the UI
        setUserData({
          fullName: data?.full_name ?? '',
          shortName: data?.short_name ?? '',
          phoneNum: data?.phone_num ?? '',
          icNum: data?.ic_num ?? '',
        });
        setBankInfo({
          bankName: data?.bank_name ?? '',
          bankNum: data?.bank_num ?? '',
          bankHolder: data?.bank_holder ?? '',
        });
        setTeamInfo({
          units: Array.isArray(data?.units) ? data.units : [],
          dept: data?.dept ?? '',
          position: data?.position ?? '',
        });
      } catch (e) {
        console.error('Supabase fetch error:', e);
      }
    };

    fetchProfile();
  }, [uid]);

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
    if (name === 'fullName') {
      const upper = value.toUpperCase();
      setUserData((prev) => ({ ...prev, [name]: upper }));
      return;
    }
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBankChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updatedValue = name === 'bankNum' ? value.replace(/\D/g, '') : value.toUpperCase();
    setBankInfo((prev) => ({ ...prev, [name]: updatedValue }));
  };

  const handleTeamChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTeamInfo((prev) => ({ ...prev, [e.target.name]: e.target.value }));
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

  // NEW: build update object (Firebase merge semantics)
  const buildUpdate = () => {
    const update: Record<string, any> = {
      email: user.email,
      full_name: userData.fullName ?? '',
      short_name: userData.shortName ?? '',
      phone_num: userData.phoneNum ?? '',
      ic_num: userData.icNum ?? '',
      bank_name: bankInfo.bankName ?? '',
      bank_num: bankInfo.bankNum ?? '',
      bank_holder: bankInfo.bankHolder ?? '',
      units: teamInfo.units ?? [],
      dept: teamInfo.dept ?? '',
      position: teamInfo.position ?? '',
      updated_at: new Date().toISOString(),
    };
    Object.keys(update).forEach((k) => update[k] === undefined && delete update[k]);
    return update;
  };

  const handleSave = async () => {
    if (!validateFields()) {
      alert('Please fill in all required fields.');
      setOpenDialog(false);
      return;
    }

    setDialogState('loading');
    setIsSaving(true);

    try {
      // Re-fetch uid right before write (guards against stale state)
      const { data: ures, error: uerr } = await supabase.auth.getUser();
      if (uerr) throw uerr;
      const uidNow = ures.user?.id;
      if (!uidNow) throw new Error('No active Supabase session (uid missing)');

      const update = buildUpdate();

      // OLD (triggers INSERT policy even when row exists):
      // const { error } = await supabase.from('profiles').upsert({ id: userId, ...update });

      // NEW: UPDATE if exists (avoids INSERT RLS), else INSERT once.
      const { data: existing, error: selErr } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', uidNow)
        .maybeSingle();
      if (selErr) throw selErr;

      if (existing) {
        // UPDATE: DO NOT send id in body; target with .eq
        const { error: updErr } = await supabase
          .from('profiles')
          .update(update)
          .eq('id', uidNow);
        if (updErr) throw updErr;
      } else {
        // INSERT: include id in row; requires INSERT policy (auth.uid() = id)
        const { error: insErr } = await supabase
          .from('profiles')
          .insert([{ id: uidNow, ...update }]);
        if (insErr) throw insErr;
      }

      // Secondary system call — don’t let it mask success
      upsertUserInfo({
        action: 'upsert_userinfo',
        email: user.email,
        phoneNum: userData.phoneNum || '',
        fullName: userData.fullName || '',
        icNum: userData.icNum || '',
        bankName: bankInfo.bankName || '',
        bankNum: bankInfo.bankNum || '',
        bankHolder: bankInfo.bankHolder || '',
      }).catch((e) => console.warn('upsertUserInfo failed (non-blocking):', e));

      setDialogState('success');
    } catch (err: any) {
      console.error('Profile save failed:', {
        message: err?.message,
        code: err?.code,
        details: err?.details,
        hint: err?.hint,
      });
      alert(`❌ Save failed: ${err?.message ?? 'Unknown error'}`);
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

  // Optional: while uid is resolving, show a tiny skeleton to avoid accidental queries
  if (uid === null) return <LinearProgress />;

  return (
    <div>
      <Box component="form" sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h6">Personal Information</Typography>

        <TextField
          label="Full Name"
          name="fullName"
          value={userData?.fullName || ''}
          onChange={handleUserChange}
          fullWidth
          required
          helperText="ℹ️ e.g. MUHAMMAD AHMAD BIN ABU BAKAR"
        />
        <TextField
          label="Short Name"
          name="shortName"
          value={userData?.shortName || ''}
          onChange={handleUserChange}
          fullWidth
          helperText="ℹ️ e.g. Ahmad"
        />
        <TextField label="Email" name="gmail" value={user.email || ''} onChange={handleUserChange} fullWidth disabled />
        <TextField
          label="IC No. / Passport No."
          name="icNum"
          value={userData?.icNum || ''}
          onChange={handleUserChange}
          fullWidth
          error={!!icError}
          helperText={
            icError
              ? '❌ Invalid IC/Passport format. Only A-Z and 0-9, 6 to 12 characters.'
              : "ℹ️ e.g. 021012145041 or A17492711. No '-' symbol or spaces."
          }
        />

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
              ? '❌ Must start with 6 and contain 11 or 12 digits only.'
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
          renderInput={(params) => <TextField {...params} label="Company Name" placeholder="Select company" />}
        />
        <TextField
          select
          label="Department"
          value={teamInfo.dept || ''}
          onChange={(e) => setTeamInfo({ ...teamInfo, dept: e.target.value })}
          placeholder="Select a department"
          fullWidth
        >
          {depts.map((dept) => (
            <MenuItem key={dept} value={dept}>
              {dept}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Position"
          name="position"
          value={teamInfo?.position || ''}
          onChange={handleTeamChange}
          fullWidth
          helperText="ℹ️ e.g. Executive, Team Leader, Technician, Driver, etc."
        />

        <Typography variant="h6">Bank Information</Typography>
        <TextField
          label="Bank Account Holder Name"
          name="bankHolder"
          value={bankInfo?.bankHolder || ''}
          onChange={handleBankChange}
          fullWidth
        />
        <Autocomplete
          options={banks}
          value={bankInfo?.bankName || ''}
          onChange={(_, newValue) => setBankInfo((prev) => ({ ...prev, bankName: newValue ?? '' }))}
          renderInput={(params) => <TextField {...params} label="Bank Name" name="bankName" fullWidth required />}
          disableClearable
        />
        <TextField
          label="Bank Account Number"
          name="bankNum"
          value={bankInfo?.bankNum || ''}
          onChange={handleBankChange}
          fullWidth
          error={!!bankNumError}
          helperText={
            bankNumError
              ? '❌ Bank number must be 6 to 20 digits.'
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
