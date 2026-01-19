import React from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  Rating,
} from '@mui/material';
import { ShoppingCart, Visibility } from '@mui/icons-material';
import { useCart } from '@contexts/CartContext';
import { formatCurrency } from '@utils/formatters';

/**
 * Product Card Component
 * Displays product information in a card format
 */
const ProductCard = ({ product }) => {
  const { addToCart, isInCart } = useCart();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  // Compute derived fields
  const inStock = product.stock > 0;
  const onSale = product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercentage = onSale
    ? Math.round((1 - product.price / product.compareAtPrice) * 100)
    : 0;

  const isOutOfStock = !inStock;
  const inCartStatus = isInCart(product.id);

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
    >
      {/* Sale Badge */}
      {onSale && (
        <Chip
          label={`-${discountPercentage}%`}
          color="error"
          size="small"
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 1,
            fontWeight: 'bold',
          }}
        />
      )}

      {/* Product Image */}
      <CardMedia
        component={Link}
        to={`/products/${product.id}`}
        sx={{
          height: 200,
          backgroundSize: 'cover',
          textDecoration: 'none',
        }}
        image={product.images[0]?.url || 'https://via.placeholder.com/400x300'}
        title={product.name}
      />

      <CardContent sx={{ flexGrow: 1 }}>
        {/* Category */}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ textTransform: 'uppercase', fontWeight: 'medium' }}
        >
          {product.category}
        </Typography>

        {/* Product Name */}
        <Typography
          variant="h6"
          component={Link}
          to={`/products/${product.id}`}
          sx={{
            textDecoration: 'none',
            color: 'inherit',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: '3em',
            '&:hover': {
              color: 'primary.main',
            },
          }}
        >
          {product.name}
        </Typography>

        {/* Rating */}
        {product.rating && product.rating.count > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <Rating
              value={product.rating.average}
              precision={0.5}
              size="small"
              readOnly
            />
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
              ({product.rating.count})
            </Typography>
          </Box>
        )}

        {/* Price */}
        <Box sx={{ mt: 2, display: 'flex', alignItems: 'baseline', gap: 1 }}>
          <Typography variant="h6" color="primary" fontWeight="bold">
            {formatCurrency(product.price)}
          </Typography>

          {onSale && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textDecoration: 'line-through' }}
            >
              {formatCurrency(product.compareAtPrice)}
            </Typography>
          )}
        </Box>

        {/* Stock Status */}
        <Box sx={{ mt: 1 }}>
          {isOutOfStock ? (
            <Chip label="สินค้าหมด" color="error" size="small" />
          ) : product.stock < 10 ? (
            <Chip
              label={`เหลือ ${product.stock} ชิ้น`}
              color="warning"
              size="small"
            />
          ) : (
            <Chip label="พร้อมส่ง" color="success" size="small" />
          )}
        </Box>
      </CardContent>

      {/* Actions */}
      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button
          fullWidth
          variant={inCartStatus ? 'outlined' : 'contained'}
          startIcon={<ShoppingCart />}
          onClick={handleAddToCart}
          disabled={isOutOfStock}
        >
          {inCartStatus ? 'อยู่ในตะกร้า' : 'เพิ่มลงตะกร้า'}
        </Button>

        <Button
          component={Link}
          to={`/products/${product.id}`}
          variant="outlined"
          size="small"
          sx={{ minWidth: 'auto', px: 2 }}
        >
          <Visibility />
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProductCard;