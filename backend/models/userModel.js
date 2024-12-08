const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const moment = require('moment');

const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mobile: { type: String },
    username: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'employee'], default: 'employee' },
    isLocked: { type: Boolean, default: false },
    isActive: { type: Boolean, default: false },
    avatar: { type: String },
    loginToken: { type: String },
    tokenExpires: { type: Date },
}, { timestamps: true });


userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.set('toJSON', {
    transform: function (doc, ret) {
        const formatted = {
            userId: ret._id,
            fullName: ret.fullName,
            email: ret.email,
            mobile: ret.mobile,
            username: ret.username,
            role: ret.role,
            isLocked: ret.isLocked,
            isActive: ret.isActive,
            avatar: ret.avatar,
            createdAt: moment(ret.createdAt).format('DD/MM/YYYY HH:mm:ss'),
            updatedAt: moment(ret.updatedAt).format('DD/MM/YYYY HH:mm:ss'),

        };

        delete ret._id;
        delete ret.__v;
        delete ret.password;

        return formatted;
    }
});

const User = mongoose.model('User', userSchema);
module.exports = User;
