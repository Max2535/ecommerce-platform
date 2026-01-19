import React from 'react';
import { Box, Container, Typography, Link, Grid } from '@mui/material';

/**
 * Footer Component
 */
const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'background.paper',
        py: 6,
        mt: 'auto',
        borderTop: 1,
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom>
              เกี่ยวกับเรา
            </Typography>
            <Typography variant="body2" color="text.secondary">
              E-Shop - ร้านค้าออนไลน์ที่คุณไว้วางใจ
              มีสินค้าคุณภาพพร้อมส่งถึงมือคุณ
            </Typography>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom>
              ลิงก์ด่วน
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="/products" color="inherit" underline="hover">
                สินค้าทั้งหมด
              </Link>
              <Link href="/about" color="inherit" underline="hover">
                เกี่ยวกับเรา
              </Link>
              <Link href="/contact" color="inherit" underline="hover">
                ติดต่อเรา
              </Link>
            </Box>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom>
              ติดต่อเรา
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Email: support@eshop.com<br />
              Tel: 02-xxx-xxxx<br />
              Line: @eshop
            </Typography>
          </Grid>
        </Grid>

        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          sx={{ mt: 4 }}
        >
          © 2024 E-Shop. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;