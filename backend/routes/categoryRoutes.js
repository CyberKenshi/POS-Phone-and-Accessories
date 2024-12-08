const express = require('express');
const router = express.Router();
const { protect, checkPasswordReset, checkLocked } = require('../middlewares/authMiddleware');
const { getAllCategories } = require('../controllers/categoryController');
const cacheMiddleware = require('../middlewares/cacheMiddleware');

// Key generator functions for caching
const categoriesKeyGenerator = (req) => 'categories_list';

router.get('/', protect, checkPasswordReset, checkLocked, cacheMiddleware(categoriesKeyGenerator), getAllCategories);

module.exports = router;

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Retrieve a list of all categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Categories fetched successfully
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
 *                   example: Categories fetched successfully.
 *                 result:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       categoryId:
 *                         type: string
 *                         example: smartphone-1
 *                       categoryName:
 *                         type: string
 *                         example: Smartphone
 *                       description:
 *                         type: string
 *                         example: Các loại điện thoại thông minh
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 */
