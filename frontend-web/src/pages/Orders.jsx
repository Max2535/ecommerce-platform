import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Chip,
  Button,
  Grid,
} from '@mui/material';
import { ArrowForward, Receipt } from '@mui/icons-material';
import { GET_MY_ORDERS } from '@graphql/queries/orders';
import { formatCurrency, formatDate } from '@utils/formatters';
import Loading from '@components/common/Loading';
import ErrorMessage from '@components/common/ErrorMessage';

/**
 * Get status color
 */
const getStatusColor = (status) => {
  const colors = {
    PENDING: 'warning',
    CONFIRMED: 'info',
    PROCESSING: 'info',
    SHIPPED: 'primary',
    DELIVERED: 'success',
    CANCELLED: 'error',
    REFUNDED: 'error',
  };
  return colors[status] || 'default';
};

/**
 * Get status label in Thai
 */
const getStatusLabel = (status) => {
  const labels = {
    PENDING: 'รอดำเนินการ',
    CONFIRMED: 'ยืนยันแล้ว',
    PROCESSING: 'กำลังจัดเตรียม',
    SHIPPED: 'จัดส่งแล้ว',
    DELIVERED: 'ได้รับสินค้าแล้ว',
    CANCELLED: 'ยกเลิก',
    REFUNDED: 'คืนเงินแล้ว',
  };
  return labels[status] || status;
};

/**
 * Orders Page Component
 */
const Orders = () => {
  const { data, loading, error } = useQuery(GET_MY_ORDERS, {
    variables: { limit: 20 },
  });

  if (loading) return <Loading message="กำลังโหลดคำสั่งซื้อ..." />;
  if (error) return <ErrorMessage message={error.message} />;

  const orders = data?.myOrders?.orders || [];

  if (orders.length === 0) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Receipt sx={{ fontSize: 100, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            ยังไม่มีคำสั่งซื้อ
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            คุณยังไม่เคยสั่งซื้อสินค้า
          </Typography>
          <Button
            component={Link}
            to="/products"
            variant="contained"
            size="large"
          >
            เริ่มช้อปปิ้ง
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        คำสั่งซื้อของฉัน
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        พบ {orders.length} คำสั่งซื้อ
      </Typography>

      {/* Orders List */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {orders.map((order) => (
          <Paper key={order.id} sx={{ p: 3 }}>
            <Grid container spacing={2}>
              {/* Order Header */}
              <Grid item xs={12}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2,
                  }}
                >
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      คำสั่งซื้อ #{order.orderNumber}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(order.createdAt)}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Chip
                      label={getStatusLabel(order.status)}
                      color={getStatusColor(order.status)}
                      size="small"
                    />
                    <Button
                      component={Link}
                      to={`/orders/${order.id}`}
                      endIcon={<ArrowForward />}
                      size="small"
                    >
                      ดูรายละเอียด
                    </Button>
                  </Box>
                </Box>
              </Grid>

              {/* Order Items */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  {order.items.slice(0, 3).map((item) => (
                    <Box
                      key={item.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        bgcolor: 'grey.50',
                        p: 1,
                        borderRadius: 1,
                      }}
                    >
                      <Box
                        component="img"
                        src={item.productImage || 'https://via.placeholder.com/60'}
                        alt={item.productName}
                        sx={{
                          width: 40,
                          height: 40,
                          objectFit: 'cover',
                          borderRadius: 1,
                        }}
                      />
                      <Box>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                          {item.productName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          จำนวน: {item.quantity}
                        </Typography>
                      </Box>
                    </Box>
                  ))}

                  {order.items.length > 3 && (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        px: 2,
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        +{order.items.length - 3} รายการ
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Grid>

              {/* Order Total */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography color="text.secondary">
                    ที่อยู่: {order.shippingAddress.city}, {order.shippingAddress.country}
                  </Typography>
                  <Typography variant="h6" color="primary" fontWeight="bold">
                    {formatCurrency(order.totalAmount)}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        ))}
      </Box>
    </Container>
  );
};

export default Orders;