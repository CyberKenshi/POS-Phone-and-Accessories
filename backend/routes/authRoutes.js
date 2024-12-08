const express = require('express');
const { login } = require('../controllers/authController');
const generateToken = require('../utils/generateToken');
const router = express.Router();
const User = require('../models/userModel');

/**
 * @swagger
 * /api/auth/login/{token}:
 *   get:
 *     summary: Login using a token
 *     description: Log in using a token that has been sent via email. The token must be valid and not expired.
 *     tags:
 *       - Authentication
 *     parameters:
 *       - in: path
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: The login token sent via email
 *     responses:
 *       200:
 *         description: Login successful. Token validated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 result:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 60c72b2f5f1b2c001c8e4b9a
 *                     fullName:
 *                       type: string
 *                       example: John Doe
 *                     email:
 *                       type: string
 *                       example: johndoe@example.com
 *                     notice:
 *                       type: string
 *                       example: Please reset your password.
 *       400:
 *         description: Invalid or expired token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: Invalid or expired token
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User login
 *     description: Log in a user using their username and password.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: admin
 *               password:
 *                 type: string
 *                 example: admin
 *     responses:
 *       200:
 *         description: Login successful.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 result:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Invalid credentials.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: Invalid username or password.
 */

router.get('/login/:token', async (req, res) => {
    const { token } = req.params;
    const user = await User.findOne({ loginToken: token, tokenExpires: { $gt: Date.now() } });
    if (!user) {
        return res.status(400).json({
            code: 400,
            success: false,
            message: 'Invalid or expired token',
            result: null
        });
    }
    // Xóa token sau khi đăng nhập thành công
    user.loginToken = undefined;
    user.tokenExpires = undefined;
    const tokenToLogin = generateToken(user._id);
    await user.save();
    res.status(200).json({
        code: 200,
        success: true,
        message: 'Please reset your password.',
        result: {
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            token: tokenToLogin
        }
    });
});

router.post('/login', login);

module.exports = router;
