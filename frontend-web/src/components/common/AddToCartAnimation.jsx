import React, { useState, useEffect, useCallback } from 'react';
import { Box, keyframes } from '@mui/material';
import { ShoppingCart } from '@mui/icons-material';

/**
 * Flying item animation keyframes
 */
const createFlyAnimation = (startX, startY, endX, endY) => keyframes`
  0% {
    opacity: 1;
    transform: translate(0, 0) scale(1) rotate(0deg);
  }
  50% {
    opacity: 1;
    transform: translate(${(endX - startX) * 0.5}px, ${(endY - startY) * 0.5 - 100}px) scale(0.8) rotate(180deg);
  }
  100% {
    opacity: 0;
    transform: translate(${endX - startX}px, ${endY - startY}px) scale(0.2) rotate(360deg);
  }
`;

/**
 * Bounce animation for cart icon
 */
const bounceAnimation = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  25% {
    transform: scale(1.3);
  }
  50% {
    transform: scale(0.9);
  }
  75% {
    transform: scale(1.15);
  }
`;

/**
 * Particle explosion animation
 */
const particleAnimation = keyframes`
  0% {
    opacity: 1;
    transform: scale(0);
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: scale(2);
  }
`;

/**
 * Add to Cart Animation Context & Component
 */
const AnimationContext = React.createContext(null);

export const useAddToCartAnimation = () => {
  const context = React.useContext(AnimationContext);
  if (!context) {
    throw new Error('useAddToCartAnimation must be used within AddToCartAnimationProvider');
  }
  return context;
};

export const AddToCartAnimationProvider = ({ children }) => {
  const [animations, setAnimations] = useState([]);
  const [cartIconRef, setCartIconRef] = useState(null);
  const [cartBounce, setCartBounce] = useState(false);

  const triggerAnimation = useCallback((startElement, productImage) => {
    if (!startElement || !cartIconRef) return;

    const startRect = startElement.getBoundingClientRect();
    const endRect = cartIconRef.getBoundingClientRect();

    const startX = startRect.left + startRect.width / 2;
    const startY = startRect.top + startRect.height / 2;
    const endX = endRect.left + endRect.width / 2;
    const endY = endRect.top + endRect.height / 2;

    const animationId = Date.now();

    setAnimations((prev) => [
      ...prev,
      {
        id: animationId,
        startX,
        startY,
        endX,
        endY,
        image: productImage,
      },
    ]);

    // Trigger cart bounce after flying animation
    setTimeout(() => {
      setCartBounce(true);
      setTimeout(() => setCartBounce(false), 500);
    }, 600);

    // Remove animation after completion
    setTimeout(() => {
      setAnimations((prev) => prev.filter((a) => a.id !== animationId));
    }, 800);
  }, [cartIconRef]);

  const registerCartIcon = useCallback((ref) => {
    setCartIconRef(ref);
  }, []);

  return (
    <AnimationContext.Provider value={{ triggerAnimation, registerCartIcon, cartBounce }}>
      {children}
      {/* Flying items */}
      {animations.map((anim) => (
        <Box
          key={anim.id}
          sx={{
            position: 'fixed',
            left: anim.startX,
            top: anim.startY,
            width: 60,
            height: 60,
            borderRadius: '50%',
            overflow: 'hidden',
            zIndex: 9999,
            pointerEvents: 'none',
            animation: `${createFlyAnimation(anim.startX, anim.startY, anim.endX, anim.endY)} 0.7s ease-in-out forwards`,
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'primary.main',
          }}
        >
          {anim.image ? (
            <Box
              component="img"
              src={anim.image}
              alt=""
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          ) : (
            <ShoppingCart sx={{ color: 'white', fontSize: 30 }} />
          )}
        </Box>
      ))}
      {/* Particle effects at cart */}
      {cartBounce && cartIconRef && (
        <Box
          sx={{
            position: 'fixed',
            left: cartIconRef.getBoundingClientRect().left + cartIconRef.getBoundingClientRect().width / 2,
            top: cartIconRef.getBoundingClientRect().top + cartIconRef.getBoundingClientRect().height / 2,
            transform: 'translate(-50%, -50%)',
            width: 40,
            height: 40,
            borderRadius: '50%',
            border: '3px solid',
            borderColor: 'primary.main',
            zIndex: 9998,
            pointerEvents: 'none',
            animation: `${particleAnimation} 0.5s ease-out forwards`,
          }}
        />
      )}
    </AnimationContext.Provider>
  );
};

/**
 * Cart Icon Wrapper - use this in Header to enable bounce animation
 */
export const AnimatedCartIcon = ({ children }) => {
  const { registerCartIcon, cartBounce } = useAddToCartAnimation();
  const iconRef = React.useRef(null);

  useEffect(() => {
    if (iconRef.current) {
      registerCartIcon(iconRef.current);
    }
  }, [registerCartIcon]);

  return (
    <Box
      ref={iconRef}
      sx={{
        display: 'inline-flex',
        animation: cartBounce ? `${bounceAnimation} 0.5s ease-out` : 'none',
      }}
    >
      {children}
    </Box>
  );
};

export default AddToCartAnimationProvider;
