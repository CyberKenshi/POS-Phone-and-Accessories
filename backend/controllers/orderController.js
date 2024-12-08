const { Order, OrderStatus } = require('../models/orderModel');
const OrderItem = require('../models/orderItemModel');
const User = require('../models/userModel');
const AppError = require('../utils/AppError');
const { Product } = require('../models/productModel');
const { ProductItem, ProductStatus } = require('../models/productItemModel');
const Customer = require('../models/customerModel');
const createInvoicePDF = require('../utils/createInvoicePDF');
const client = require('../config/redisClient');
const fs = require('fs');
const path = require('path');
const sendEmail = require('../utils/sendEmail');

const getOrders = async (req, res, next) => {
    const { phoneNumber } = req.query;
    try {
        let orders;
        if (!phoneNumber) {
            return next(new AppError('Phone number is required', 400));
        }
        if (phoneNumber) {
            const customer = await Customer.findOne({ phoneNumber });
            //console.log(customer); //Debug

            if (!customer) {
                return next(new AppError('Customer not found', 404));
            }

            orders = await Order.find({ customerId: customer._id });
        }

        if (!phoneNumber) {
            return next(new AppError('Phone number is required', 400));
        }
        if (!orders || orders.length === 0) {
            return next(new AppError('No orders found', 404));
        }

        res.status(200).json({
            code: 200,
            success: true,
            message: 'Get orders successfully',
            result: orders
        });
    } catch (error) {
        return next(new AppError(`Error while getting orders: ${error.message}`, 500));
    }
}

const getOrderDetail = async (req, res, next) => {
    const { orderId } = req.params;
    if (!orderId) {
        return next(new AppError('OrderId is required', 400));
    }
    try {
        const order = await Order.findById(orderId);
        if (!order) {
            return next(new AppError('Order not found', 404));
        }
        const orderItems = await OrderItem.find({ orderId });
        const products = await getProductDetailsFromOrderItems(orderItems);

        res.status(200).json({
            code: 200,
            success: true,
            message: 'Get order detail successfully',
            result: {
                order,
                products
            }
        });
    } catch (error) {
        return next(new AppError(`Error while getting order detail: ${error.message}`, 500));
    }
}

const createOrder = async (req, res, next) => {
    try {
        const { phoneNumber } = req.body;
        const employeeId = req.user.id;

        if (!phoneNumber || !employeeId) {
            return next(new AppError('Phone number and Employee ID are required', 400));
        }
        const customer = await Customer.findOne({ phoneNumber });
        if (!customer) {
            return next(new AppError('Customer not found', 404));
        }
        const employee = await User.findById(employeeId);
        if (!employee) {
            return next(new AppError('Employee not found', 404));
        }

        const newOrder = await Order.create({
            customerId: customer._id,
            employeeId: employeeId,
            amountReceived: 0,
            changeGiven: 0,
            total: 0,
            status: OrderStatus.PENDING,
            invoiceUrl: '',
        });


        // Xóa cache
        client.del(`${employeeId}_timeline:today`);
        client.del(`${employeeId}_timeline:last7days`);
        client.del(`${employeeId}_timeline:thisMonth`);

        client.del(`product_report:${employeeId}:timeline:today`);
        client.del(`product_report:${employeeId}:timeline:last7days`);
        client.del(`product_report:${employeeId}:timeline:thisMonth`);

        client.del(`orders_phoneNumber_${customer.phoneNumber}`);
        client.del(`order_${newOrder._id}`);

        res.status(201).json({
            code: 201,
            success: true,
            message: 'Order created successfully',
            result: newOrder
        });
    } catch (error) {
        return next(new AppError(`Error while creating order: ${error.message}`, 500));
    }
}

