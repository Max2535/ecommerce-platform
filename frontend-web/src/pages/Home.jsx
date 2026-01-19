import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';
import {
  Container,
  Typography,
  Button,
  Box,
  Grid,
} from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import { GET_FEATURED_PRODUCTS } from '@graphql/queries/products';
import ProductCard from '@components/products/ProductCard';
import Loading from '@components/common/Loading';
import ErrorMessage from '@components/common/ErrorMessage';

/**
 * Home Page Component
 */
const Home = () => {
  const { data, loading, error } = useQuery(GET_FEATURED_PRODUCTS, {
    variables: { limit: 8 },
  });

  return (
    <Container maxWidth="lg">
      {/* Hero Section */}
      <Box
        sx={{
          py: 8,
          textAlign: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: 2,
          mb: 6,
        }}
      >
        <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
          ยินดีต้อนรับสู่ E-Shop
        </Typography>
        <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
          ช้อปสินค้าคุณภาพ ราคาดี ส่งฟรีทั่วไทย
        </Typography>
        <Button
          component={Link}
          to="/products"
          variant="contained"
          size="large"
          sx={{
            bgcolor: 'white',
            color: 'primary.main',
            px: 4,
            py: 1.5,
            '&:hover': {
              bgcolor: 'grey.100',
            },
          }}
          endIcon={<ArrowForward />}
        >
          เริ่มช้อปปิ้ง
        </Button>
      </Box>

      {/* Featured Products Section */}
      <Box sx={{ mb: 6 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Typography variant="h4" component="h2" fontWeight="bold">
            สินค้าแนะนำ
          </Typography>
          <Button
            component={Link}
            to="/products?featured=true"
            endIcon={<ArrowForward />}
          >
            ดูทั้งหมด
          </Button>
        </Box>

        {loading && <Loading />}
        {error && <ErrorMessage message={error.message} />}

        {data && data.featuredProducts && (
          <Grid container spacing={3}>
            {data.featuredProducts.map((product) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                <ProductCard product={product} />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Features Section */}
      <Grid container spacing={4} sx={{ mb: 6 }}>
        <Grid item xs={12} md={4}>
          <Box sx={{ textAlign: 'center', p: 3 }}>
            <Typography variant="h3" sx={{ mb: 2 }}>
              🚚
            </Typography>
            <Typography variant="h6" gutterBottom>
              จัดส่งฟรี
            </Typography>
            <Typography color="text.secondary">
              สั่งซื้อขั้นต่ำ 1,000 บาท
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Box sx={{ textAlign: 'center', p: 3 }}>
            <Typography variant="h3" sx={{ mb: 2 }}>
              🔒
            </Typography>
            <Typography variant="h6" gutterBottom>
              ชำระเงินปลอดภัย
            </Typography>
            <Typography color="text.secondary">
              รองรับหลายช่องทางการชำระเงิน
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Box sx={{ textAlign: 'center', p: 3 }}>
            <Typography variant="h3" sx={{ mb: 2 }}>
              💯
            </Typography>
            <Typography variant="h6" gutterBottom>
              สินค้าคุณภาพ
            </Typography>
            <Typography color="text.secondary">
              รับประกันสินค้าทุกชิ้น
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Home;