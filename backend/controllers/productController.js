const { Product, generateBarcode } = require('../models/productModel');
const { ProductItem, ProductStatus } = require('../models/productItemModel');
const cloudinary = require('../utils/cloudinary');
const fs = require('fs');
const mongoose = require('mongoose');
const AppError = require('../utils/AppError');
const User = require('../models/userModel');
const { v4: uuidv4 } = require('uuid');
const client = require('../config/redisClient');
const OrderItem = require('../models/orderItemModel');

const getProducts = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        const { category, brand, minPrice, maxPrice, sort, limit = 10, page = 1, productName, barcode } = req.query;

        // Xây dựng query object
        let query = {};

        if (category) {
            query.categoryId = new RegExp(`^${category}-`, 'i');
        }

        if (brand) {
            query.manufacturer = new RegExp(brand, 'i');
        }

        // Tìm kiếm theo productName
        if (productName) {
            query.productName = new RegExp(productName, 'i');
        }
        if (barcode) {
            query.barcode = new RegExp(barcode, 'i');
        }

        // Xử lý range price
        if (minPrice || maxPrice) {
            if ((minPrice && isNaN(Number(minPrice))) || (maxPrice && isNaN(Number(maxPrice)))) {
                return next(new AppError('Price must be a number', 400));
            }

            if ((minPrice && Number(minPrice) < 0) || (maxPrice && Number(maxPrice) < 0)) {
                return next(new AppError('Price cannot be negative', 400));
            }

            if (minPrice && maxPrice) {
                if (Number(minPrice) > Number(maxPrice)) {
                    return next(new AppError('Min price cannot be greater than max price', 400));
                }
                if (Number(minPrice) === Number(maxPrice)) {
                    return next(new AppError('Min price cannot equal max price', 400));
                }
            }

            query.retailPrice = {};

            if (minPrice) {
                query.retailPrice.$gte = Number(minPrice);
            }

            if (maxPrice) {
                query.retailPrice.$lte = Number(maxPrice);
            }

            const MAX_PRICE_RANGE = 1000000000;
            if (maxPrice && Number(maxPrice) > MAX_PRICE_RANGE) {
                return next(new AppError(`Max price cannot exceed ${MAX_PRICE_RANGE}`, 400));
            }
        }

        // Xây dựng query cơ bản
        let productQuery = Product.find(query);

        // Sorting 
        if (sort) {
            const allowedSortFields = ['productName', 'retailPrice', 'createdAt', 'manufacturer'];

            const sortFields = sort.split(',');

            const isValidSort = sortFields.every(field => {

                const cleanField = field.startsWith('-') ? field.substring(1) : field;
                return allowedSortFields.includes(cleanField);
            });

            if (!isValidSort) {
                return next(new AppError('Invalid sort fields. Allowed fields: ' + allowedSortFields.join(', '), 400));
            }

            const sortOrder = sortFields.join(' ');
            productQuery = productQuery.sort(sortOrder);
        }

        // Phân trang
        const total = await Product.countDocuments(query);
        if (total === 0) {
            return next(new AppError('No products found', 404));
        }
        // console.log(`total ${total}`);
        let maxPage = Math.ceil(total / Number(limit));
        const MAX_LIMIT = 100;
        if (page < 1 || limit < 1) {
            return next(new AppError('Page and limit must be positive numbers', 400));
        }
        if (page > maxPage) {
            return next(new AppError('Page is out of range, max page is ' + maxPage, 400));
        }
        if (limit > MAX_LIMIT) {
            return next(new AppError('Limit is out of range, max limit is ' + MAX_LIMIT, 400));
        }
        const skip = (Number(page) - 1) * Number(limit);
        productQuery = productQuery.skip(skip).limit(Number(limit));

        // Ẩn importPrice nếu không phải admin
        if (user.role !== 'admin') {
            productQuery = productQuery.select('-importPrice');
        }

        // Thực thi query
        const products = await productQuery;

        if (!products || products.length === 0) {
            return next(new AppError('No products found', 404));
        }

        res.status(200).json({
            code: 200,
            success: true,
            message: 'Get products successfully',
            result: {
                products,
                pagination: {
                    currentPage: Number(page),
                    totalPages: Math.ceil(total / Number(limit)),
                    totalItems: total,
                    itemsPerPage: Number(limit)
                }
            }
        });
    } catch (error) {
        return next(new AppError(`Error while getting product list: ${error.message}`, 500));
    }
};

