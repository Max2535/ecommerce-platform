const { Order, OrderItem } = require('../models');
const { sequelize } = require('../config/database');
const userServiceClient = require('../services/userServiceClient');
const productServiceClient = require('../services/productServiceClient');

/**
 * Order Resolvers
 */
const orderResolvers = {
  Query: {
    /**
     * Get single order
     */
    order: async (_, { id }, { user }) => {
      if (!user) {
        throw new Error('Not authenticated');
      }

      const order = await Order.findByPk(id, {
        include: [{
          model: OrderItem,
          as: 'items',
        }],
      });

      if (!order) {
        throw new Error('Order not found');
      }

      // Check if user owns this order
      if (order.userId !== user.id) {
        throw new Error('Not authorized to view this order');
      }

      return order;
    },

    /**
     * Get user's orders
     */
    myOrders: async (_, { status, limit = 10, offset = 0 }, { user }) => {
      if (!user) {
        throw new Error('Not authenticated');
      }

      const where = { userId: user.id };
      if (status) {
        where.status = status.toLowerCase();
      }

      const { count, rows } = await Order.findAndCountAll({
        where,
        include: [{
          model: OrderItem,
          as: 'items',
        }],
        order: [['createdAt', 'DESC']],
        limit,
        offset,
      });

      return {
        orders: rows,
        totalCount: count,
        hasMore: offset + rows.length < count,
      };
    },

    /**
     * Get all orders (admin only - simplified for workshop)
     */
    orders: async (_, { status, userId, limit = 10, offset = 0 }) => {
      const where = {};
      if (status) where.status = status.toLowerCase();
      if (userId) where.userId = userId;

      const { count, rows } = await Order.findAndCountAll({
        where,
        include: [{
          model: OrderItem,
          as: 'items',
        }],
        order: [['createdAt', 'DESC']],
        limit,
        offset,
      });

      return {
        orders: rows,
        totalCount: count,
        hasMore: offset + rows.length < count,
      };
    },
  },

  Mutation: {
    /**
     * Create new order
     */
    createOrder: async (_, { input }, { user, token }) => {
      if (!user) {
        throw new Error('Not authenticated');
      }

      const transaction = await sequelize.transaction();

      try {
        // 1. Validate products
        console.log('Validating products...');
        const validationResults = await productServiceClient.validateProducts(input.items);

        const invalidProducts = validationResults.filter(r => !r.valid);
        if (invalidProducts.length > 0) {
          throw new Error(`Invalid products: ${invalidProducts.map(p => p.error).join(', ')}`);
        }

        // 2. Get shipping address
        console.log('Fetching shipping address...');
        let shippingAddress;

        if (input.shippingAddress) {
          shippingAddress = input.shippingAddress;
        } else if (input.shippingAddressId) {
          const userAddress = await userServiceClient.getUserDefaultAddress(user.id, token);
          shippingAddress = {
            street: userAddress.street,
            city: userAddress.city,
            state: userAddress.state,
            postalCode: userAddress.postalCode,
            country: userAddress.country,
          };
        } else {
          throw new Error('Shipping address is required');
        }

        // 3. Calculate order totals
        console.log('Calculating totals...');
        let subtotal = 0;
        const orderItems = [];

        for (const item of input.items) {
          const validation = validationResults.find(v => v.productId === item.productId);
          const product = validation.product;

          const itemSubtotal = product.price * item.quantity;
          subtotal += itemSubtotal;

          orderItems.push({
            productId: product.id,
            productName: product.name,
            productSku: product.sku,
            productImage: product.images[0]?.url,
            unitPrice: product.price,
            quantity: item.quantity,
            subtotal: itemSubtotal,
            discount: 0,
            total: itemSubtotal,
          });
        }

        // 4. Create order
        console.log('Creating order...');
        const orderNumber = await Order.generateOrderNumber();

        const order = await Order.create({
          orderNumber,
          userId: user.id,
          status: 'pending',
          subtotal,
          tax: 0,
          shippingCost: 0,
          discount: 0,
          totalAmount: 0,
          shippingAddress,
          paymentMethod: input.paymentMethod.toLowerCase(),
          paymentStatus: 'pending',
          customerNotes: input.customerNotes,
        }, { transaction });

        // Calculate totals
        order.calculateTotals();
        await order.save({ transaction });

        // 5. Create order items
        console.log('Creating order items...');
        for (const itemData of orderItems) {
          await OrderItem.create({
            ...itemData,
            orderId: order.id,
          }, { transaction });
        }

        // 6. Update product stock
        console.log('Updating product stock...');
        for (const item of input.items) {
          await productServiceClient.updateStock(item.productId, -item.quantity);
        }

        // Commit transaction
        await transaction.commit();
        console.log('✅ Order created successfully');

        // Fetch complete order with items
        const completeOrder = await Order.findByPk(order.id, {
          include: [{
            model: OrderItem,
            as: 'items',
          }],
        });

        return completeOrder;
      } catch (error) {
        // Rollback transaction on error
        await transaction.rollback();
        console.error('❌ Order creation failed:', error);
        throw new Error(`Failed to create order: ${error.message}`);
      }
    },

    /**
     * Update order status
     */
    updateOrderStatus: async (_, { id, input }) => {
      const order = await Order.findByPk(id);

      if (!order) {
        throw new Error('Order not found');
      }

      order.status = input.status.toLowerCase();

      if (input.trackingNumber) {
        order.trackingNumber = input.trackingNumber;
      }

      if (input.internalNotes) {
        order.internalNotes = input.internalNotes;
      }

      // Update timestamps based on status
      if (input.status === 'SHIPPED' && !order.shippedAt) {
        order.shippedAt = new Date();
      }

      if (input.status === 'DELIVERED' && !order.deliveredAt) {
        order.deliveredAt = new Date();
      }

      await order.save();

      return Order.findByPk(id, {
        include: [{
          model: OrderItem,
          as: 'items',
        }],
      });
    },

    /**
     * Cancel order
     */
    cancelOrder: async (_, { id, reason }, { user }) => {
      if (!user) {
        throw new Error('Not authenticated');
      }

      const transaction = await sequelize.transaction();

      try {
        const order = await Order.findByPk(id, {
          include: [{
            model: OrderItem,
            as: 'items',
          }],
        });

        if (!order) {
          throw new Error('Order not found');
        }

        if (order.userId !== user.id) {
          throw new Error('Not authorized to cancel this order');
        }

        if (!order.canBeCancelled()) {
          throw new Error(`Order cannot be cancelled. Current status: ${order.status}`);
        }

        // Restore product stock
        for (const item of order.items) {
          await productServiceClient.updateStock(item.productId, item.quantity);
        }

        // Update order
        order.status = 'cancelled';
        order.cancelledAt = new Date();
        order.cancellationReason = reason;
        await order.save({ transaction });

        await transaction.commit();

        return Order.findByPk(id, {
          include: [{
            model: OrderItem,
            as: 'items',
          }],
        });
      } catch (error) {
        await transaction.rollback();
        throw new Error(`Failed to cancel order: ${error.message}`);
      }
    },

    /**
     * Mark order as paid
     */
    markAsPaid: async (_, { id }) => {
      const order = await Order.findByPk(id);

      if (!order) {
        throw new Error('Order not found');
      }

      order.paymentStatus = 'paid';
      order.paidAt = new Date();
      order.status = 'confirmed';
      await order.save();

      return Order.findByPk(id, {
        include: [{
          model: OrderItem,
          as: 'items',
        }],
      });
    },

    /**
     * Refund order
     */
    refundOrder: async (_, { id, reason }) => {
      const transaction = await sequelize.transaction();

      try {
        const order = await Order.findByPk(id, {
          include: [{
            model: OrderItem,
            as: 'items',
          }],
        });

        if (!order) {
          throw new Error('Order not found');
        }

        if (!order.canBeRefunded()) {
          throw new Error('Order cannot be refunded');
        }

        // Restore stock
        for (const item of order.items) {
          await productServiceClient.updateStock(item.productId, item.quantity);
        }

        // Update order
        order.status = 'refunded';
        order.paymentStatus = 'refunded';
        order.internalNotes = `Refund reason: ${reason}`;
        await order.save({ transaction });

        await transaction.commit();

        return Order.findByPk(id, {
          include: [{
            model: OrderItem,
            as: 'items',
          }],
        });
      } catch (error) {
        await transaction.rollback();
        throw new Error(`Failed to refund order: ${error.message}`);
      }
    },
  },
  // Federation resolvers
  Order: {
    __resolveReference: async (reference) => {
      const order = await Order.findByPk(reference.id, {
        include: [{
          model: OrderItem,
          as: 'items',
        }],
      });
      return order;
    },

    user: (order) => {
      return { __typename: 'User', id: order.userId };
    },

    // Field resolvers for enum transformation
    status: (order) => order.status?.toUpperCase(),
    paymentStatus: (order) => order.paymentStatus?.toUpperCase(),
    paymentMethod: (order) => order.paymentMethod?.toUpperCase(),
  },

  OrderItem: {
    product: (orderItem) => {
      return { __typename: 'Product', id: orderItem.productId };
    },
  },

  User: {
    orders: async (user) => {
      const orders = await Order.findAll({
        where: { userId: user.id },
        include: [{
          model: OrderItem,
          as: 'items',
        }],
        order: [['createdAt', 'DESC']],
      });
      return orders;
    },
  },
};

module.exports = orderResolvers;