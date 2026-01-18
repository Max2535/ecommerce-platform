const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * OrderItem Model
 * Individual items within an order
 */
const OrderItem = sequelize.define('OrderItem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  orderId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'orders',
      key: 'id',
    },
  },

  productId: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Reference to product in Product Service',
  },

  productName: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },

  productSku: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },

  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
    },
  },

  unitPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },

  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },

  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },

  discount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
  },

  productImage: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
}, {
  tableName: 'order_items',
  timestamps: true,
  indexes: [
    { fields: ['order_id'] },
    { fields: ['product_id'] },
  ],
});

module.exports = OrderItem;
