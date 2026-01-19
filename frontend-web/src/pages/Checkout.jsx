import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@apollo/client/react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  TextField,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Divider,
  Alert,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { Lock } from '@mui/icons-material';
import { useCart } from '@contexts/CartContext';
import { CREATE_ORDER_MUTATION } from '@graphql/mutations/orders';
import { formatCurrency } from '@utils/formatters';
import Loading from '@components/common/Loading';

/**
 * Checkout Page Component
 */
const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, getTotal, clearCart } = useCart();

  const [shippingInfo, setShippingInfo] = useState({
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Thailand',
  });
  const [paymentMethod, setPaymentMethod] = useState('CREDIT_CARD');
  const [customerNotes, setCustomerNotes] = useState('');
  const [error, setError] = useState('');

  const [createOrder, { loading }] = useMutation(CREATE_ORDER_MUTATION);

  const subtotal = getTotal();
  const tax = subtotal * 0.07;
  const shipping = subtotal >= 1000 ? 0 : 50;
  const total = subtotal + tax + shipping;

  const handleShippingChange = (e) => {
    setShippingInfo({
      ...shippingInfo,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate shipping info
    if (!shippingInfo.street || !shippingInfo.city || !shippingInfo.postalCode) {
      setError('กรุณากรอกที่อยู่จัดส่งให้ครบถ้วน');
      return;
    }

    try {
      const { data } = await createOrder({
        variables: {
          input: {
            items: cartItems.map((item) => ({
              productId: item.id,
              quantity: item.quantity,
            })),
            shippingAddress: shippingInfo,
            paymentMethod,
            customerNotes: customerNotes || null,
          },
        },
      });

      if (data?.createOrder) {
        // Clear cart
        clearCart();

        // Navigate to order confirmation
        navigate(`/orders/${data.createOrder.id}`, {
          state: { newOrder: true },
        });
      }
    } catch (err) {
      console.error('Order creation error:', err);
      setError(err.message || 'ไม่สามารถสร้างคำสั่งซื้อได้ กรุณาลองใหม่อีกครั้ง');
    }
  };

  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  if (loading) {
    return <Loading message="กำลังสร้างคำสั่งซื้อ..." />;
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        ชำระเงิน
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Shipping & Payment Info */}
          <Grid item xs={12} md={8}>
            {/* Shipping Address */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                ที่อยู่จัดส่ง
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="ที่อยู่"
                    name="street"
                    value={shippingInfo.street}
                    onChange={handleShippingChange}
                    required
                    placeholder="123 ถนนสุขุมวิท"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="เมือง/อำเภอ"
                    name="city"
                    value={shippingInfo.city}
                    onChange={handleShippingChange}
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="จังหวัด"
                    name="state"
                    value={shippingInfo.state}
                    onChange={handleShippingChange}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="รหัสไปรษณีย์"
                    name="postalCode"
                    value={shippingInfo.postalCode}
                    onChange={handleShippingChange}
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="ประเทศ"
                    name="country"
                    value={shippingInfo.country}
                    onChange={handleShippingChange}
                    required
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* Payment Method */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                วิธีการชำระเงิน
              </Typography>

              <FormControl component="fieldset">
                <RadioGroup
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <FormControlLabel
                    value="CREDIT_CARD"
                    control={<Radio />}
                    label="บัตรเครดิต/เดบิต"
                  />
                  <FormControlLabel
                    value="BANK_TRANSFER"
                    control={<Radio />}
                    label="โอนเงินผ่านธนาคาร"
                  />
                  <FormControlLabel
                    value="CASH_ON_DELIVERY"
                    control={<Radio />}
                    label="เก็บเงินปลายทาง"
                  />
                  <FormControlLabel
                    value="E_WALLET"
                    control={<Radio />}
                    label="E-Wallet (PromptPay/TrueMoney)"
                  />
                </RadioGroup>
              </FormControl>
            </Paper>

            {/* Customer Notes */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                หมายเหตุ (ถ้ามี)
              </Typography>

              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="ระบุข้อมูลเพิ่มเติม เช่น เวลาที่สะดวกรับสินค้า"
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
              />
            </Paper>
          </Grid>

          {/* Order Summary */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, position: 'sticky', top: 16 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                สรุปคำสั่งซื้อ
              </Typography>

              <Divider sx={{ my: 2 }} />

              {/* Order Items */}
              <List dense>
                {cartItems.map((item) => (
                  <ListItem key={item.id} sx={{ px: 0 }}>
                    <ListItemText
                      primary={item.name}
                      secondary={`จำนวน: ${item.quantity}`}
                    />
                    <Typography>
                      {formatCurrency(item.price * item.quantity)}
                    </Typography>
                  </ListItem>
                ))}
              </List>

              <Divider sx={{ my: 2 }} />

              {/* Price Breakdown */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>ยอดรวมสินค้า</Typography>
                <Typography>{formatCurrency(subtotal)}</Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>ภาษีมูลค่าเพิ่ม (7%)</Typography>
                <Typography>{formatCurrency(tax)}</Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography>ค่าจัดส่ง</Typography>
                <Typography color={shipping === 0 ? 'success.main' : 'inherit'}>
                  {shipping === 0 ? 'ฟรี' : formatCurrency(shipping)}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" fontWeight="bold">
                  ยอดรวมทั้งหมด
                </Typography>
                <Typography variant="h6" color="primary" fontWeight="bold">
                  {formatCurrency(total)}
                </Typography>
              </Box>

              {/* Submit Button */}
              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                startIcon={<Lock />}
                disabled={loading}
              >
                ยืนยันคำสั่งซื้อ
              </Button>

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', textAlign: 'center', mt: 2 }}
              >
                ข้อมูลของคุณจะถูกเข้ารหัสและปลอดภัย
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Checkout;