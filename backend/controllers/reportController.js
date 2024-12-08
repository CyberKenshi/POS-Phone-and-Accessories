const { Order } = require('../models/orderModel');
const OrderItem = require('../models/orderItemModel');
const { Product } = require('../models/productModel');
const User = require('../models/userModel');
const moment = require('moment');
const AppError = require('../utils/AppError');

async function getSalesReport(req, res, next) {
    const { startDate, endDate } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
        return next(new AppError('User not found!', 404));
    }

    const today = moment().startOf('day');
    const yesterday = moment().subtract(1, 'days').startOf('day');
    const last7Days = moment().subtract(7, 'days').startOf('day');
    const thisMonth = moment().startOf('month');

    let filter = {};
    let timeline = '';

    if (startDate && endDate) {
        filter.orderDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
        timeline = `From ${startDate} to ${endDate}`;
    } else if (req.query.timeline === 'today') {
        filter.orderDate = { $gte: today.toDate() };
        timeline = 'Today';
    } else if (req.query.timeline === 'yesterday') {
        filter.orderDate = { $gte: yesterday.toDate(), $lt: today.toDate() };
        timeline = 'Yesterday';
    } else if (req.query.timeline === 'last7days') {
        filter.orderDate = { $gte: last7Days.toDate() };
        timeline = 'Last 7 Days';
    } else if (req.query.timeline === 'thisMonth') {
        filter.orderDate = { $gte: thisMonth.toDate() };
        timeline = 'This Month';
    }

    try {
        const orders = await Order.find(filter).sort({ orderDate: 1 });

        if (orders.length === 0) {
            return res.status(200).json({
                code: 200,
                success: true,
                message: 'No orders found',
                result: {
                    timeline,
                    totalAmountReceived: 0,
                    totalOrders: 0,
                    totalProducts: 0,
                    orders: []
                }
            });
        }

        const orderItems = await OrderItem.find({ orderId: { $in: orders.map(order => order._id) } });
        const productIds = orderItems.map(item => item.productId);
        const products = await Product.find({ _id: { $in: productIds } });

        const totalAmountReceived = orders.reduce((sum, order) => sum + order.amountReceived, 0);
        const totalIncome = orders.reduce((sum, order) => sum + order.total, 0);
        const totalOrders = orders.length;
        const totalProducts = orderItems.length;
        let result = {
            timeline,
            totalAmountReceived,
            totalIncome,
            totalOrders,
            totalProducts,
            orders
        };

        if (user.role !== 'admin') {
            res.status(200).json({
                code: 200,
                success: true,
                message: 'Get reports successfully',
                result: result
            });
        } else {
            let totalProfit;
            totalProfit = orders.reduce((profitSum, order) => {
                const itemsInOrder = orderItems.filter(item => item.orderId.equals(order._id));
                const totalCost = itemsInOrder.reduce((costSum, item) => {
                    const product = products.find(prod => prod._id.equals(item.productId));
                    return costSum + (product ? product.importPrice : 0);
                }, 0);
                return profitSum + (order.amountReceived - totalCost);
            }, 0);
            result = {
                timeline,
                totalAmountReceived,
                totalIncome,
                totalProfit: totalProfit,
                totalOrders,
                totalProducts,
                orders,
            };
            res.status(200).json({
                code: 200,
                success: true,
                message: 'Get reports successfully',
                result: result
            });
        }
    } catch (error) {
        return next(new AppError(`Error while getting report list: ${error.message}`, 500));
    }
}

async function getProductReport(req, res, next) {
    const { startDate, endDate } = req.body;

    const today = moment().startOf('day');
    const yesterday = moment().subtract(1, 'days').startOf('day');
    const last7Days = moment().subtract(7, 'days').startOf('day');
    const thisMonth = moment().startOf('month');

    let filter = {};
    let timeline = '';

    if (startDate && endDate) {
        filter.orderDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
        timeline = `From ${startDate} to ${endDate}`;
    } else if (req.query.timeline === 'today') {
        filter.orderDate = { $gte: today.toDate() };
        timeline = 'Today';
    } else if (req.query.timeline === 'yesterday') {
        filter.orderDate = { $gte: yesterday.toDate(), $lt: today.toDate() };
        timeline = 'Yesterday';
    } else if (req.query.timeline === 'last7days') {
        filter.orderDate = { $gte: last7Days.toDate() };
        timeline = 'Last 7 Days';
    } else if (req.query.timeline === 'thisMonth') {
        filter.orderDate = { $gte: thisMonth.toDate() };
        timeline = 'This Month';
    }

    try {
        const orders = await Order.find(filter).sort({ orderDate: 1 });

        if (orders.length === 0) {
            return res.status(200).json({
                code: 200,
                success: true,
                message: 'No orders found',
                result: {
                    timeline,
                    products: []
                }
            });
        }

        const orderItems = await OrderItem.find({ orderId: { $in: orders.map(order => order._id) } });

        const productSales = {};

        orderItems.forEach(item => {
            if (productSales[item.productId]) {
                productSales[item.productId] += 1;
            } else {
                productSales[item.productId] = 1;
            }
        });

        const productIds = Object.keys(productSales);
        const products = await Product.find({ _id: { $in: productIds } });

        const result = products.map(product => ({
            productId: product._id,
            productName: product.productName,
            barcode: product.barcode,
            totalSold: productSales[product._id] || 0,
            stockQuantity: product.stockQuantity,
            isActive: product.isActive
        }));

        res.status(200).json({
            code: 200,
            success: true,
            message: 'Get products report successfully',
            result: {
                timeline,
                products: result
            }
        });
    } catch (error) {
        return next(new AppError(`Error while getting product report: ${error.message}`, 500));
    }
}
module.exports = { getSalesReport, getProductReport };