const addProductToOrder = async (req, res, next) => {
    const { productName, barcode, quantity } = req.body;
    const { orderId } = req.params;

    try {
        // Tìm đơn hàng
        const order = await Order.findById(orderId);
        if (!order) {
            return next(new AppError('Order not found', 404));
        }
        const customer = await Customer.findById(order.customerId);

        // Tìm sản phẩm theo productName, barcode hoặc cả hai
        const query = {};
        if (productName) {
            query.productName = new RegExp(productName, 'i');
        }
        if (barcode) {
            query.barcode = barcode;
        }

        const product = await Product.findOne(query);

        if (!product) {
            return next(new AppError('Product not found', 404));
        }
        if (quantity <= 0) {
            return next(new AppError('Quantity must be greater than 0', 400));
        }
        if (product.stockQuantity <= 0) {
            return next(new AppError('Product is out of stock', 400));
        }
        if (quantity > product.stockQuantity) {
            return next(new AppError(`Product have only ${product.stockQuantity} items`, 400));
        }
        if (product.isActive === false) {
            return next(new AppError('Product is not active', 400));
        }

        // Thêm sản phẩm vào đơn hàng
        const availableItems = await ProductItem.find({
            productId: product._id,
            status: ProductStatus.IN_STOCK
        }).limit(quantity);
        if (availableItems.length < quantity) {
            return next(new AppError(`Only ${availableItems.length} items available`, 400));
        }

        let total = 0;
        for (const item of availableItems) {
            await OrderItem.create({
                orderId,
                productId: product._id,
                productItemId: item._id,
            });
            item.status = ProductStatus.SOLD;
            product.stockQuantity -= 1;
            await item.save();
            await product.save();
            total += product.retailPrice;
        }
        order.total += total;
        await order.save();

        // Lấy lại thông tin sản phẩm sau khi thêm
        const orderItems = await OrderItem.find({ orderId });
        const products = await getProductDetailsFromOrderItems(orderItems);

        client.del(`orders_phoneNumber_${customer.phoneNumber}`);
        client.del(`order_${order._id}`);

        res.status(200).json({
            code: 200,
            success: true,
            message: 'Product added to order successfully',
            result: {
                order,
                products
            }
        });
    } catch (error) {
        return next(new AppError(`Error while adding product to order: ${error.message}`, 500));
    }
}

const removeProductFromOrder = async (req, res, next) => {
    const { productName, barcode, quantity } = req.body;
    const { orderId } = req.params;

    try {
        // Tìm đơn hàng
        const order = await Order.findById(orderId);
        if (!order) {
            return next(new AppError('Order not found', 404));
        }
        const customer = await Customer.findById(order.customerId);
        if (quantity <= 0) {
            return next(new AppError('Quantity must be greater than 0', 400));
        }
        // Tìm sản phẩm theo productName, barcode hoặc cả hai
        const query = {};
        if (productName) {
            query.productName = new RegExp(productName, 'i');
        }
        if (barcode) {
            query.barcode = barcode;
        }

        const product = await Product.findOne(query);

        if (!product) {
            return next(new AppError('Product not found', 404));
        }

        // Tìm các OrderItem cần xóa
        const orderItems = await OrderItem.find({
            orderId,
            productId: product._id,
        }).limit(quantity);

        if (orderItems.length == 0) {
            return next(new AppError('Product not found in order', 404));
        }
        if (orderItems.length < quantity) {
            return next(new AppError(`Only ${orderItems.length} items available to remove`, 400));
        }

        let totalReduction = 0;
        for (const orderItem of orderItems) {
            const productItem = await ProductItem.findById(orderItem.productItemId);
            if (productItem) {
                productItem.status = ProductStatus.IN_STOCK;
                product.stockQuantity += 1;
                await productItem.save();
                await product.save();
            }

            totalReduction += product.retailPrice;

            await orderItem.deleteOne();
        }

        order.total -= totalReduction;
        await order.save();

        const updatedOrderItems = await OrderItem.find({ orderId });
        const products = await getProductDetailsFromOrderItems(updatedOrderItems);

        client.del(`orders_phoneNumber_${customer.phoneNumber}`);
        client.del(`order_${order._id}`);

        res.status(200).json({
            code: 200,
            success: true,
            message: 'Product removed from order successfully',
            result: {
                order,
                products
            }
        });
    } catch (error) {
        return next(new AppError(`Error while removing product from order: ${error.message}`, 500));
    }
}

const deleteOrder = async (req, res, next) => {
    const { orderId } = req.params;
    try {
        const order = await Order.findById(orderId);
        if (!order) {
            return next(new AppError('Order not found', 404));
        }
        const customer = await Customer.findById(order.customerId);
        await order.deleteOne();
        client.del(`orders_phoneNumber_${customer.phoneNumber}`);
        client.del(`order_${order._id}`);
        res.status(200).json({
            code: 200,
            success: true,
            message: 'Order deleted successfully',
            result: order
        });
    } catch (error) {
        return next(new AppError(`Error while deleting order: ${error.message}`, 500));
    }
}

