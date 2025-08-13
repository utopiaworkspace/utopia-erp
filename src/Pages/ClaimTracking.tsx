import React, { useEffect, useState } from 'react';
import {
  Card, CardContent, Typography, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip, Paper, Button
} from '@mui/material';
import LinearProgress from '@mui/material/LinearProgress';
import { Navigate, useNavigate } from 'react-router-dom';
import { useSession } from '../SessionContext';
import { supabase } from '../supabase/supabaseClient';

interface Claim {
  claim_id: string;
  claim_type: 'General' | 'Benefit';
  total_amount: number;
  approved_at: string | null;
  claim_status: 'Pending' | 'Approved' | 'Rejected';
}

export default function ClaimTrackingPage() {
  const { session, loading } = useSession();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loadingClaims, setLoadingClaims] = useState(true);
  const navigate = useNavigate(); // <-- ✅ for routing

  useEffect(() => {
    const fetchClaims = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error('Failed to get user:', userError.message);
        setLoadingClaims(false);
        return;
      }

      if (!user) {
        console.warn('No user found');
        setLoadingClaims(false);
        return;
      }

      const { data, error } = await supabase
        .from('claim_master')
        .select('claim_id, claim_type, total_amount, approved_at, claim_status')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching claims:', error.message);
      } else {
        setClaims(data as Claim[]);
      }

      setLoadingClaims(false);
    };

    fetchClaims();
  }, []);

  const handleEdit = (claim: Claim) => {
    const path =
      claim.claim_type === 'General'
        ? `/claim-form/general/${claim.claim_id}`
        : `/claim-form/benefit/${claim.claim_id}`;
    navigate(path);
  };

  if (loading || loadingClaims) return <LinearProgress />;
  if (!session) return <Navigate to="/sign-in" />;

  return (
    <>
      <Card sx={{ maxWidth: 900, width: '100%', mx: 'auto', my: 4, p: 3, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Claim History & Status
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Below is a list of your submitted claims and their current statuses.
            You can refer to the Claim ID for any follow-ups.
          </Typography>
        </CardContent>
      </Card>

      <TableContainer component={Paper} sx={{ maxWidth: 900, mx: 'auto', boxShadow: 3 }}>
        <Table>
          <TableHead sx={{ backgroundColor: '#009688' }}>
            <TableRow>
              <TableCell><strong>Claim ID</strong></TableCell>
              <TableCell><strong>Type</strong></TableCell>
              <TableCell><strong>Amount (RM)</strong></TableCell>
              <TableCell><strong>Approved At</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell> {/* ✅ New column */}
            </TableRow>
          </TableHead>
          <TableBody>
            {claims.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No claims submitted yet.
                </TableCell>
              </TableRow>
            ) : (
              claims.map((claim) => (
                <TableRow key={claim.claim_id}>
                  <TableCell>{claim.claim_id}</TableCell>
                  <TableCell>{claim.claim_type}</TableCell>
                  <TableCell>{claim.total_amount.toFixed(2)}</TableCell>
                  <TableCell>
                    {claim.approved_at ? new Date(claim.approved_at).toLocaleDateString() : '-'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={claim.claim_status}
                      color={
                        claim.claim_status === 'Approved' ? 'success' :
                        claim.claim_status === 'Rejected' ? 'error' :
                        'warning'
                      }
                      variant="outlined"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {claim.claim_status === 'Rejected' && (
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => handleEdit(claim)}
                      >
                        Edit
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
