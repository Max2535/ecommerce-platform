import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Typography,
  Button,
} from '@mui/material';
import { FilterList, Clear } from '@mui/icons-material';
import { formatCurrency } from '@utils/formatters';

/**
 * Product Filters Component
 * Provides filtering options for products
 */
const ProductFilters = ({
  categories = [],
  selectedCategory,
  priceRange,
  onCategoryChange,
  onPriceChange,
  onClearFilters,
}) => {
  const maxPrice = 100000;

  return (
    <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <FilterList sx={{ mr: 1 }} />
        <Typography variant="h6">ตัวกรอง</Typography>
      </Box>

      {/* Category Filter */}
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>หมวดหมู่</InputLabel>
        <Select
          value={selectedCategory || ''}
          label="หมวดหมู่"
          onChange={(e) => onCategoryChange(e.target.value)}
        >
          <MenuItem value="">ทั้งหมด</MenuItem>
          {categories.map((category) => (
            <MenuItem key={category} value={category}>
              {category}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Price Range Filter */}
      <Box sx={{ mb: 3 }}>
        <Typography gutterBottom>ช่วงราคา</Typography>
        <Slider
          value={priceRange || [0, maxPrice]}
          onChange={(e, newValue) => onPriceChange(newValue)}
          valueLabelDisplay="auto"
          valueLabelFormat={formatCurrency}
          min={0}
          max={maxPrice}
          step={1000}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="caption">
            {formatCurrency(priceRange?.[0] || 0)}
          </Typography>
          <Typography variant="caption">
            {formatCurrency(priceRange?.[1] || maxPrice)}
          </Typography>
        </Box>
      </Box>

      {/* Clear Filters */}
      <Button
        fullWidth
        variant="outlined"
        startIcon={<Clear />}
        onClick={onClearFilters}
      >
        ล้างตัวกรอง
      </Button>
    </Box>
  );
};

export default ProductFilters;