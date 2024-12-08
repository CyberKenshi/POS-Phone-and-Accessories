const mongoose = require('mongoose');
const moment = require('moment');

const customerSchema = new mongoose.Schema({
    customerName: { type: String, required: true },
    phoneNumber: { type: String, required: true, unique: true },
    address: { type: String, default: '' },
    email: { type: String, default: '' },
}, { timestamps: true });

customerSchema.set('toJSON', {
    transform: function (doc, ret) {
        const formatted = {
            customerId: ret._id,
            customerName: ret.customerName,
            phoneNumber: ret.phoneNumber,
            address: ret.address,
            email: ret.email,
            createdAt: moment(ret.createdAt).format('DD/MM/YYYY HH:mm:ss'),
            updatedAt: moment(ret.updatedAt).format('DD/MM/YYYY HH:mm:ss')
        }

        delete ret._id;
        delete ret.__v;
        return formatted;
    }
});

const Customer = mongoose.model('Customer', customerSchema);
module.exports = Customer;

