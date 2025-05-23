import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, CircularProgress } from '@mui/material';

interface Props {
  open: boolean;
  state: 'confirm' | 'loading' | 'success';
  onCancel: () => void;
  onConfirm: () => void;
  onCloseSuccess: () => void;
  claimId: string;
  totalAmount: number;
  receiptCount: number;
}

export default function ClaimDialog({ open, state, onCancel, onConfirm, onCloseSuccess, claimId, totalAmount, receiptCount }: Props) {
  return (
    <Dialog
      open={open}
      fullWidth
      maxWidth="sm" // 或 "md"，更宽一点
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
            Total Amount: RM {totalAmount.toFixed(2)}
            <br />
            Number of Receipts: {receiptCount}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={onCancel}>Cancel</Button>
            <Button onClick={onConfirm} variant="contained" color="primary">Confirm</Button>
          </DialogActions>
        </>
      )}

      {state === 'loading' && (
        <DialogContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
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
              Your Claim ID is <strong>{claimId}.</strong>
              <br />
              <br />
              <strong>📸 Please screenshot this page and keep a copy.</strong>
              <br />
              <br />
              📌 Reminder:
              <br />
              Write your <strong>name</strong> and <strong>Claim ID</strong> on the original receipt.  
              <br />
              Submit the original receipt for processing.
              <br />
              - HR Department (benefit claim)
              <br />
              - Your Manager (general claim)
              <br />
              <br />
              Claims without original receipts will not be approved.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={onCloseSuccess} variant="contained" color="primary">
              Close
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}