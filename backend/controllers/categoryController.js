const { Category } = require('../models/categoryModel');
const AppError = require('../utils/AppError');

const getAllCategories = async (req, res, next) => {
    const categories = await Category.find();
    if (!categories || categories.length === 0) {
        return next(new AppError('Categories not found'), 404);
    }
    res.status(200).json({
        code: 200,
        success: true,
        message: 'Categories fetched successfully.',
        result: categories
    });
};

module.exports = { getAllCategories };