const getProductById = async (req, res, next) => {
    try {
        const { productId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return next(new AppError('ProductId not found', 404));
        }
        const product = await Product.findById(productId);
        if (!product) {
            return next(new AppError('Product not found', 404));
        }
        await product.save();
        res.status(200).json({
            code: 200,
            success: true,
            message: 'Get product successfully',
            result: product
        });
    } catch (error) {
        return next(new AppError(`Error while getting product by id: ${error.message}`, 500));
    }
};

const getProductByBarcode = async (req, res, next) => {
    try {
        const { barcode } = req.params;
        if (!barcode) {
            return next(new AppError('Barcode is required', 400));
        }
        const product = await Product.findOne({ barcode });
        if (!product) {
            return next(new AppError('Product not found', 404));
        }
        res.status(200).json({
            code: 200,
            success: true,
            message: 'Get product by barcode successfully',
            result: product
        });
    } catch (error) {
        return next(new AppError(`Error while getting product by barcode: ${error.message}`, 500));
    }
};

const getProductItems = async (req, res, next) => {
    try {
        const { productId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return next(new AppError('ProductId not found', 404));
        }
        const productItems = await ProductItem.find({ productId }).populate({
            path: 'productId',
            select: '-stockQuantity'
        })
        if (!productItems || productItems.length === 0) {
            return next(new AppError('Product items not found', 404));
        }
        //console.log(productItems.length); // Debug
        res.status(200).json({
            code: 200,
            success: true,
            message: 'Get product items successfully',
            result: productItems
        });
    } catch (error) {
        return next(new AppError(`Error while getting product item: ${error.message}`, 500));
    }
};

const getProductItemsByBarcode = async (req, res, next) => {
    try {
        const { barcode } = req.params;
        if (!barcode) {
            return next(new AppError('Barcode is required', 400));
        }
        const product = await Product.findOne({ barcode });
        if (!product) {
            return next(new AppError('Product not found!', 404));
        }
        const productItems = await ProductItem.find({ productId: product._id }).populate({
            path: 'productId',
            select: '-stockQuantity'
        })
        if (!productItems || productItems.length === 0) {
            return next(new AppError('Product items not found', 404));
        }
        //console.log(productItems.length); // Debug
        res.status(200).json({
            code: 200,
            success: true,
            message: 'Get product items successfully',
            result: productItems
        });
    } catch (error) {
        return next(new AppError(`Error while getting product item: ${error.message}`, 500));
    }
}

