const mongoose = require('mongoose');
const moment = require('moment');

const ProductStatus = {
    IN_STOCK: 'IN_STOCK',           // Còn trong kho
    SOLD: 'SOLD',                   // Đã bán
    WARRANTY: 'WARRANTY',           // Đang bảo hành
    RETURNED: 'RETURNED',           // Đã trả lại
    PROCESSING: 'PROCESSING',       // Đang xử lý
};

const productItemSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    serialNumber: { type: String, unique: true },
    status: { type: String, enum: Object.values(ProductStatus), default: ProductStatus.IN_STOCK, required: true }
}, { timestamps: true });



productItemSchema.set('toJSON', {
    transform: function (doc, ret) {
        const formatted = {
            productItemId: ret._id,
            productId: ret.productId,
            serialNumber: ret.serialNumber,
            status: ret.status,
            createdAt: moment(ret.createdAt).format('DD/MM/YYYY HH:mm:ss'),
            updatedAt: moment(ret.updatedAt).format('DD/MM/YYYY HH:mm:ss'),
        }
        delete ret._id;
        delete ret.__v;
        return formatted;
    }
});

const ProductItem = mongoose.model('ProductItem', productItemSchema);
module.exports = { ProductItem, ProductStatus };
