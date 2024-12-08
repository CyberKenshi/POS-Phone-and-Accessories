const express = require('express');
const { resetPassword, getProfile, uploadImage, changePassword } = require('../controllers/employeeController');
const { protect, checkPasswordReset, checkLocked } = require('../middlewares/authMiddleware'); // Middleware bảo vệ
const { body, validationResult } = require('express-validator');
const cacheMiddleware = require('../middlewares/cacheMiddleware');

// Key generator functions for caching
const profileKeyGenerator = (req) => `employee_profile_${req.user.id}`;

const router = express.Router();
const multer = require('../middlewares/multer');
const AppError = require('../utils/AppError');

router.post(
    '/reset-password',
    protect,
    [
        body('password')
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters')
            .not()
            .isIn(['12345678', 'password', 'qwerty'])
            .withMessage('Password is too common, please choose another one'),
    ],
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new AppError(errors.array().map(err => err.msg).join(', '), 400));
        }

        resetPassword(req, res, next);
    }
);

router.post(
    '/change-password',
    protect,
    [
        body('oldPassword')
            .notEmpty()
            .withMessage('Old password is required.'),
        body('newPassword')
            .isLength({ min: 6 })
            .withMessage('New password must be at least 6 characters long.')
            .not()
            .isIn(['12345678', 'password', 'qwerty'])
            .withMessage('New password is too common, please choose a stronger password.')
    ],
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new AppError(errors.array().map(err => err.msg).join(', '), 400));
        }

        changePassword(req, res, next);
    }
);

router.get('/profile', protect, checkPasswordReset, checkLocked, cacheMiddleware(profileKeyGenerator), getProfile);

router.post('/upload-avatar', protect, checkPasswordReset, checkLocked, multer.single('avatar'), uploadImage);

module.exports = router;

/**
 * @swagger
 * /api/employee/reset-password:
 *   post:
 *     summary: Reset employee password
 *     description: Allow an employee to reset their password.
 *     tags:
 *       - Employees
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *                 example: newPassword123
 *     responses:
 *       200:
 *         description: Password reset successfully.
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
 *                   example: Password has been reset successfully.
 *                 result:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Password has been reset successfully.
 *       400:
 *         description: New password is the same as the old password.
 *       404:
 *         description: User not found.
 */


/**
 * @swagger
 * /api/employee/profile:
 *   get:
 *     summary: Get employee profile
 *     description: Retrieve the profile information of the logged-in employee.
 *     tags:
 *       - Employees
 *     responses:
 *       200:
 *         description: Success
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
 *                   example: null
 *                 result:
 *                   type: object
 *                   properties:
 *                     fullName:
 *                       type: string
 *                       example: John Doe
 *                     email:
 *                       type: string
 *                       example: john.doe@example.com
 *                     mobile:
 *                       type: string
 *                       example: 123456789
 *                     role:
 *                       type: string
 *                       example: employee
 *       404:
 *         description: User not found.
 *       500:
 *         description: An error occurred while retrieving the profile.
*/
/**
 * @swagger
 * /api/employee/change-password:
 *   post:
 *     summary: Change the password for the logged-in user
 *     description: Requires the old password and a new password to update the current user's password.
 *     tags:
 *       - Employees
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 description: The current password of the user
 *                 example: old_password_123
 *               newPassword:
 *                 type: string
 *                 description: The new password to be set
 *                 example: new_password_456
 *     responses:
 *       200:
 *         description: Password changed successfully
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
 *                   example: "Password has been changed successfully."
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 400
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Old password and New password are required!"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 401
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Unauthorized. Please login again."
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 500
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Error while changing the password: <error details>"
 */


/**
 * @swagger
 * /api/employee/upload-avatar:
 *   post:
 *     summary: Upload employee profile picture
 *     description: Upload and update the employee's profile picture using Cloudinary.
 *     tags:
 *       - Employees
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile picture updated successfully.
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
 *                   example: Profile picture updated successfully.
 *                 result:
 *                   type: object
 *                   properties:
 *                     avatar:
 *                       type: string
 *                       example: https://res.cloudinary.com/your-cloud/image/upload/sample.jpg
 *       400:
 *         description: No file uploaded.
 *       404:
 *         description: User not found.
 *       500:
 *         description: An error occurred while uploading the image.
 */

