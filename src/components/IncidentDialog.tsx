import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, CircularProgress } from '@mui/material';

interface Props {
  open: boolean;
  state: 'confirm' | 'loading' | 'success';
  onCancel: () => void;
  onConfirm: () => void;
  onCloseSuccess: () => void;
  ticketId: string;
}

export default function IncidentDialog({ open, state, onCancel, onConfirm, onCloseSuccess, ticketId }: Props) {
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
            <Typography>Are you sure you want to submit this incident report?</Typography>
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
              Your incident report has been successfully submitted!
              <br />
              Your Ticket ID is {ticketId}.
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
