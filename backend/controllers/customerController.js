const Customer = require('../models/customerModel');
const AppError = require('../utils/AppError');
const { Order } = require('../models/orderModel');
const client = require('../config/redisClient');

const getAllCustomers = async (req, res, next) => {
    try {
        const customers = await Customer.find();
        if (customers.length === 0) {
            return next(new AppError('No customers found', 404));
        }
        res.status(200).json({
            code: 200,
            success: true,
            message: 'Get all customers successfully',
            result: customers
        })
    } catch (error) {
        return next(new AppError(`Error while getting all customers: ${error.message}`, 500));
    }
}

const getCustomersByPhoneNumber = async (req, res, next) => {
    try {
        const { phoneNumber } = req.params;
        if (!phoneNumber) {
            return next(new AppError('Phone number is required', 400));
        }
        const customers = await Customer.find({ phoneNumber });
        if (customers.length === 0) {
            return next(new AppError('No customers found', 404));
        }
        res.status(200).json({
            code: 200,
            success: true,
            message: 'Get customers successfully',
            result: customers
        });
    } catch (error) {
        return next(new AppError(`Error while getting customers: ${error.message}`, 500));
    }
}

const createCustomer = async (req, res, next) => {
    try {
        const { customerName, phoneNumber, address, email } = req.body;
        const existingCustomer = await Customer.findOne({ phoneNumber });
        if (existingCustomer) {
            return next(new AppError('Phone number already exists', 400));
        }
        const customer = await Customer.create({ customerName, phoneNumber, address, email });
        client.del('customers_list');
        res.status(201).json({
            code: 201,
            success: true,
            message: 'Customer created successfully',
            result: customer
        })
    } catch (error) {
        return next(new AppError(`Error while creating customer: ${error.message}`, 500));
    }
}

const updateCustomer = async (req, res, next) => {
    try {
        const { customerId } = req.params;
        const { customerName, phoneNumber, address, email } = req.body;
        if (!customerName || !address || !phoneNumber) {
            return next(new AppError('Customer name, address and phone number are required', 400));
        }

        const existingCustomer = await Customer.findById(customerId);
        if (!existingCustomer) {
            return next(new AppError('Customer not found', 404));
        }

        const phoneNumberExists = await Customer.findOne({ phoneNumber });
        if (phoneNumberExists && phoneNumberExists._id.toString() !== customerId) {
            return next(new AppError('Phone number already exists', 400));
        }
        client.del(`customer_${existingCustomer.phoneNumber}`);
        client.del(`customer_orders_${existingCustomer.phoneNumber}`);

        const customer = await Customer.findByIdAndUpdate(customerId, { customerName, phoneNumber, address, email }, { new: true });

        client.del('customers_list');


        res.status(200).json({
            code: 200,
            success: true,
            message: 'Customer updated successfully',
            result: customer
        });
    } catch (error) {
        return next(new AppError(`Error while updating customer: ${error.message}`, 500));
    }
}

const deleteCustomer = async (req, res, next) => {
    try {
        const { customerId } = req.params;
        const customer = await Customer.findById(customerId);
        if (!customer) {
            return next(new AppError('Customer not found', 404));
        }
        await customer.deleteOne();
        client.del('customers_list');
        client.del(`customer_${customer.phoneNumber}`);
        client.del(`customer_orders_${customer.phoneNumber}`);
        res.status(200).json({
            code: 200,
            success: true,
            message: 'Customer deleted successfully',
            result: customer
        })
    } catch (error) {
        return next(new AppError(`Error while deleting customer: ${error.message}`, 500));
    }
}

const getOrderHistoryByPhoneNumber = async (req, res, next) => {
    try {
        const { phoneNumber } = req.params;
        if (!phoneNumber) {
            return next(new AppError('Phone number is required!', 400));
        }
        const customer = await Customer.findOne({ phoneNumber });
        if (!customer) {
            return next(new AppError('Customer not found', 404));
        }

        const orders = await Order.find({ customerId: customer._id }).sort({ orderDate: -1 });
        if (orders.length === 0) {
            return next(new AppError('No orders found for this customer', 404));
        }

        res.status(200).json({
            code: 200,
            success: true,
            message: 'Get order history successfully',
            result: {
                customer,
                orders
            }
        });
    } catch (error) {
        return next(new AppError(`Error while getting order history: ${error.message}`, 500));
    }
}

module.exports = {
    getAllCustomers,
    getCustomersByPhoneNumber,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    getOrderHistoryByPhoneNumber
}

