const User = require('../models/userModel');
const generateToken = require('../utils/generateToken');
const bcrypt = require('bcrypt');
const AppError = require('../utils/AppError');
const { error } = require('console');

const login = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });

        if (user && user.role === 'employee' && user.loginToken) {
            return next(new AppError('Please login by clicking on the link in your email', 400));
        }

        if (user && (await bcrypt.compare(password, user.password))) {
            // Tạo token
            const token = generateToken(user._id);

            return res.status(200).json({
                code: 200,
                success: true,
                message: 'Login successful',
                result: {
                    _id: user._id,
                    fullName: user.fullName,
                    email: user.email,
                    token: token
                }
            });
        } else {
            return next(new AppError('Invalid email or password', 401));
        }
    } catch (error) {
        return next(new AppError(`Error while login: ${error.message}`, 500));
    }

};

module.exports = { login };
