import React, { useState, useEffect } from "react";
import { Button, Typography, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { useSession } from '../SessionContext';


export default function RMBDashboard() {
    const { session, loading } = useSession();
    const [open, setOpen] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogState, setDialogState] = useState<'confirm' | 'loading' | 'success'>('confirm');
  
    const [eventData, setEventData] = useState({
        eventId: '',
        eventType: '',
        plateNum: '',
        responsibleName: '',
        responsibleDept: '',
        description: '',
        impact: '',
        date: '',
        file: null as File | null,
        email: session?.user?.email || '',
    });

    return (
        <> 
            <Button variant="contained" onClick={() => setOpen(true)}>
                Submit Event
            </Button>

            <Dialog component="form" open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth onSubmit={handleFormSubmit}>
                <DialogTitle>Submit Incident Report</DialogTitle>
                <DialogContent dividers>
                <Box display="flex" flexDirection="column" gap={2} mt={2}>

                    <TextField
                    label="Business Unit"
                    select
                    fullWidth
                    value={incidentData.unit}
                    onChange={(e) => handleChange('unit', e.target.value)}
                    required
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
                    required
                    />

                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker

                        sx={{ minWidth: "40%" }}
                        label="Date"
                        value={incidentData.date ? dayjs(incidentData.date, 'DD/MM/YYYY') : null}
                        maxDate={dayjs()}
                        onChange={(newValue) => handleChange('date', newValue ? newValue.format('DD/MM/YYYY') : '')}
                        format='DD/MM/YYYY'
                        slotProps={{
                        textField: {
                            required: true,
                        },
                        }}
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
                    <Typography>
                    Incident Details
                    </Typography>
                    <Box>
                    <Button variant="outlined" component="label" fullWidth>

                        {incidentData.file ? `File: ${incidentData.file.name}` : "Incident Image or PDF"}
                        <input
                        
                        accept="image/*,application/pdf"
                        type="file"
                        hidden
                        
                        onChange={handleFileChange}
                        />
                    </Button>
                    </Box> 

                    <TextField
                    label="Description"
                    fullWidth
                    multiline
                    rows={4}
                    value={incidentData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    required
                    />

                    <TextField
                    label="Impact"
                    fullWidth
                    multiline
                    rows={2}
                    value={incidentData.impact}
                    onChange={(e) => handleChange('impact', e.target.value)}
                    
                    />
                    

                    {/* <Button variant="contained" component="label">
                    Upload File
                    <input type="file" hidden onChange={handleFileChange} />
                    </Button>
                    {incidentData.file && (
                    <Typography variant="body2" mt={1}>
                        Selected File: {incidentData.file.name}
                    </Typography>
                    )} */}

                </Box>
                </DialogContent>

                <DialogActions>
                <Button onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" variant="contained">
                    Submit
                </Button>
                </DialogActions>
            </Dialog>

            <Typography>
                RMB Dashboard
            </Typography>
        </>
    );
}