const updateOrder = async (req, res, next) => {
    const { orderId } = req.params;
    const { amountReceived, email, address } = req.body;

    try {
        const order = await Order.findById(orderId);
        if (!order) {
            return next(new AppError('Order not found', 404));
        }
        const customer = await Customer.findById(order.customerId);
        if (!customer) {
            return next(new AppError('Customer not found', 404));
        }
        if (amountReceived !== undefined) {
            order.amountReceived = amountReceived;
            if (amountReceived < order.total) {
                return next(new AppError('Amount received is less than the total amount', 400));
            }
            order.changeGiven = amountReceived - order.total;
        }
        if (email) {
            existingCustomer = await Customer.findOne({ email });
            if (existingCustomer) {
                return next(new AppError('Email exist! Please insert other email', 400));
            }
            customer.email = email;
        }
        if (address) {
            customer.address = address;
        }
        await customer.save();
        await order.save();

        client.del(`orders_phoneNumber_${customer.phoneNumber}`);
        client.del(`order_${order._id}`);
        client.del('customers_list');
        client.del(`customer_${customer.phoneNumber}`);
        res.status(200).json({
            code: 200,
            success: true,
            message: 'Order updated successfully',
            result: order
        });
    } catch (error) {
        return next(new AppError(`Error while updating order: ${error.message}`, 500));
    }
}

const getProductDetailsFromOrderItems = async (orderItems) => {
    const productDetails = {};

    for (const item of orderItems) {
        const product = await Product.findById(item.productId);
        if (product) {
            if (!productDetails[product._id]) {
                productDetails[product._id] = {
                    productId: product._id,
                    productName: product.productName,
                    barcode: product.barcode,
                    quantity: 0,
                    unitPrice: product.retailPrice,
                    totalPrice: 0
                };
            }
            productDetails[product._id].quantity += 1;
            productDetails[product._id].totalPrice += product.retailPrice;
        }
    }

    return Object.values(productDetails);
};

const checkoutOrder = async (req, res, next) => {
    const { orderId } = req.params;
    const { amountReceived } = req.body;

    try {
        const order = await Order.findById(orderId);
        if (!order) {
            return next(new AppError('Order not found', 404));
        }

        if (!order.customerId || !order.employeeId || order.total <= 0) {
            return next(new AppError('Order is not ready for checkout', 400));
        }

        const orderItems = await OrderItem.find({ orderId });
        const products = await getProductDetailsFromOrderItems(orderItems);
        const customer = await Customer.findById(order.customerId);

        // Tạo file PDF và chờ cho đến khi hoàn tất
        const invoiceUrl = await createInvoicePDF(order, products, customer);

        order.status = OrderStatus.COMPLETED;
        order.invoiceUrl = invoiceUrl;
        if (!amountReceived && !order.amountReceived) {
            return next(new AppError('Amount received is required', 400));
        }
        order.amountReceived = amountReceived;
        if (amountReceived < order.total) {
            return next(new AppError('Amount received is less than the total amount', 400));
        }
        order.changeGiven = amountReceived - order.total;
        await order.save();

        const pdfPath = path.resolve(invoiceUrl);

        // Cấu trúc dữ liệu email với file đính kèm
        const emailData = {
            to: customer.email,
            subject: 'Your Invoice from POS',
            text: 'Thank you for your shopping! This is your invoice.',
            htmlContent: `<p>Thank you for your shopping! This is your invoice.</p>`,
            attachmentPath: pdfPath
        };

        // Gọi hàm sendEmail để gửi email với file đính kèm
        await sendEmail(emailData.to, emailData.subject, emailData.text, emailData.htmlContent, emailData.attachmentPath);

        client.del(`orders_phoneNumber_${customer.phoneNumber}`);
        client.del(`customer_orders_${customer.phoneNumber}`);
        client.del(`order_${order._id}`);
        res.status(200).json({
            code: 200,
            success: true,
            message: 'Order checked out successfully',
            result: order
        });
    } catch (error) {
        console.error(error);
        return next(new AppError(`Error while checking out order: ${error.message}`, 500));
    }
}

module.exports = {
    createOrder,
    getOrderDetail,
    getOrders,
    addProductToOrder,
    removeProductFromOrder,
    deleteOrder,
    updateOrder,
    checkoutOrder
};
