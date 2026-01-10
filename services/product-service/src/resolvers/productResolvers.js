const Product = require('../models/Product');

/**
 * Product Resolvers
 */
const productResolvers = {
  Query: {
    /**
     * Get single product by ID or slug
     */
    product: async (_, { id, slug }) => {
      try {
        let product;

        if (id) {
          product = await Product.findById(id);
        } else if (slug) {
          product = await Product.findOne({ slug, isActive: true });
        } else {
          throw new Error('Either id or slug must be provided');
        }

        if (!product) {
          throw new Error('Product not found');
        }

        return product;
      } catch (error) {
        throw new Error(`Failed to fetch product: ${error.message}`);
      }
    },

    /**
     * Get products with filters, sorting, and pagination
     */
    products: async (_, { filter = {}, sort, page = 1, limit = 10 }) => {
      try {
        // Build query
        const query = { isActive: true };

        if (filter.category) query.category = filter.category;
        if (filter.subcategory) query.subcategory = filter.subcategory;
        if (filter.brand) query.brand = filter.brand;
        if (filter.isFeatured !== undefined) query.isFeatured = filter.isFeatured;
        if (filter.tags && filter.tags.length > 0) query.tags = { $in: filter.tags };

        // Price range filter
        if (filter.minPrice !== undefined || filter.maxPrice !== undefined) {
          query.price = {};
          if (filter.minPrice !== undefined) query.price.$gte = filter.minPrice;
          if (filter.maxPrice !== undefined) query.price.$lte = filter.maxPrice;
        }

        // Stock filter
        if (filter.inStock) query.stock = { $gt: 0 };

        // Search filter
        if (filter.search) {
          query.$text = { $search: filter.search };
        }

        // Build sort
        let sortOption = { createdAt: -1 }; // Default sort

        if (sort) {
          const sortField = {
            NAME: 'name',
            PRICE: 'price',
            CREATED_AT: 'createdAt',
            UPDATED_AT: 'updatedAt',
            SALES_COUNT: 'salesCount',
            VIEW_COUNT: 'viewCount',
            RATING: 'rating.average',
          }[sort.field];

          const sortOrder = sort.order === 'ASC' ? 1 : -1;
          sortOption = { [sortField]: sortOrder };
        }

        // Pagination
        const skip = (page - 1) * limit;
        const maxLimit = parseInt(process.env.MAX_PAGE_SIZE) || 100;
        const actualLimit = Math.min(limit, maxLimit);

        // Execute queries
        const [products, totalCount] = await Promise.all([
          Product.find(query)
            .sort(sortOption)
            .skip(skip)
            .limit(actualLimit),
          Product.countDocuments(query),
        ]);

        // Build response
        const edges = products.map((product, index) => ({
          node: product,
          cursor: Buffer.from(`${skip + index}`).toString('base64'),
        }));

        const hasNextPage = skip + products.length < totalCount;
        const hasPreviousPage = page > 1;

        return {
          edges,
          pageInfo: {
            hasNextPage,
            hasPreviousPage,
            startCursor: edges.length > 0 ? edges[0].cursor : null,
            endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
          },
          totalCount,
        };
      } catch (error) {
        throw new Error(`Failed to fetch products: ${error.message}`);
      }
    },

    /**
     * Get featured products
     */
    featuredProducts: async (_, { limit = 10 }) => {
      try {
        const products = await Product.find({
          isActive: true,
          isFeatured: true
        })
          .sort({ createdAt: -1 })
          .limit(limit);

        return products;
      } catch (error) {
        throw new Error(`Failed to fetch featured products: ${error.message}`);
      }
    },

    /**
     * Get products by category
     */
    productsByCategory: async (_, { category, limit = 10 }) => {
      try {
        const products = await Product.findByCategory(category, { limit });
        return products;
      } catch (error) {
        throw new Error(`Failed to fetch products by category: ${error.message}`);
      }
    },

    /**
     * Search products
     */
    searchProducts: async (_, { query, limit = 10 }) => {
      try {
        const products = await Product.searchProducts(query, { limit });
        return products;
      } catch (error) {
        throw new Error(`Failed to search products: ${error.message}`);
      }
    },

    /**
     * Get all categories
     */
    categories: async () => {
      try {
        const categories = await Product.distinct('category', { isActive: true });
        return categories;
      } catch (error) {
        throw new Error(`Failed to fetch categories: ${error.message}`);
      }
    },
  },

  Mutation: {
    /**
     * Create new product
     */
    createProduct: async (_, { input }) => {
      try {
        // Validate required fields
        if (!input.name || !input.description || !input.price || !input.sku) {
          throw new Error('Missing required fields');
        }

        // Check if SKU already exists
        const existingSKU = await Product.findOne({ sku: input.sku.toUpperCase() });
        if (existingSKU) {
          throw new Error('SKU already exists');
        }

        // Create product
        const product = new Product(input);
        await product.save();

        return product;
      } catch (error) {
        throw new Error(`Failed to create product: ${error.message}`);
      }
    },

    /**
     * Update product
     */
    updateProduct: async (_, { id, input }) => {
      try {
        const product = await Product.findById(id);

        if (!product) {
          throw new Error('Product not found');
        }

        // If updating SKU, check for duplicates
        if (input.sku && input.sku !== product.sku) {
          const existingSKU = await Product.findOne({
            sku: input.sku.toUpperCase(),
            _id: { $ne: id }
          });

          if (existingSKU) {
            throw new Error('SKU already exists');
          }
        }

        // Update product
        Object.assign(product, input);
        await product.save();

        return product;
      } catch (error) {
        throw new Error(`Failed to update product: ${error.message}`);
      }
    },

    /**
     * Delete product (soft delete)
     */
    deleteProduct: async (_, { id }) => {
      try {
        const product = await Product.findById(id);

        if (!product) {
          throw new Error('Product not found');
        }

        // Soft delete by setting isActive to false
        product.isActive = false;
        await product.save();

        return true;
      } catch (error) {
        throw new Error(`Failed to delete product: ${error.message}`);
      }
    },

    /**
     * Update stock
     */
    updateStock: async (_, { id, quantity }) => {
      try {
        const product = await Product.findById(id);

        if (!product) {
          throw new Error('Product not found');
        }

        await product.updateStock(quantity);

        return product;
      } catch (error) {
        throw new Error(`Failed to update stock: ${error.message}`);
      }
    },

    /**
     * Increment view count
     */
    incrementViewCount: async (_, { id }) => {
      try {
        const product = await Product.findById(id);

        if (!product) {
          throw new Error('Product not found');
        }

        await product.incrementViewCount();

        return product;
      } catch (error) {
        throw new Error(`Failed to increment view count: ${error.message}`);
      }
    },
  },
};

module.exports = productResolvers;