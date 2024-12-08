const express = require('express');
const { getProducts,
    getProductById,
    getProductByBarcode,
    getProductItems,
    getProductItemsByBarcode,
    addProduct,
    editProduct, editProductItem,
    deleteProductById,
    deleteProductByBarcode } = require('../controllers/productController');
const { protect, checkPasswordReset, checkLocked } = require('../middlewares/authMiddleware'); // Middleware bảo vệ
const { isAdmin } = require('../middlewares/roleMiddleware');
const router = express.Router();
const multer = require('../middlewares/multer');
const cacheMiddleware = require('../middlewares/cacheMiddleware');

// Key generator functions for caching
const productsKeyGenerator = (req) => {
    const { category, brand, minPrice, maxPrice, sort, limit, page, productName, barcode } = req.query;
    return `products_${JSON.stringify({ category, brand, minPrice, maxPrice, sort, limit, page, productName, barcode })}`;
};
const productByIdKeyGenerator = (req) => `product_${req.params.productId}`;
const productByBarcodeKeyGenerator = (req) => `product_barcode_${req.params.barcode}`;
const productItemsKeyGenerator = (req) => `product_items_${req.params.productId}`;
const productItemsByBarcodeKeyGenerator = (req) => `product_items_barcode_${req.params.barcode}`;

router.get('/', protect, checkPasswordReset, checkLocked, getProducts);

router.get('/:productId', protect, checkPasswordReset, checkLocked, cacheMiddleware(productByIdKeyGenerator), getProductById);

router.get('/barcode/:barcode', protect, checkPasswordReset, checkLocked, cacheMiddleware(productByBarcodeKeyGenerator), getProductByBarcode);

router.get('/items/:productId', protect, checkPasswordReset, checkLocked, cacheMiddleware(productItemsKeyGenerator), getProductItems);

router.get('/items/barcode/:barcode', protect, checkPasswordReset, checkLocked, cacheMiddleware(productItemsByBarcodeKeyGenerator), getProductItemsByBarcode);

router.post('/', protect, isAdmin, multer.array('images'), addProduct);

router.patch('/:productId', protect, isAdmin, multer.array('images', 5), editProduct);

router.patch('/items/:productItemId', protect, isAdmin, editProductItem);

router.delete('/:productId', protect, isAdmin, deleteProductById);

router.delete('/barcode/:barcode', protect, isAdmin, deleteProductByBarcode);


/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Lấy danh sách sản phẩm
 *     description: Lấy danh sách sản phẩm với các tùy chọn lọc, phân trang và sắp xếp
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: barcode
 *         schema:
 *           type: string
 *         description: Tìm kiếm theo barcode
 *       - in: query
 *         name: productName
 *         schema:
 *           type: string
 *         description: Tìm kiếm theo tên sản phẩm
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Lọc theo danh mục sản phẩm (ví dụ smartphone, watch, tablet)
 *       - in: query
 *         name: brand
 *         schema:
 *           type: string
 *         description: Lọc theo thương hiệu sản phẩm
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Giá tối thiểu
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Giá tối đa
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: Sắp xếp theo trường (prefix với - để sắp xếp giảm dần, ví dụ -retailPrice)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Số trang
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Số sản phẩm trên mỗi trang
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lấy danh sách sản phẩm thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Get products successfully
 *                 result:
 *                   type: object
 *                   properties:
 *                     products:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           productName:
 *                             type: string
 *                           categoryId:
 *                             type: string
 *                           retailPrice:
 *                             type: number
 *                           manufacturer:
 *                             type: string
 *                           images:
 *                             type: array
 *                             items:
 *                               type: string
 *                           importPrice:
 *                             type: number
 *                             description: Chỉ hiển thị với admin
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *                         totalItems:
 *                           type: integer
 *                         itemsPerPage:
 *                           type: integer
 *       404:
 *         description: Không tìm thấy sản phẩm
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: No products found
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error while getting product list
 */

