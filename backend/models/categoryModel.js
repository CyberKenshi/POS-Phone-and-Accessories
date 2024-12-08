const mongoose = require('mongoose');
const moment = require('moment');

const counterSchema = new mongoose.Schema({
    _id: { type: String },
    seq: { type: Number }
});
const Counter = mongoose.model('Counter', counterSchema);

const categorySchema = new mongoose.Schema({
    categoryId: {
        type: String,
        unique: true
    },
    categoryName: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    }
}, { timestamps: true });

categorySchema.pre('save', async function (next) {
    try {
        if (!this.categoryId) {
            const counter = await Counter.findByIdAndUpdate(
                'categoryId',
                { $inc: { seq: 1 } },
                { upsert: true, new: true }
            );
            this.categoryId = `${this.categoryName.toLowerCase().replace(/\s+/g, '')}-${counter.seq}`;
        }
        next();
    } catch (error) {
        next(error);
    }
});

categorySchema.set('toJSON', {
    transform: function (doc, ret) {
        const formatted = {
            categoryId: ret.categoryId,
            categoryName: ret.categoryName,
            description: ret.description,
            createdAt: moment(ret.createdAt).format('DD/MM/YYYY HH:mm:ss'),
            updatedAt: moment(ret.updatedAt).format('DD/MM/YYYY HH:mm:ss')
        };
        delete ret._id;
        delete ret.__v;
        return formatted;
    }
});

const Category = mongoose.model('Category', categorySchema);
module.exports = { Category, Counter }; 