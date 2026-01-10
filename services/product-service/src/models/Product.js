const mongoose = require('mongoose');

/**
 * Product Schema
 * Complete product information with inventory management
 */
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      minlength: [3, 'Product name must be at least 3 characters'],
      maxlength: [200, 'Product name cannot exceed 200 characters'],
      index: true,
    },

    slug: {
      type: String,
      required: false,
      unique: true,
      lowercase: true,
      index: true,
    },

    description: {
      type: String,
      required: [true, 'Product description is required'],
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },

    shortDescription: {
      type: String,
      maxlength: [500, 'Short description cannot exceed 500 characters'],
    },

    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price cannot be negative'],
      set: (val) => Math.round(val * 100) / 100, // Round to 2 decimal places
    },

    compareAtPrice: {
      type: Number,
      min: [0, 'Compare at price cannot be negative'],
      validate: {
        validator: function(value) {
          return !value || value >= this.price;
        },
        message: 'Compare at price must be greater than or equal to price',
      },
    },

    cost: {
      type: Number,
      min: [0, 'Cost cannot be negative'],
    },

    category: {
      type: String,
      required: [true, 'Product category is required'],
      enum: {
        values: ['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports', 'Toys', 'Beauty', 'Food', 'Other'],
        message: '{VALUE} is not a valid category',
      },
      index: true,
    },

    subcategory: {
      type: String,
      trim: true,
    },

    brand: {
      type: String,
      trim: true,
      index: true,
    },

    images: [{
      url: {
        type: String,
        required: true,
      },
      alt: {
        type: String,
        default: '',
      },
      position: {
        type: Number,
        default: 0,
      },
    }],

    stock: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
      index: true,
    },

    sku: {
      type: String,
      required: [true, 'SKU is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },

    barcode: {
      type: String,
      trim: true,
      sparse: true, // Allow multiple null values
    },

    weight: {
      value: {
        type: Number,
        min: [0, 'Weight cannot be negative'],
      },
      unit: {
        type: String,
        enum: ['kg', 'g', 'lb', 'oz'],
        default: 'kg',
      },
    },

    dimensions: {
      length: Number,
      width: Number,
      height: Number,
      unit: {
        type: String,
        enum: ['cm', 'in', 'm'],
        default: 'cm',
      },
    },

    tags: [{
      type: String,
      trim: true,
      lowercase: true,
    }],

    features: [{
      name: String,
      value: String,
    }],

    specifications: {
      type: Map,
      of: String,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },

    // SEO fields
    seo: {
      title: String,
      description: String,
      keywords: [String],
    },

    // Statistics
    viewCount: {
      type: Number,
      default: 0,
    },

    salesCount: {
      type: Number,
      default: 0,
    },

    rating: {
      average: {
        type: Number,
        min: 0,
        max: 5,
        default: 0,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, price: 1 });
productSchema.index({ category: 1, subcategory: 1 });
productSchema.index({ brand: 1, category: 1 });
productSchema.index({ isActive: 1, isFeatured: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ price: 1 });

// Virtual fields
productSchema.virtual('inStock').get(function() {
  return this.stock > 0;
});

productSchema.virtual('onSale').get(function() {
  return !!(this.compareAtPrice && this.compareAtPrice > this.price);
});

productSchema.virtual('discountPercentage').get(function() {
  if (!this.onSale) return 0;
  return Math.round(((this.compareAtPrice - this.price) / this.compareAtPrice) * 100);
});

// Pre-save middleware
productSchema.pre('save', function() {
  // Generate slug from name if not provided
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  // Set short description from description if not provided
  if (!this.shortDescription && this.description) {
    this.shortDescription = this.description.substring(0, 150) + '...';
  }

  // Sort images by position
  if (this.images && this.images.length > 0) {
    this.images.sort((a, b) => a.position - b.position);
  }
});

// Static methods
productSchema.statics.findByCategory = function(category, options = {}) {
  const query = { category, isActive: true };
  return this.find(query)
    .sort(options.sort || { createdAt: -1 })
    .limit(options.limit || 10)
    .skip(options.skip || 0);
};

productSchema.statics.searchProducts = function(searchTerm, options = {}) {
  const query = {
    $text: { $search: searchTerm },
    isActive: true,
  };

  return this.find(query, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' } })
    .limit(options.limit || 10)
    .skip(options.skip || 0);
};

// Instance methods
productSchema.methods.incrementViewCount = function() {
  this.viewCount += 1;
  return this.save();
};

productSchema.methods.updateStock = function(quantity) {
  this.stock += quantity;
  if (this.stock < 0) {
    throw new Error('Insufficient stock');
  }
  return this.save();
};

productSchema.methods.decrementStock = function(quantity) {
  if (this.stock < quantity) {
    throw new Error('Insufficient stock');
  }
  this.stock -= quantity;
  this.salesCount += quantity;
  return this.save();
};

const Product = mongoose.model('Product', productSchema);

module.exports = Product;