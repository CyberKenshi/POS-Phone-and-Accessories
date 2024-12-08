const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const protect = async (req, res, next) => {
    let token;

    // Lấy token từ header Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    // Nếu không tìm thấy token
    if (!token) {
        return res.status(401).json({
            code: 401,
            success: false,
            message: 'Not authorized, no token',
            result: null
        });
    }

    try {
        // Giải mã token để lấy user ID
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Tìm người dùng từ cơ sở dữ liệu, bỏ qua trường password
        req.user = await User.findById(decoded.id).select('-password');

        // Nếu không tìm thấy user trong database
        if (!req.user) {
            return res.status(401).json({
                code: 401,
                success: false,
                message: 'Not authorized, user not found',
                result: null
            });
        }

        next();
    } catch (error) {
        return res.status(401).json({
            code: 401,
            success: false,
            message: 'Not authorized, token invalid',
            result: null
        });
    }
};


const checkPasswordReset = (req, res, next) => {
    if (!req.user.isActive && req.user.role === 'employee') {
        return res.status(403).json({
            code: 403,
            success: false,
            message: 'You must reset your password before accessing other features.',
            result: null
        });
    }
    next();
};

const checkLocked = (req, res, next) => {
    if (req.user.isLocked && req.user.role === 'employee') {
        return res.status(403).json({
            code: 403,
            success: false,
            message: 'This employee is locked!',
            result: null
        });
    }
    next();
};

module.exports = { protect, checkPasswordReset, checkLocked };
