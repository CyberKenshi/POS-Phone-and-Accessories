const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    productItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductItem', required: true },
});

orderItemSchema.set('toJSON', {
    transform: function (doc, ret) {
        const formatted = {
            orderItemId: ret._id,
            orderId: ret.orderId,
            productId: ret.productId,
            productItemId: ret.productItemId,
            createdAt: moment(ret.createdAt).format('DD/MM/YYYY HH:mm:ss'),
            updatedAt: moment(ret.updatedAt).format('DD/MM/YYYY HH:mm:ss'),
        }

        delete ret._id;
        delete ret.__v;
        return formatted;
    }
});

const OrderItem = mongoose.model('OrderItem', orderItemSchema);
module.exports = OrderItem;