const addProduct = async (req, res, next) => {
    try {
        const {
            productName,
            importPrice,
            retailPrice,
            categoryId,
            manufacturer,
            description = '',
            stockQuantity = 1
        } = req.body;

        if (!productName || !importPrice || !retailPrice || !categoryId || !manufacturer) {
            return next(new AppError('Required fields must be filled', 400));
        }

        if (importPrice < 0 || retailPrice < 0 || stockQuantity < 0) {
            return next(new AppError('Price and stock quantity cannot be negative', 400));
        }

        // console.log(importPrice, retailPrice);
        if (Number(importPrice) > Number(retailPrice)) {
            return next(new AppError('Import price cannot be greater than retail price', 400));
        }

        if (!req.files || req.files.length === 0) {
            return next(new AppError('No images uploaded', 400));
        }

        const imageUrls = [];
        for (const file of req.files) {
            const filename = `${productName}-${Date.now()}`;

            const result = await cloudinary.uploader.upload(file.path, {
                public_id: `product_images/${filename}`,
                folder: 'POS',
                use_filename: true,
                unique_filename: false,
                overwrite: true,
            });

            imageUrls.push(result.secure_url);
            fs.unlinkSync(file.path);
        }

        const newProduct = await Product.create({
            productName,
            barcode: generateBarcode(),
            categoryId,
            importPrice: Number(importPrice),
            retailPrice: Number(retailPrice),
            manufacturer,
            description,
            image: imageUrls,
            stockQuantity: Number(stockQuantity),
            isActive: true
        });

        const productItems = Array(Number(stockQuantity)).fill().map(() => ({
            productId: newProduct._id,
            serialNumber: newProduct.manufacturer.slice(0, 3).toUpperCase() + uuidv4().replace(/-/g, '').slice(-9),
            status: 'IN_STOCK'
        }));

        await ProductItem.insertMany(productItems);
        res.status(201).json({
            code: 201,
            success: true,
            message: 'Product added successfully',
            result: newProduct
        });

    } catch (error) {
        return next(new AppError(`Error while adding product: ${error.message}`, 500));
    }
};

const editProduct = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const { productName, importPrice, retailPrice, categoryId, manufacturer, description, isActive, stockQuantity } = req.body;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return next(new AppError('Invalid ProductId', 400));
        }

        const product = await Product.findById(productId);
        if (!product) {
            return next(new AppError('Product not found', 404));
        }

        if (productName) product.productName = productName;
        if (importPrice) product.importPrice = importPrice;
        if (retailPrice) product.retailPrice = retailPrice;
        if (categoryId) product.categoryId = categoryId;
        if (manufacturer) product.manufacturer = manufacturer;
        if (description) product.description = description;
        if (isActive !== undefined) product.isActive = isActive;
        if (req.files && req.files.length > 0) {
            const imageUrls = [];
            for (const file of req.files) {
                const filename = `${productName}-${Date.now()}`;

                const result = await cloudinary.uploader.upload(file.path, {
                    public_id: `product_images/${filename}`,
                    folder: 'POS',
                    use_filename: true,
                    unique_filename: false,
                    overwrite: true,
                });

                imageUrls.push(result.secure_url);
                fs.unlinkSync(file.path);
            }
            product.image = imageUrls;
        }

        if (stockQuantity !== undefined) {
            if (stockQuantity > product.stockQuantity) {
                const newItemsCount = stockQuantity - product.stockQuantity;
                const newProductItems = Array(newItemsCount).fill().map(() => ({
                    productId: product._id,
                    serialNumber: product.manufacturer.slice(0, 3).toUpperCase() + uuidv4().replace(/-/g, '').slice(-9),
                    status: 'IN_STOCK'
                }));
                await ProductItem.insertMany(newProductItems);
            } else if (stockQuantity < product.stockQuantity) {
                const itemsToRemove = product.stockQuantity - stockQuantity;
                const productItemsToRemove = await ProductItem.find({ productId: product._id }).sort({ createdAt: -1 }).limit(itemsToRemove);
                await ProductItem.deleteMany({ _id: { $in: productItemsToRemove.map(item => item._id) } });
            }
            product.stockQuantity = stockQuantity;
        }

        await product.save();
        await client.del(`product_${product._id}`);
        await client.del(`product_barcode_${product.barcode}`);
        await client.del(`product_items_${product._id}`);
        await client.del(`product_items_barcode_${product.barcode}`);

        res.status(200).json({
            code: 200,
            success: true,
            message: 'Product updated successfully',
            result: product
        });
    } catch (error) {
        return next(new AppError(`Error updating product: ${error.message}`, 500));
    }
};

