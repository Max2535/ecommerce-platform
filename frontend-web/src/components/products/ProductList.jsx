import React from 'react';
import { Grid, Box } from '@mui/material';
import ProductCard from './ProductCard';
import Loading from '@components/common/Loading';
import ErrorMessage from '@components/common/ErrorMessage';

/**
 * Product List Component
 * Displays a grid of product cards
 */
const ProductList = ({ products, loading, error }) => {
  if (loading) {
    return <Loading message="กำลังโหลดสินค้า..." />;
  }

  if (error) {
    return <ErrorMessage message={error.message} />;
  }

  if (!products || products.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary">
          ไม่พบสินค้า
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {products.map((product) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
          <ProductCard product={product} />
        </Grid>
      ))}
    </Grid>
  );
};

export default ProductList;