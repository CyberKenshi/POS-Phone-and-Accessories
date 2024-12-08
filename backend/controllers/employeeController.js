const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const cloudinary = require('../utils/cloudinary');
const fs = require('fs');
const AppError = require('../utils/AppError');
const client = require('../config/redisClient');

const resetPassword = async (req, res, next) => {
    try {
        const { password } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            return next(new AppError('User not found', 404));
        }
        if (user.isActive === true) {
            return next(new AppError('This user\'s password has been reset. Please use other APIs to change password!', 400));
        }
        const isSamePassword = await bcrypt.compare(password, user.password);
        if (isSamePassword) {
            return next(new AppError('New password cannot be the same as the old password!', 400));
        }

        user.password = password;
        user.isActive = true;
        await user.save();

        res.status(200).json({
            code: 200,
            success: true,
            message: 'Password has been reset successfully.',
            result: null
        });
    } catch (error) {
        return next(new AppError(`Error in resetPassword: ${error.message}`, 500));
    }
};

const getProfile = async (req, res, next) => {
    try {
        // Find the user by their ID
        const user = await User.findById(req.user.id).select('-password');

        if (!user) {
            return next(new AppError('User not found', 404));
        }

        // Response with user profile information
        res.status(200).json({
            code: 200,
            success: true,
            message: 'Get profile successfully',
            result: user
        });
    } catch (error) {
        return next(new AppError(`Error while getting profile: ${error.message}`, 500));
    }
};

const changePassword = async (req, res, next) => {
    try {
        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) {
            return next(new AppError('Old password and New password are required!'), 400);
        }
        const user = await User.findById(req.user.id);
        if (!user) {
            return next(new AppError('User not found!', 404));
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return next(new AppError('Old password is incorrect!', 401));
        }

        user.password = newPassword;
        await user.save();

        res.status(200).json({
            code: 200,
            success: true,
            message: 'Password changed successfully!',
            result: user
        });

    } catch (error) {
        return next(new AppError(`Error while changing the password: ${error.message}`, 500));
    }
};

const uploadImage = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return next(new AppError('User not found', 404))
        }
        if (!req.file) {
            return next(new AppError('No file uploaded', 400))
        }

        // Custom filename with userID and timestamp
        const filename = `${user._id}-${Date.now()}`;

        // Upload image to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
            public_id: `employee_avatar/${filename}`,
            folder: 'POS',
            use_filename: true,
            unique_filename: false,
            overwrite: true,
        });

        // Remove the file from local after upload
        fs.unlinkSync(req.file.path);

        // Update user's avatar field
        user.avatar = result.secure_url;
        await user.save();
        await client.del(`employee_profile_${user._id}`)
        // Response
        res.status(200).json({
            code: 200,
            success: true,
            message: 'Profile picture updated successfully',
            result: {
                avatar: user.avatar
            }
        });
    } catch (error) {
        return next(new AppError(`Error while uploading the image: ${error.message}`, 500));
    }
};

module.exports = { resetPassword, getProfile, uploadImage, changePassword };