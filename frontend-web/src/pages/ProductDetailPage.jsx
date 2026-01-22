import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';
import {
  Container,
  Grid,
  Box,
  Typography,
  Button,
  Chip,
  Rating,
  Divider,
  TextField,
  Table,
  TableBody,
  TableRow,
  TableCell,
} from '@mui/material';
import {
  ShoppingCart,
  ArrowBack,
  LocalShipping,
  VerifiedUser,
} from '@mui/icons-material';
import { GET_PRODUCT } from '@graphql/queries/products';
import { useCart } from '@contexts/CartContext';
import { useAddToCartAnimation } from '@components/common/AddToCartAnimation';
import { formatCurrency } from '@utils/formatters';
import Loading from '@components/common/Loading';
import ErrorMessage from '@components/common/ErrorMessage';

/**
 * Product Detail Page Component
 */
const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { triggerAnimation } = useAddToCartAnimation();
  const buttonRef = useRef(null);

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const { data, loading, error } = useQuery(GET_PRODUCT, {
    variables: { id },
  });

  if (loading) return <Loading message="กำลังโหลดข้อมูลสินค้า..." />;
  if (error) return <ErrorMessage message={error.message} />;
  if (!data?.product) return <ErrorMessage message="ไม่พบสินค้า" />;

  const product = data.product;

  // Compute derived fields
  const inStock = product.stock > 0;
  const onSale = product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercentage = onSale
    ? Math.round((1 - product.price / product.compareAtPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    // Trigger flying animation
    if (buttonRef.current) {
      triggerAnimation(buttonRef.current, product.images[selectedImage]?.url);
    }

    addToCart(product, quantity);
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= product.stock) {
      setQuantity(value);
    }
  };

  return (
    <Container maxWidth="lg">
      {/* Back Button */}
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate(-1)}
        sx={{ mb: 3 }}
      >
        กลับ
      </Button>

      <Grid container spacing={4}>
        {/* Images */}
        <Grid item xs={12} md={6}>
          {/* Main Image */}
          <Box
            sx={{
              width: '100%',
              height: 400,
              bgcolor: 'grey.100',
              borderRadius: 2,
              mb: 2,
              backgroundImage: `url(${product.images[selectedImage]?.url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />

          {/* Thumbnail Images */}
          {product.images.length > 1 && (
            <Grid container spacing={1}>
              {product.images.map((image, index) => (
                <Grid item xs={3} key={index}>
                  <Box
                    onClick={() => setSelectedImage(index)}
                    sx={{
                      width: '100%',
                      height: 80,
                      backgroundImage: `url(${image.url})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      borderRadius: 1,
                      cursor: 'pointer',
                      border: selectedImage === index ? 2 : 1,
                      borderColor: selectedImage === index ? 'primary.main' : 'grey.300',
                      '&:hover': {
                        borderColor: 'primary.main',
                      },
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>

        {/* Product Info */}
        <Grid item xs={12} md={6}>
          {/* Category */}
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ textTransform: 'uppercase' }}
          >
            {product.category}
          </Typography>

          {/* Product Name */}
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            {product.name}
          </Typography>

          {/* Brand */}
          {product.brand && (
            <Typography variant="body1" color="text.secondary" gutterBottom>
              แบรนด์: {product.brand}
            </Typography>
          )}

          {/* Rating */}
          {product.rating && product.rating.count > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Rating value={product.rating.average} precision={0.5} readOnly />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                ({product.rating.count} รีวิว)
              </Typography>
            </Box>
          )}

          <Divider sx={{ my: 2 }} />

          {/* Price */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, mb: 1 }}>
              <Typography variant="h4" color="primary" fontWeight="bold">
                {formatCurrency(product.price)}
              </Typography>

              {onSale && (
                <>
                  <Typography
                    variant="h6"
                    color="text.secondary"
                    sx={{ textDecoration: 'line-through' }}
                  >
                    {formatCurrency(product.compareAtPrice)}
                  </Typography>
                  <Chip
                    label={`ประหยัด ${discountPercentage}%`}
                    color="error"
                    size="small"
                  />
                </>
              )}
            </Box>
          </Box>

          {/* Stock Status */}
          <Box sx={{ mb: 3 }}>
            {inStock ? (
              <Chip
                label={`มีสินค้า ${product.stock} ชิ้น`}
                color="success"
                icon={<VerifiedUser />}
              />
            ) : (
              <Chip label="สินค้าหมด" color="error" />
            )}
          </Box>

          {/* Quantity Selector */}
          {inStock && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" gutterBottom>
                จำนวน:
              </Typography>
              <TextField
                type="number"
                value={quantity}
                onChange={handleQuantityChange}
                inputProps={{
                  min: 1,
                  max: product.stock,
                }}
                sx={{ width: 120 }}
              />
            </Box>
          )}

          {/* Add to Cart Button */}
          <Button
            ref={buttonRef}
            fullWidth
            variant="contained"
            size="large"
            startIcon={<ShoppingCart />}
            onClick={handleAddToCart}
            disabled={!inStock}
            sx={{ mb: 2 }}
          >
            เพิ่มลงตะกร้า
          </Button>

          {/* Features */}
          <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1, mt: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <LocalShipping sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="body2">
                จัดส่งฟรีสำหรับคำสั่งซื้อ 1,000 บาทขึ้นไป
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <VerifiedUser sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="body2">รับประกันสินค้า 30 วัน</Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Product Details */}
      <Box sx={{ mt: 6 }}>
        <Typography variant="h5" gutterBottom fontWeight="bold">
          รายละเอียดสินค้า
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ whiteSpace: 'pre-line', mb: 3 }}
        >
          {product.description}
        </Typography>

        {/* Attributes Table */}
        {product.attributes && Object.keys(product.attributes).length > 0 && (
          <>
            <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mt: 4 }}>
              คุณสมบัติ
            </Typography>
            <Table>
              <TableBody>
                {Object.entries(product.attributes).map(([key, value]) => (
                  <TableRow key={key}>
                    <TableCell sx={{ fontWeight: 'medium', width: '30%' }}>
                      {key}
                    </TableCell>
                    <TableCell>{String(value)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}

        {/* Product Info */}
        <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mt: 4 }}>
          ข้อมูลสินค้า
        </Typography>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell sx={{ fontWeight: 'medium', width: '30%' }}>SKU</TableCell>
              <TableCell>{product.sku}</TableCell>
            </TableRow>
            {product.weight && (
              <TableRow>
                <TableCell sx={{ fontWeight: 'medium' }}>น้ำหนัก</TableCell>
                <TableCell>{product.weight.value} {product.weight.unit || 'kg'}</TableCell>
              </TableRow>
            )}
            {product.tags && product.tags.length > 0 && (
              <TableRow>
                <TableCell sx={{ fontWeight: 'medium' }}>แท็ก</TableCell>
                <TableCell>
                  {product.tags.map((tag, index) => (
                    <Chip key={index} label={tag} size="small" sx={{ mr: 1 }} />
                  ))}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>
    </Container>
  );
};

export default ProductDetailPage;