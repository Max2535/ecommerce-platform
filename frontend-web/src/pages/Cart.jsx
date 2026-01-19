import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Divider,
  TextField,
} from '@mui/material';
import {
  Delete,
  Add,
  Remove,
  ShoppingCart,
  ArrowForward,
} from '@mui/icons-material';
import { useCart } from '@contexts/CartContext';
import { formatCurrency } from '@utils/formatters';

/**
 * Shopping Cart Page Component
 */
const Cart = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotal,
  } = useCart();

  const subtotal = getTotal();
  const shipping = subtotal >= 1000 ? 0 : 50;
  const total = subtotal + shipping;

  if (cartItems.length === 0) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <ShoppingCart sx={{ fontSize: 100, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            ตะกร้าสินค้าว่างเปล่า
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            คุณยังไม่มีสินค้าในตะกร้า
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
        ตะกร้าสินค้า
      </Typography>

      <Grid container spacing={3}>
        {/* Cart Items Table */}
        <Grid item xs={12} md={8}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>สินค้า</TableCell>
                  <TableCell align="center">ราคา</TableCell>
                  <TableCell align="center">จำนวน</TableCell>
                  <TableCell align="right">รวม</TableCell>
                  <TableCell align="center"></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cartItems.map((item) => (
                  <TableRow key={item.id}>
                    {/* Product Info */}
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box
                          component="img"
                          src={item.image || 'https://via.placeholder.com/100'}
                          alt={item.name}
                          sx={{
                            width: 80,
                            height: 80,
                            objectFit: 'cover',
                            borderRadius: 1,
                          }}
                        />
                        <Typography variant="body1">{item.name}</Typography>
                      </Box>
                    </TableCell>

                    {/* Price */}
                    <TableCell align="center">
                      <Typography>{formatCurrency(item.price)}</Typography>
                    </TableCell>

                    {/* Quantity Controls */}
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <IconButton
                          size="small"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Remove />
                        </IconButton>

                        <TextField
                          size="small"
                          value={item.quantity}
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            if (!isNaN(value)) {
                              updateQuantity(item.id, value);
                            }
                          }}
                          inputProps={{
                            style: { textAlign: 'center' },
                            min: 1,
                            max: item.stock,
                          }}
                          sx={{ width: 60, mx: 1 }}
                        />

                        <IconButton
                          size="small"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                        >
                          <Add />
                        </IconButton>
                      </Box>
                    </TableCell>

                    {/* Subtotal */}
                    <TableCell align="right">
                      <Typography fontWeight="medium">
                        {formatCurrency(item.price * item.quantity)}
                      </Typography>
                    </TableCell>

                    {/* Delete Button */}
                    <TableCell align="center">
                      <IconButton
                        color="error"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Clear Cart Button */}
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              color="error"
              onClick={clearCart}
            >
              ล้างตะกร้า
            </Button>

            <Button
              component={Link}
              to="/products"
              variant="outlined"
            >
              เลือกซื้อสินค้าเพิ่ม
            </Button>
          </Box>
        </Grid>

        {/* Order Summary */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              สรุปคำสั่งซื้อ
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>ยอดรวมสินค้า</Typography>
              <Typography>{formatCurrency(subtotal)}</Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography>ค่าจัดส่ง</Typography>
              <Typography color={shipping === 0 ? 'success.main' : 'inherit'}>
                {shipping === 0 ? 'ฟรี' : formatCurrency(shipping)}
              </Typography>
            </Box>

            {subtotal < 1000 && (
              <Box sx={{ bgcolor: 'info.light', p: 1, borderRadius: 1, mb: 2 }}>
                <Typography variant="caption">
                  ซื้อเพิ่มอีก {formatCurrency(1000 - subtotal)} เพื่อรับจัดส่งฟรี!
                </Typography>
              </Box>
            )}

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6" fontWeight="bold">
                ยอดรวมทั้งหมด
              </Typography>
              <Typography variant="h6" color="primary" fontWeight="bold">
                {formatCurrency(total)}
              </Typography>
            </Box>

            <Button
              fullWidth
              variant="contained"
              size="large"
              endIcon={<ArrowForward />}
              onClick={() => navigate('/checkout')}
            >
              ดำเนินการชำระเงิน
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Cart;