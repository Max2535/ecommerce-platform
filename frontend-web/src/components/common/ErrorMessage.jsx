import React from 'react';
import { Alert, AlertTitle, Box } from '@mui/material';

/**
 * Error Message Component
 * Displays error messages in a consistent format
 */
const ErrorMessage = ({
  title = 'เกิดข้อผิดพลาด',
  message,
  severity = 'error'
}) => {
  return (
    <Box sx={{ my: 2 }}>
      <Alert severity={severity}>
        <AlertTitle>{title}</AlertTitle>
        {message || 'ไม่สามารถดำเนินการได้ กรุณาลองใหม่อีกครั้ง'}
      </Alert>
    </Box>
  );
};

export default ErrorMessage;