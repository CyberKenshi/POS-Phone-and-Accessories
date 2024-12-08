const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');

const productSchema = new mongoose.Schema({
    productName: { type: String, required: true },
    barcode: { type: String, unique: true, required: true },
    categoryId: { type: String, ref: 'Category', required: true },
    importPrice: { type: Number, required: true },
    retailPrice: { type: Number, required: true },
    manufacturer: { type: String, required: true },
    description: { type: String, default: '' },
    image: { type: [String], default: [] },
    stockQuantity: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

function generateBarcode() {
    return uuidv4().replace(/-/g, '').slice(-15);
}

productSchema.set('toJSON', {
    transform: function (doc, ret) {
        const formatted = {
            productId: ret._id,
            productName: ret.productName,
            barcode: ret.barcode,
            categoryId: ret.categoryId,
            importPrice: ret.importPrice,
            retailPrice: ret.retailPrice,
            manufacturer: ret.manufacturer,
            description: ret.description,
            image: ret.image,
            stockQuantity: ret.stockQuantity,
            isActive: ret.isActive,
            createdAt: moment(ret.createdAt).format('DD/MM/YYYY HH:mm:ss'),
            updatedAt: moment(ret.updatedAt).format('DD/MM/YYYY HH:mm:ss'),
        };

        delete ret._id;
        delete ret.__v;
        return formatted;
    }
});

const Product = mongoose.model('Product', productSchema);
module.exports = { Product, generateBarcode };