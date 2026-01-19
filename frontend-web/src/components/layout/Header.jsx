import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Badge,
  Box,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  ShoppingCart,
  AccountCircle,
  Search,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { useAuth } from '@contexts/AuthContext';
import { useCart } from '@contexts/CartContext';
import { AnimatedCartIcon } from '@components/common/AddToCartAnimation';

/**
 * Header Component
 * Main navigation bar with search, cart, and user menu
 */
const Header = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const { getItemCount } = useCart();

  const [anchorEl, setAnchorEl] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <AppBar position="sticky">
      <Toolbar>
        {/* Logo */}
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{
            flexGrow: 0,
            textDecoration: 'none',
            color: 'inherit',
            fontWeight: 'bold',
            mr: 4,
          }}
        >
          E-Shop
        </Typography>

        {/* Navigation Links */}
        <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, gap: 2 }}>
          <Button color="inherit" component={Link} to="/products">
            สินค้าทั้งหมด
          </Button>
          <Button color="inherit" component={Link} to="/products?featured=true">
            สินค้าแนะนำ
          </Button>
        </Box>

        {/* Search Bar */}
        <Box
          component="form"
          onSubmit={handleSearch}
          sx={{ flexGrow: 1, maxWidth: 400, mx: 2 }}
        >
          <TextField
            fullWidth
            size="small"
            placeholder="ค้นหาสินค้า..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
              sx: { bgcolor: 'background.paper', borderRadius: 1 },
            }}
          />
        </Box>

        {/* Cart Icon */}
        <AnimatedCartIcon>
          <IconButton
            color="inherit"
            component={Link}
            to="/cart"
            sx={{ mr: 1 }}
          >
            <Badge badgeContent={getItemCount()} color="error">
              <ShoppingCart />
            </Badge>
          </IconButton>
        </AnimatedCartIcon>

        {/* User Menu */}
        {isAuthenticated() ? (
          <>
            <IconButton
              color="inherit"
              onClick={handleMenuOpen}
            >
              <AccountCircle />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem component={Link} to="/profile" onClick={handleMenuClose}>
                โปรไฟล์
              </MenuItem>
              <MenuItem component={Link} to="/orders" onClick={handleMenuClose}>
                คำสั่งซื้อของฉัน
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                ออกจากระบบ
              </MenuItem>
            </Menu>
          </>
        ) : (
          <Button color="inherit" component={Link} to="/login">
            เข้าสู่ระบบ
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;