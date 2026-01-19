import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import apolloClient from './config/apollo';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { AddToCartAnimationProvider } from './components/common/AddToCartAnimation';

import Layout from './components/layout/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import Home from './pages/Home';
import ProductListPage from './pages/ProductListPage';
import ProductDetailPage from './pages/ProductDetailPage';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Login from './pages/Login';
import Register from './pages/Register';

/**
 * MUI Theme Configuration
 */
const theme = createTheme({
  palette: {
    primary: {
      main: '#667eea',
    },
    secondary: {
      main: '#764ba2',
    },
  },
  typography: {
    fontFamily: '"Noto Sans Thai", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

/**
 * Main App Component
 */
function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <CartProvider>
            <AddToCartAnimationProvider>
              <BrowserRouter>
                <Layout>
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/products" element={<ProductListPage />} />
                    <Route path="/products/:id" element={<ProductDetailPage />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Protected Routes */}
                    <Route element={<ProtectedRoute />}>
                      <Route path="/checkout" element={<Checkout />} />
                      <Route path="/orders" element={<Orders />} />
                      <Route path="/orders/:id" element={<Orders />} />
                    </Route>
                  </Routes>
                </Layout>
              </BrowserRouter>
            </AddToCartAnimationProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </ApolloProvider>
  );
}

export default App;