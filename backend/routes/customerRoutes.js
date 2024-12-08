const express = require('express');
const router = express.Router();
const { getAllCustomers, getCustomersByPhoneNumber, createCustomer, updateCustomer, deleteCustomer, getOrderHistoryByPhoneNumber } = require('../controllers/customerController');
const { protect, checkPasswordReset, checkLocked } = require('../middlewares/authMiddleware');
const cacheMiddleware = require('../middlewares/cacheMiddleware');
const { check, validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

// Key generator functions for caching
const customersKeyGenerator = (req) => 'customers_list';
const customerByPhoneKeyGenerator = (req) => `customer_${req.params.phoneNumber}`;
const customerOrdersByPhoneKeyGenerator = (req) => `customer_orders_${req.params.phoneNumber}`;

router.get('/', protect, checkPasswordReset, checkLocked, cacheMiddleware(customersKeyGenerator), getAllCustomers);
router.get('/:phoneNumber', protect, checkPasswordReset, checkLocked, cacheMiddleware(customerByPhoneKeyGenerator), getCustomersByPhoneNumber);
router.get('/history/:phoneNumber', protect, checkPasswordReset, checkLocked, cacheMiddleware(customerOrdersByPhoneKeyGenerator), getOrderHistoryByPhoneNumber);
router.post(
    '/',
    protect,
    checkPasswordReset,
    checkLocked,
    [
        check('customerName', 'Customer name is required').notEmpty(),
        check('phoneNumber', 'Phone number is required').notEmpty(),
        check('address', 'Address is required').notEmpty(),
        check('email', 'Email is required').notEmpty(),
        check('email', 'Please provide a valid email').isEmail()
    ],
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new AppError(errors.array().map(err => err.msg).join(', '), 400));
        }

        createCustomer(req, res, next);
    }
);
router.patch('/:customerId', protect, checkPasswordReset, checkLocked, updateCustomer);
router.delete('/:customerId', protect, checkPasswordReset, checkLocked, deleteCustomer);


module.exports = router;

/**
 * @swagger
 * /api/customers:
 *   get:
 *     summary: Retrieve a list of all customers
 *     description: Retrieve a list of all customers in the database.
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of customers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   customerId:
 *                     type: string
 *                   customerName:
 *                     type: string
 *                   phoneNumber:
 *                     type: string
 *                   address:
 *                     type: string
 *                   email:
 *                     type: string
 *       500:
 *         description: Error retrieving customers
 */

/**
 * @swagger
 * /api/customers/{phoneNumber}:
 *   get:
 *     summary: Retrieve a customer by phone number
 *     description: Retrieve a specific customer using their phone number.
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: phoneNumber
 *         required: true
 *         description: The phone number of the customer to retrieve.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Customer retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 customerId:
 *                   type: string
 *                 customerName:
 *                   type: string
 *                 phoneNumber:
 *                   type: string
 *                 address:
 *                   type: string
 *                 email:
 *                   type: string
 *       404:
 *         description: Customer not found
 *       500:
 *         description: Error retrieving customer
 */

/**
 * @swagger
 * /api/customers:
 *   post:
 *     summary: Create a new customer
 *     description: Add a new customer to the database.
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customerName:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               address:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: Customer created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Error creating customer
 */

/**
 * @swagger
 * /api/customers/{customerId}:
 *   patch:
 *     summary: Update a customer
 *     description: Update the details of an existing customer.
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         description: The ID of the customer to update.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customerName:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               address:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Customer updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Customer not found
 *       500:
 *         description: Error updating customer
 */

/**
 * @swagger
 * /api/customers/{customerId}:
 *   delete:
 *     summary: Delete a customer
 *     description: Remove a customer from the database.
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         description: The ID of the customer to delete.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Customer deleted successfully
 *       404:
 *         description: Customer not found
 *       500:
 *         description: Error deleting customer
 */

/**
 * @swagger
 * /api/customers/history/{phoneNumber}:
 *   get:
 *     summary: Get order history by phone number
 *     description: Retrieve all orders associated with a customer using their phone number.
 *     tags: [Customers]
 *     parameters:
 *       - in: path
 *         name: phoneNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: The phone number of the customer whose order history is to be retrieved.
 *     responses:
 *       200:
 *         description: Order history retrieved successfully
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
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       orderId:
 *                         type: string
 *                       customerId:
 *                         type: string
 *                       employeeId:
 *                         type: string
 *                       amountReceived:
 *                         type: number
 *                       changeGiven:
 *                         type: number
 *                       orderDate:
 *                         type: string
 *                         format: date
 *                       total:
 *                         type: number
 *                       status:
 *                         type: string
 *                       invoiceUrl:
 *                         type: string
 *       404:
 *         description: Customer not found or no orders found for this customer
 *       500:
 *         description: Error while retrieving order history
 */