const express = require('express');
const { protect, checkPasswordReset, checkLocked } = require('../middlewares/authMiddleware');
const {
    createOrder,
    getOrderDetail,
    getOrders,
    addProductToOrder,
    removeProductFromOrder,
    updateOrder,
    deleteOrder,
    checkoutOrder
} = require('../controllers/orderController');
const cacheMiddleware = require('../middlewares/cacheMiddleware');

// Key generator functions for caching
const ordersKeyGenerator = (req) => {
    const { phoneNumber } = req.query;
    return `orders_phoneNumber_${phoneNumber || 'none'}`;
};
const orderByIdKeyGenerator = (req) => `order_${req.params.orderId}`;

const router = express.Router();

router.get('/', protect, checkPasswordReset, checkLocked, cacheMiddleware(ordersKeyGenerator), getOrders);
router.get('/details/:orderId', protect, checkPasswordReset, checkLocked, cacheMiddleware(orderByIdKeyGenerator), getOrderDetail);
router.post('/', protect, checkPasswordReset, checkLocked, createOrder);
router.post('/add-product/:orderId', protect, checkPasswordReset, checkLocked, addProductToOrder);
router.post('/remove-product/:orderId', protect, checkPasswordReset, checkLocked, removeProductFromOrder);
router.patch('/:orderId', protect, checkPasswordReset, checkLocked, updateOrder);
router.delete('/:orderId', protect, checkPasswordReset, checkLocked, deleteOrder);
router.post('/checkout/:orderId', protect, checkPasswordReset, checkLocked, checkoutOrder);
module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management
 * /api/orders:
 *   get:
 *     summary: Retrieve a list of orders
 *     description: Retrieve orders by phone number or order ID.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: phoneNumber
 *         schema:
 *           type: string
 *         description: The phone number of the customer.
 *     responses:
 *       200:
 *         description: A list of orders
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       400:
 *         description: Phone number or order ID is required
 *       404:
 *         description: No orders found
 *       500:
 *         description: Error while getting orders
 */

/**
 * @swagger
 * /api/orders/details/{orderId}:
 *   get:
 *     summary: Retrieve order details
 *     description: Retrieve detailed information about a specific order.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the order.
 *     responses:
 *       200:
 *         description: Order details retrieved successfully
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
 *       404:
 *         description: Order not found
 *       500:
 *         description: Error while getting order detail
 */

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create a new order
 *     description: Create a new order with a customer phone number and employee ID.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phoneNumber:
 *                 type: string
 *     responses:
 *       201:
 *         description: Order created successfully
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
 *       400:
 *         description: Phone number and Employee ID are required
 *       404:
 *         description: Customer or Employee not found
 *       500:
 *         description: Error while creating order
 */

/**
 * @swagger
 * /api/orders/add-product/{orderId}:
 *   post:
 *     summary: Add a product to an order
 *     description: Add a product to an existing order by product name or barcode.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the order.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productName:
 *                 type: string
 *               barcode:
 *                 type: string
 *               quantity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Product added to order successfully
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
 *       400:
 *         description: Invalid input or product not available
 *       404:
 *         description: Order or Product not found
 *       500:
 *         description: Error while adding product to order
 */

/**
 * @swagger
 * /api/orders/remove-product/{orderId}:
 *   post:
 *     summary: Remove a product from an order
 *     description: Remove a specified quantity of a product from an existing order.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the order.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productName:
 *                 type: string
 *               barcode:
 *                 type: string
 *               quantity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Product removed from order successfully
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
 *       400:
 *         description: Invalid input or insufficient quantity
 *       404:
 *         description: Order not found
 *       500:
 *         description: Error while removing product from order
 */

/**
 * @swagger
 * /api/orders/{orderId}:
 *   patch:
 *     summary: Update an order
 *     description: Update specific fields of an order such as customerId (via phoneNumber), amountReceived, and orderDate.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the order to update.
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The email address of the customer.
 *               address:
 *                 type: string
 *                 description: The physical address of the customer.
 *               amountReceived:
 *                 format: number
 *                 description: The amount received for the order.
 *     responses:
 *       200:
 *         description: Order updated successfully
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
 *                     orderId:
 *                       type: string
 *                     customerId:
 *                       type: string
 *                     employeeId:
 *                       type: string
 *                     amountReceived:
 *                       type: number
 *                     changeGiven:
 *                       type: number
 *                     orderDate:
 *                       type: string
 *                       format: date
 *                     total:
 *                       type: number
 *                     status:
 *                       type: string
 *                     invoiceUrl:
 *                       type: string
 *       400:
 *         description: Bad request, such as amount received is less than the total amount
 *       404:
 *         description: Order or customer not found
 *       500:
 *         description: Error while updating order
 */
/**
 * @swagger
 * /api/orders/{orderId}:
 *   delete:
 *     summary: Delete an order
 *     description: Delete an existing order by ID.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the order.
 *     responses:
 *       200:
 *         description: Order deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                 message:
 *                   type: string
 *       500:
 *         description: Error while deleting order
 */

/**
 * @swagger
 * /api/orders/checkout/{orderId}:
 *   post:
 *     summary: Checkout an order
 *     description: Completes an order by generating an invoice and updating the order status to completed.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amountReceived:
 *                 type: number
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the order to checkout.
 *     responses:
 *       200:
 *         description: Order checked out successfully
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
 *                     orderId:
 *                       type: string
 *                     customerId:
 *                       type: string
 *                     employeeId:
 *                       type: string
 *                     amountReceived:
 *                       type: number
 *                     changeGiven:
 *                       type: number
 *                     orderDate:
 *                       type: string
 *                       format: date
 *                     total:
 *                       type: number
 *                     status:
 *                       type: string
 *                     invoiceUrl:
 *                       type: string
 *       400:
 *         description: Order is not ready for checkout
 *       404:
 *         description: Order not found
 *       500:
 *         description: Error while checking out order
 */