/**
 * @swagger
 * /api/products/{productId}:
 *   get:
 *     summary: Retrieve a product by its ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the product to retrieve
 *     responses:
 *       200:
 *         description: Get product successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Get product successfully
 *                 result:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c85"
 *                     productName:
 *                       type: string
 *                       example: "iPhone 13"
 *                     categoryId:
 *                       type: string
 *                       example: "smartphone-1"
 *                     importPrice:
 *                       type: number
 *                       example: 700
 *                     retailPrice:
 *                       type: number
 *                       example: 1000
 *                     manufacturer:
 *                       type: string
 *                       example: "Apple"
 *                     description:
 *                       type: string
 *                       example: "Latest model of iPhone"
 *                     image:
 *                       type: array
 *                       items:
 *                         type: string
 *                     stockQuantity:
 *                       type: number
 *                       example: 50
 *                     isActive:
 *                       type: boolean
 *                       example: true
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: number
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: Product not found
 *       500:
 *         description: Error while getting product by id
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: number
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: Error while getting product by id
 */
/**
 * @swagger
 * /api/products/barcode/{barcode}:
 *   get:
 *     summary: Lấy sản phẩm theo mã vạch
 *     tags: [Products]
 *     parameters:
 *       - name: barcode
 *         in: path
 *         required: true
 *         description: Mã vạch của sản phẩm
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lấy sản phẩm thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 'Get product by barcode successfully'
 *                 result:
 *                   $ref: '#/components/schemas/Product'  # Đảm bảo bạn đã định nghĩa schema Product trong components
 *       400:
 *         description: Mã vạch là bắt buộc
 *       404:
 *         description: Sản phẩm không tìm thấy
 *       500:
 *         description: Lỗi khi lấy sản phẩm theo mã vạch
 */

/**
 * @swagger
 * /api/products/items/{productId}:
 *   get:
 *     summary: Retrieve product items by product ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the product
 *     responses:
 *       200:
 *         description: Get product items successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Get product items successfully
 *                 result:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       barcode:
 *                         type: string
 *                         example: "1234567890123"
 *                       productId:
 *                         type: string
 *                         example: "60d21b4667d0d8992e610c85"
 *                       status:
 *                         type: string
 *                         example: "IN_STOCK"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *       400:
 *         description: Invalid productId format
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: number
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: Invalid productId format
 *       404:
 *         description: No product items found for the given productId
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: number
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: No product items found for the given productId
 *       500:
 *         description: Error while getting product items
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: number
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: Error while getting product items
 */

/**
 * @swagger
 * /api/products/items/barcode/{barcode}:
 *   get:
 *     summary: Lấy danh sách sản phẩm theo mã vạch
 *     tags: [Products]
 *     parameters:
 *       - name: barcode
 *         in: path
 *         required: true
 *         description: Mã vạch của sản phẩm
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lấy sản phẩm thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 'Get product items successfully'
 *                 result:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       barcode:
 *                         type: string
 *                         example: "1234567890123"
 *                       productId:
 *                         type: string
 *                         example: "60d21b4667d0d8992e610c85"
 *                       status:
 *                         type: string
 *                         example: "IN_STOCK"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *       400:
 *         description: Mã vạch là bắt buộc
 *       404:
 *         description: Không tìm thấy sản phẩm
 *       500:
 *         description: Lỗi khi lấy sản phẩm theo mã vạch
 */

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Add a new product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - productName
 *               - importPrice
 *               - retailPrice
 *               - categoryId
 *               - manufacturer
 *               - images
 *             properties:
 *               productName:
 *                 type: string
 *               importPrice:
 *                 type: number
 *               retailPrice:
 *                 type: number
 *               categoryId:
 *                 type: string
 *               manufacturer:
 *                 type: string
 *               description:
 *                 type: string
 *               stockQuantity:
 *                 type: number
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Product images (max 5 files)
 *
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: number
 *                   example: 201
 *                 message:
 *                   type: string
 *                   example: Product added successfully
 *                 result:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                     productName:
 *                       type: string
 *                     categoryId:
 *                       type: string
 *                     importPrice:
 *                       type: number
 *                     retailPrice:
 *                       type: number
 *                     manufacturer:
 *                       type: string
 *                     description:
 *                       type: string
 *                     image:
 *                       type: array
 *                       items:
 *                         type: string
 *                     stockQuantity:
 *                       type: number
 *                     isActive:
 *                       type: boolean
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: number
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: Required fields must be filled
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: number
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: Error while adding product
 */

