import React, { useEffect, useState, useCallback } from 'react';
import {
  Card, CardContent, Typography, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip, Paper, Button,
  Alert, Stack, Tabs, Tab, Box
} from '@mui/material';
import LinearProgress from '@mui/material/LinearProgress';
import { Navigate, useNavigate } from 'react-router-dom';
import { useSession } from '../SessionContext';
import { supabase } from '../supabase/supabaseClient';

interface Claim {
  claim_id: string;
  claim_type: 'General' | 'Benefit' | string;
  total_amount: number;

  // ✅ keep explicit statuses
  manager_approval: 'Pending' | 'Approved' | 'Rejected' | 'Issued' | string;
  finance_status:  'Pending' | 'Approved' | 'Rejected' | 'Issued' | string;

  created_at?: string | null;
  approved_at?: string | null;
}

export default function ClaimTrackingPage() {
  const { session, loading } = useSession();
  const [tab, setTab] = useState<0 | 1>(0); // 0 = General, 1 = Benefit
  const [generalClaims, setGeneralClaims] = useState<Claim[]>([]);
  const [benefitClaims, setBenefitClaims] = useState<Claim[]>([]);
  const [loadingClaims, setLoadingClaims] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [uid, setUid] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (!error && data.user?.id) setUid(data.user.id);
        else if (session?.user?.id) setUid(session.user.id);
        else setUid(null);
      } catch {
        setUid(session?.user?.id ?? null);
      }
    })();
  }, [session?.user?.id]);

  const safeStatus = (s?: string | null): Claim['manager_approval'] =>
    (s && typeof s === 'string' && s.trim().length) ? s : 'Pending';

  const normalizeMasterRow = (row: any, type: 'General' | 'Benefit'): Claim => {
    const claim_id = row.claim_id ?? row.id ?? row.reference_id ?? row.ref_id ?? '';
    const total_amount = Number(row.total_amount ?? row.amount ?? row.total ?? 0);

    // ❌ OLD (single status + date)
    // const claim_status = row.claim_status ?? row.status ?? 'Pending';
    // const approved_at = row.approved_at ?? row.approval_date ?? row.approvedOn ?? null;

    // ✅ NEW (two separate status fields, with broad fallbacks)
    const manager_approval = safeStatus(
      row.manager_approval ?? row.manager_status ?? row.approval_status
    );
    const finance_status  = safeStatus(
      row.finance_status ?? row.account_status
    );

    const approved_at =
      row.approved_at ?? row.approval_date ?? row.approvedOn ?? null;

    const created_at =
      row.created_at ?? row.inserted_at ?? row.submitted_at ?? row.submitted_ts ?? row.updated_at ?? null;

    return {
      claim_id,
      claim_type: type,
      total_amount,
      manager_approval,
      finance_status,
      created_at,
      approved_at,
    };
  };

  const fetchClaims = useCallback(async () => {
    if (!uid) return;
    setLoadingClaims(true);
    setErrorMsg(null);
    try {
      const [generalRes, benefitRes] = await Promise.all([
        supabase.from('claim_general_master').select('*').eq('user_id', uid),
        supabase.from('claim_benefit_master').select('*').eq('user_id', uid),
      ]);
      if (generalRes.error) throw generalRes.error;
      if (benefitRes.error) throw benefitRes.error;

      const g = (generalRes.data ?? [])
        .map((r: any) => normalizeMasterRow(r, 'General'))
        .sort((a, b) => (new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()));
      const b = (benefitRes.data ?? [])
        .map((r: any) => normalizeMasterRow(r, 'Benefit'))
        .sort((a, b) => (new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()));

      setGeneralClaims(g);
      setBenefitClaims(b);
    } catch (err: any) {
      console.error('Error fetching claims:', err);
      setErrorMsg(err?.message ?? 'Failed to load claims.');
      setGeneralClaims([]);
      setBenefitClaims([]);
    } finally {
      setLoadingClaims(false);
    }
  }, [uid]);

  useEffect(() => {
    if (!uid) return;
    fetchClaims();
  }, [uid, fetchClaims]);

  useEffect(() => {
    if (!uid) return;
    const chGeneral = supabase
      .channel(`rt_claim_general_${uid}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'claim_general_master', filter: `user_id=eq.${uid}` },
        () => fetchClaims()
      )
      .subscribe();
    const chBenefit = supabase
      .channel(`rt_claim_benefit_${uid}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'claim_benefit_master', filter: `user_id=eq.${uid}` },
        () => fetchClaims()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(chGeneral);
      supabase.removeChannel(chBenefit);
    };
  }, [uid, fetchClaims]);

  const handleEdit = (claim: Claim) => {
    const path = claim.claim_type === 'General'
      ? `/claim-form/general/${claim.claim_id}`
      : `/claim-form/benefit/${claim.claim_id}`;
    navigate(path);
  };

  const statusColor = (s: string) =>
    s === 'Approved' ? 'success' : s === 'Rejected' ? 'error' : s === 'Issued' ? 'info' : 'warning';

  const fmtAmount = (n: number) =>
    (Number.isFinite(n) ? n : 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const fmtDateTime = (iso: string | null | undefined) =>
    (iso ? new Date(iso).toLocaleString() : '-');

  // ✅ NEW: show finance only when manager is Approved
  const shouldShowFinance = (managerStatus: string) => {
    // ❌ OLD: always show finance chip
    // return true;

    // ✅ NEW: hide finance when manager is Pending / Issued / Rejected
    return managerStatus === 'Approved';
  };

  if (loading || loadingClaims) return <LinearProgress />;
  if (!session) return <Navigate to="/sign-in" />;

  const rows = tab === 0 ? generalClaims : benefitClaims;

  return (
    <>
      <Card sx={{ maxWidth: 900, width: '100%', mx: 'auto', my: 4, p: 3, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Claim History & Status</Typography>
          <Typography variant="body2" color="text.secondary">
            Track your reimbursement claims. Use the tabs to switch between General and Benefit claims.
          </Typography>
        </CardContent>
      </Card>

      <Paper sx={{ maxWidth: 900, mx: 'auto', boxShadow: 3 }}>
        <Box sx={{ px: 2, pt: 2 }}>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            aria-label="Claim type tabs"
            variant="fullWidth"
            // ❌ OLD
            // TabIndicatorProps={{ sx: { bgcolor: '#009688', height: 3, borderRadius: 1 } }}
            // ✅ NEW (your orange)
            TabIndicatorProps={{ sx: { bgcolor: '#F57C00', height: 3, borderRadius: 1 } }}
          >
            <Tab label={`General (${generalClaims.length})`} sx={{ fontWeight: tab === 0 ? 700 : 500 }} />
            <Tab label={`Benefit (${benefitClaims.length})`} sx={{ fontWeight: tab === 1 ? 700 : 500 }} />
          </Tabs>
        </Box>

        {errorMsg && (
          <Stack px={2} pt={2}>
            <Alert severity="error">{errorMsg}</Alert>
          </Stack>
        )}

        <TableContainer
          sx={{ height: 520, overflowY: 'auto', borderTop: '1px solid rgba(0,0,0,0.08)' }}
        >
          <Table sx={{ tableLayout: 'fixed' }} size="small">
            <colgroup>
              <col style={{ width: '24%' }} /> {/* Claim ID */}
              <col style={{ width: '14%' }} /> {/* Amount */}
              <col style={{ width: '16%' }} /> {/* Manager Approval */}
              <col style={{ width: '16%' }} /> {/* Finance Status */}
              <col style={{ width: '20%' }} /> {/* Date Submitted */}
              <col style={{ width: '10%' }} /> {/* Actions */}
            </colgroup>

            <TableHead sx={{ backgroundColor: '#009688' }}>
              <TableRow>
                <TableCell><strong>Claim ID</strong></TableCell>
                <TableCell><strong>Amount (RM)</strong></TableCell>
                <TableCell><strong>Manager Approval</strong></TableCell>
                <TableCell><strong>Finance Status</strong></TableCell>
                <TableCell><strong>Date Submitted</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No {tab === 0 ? 'General' : 'Benefit'} claims yet.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((claim) => {
                  // ❌ OLD
                  // const showEdit = claim.claim_status === 'Rejected';
                  // ✅ NEW: show Edit if either side says Issued
                  const showEdit = claim.manager_approval === 'Issued' || claim.finance_status === 'Issued';

                  return (
                    <TableRow key={`${claim.claim_type}-${claim.claim_id}`}>
                      <TableCell sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {claim.claim_id}
                      </TableCell>

                      <TableCell>{fmtAmount(claim.total_amount)}</TableCell>

                      {/* Manager Approval chip */}
                      <TableCell>
                        <Chip
                          label={claim.manager_approval}
                          color={statusColor(claim.manager_approval) as any}
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>

                      {/* ❌ OLD: always render finance chip
                      <TableCell>
                        <Chip
                          label={claim.finance_status}
                          color={statusColor(claim.finance_status) as any}
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>
                      */}

                      {/* ✅ NEW: only render finance when manager is Approved */}
                      <TableCell>
                        {shouldShowFinance(claim.manager_approval) ? (
                          <Chip
                            label={claim.finance_status || '—'}
                            color={statusColor(claim.finance_status) as any}
                            variant="outlined"
                            size="small"
                          />
                        ) : (
                          // render nothing (keeps row height stable)
                          <></>
                        )}
                      </TableCell>

                      <TableCell>{fmtDateTime(claim.created_at)}</TableCell>

                      <TableCell>
                        {showEdit && (
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
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </>
  );
}