const User = require('../models/userModel');

// Middleware kiểm tra xem người dùng có phải là admin không
const isAdmin = async (req, res, next) => {
    const userId = req.user.id;

    try {
        const user = await User.findById(userId);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({
                code: 403,
                success: false,
                message: 'Access denied. Admins only.',
                result: null
            });
        }
        next();
    } catch (error) {
        res.status(500).json({
            code: 500,
            success: false,
            message: 'Server error',
            result: null
        });
    }

};

module.exports = { isAdmin };