/**
 * @swagger
 * /api/products/barcode/{barcode}:
 *   get:
 *     summary: Retrieve a product by its barcode
 *     description: Retrieve a product using its unique barcode.
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: barcode
 *         required: true
 *         description: The barcode of the product to retrieve.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 result:
 *                   type: object
 *                   properties:
 *                     productName:
 *                       type: string
 *                     barcode:
 *                       type: string
 *                     categoryId:
 *                       type: string
 *                     manufacturer:
 *                       type: string
 *                     description:
 *                       type: string
 *                     image:
 *                       type: array
 *                       items:
 *                         type: string
 *                     stockQuantity:
 *                       type: integer
 *       400:
 *         description: Barcode is required
 *       404:
 *         description: Product not found
 *       500:
 *         description: Error while getting product by barcode
 */
/**
 * @swagger
 * /api/products/{productId}:
 *   patch:
 *     summary: Update a product by its ID
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the product to update
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               productName:
 *                 type: string
 *                 description: The name of the product
 *               importPrice:
 *                 type: number
 *                 description: The import price of the product
 *               retailPrice:
 *                 type: number
 *                 description: The retail price of the product
 *               categoryId:
 *                 type: string
 *                 description: The category ID of the product
 *               manufacturer:
 *                 type: string
 *                 description: The manufacturer of the product
 *               description:
 *                 type: string
 *                 description: The description of the product
 *               isActive:
 *                 type: boolean
 *                 description: The active status of the product
 *               stockQuantity:
 *                 type: number
 *                 description: The stock quantity of the product
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Product images (max 5 files)
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Product updated successfully
 *                 result:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                     productName:
 *                       type: string
 *                     categoryId:
 *                       type: string
 *                     importPrice:
 *                       type: number
 *                     retailPrice:
 *                       type: number
 *                     manufacturer:
 *                       type: string
 *                     description:
 *                       type: string
 *                     image:
 *                       type: array
 *                       items:
 *                         type: string
 *                     stockQuantity:
 *                       type: number
 *                     isActive:
 *                       type: boolean
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: number
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: Invalid input
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: number
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: Product not found
 *       500:
 *         description: Error updating product
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: number
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: Error updating product
 */

/**
 * @swagger
 * /api/products/items/{productItemId}:
 *   patch:
 *     summary: Update a product item's status
 *     description: Update the status of a specific product item by its ID.
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productItemId
 *         required: true
 *         description: The ID of the product item to update.
 *         schema:
 *           type: string
 *       - in: body
 *         name: status
 *         required: true
 *         description: The new status for the product item.
 *         schema:
 *           type: object
 *           properties:
 *             status:
 *               type: string
 *               description: The status of the product item.
 *               enum: [IN_STOCK, SOLD, WARRANTY, PROCESSING]
 *     responses:
 *       200:
 *         description: Product item updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 result:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     productId:
 *                       type: string
 *                     status:
 *                       type: string
 *       400:
 *         description: Invalid ProductItemId or status value
 *       404:
 *         description: Product item not found
 *       500:
 *         description: Error updating product item
 */
/**
 * @swagger
 * /api/products/{productId}:
 *   delete:
 *     summary: Xóa sản phẩm theo ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         description: ID của sản phẩm cần xóa
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sản phẩm đã được xóa thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 'Product item deleted successfully'
 *                 result:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     productName:
 *                       type: string
 *                     barcode:
 *                       type: string
 *                     stockQuantity:
 *                       type: integer
 *       400:
 *         description: ID sản phẩm không hợp lệ hoặc sản phẩm không thể xóa
 *       404:
 *         description: Không tìm thấy sản phẩm
 *       500:
 *         description: Lỗi khi xóa sản phẩm
 */

/**
 * @swagger
 * /api/products/barcode/{barcode}:
 *   delete:
 *     summary: Xóa sản phẩm theo mã vạch
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: barcode
 *         required: true
 *         description: Mã vạch của sản phẩm cần xóa
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sản phẩm đã được xóa thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 'Product deleted successfully'
 *                 result:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     productName:
 *                       type: string
 *                     barcode:
 *                       type: string
 *                     stockQuantity:
 *                       type: integer
 *       400:
 *         description: Mã vạch không hợp lệ hoặc sản phẩm không thể xóa
 *       404:
 *         description: Không tìm thấy sản phẩm
 *       500:
 *         description: Lỗi khi xóa sản phẩm
 */

module.exports = router;