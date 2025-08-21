import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress
} from '@mui/material';

interface Props {
  open: boolean;
  state: 'confirm' | 'loading' | 'success' | 'error'; // Add 'error'
  onCancel: () => void;
  onConfirm: () => void;
  onCloseSuccess: () => void;
  claimId: string;
  totalAmount: number;
  receiptCount: number;
  submitTimestamp?: string;
  errorMessage?: string; // Add error message prop
}

export default function ClaimDialog({
  open,
  state,
  onCancel,
  onConfirm,
  onCloseSuccess,
  claimId,
  totalAmount,
  receiptCount,
  submitTimestamp,
  errorMessage
}: Props) {
  return (
    <Dialog
      open={open}
      fullWidth
      maxWidth="sm"
      onClose={(e, reason) => {
        if (state === 'loading' || state === 'success') return;
        onCancel();
      }}
    >
      {state === 'confirm' && (
        <>
          <DialogTitle>Confirm Submit</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to submit the claim?
              <br />
              Total Amount: RM {Number(totalAmount).toFixed(2)}
              <br />
              Number of Receipts: {receiptCount}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={onCancel}>Cancel</Button>
            <Button onClick={onConfirm} variant="contained" color="primary">
              Confirm
            </Button>
          </DialogActions>
        </>
      )}

      {state === 'loading' && (
        <DialogContent
          sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
        >
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Submitting...</Typography>
        </DialogContent>
      )}

      {state === 'success' && (
        <>
          <DialogTitle>Success</DialogTitle>
          <DialogContent>
            <Typography>
              ✅ Claim Submitted Successfully!
              <br />
              <br />
              Your Claim ID: <strong>{claimId}</strong>
              <br />
              Submitted At: {submitTimestamp ? submitTimestamp : <span style={{ color: '#d32f2f' }}>No timestamp</span>}
              <br />
              <span style={{ color: '#d97706', fontWeight: 600 }}>📸 Please screenshot and save it.</span>
              <br />
              <br />
              Total Amount: RM {Number(totalAmount).toFixed(2)}
              <br />
              Number of Receipts: {receiptCount}
              <br />
              <br />
              📌 What to do next:
              <ol style={{ paddingLeft: 20, margin: 0 }}>
                <li>Paste your original receipt on A4 paper.</li>
                <li>
                  Write at the top:
                  <ul style={{ paddingLeft: 20, marginTop: 4 }}>
                    <li>Your Full Name</li>
                    <li>Company Name</li>
                    <li>Claim ID</li>
                  </ul>
                </li>
                <li>
                  Submit the A4 paper to the Finance Department
                  <br />
                  (Mailbox at Utopia Main Office).
                </li>
              </ol>
              <br />
              <span style={{ color: '#d32f2f', fontWeight: 600 }}>
                ❗ No original receipt = No process
              </span>
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={onCloseSuccess} variant="contained" color="primary">
              Close
            </Button>
          </DialogActions>
        </>
      )}

      {state === 'error' && (
        <>
          <DialogTitle>Error</DialogTitle>
          <DialogContent>
            <Typography color="error">
              ❌ Failed to submit your claim.
              <br />
              {errorMessage || 'An unexpected error occurred. Please try again.'}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={onCancel} color="error">
              Close
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}
