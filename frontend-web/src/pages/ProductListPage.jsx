import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';
import {
  Container,
  Grid,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
} from '@mui/material';
import { GET_PRODUCTS, GET_CATEGORIES } from '@graphql/queries/products';
import ProductList from '@components/products/ProductList';
import ProductFilters from '@components/products/ProductFilters';

/**
 * Product List Page Component
 */
const ProductListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // State
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('CREATED_AT');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState([0, 100000]);

  // Get categories
  const { data: categoriesData } = useQuery(GET_CATEGORIES);

  // Build filter from search params
  const filter = {};
  const searchQuery = searchParams.get('search');
  const featuredParam = searchParams.get('featured');

  if (searchQuery) filter.search = searchQuery;
  if (featuredParam === 'true') filter.isFeatured = true;
  if (selectedCategory) filter.category = selectedCategory;
  if (priceRange[0] > 0) filter.minPrice = priceRange[0];
  if (priceRange[1] < 100000) filter.maxPrice = priceRange[1];

  // Fetch products
  const { data, loading, error } = useQuery(GET_PRODUCTS, {
    variables: {
      filter,
      sort: {
        field: sortBy,
        order: sortOrder,
      },
      page,
      limit: 12,
    },
  });

  const totalPages = data?.products
    ? Math.ceil(data.products.totalCount / 12)
    : 0;

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSortChange = (event) => {
    const value = event.target.value;
    const [field, order] = value.split('_');
    setSortBy(field);
    setSortOrder(order);
  };

  const handleClearFilters = () => {
    setSelectedCategory('');
    setPriceRange([0, 100000]);
    setSearchParams({});
  };

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [selectedCategory, priceRange, searchQuery]);

  return (
    <Container maxWidth="lg">
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          {searchQuery ? `ผลการค้นหา: "${searchQuery}"` : 'สินค้าทั้งหมด'}
        </Typography>

        {data?.products && (
          <Typography color="text.secondary">
            พบ {data.products.totalCount} รายการ
          </Typography>
        )}
      </Box>

      <Grid container spacing={3}>
        {/* Filters Sidebar */}
        <Grid item xs={12} md={3}>
          <ProductFilters
            categories={categoriesData?.categories || []}
            selectedCategory={selectedCategory}
            priceRange={priceRange}
            onCategoryChange={setSelectedCategory}
            onPriceChange={setPriceRange}
            onClearFilters={handleClearFilters}
          />
        </Grid>

        {/* Products Grid */}
        <Grid item xs={12} md={9}>
          {/* Sort Options */}
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>เรียงตาม</InputLabel>
              <Select
                value={`${sortBy}_${sortOrder}`}
                label="เรียงตาม"
                onChange={handleSortChange}
              >
                <MenuItem value="CREATED_AT_DESC">ล่าสุด</MenuItem>
                <MenuItem value="CREATED_AT_ASC">เก่าสุด</MenuItem>
                <MenuItem value="PRICE_ASC">ราคา: ต่ำ - สูง</MenuItem>
                <MenuItem value="PRICE_DESC">ราคา: สูง - ต่ำ</MenuItem>
                <MenuItem value="NAME_ASC">ชื่อ: A - Z</MenuItem>
                <MenuItem value="NAME_DESC">ชื่อ: Z - A</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Product List */}
          <ProductList
            products={data?.products?.edges?.map((edge) => edge.node)}
            loading={loading}
            error={error}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProductListPage;