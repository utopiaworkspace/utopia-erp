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
    <Dialog open={open} onClose={onCancel}>
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
              Your claim has been successfully submitted!
              <br />
              Your Claim ID is {claimId}.
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