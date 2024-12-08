const mongoose = require('mongoose');
const moment = require('moment');

const OrderStatus = {
    PENDING: 'PENDING',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED'
};

const orderSchema = new mongoose.Schema({
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amountReceived: { type: Number, required: true },
    changeGiven: { type: Number, required: true },
    orderDate: { type: Date, default: Date.now },
    total: { type: Number, required: true },
    status: { type: String, enum: Object.values(OrderStatus), default: OrderStatus.PENDING, required: true },
    invoiceUrl: { type: String, default: '' },
}, { timestamps: true });

orderSchema.set('toJSON', {
    transform: function (doc, ret) {
        const formatted = {
            orderId: ret._id,
            customerId: ret.customerId,
            employeeId: ret.employeeId,
            amountReceived: ret.amountReceived,
            changeGiven: ret.changeGiven,
            orderDate: moment(ret.orderDate).format('DD/MM/YYYY HH:mm:ss'),
            total: ret.total,
            status: ret.status,
            invoiceUrl: ret.invoiceUrl
        }

        delete ret._id;
        delete ret.__v;
        return formatted;
    }
});

const Order = mongoose.model('Order', orderSchema);
module.exports = { Order, OrderStatus };


