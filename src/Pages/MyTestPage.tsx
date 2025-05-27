import React, { useState } from 'react';
import { Box, Select, MenuItem, TextField, Typography } from '@mui/material';

export default function MyTestPage() {
  const [idType, setIdType] = useState('ic');
  const [idValue, setIdValue] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (idType === 'ic') {
      value = value.replace(/\D/g, '').slice(0, 12); // 纯数字，限制12位
    } else {
      value = value.replace(/[^A-Za-z0-9]/g, '').slice(0, 20); // 字母+数字
    }
    setIdValue(value);
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h6">🆔 IC / Passport 测试页面</Typography>
      <Select
        value={idType}
        onChange={(e) => setIdType(e.target.value)}
        fullWidth
        sx={{ my: 2 }}
      >
        <MenuItem value="ic">IC</MenuItem>
        <MenuItem value="passport">Passport</MenuItem>
      </Select>
      <TextField
        label={idType === 'ic' ? 'IC No.' : 'Passport No.'}
        value={idValue}
        onChange={handleChange}
        fullWidth
        helperText={
          idType === 'ic'
            ? 'Must be 12 digit IC number'
            : 'Letters and numbers only for passport'
        }
      />
    </Box>
  );
}
