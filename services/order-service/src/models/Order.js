const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Order Model
 * Main order information and status tracking
 */
const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  orderNumber: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    comment: 'Human-readable order number',
  },

  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: 'Reference to user in User Service',
  },

  status: {
    type: DataTypes.ENUM(
      'pending',
      'confirmed',
      'processing',
      'shipped',
      'delivered',
      'cancelled',
      'refunded'
    ),
    defaultValue: 'pending',
    allowNull: false,
  },

  // Price breakdown
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    comment: 'Sum of all items before tax and shipping',
  },

  tax: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
  },

  shippingCost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
  },

  discount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
  },

  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    comment: 'Final amount = subtotal + tax + shipping - discount',
  },

  // Shipping information
  shippingAddress: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: 'Shipping address details as JSON',
  },

  // Payment information
  paymentMethod: {
    type: DataTypes.ENUM('credit_card', 'debit_card', 'bank_transfer', 'cash_on_delivery', 'e_wallet'),
    allowNull: true,
  },

  paymentStatus: {
    type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
    defaultValue: 'pending',
    allowNull: false,
  },

  paidAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },

  // Tracking
  trackingNumber: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },

  shippedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },

  deliveredAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },

  cancelledAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },

  cancellationReason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  // Notes
  customerNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  internalNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'orders',
  timestamps: true,
  indexes: [
    { fields: ['order_number'], unique: true },
    { fields: ['user_id'] },
    { fields: ['status'] },
    { fields: ['created_at'] },
    { fields: ['payment_status'] },
  ],
});

/**
 * Generate unique order number
 */
Order.generateOrderNumber = async function() {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');

  // Find the last order of the day
  const lastOrder = await Order.findOne({
    where: {
      orderNumber: {
        [sequelize.Sequelize.Op.like]: `ORD${year}${month}${day}%`
      }
    },
    order: [['created_at', 'DESC']],
  });

  let sequence = 1;
  if (lastOrder) {
    const lastSequence = parseInt(lastOrder.orderNumber.slice(-4));
    sequence = lastSequence + 1;
  }

  return `ORD${year}${month}${day}${sequence.toString().padStart(4, '0')}`;
};

/**
 * Instance Methods
 */
Order.prototype.calculateTotals = function() {
  const taxRate = parseFloat(process.env.TAX_RATE) || 0.07;
  const freeShippingThreshold = parseFloat(process.env.FREE_SHIPPING_THRESHOLD) || 1000;
  const shippingCost = parseFloat(process.env.SHIPPING_COST) || 50;

  this.tax = (this.subtotal * taxRate).toFixed(2);
  this.shippingCost = this.subtotal >= freeShippingThreshold ? 0 : shippingCost;
  this.totalAmount = (
    parseFloat(this.subtotal) +
    parseFloat(this.tax) +
    parseFloat(this.shippingCost) -
    parseFloat(this.discount)
  ).toFixed(2);
};

Order.prototype.canBeCancelled = function() {
  return ['pending', 'confirmed'].includes(this.status);
};

Order.prototype.canBeRefunded = function() {
  return ['delivered'].includes(this.status) && this.paymentStatus === 'paid';
};

module.exports = Order;