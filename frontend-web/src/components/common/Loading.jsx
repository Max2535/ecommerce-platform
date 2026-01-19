import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

/**
 * Loading Component
 * Displays a centered loading spinner
 */
const Loading = ({ message = 'กำลังโหลด...' }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '200px',
        gap: 2,
      }}
    >
      <CircularProgress />
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
};

export default Loading;