const deleteProductById = async (req, res, next) => {
    try {
        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return next(new AppError('Invalid ProductItemId', 400));
        }
        if (!productId) {
            return next(new AppError('ProductId is required', 400));
        }
        const product = await Product.findById(productId);
        if (!product) {
            return next(new AppError('Product not found', 404));
        }
        const orderItem = await OrderItem.findOne({ productId });
        if (orderItem) {
            return next(new AppError('Product cannot be deleted because it\'s in order', 400));
        }
        await ProductItem.deleteMany({ productId });
        await product.deleteOne();
        await client.del(`product_${product._id}`);
        await client.del(`product_barcode_${product.barcode}`);
        await client.del(`product_items_${product._id}`);
        await client.del(`product_items_barcode_${product.barcode}`);

        res.status(200).json({
            code: 200,
            success: true,
            message: 'Product item deleted successfully',
            result: product
        });
    } catch (error) {
        return next(new AppError(`Error deleting product: ${error.message}`, 500));
    }
}

const deleteProductByBarcode = async (req, res, next) => {
    try {
        const { barcode } = req.params;

        if (!barcode) {
            return next(new AppError('Barcode is required', 400));
        }

        const product = await Product.findOne({ barcode });
        if (!product) {
            return next(new AppError('Product not found', 404));
        }

        const orderItem = await OrderItem.findOne({ productId: product._id });
        if (orderItem) {
            return next(new AppError('Product cannot be deleted because it\'s in order', 400));
        }

        await ProductItem.deleteMany({ productId: product._id });
        await product.deleteOne();
        await client.del(`product_${product._id}`);
        await client.del(`product_barcode_${product.barcode}`);
        await client.del(`product_items_${product._id}`);
        await client.del(`product_items_barcode_${product.barcode}`);

        res.status(200).json({
            code: 200,
            success: true,
            message: 'Product deleted successfully',
            result: product
        });
    } catch (error) {
        return next(new AppError(`Error deleting product: ${error.message}`, 500));
    }
};

const deleteProductItemByProductItemId = async (req, res, next) => {
    try {
        const { productItemId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productItemId)) {
            return next(new AppError('Invalid ProductItemId', 400));
        }

        const productItem = await ProductItem.findById(productItemId);
        if (!productItem) {
            return next(new AppError('Product item not found', 404));
        }
        const product = await Product.findById(productItem.productId);

        if (productItem.status === 'SOLD' || productItem.status === 'WARRANTY' || productItem.status === 'PROCESSING') {
            return next(new AppError('Product item cannot be deleted', 400));
        }

        deletedProductItem = await productItem.deleteOne();
        product.stockQuantity -= 1;
        await product.save();
        await client.del(`product_${product._id}`);
        await client.del(`product_barcode_${product.barcode}`);
        await client.del(`product_items_${product._id}`);
        await client.del(`product_items_barcode_${product.barcode}`);
        res.status(200).json({
            code: 200,
            success: true,
            message: 'Product item deleted successfully',
            result: productItem
        });
    } catch (error) {
        return next(new AppError(`Error deleting product item: ${error.message}`, 500));
    }
};

const editProductItem = async (req, res, next) => {
    try {
        const { productItemId } = req.params;
        const { status } = req.body;

        if (!mongoose.Types.ObjectId.isValid(productItemId)) {
            return next(new AppError('Invalid ProductItemId', 400));
        }

        const productItem = await ProductItem.findById(productItemId);
        if (!productItem) {
            return next(new AppError('Product item not found', 404));
        }

        if (status && !Object.values(ProductStatus).includes(status)) {
            return next(new AppError('Invalid status value', 400));
        }

        if (status) {
            productItem.status = status;
        }

        const updatedProductItem = await productItem.save();

        res.status(200).json({
            code: 200,
            success: true,
            message: 'Product item updated successfully',
            result: updatedProductItem
        });
    } catch (error) {
        return next(new AppError(`Error updating product item: ${error.message}`, 500));
    }
};

module.exports = {
    getProducts,
    getProductById,
    getProductByBarcode,
    getProductItems,
    getProductItemsByBarcode,
    addProduct,
    editProduct,
    deleteProductById,
    deleteProductByBarcode,
    editProductItem,
};