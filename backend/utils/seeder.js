const { faker } = require('@faker-js/faker');
const User = require('../models/userModel');
const { Product, generateBarcode } = require('../models/productModel');
const { Category, Counter } = require('../models/categoryModel');
const { Order } = require('../models/orderModel');
const OrderItem = require('../models/orderItemModel');
const { ProductItem, ProductStatus } = require('../models/productItemModel');
const Customer = require('../models/customerModel');
const dotenv = require('dotenv').config();
const connectDB = require('../config/db');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { parse } = require('csv-parse');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const createAdminAccount = async () => {
    try {
        const adminExists = await User.findOne({ username: 'admin' });

        if (adminExists) {
            console.log('Admin account already exists.');
            return;
        }

        const adminUser = new User({
            fullName: 'Admin',
            username: 'admin',
            email: 'admin@gmail.com',
            mobile: '',
            password: 'admin',
            passwordResetRequired: false,
            role: 'admin',
            avatar: 'https://avatars.githubusercontent.com/u/4191182',
            isActive: true,
        });

        await adminUser.save();
        console.log('Admin account created successfully.');
    } catch (error) {
        console.error('Error creating admin account: ', error);
    }
};

async function seedDB() {
    try {
        // Kết nối MongoDB
        await connectDB();

        // Làm sạch các bảng
        await User.deleteMany({});
        await Product.deleteMany({});
        await Category.deleteMany({});
        await Product.deleteMany({});
        await ProductItem.deleteMany({});
        await Customer.deleteMany({});
        await Order.deleteMany({});
        await OrderItem.deleteMany({});
        // Tạo tài khoản admin
        await createAdminAccount();

        // SEED DATABASE

        // Seed data user
        const userData = [];
        const salt = await bcrypt.genSalt(10);
        const password = await bcrypt.hash("password", salt);
        for (let i = 0; i < 15; i++) {
            const email = faker.internet.email();
            userData.push({
                fullName: faker.person.fullName(),
                email: email,
                mobile: faker.phone.number(),
                username: email.split('@')[0],
                password: password,
                role: faker.helpers.arrayElement(['employee']),
                avatar: faker.image.avatar(),
                isActive: true,
                isLocked: faker.datatype.boolean(),
                loginToken: undefined,
                tokenExpires: undefined,
                passwordResetRequired: false,
            });
        }
        const users = await User.insertMany(userData);
        console.log("Users created successfully");

        // Tạo counter collection
        await Counter.findByIdAndUpdate(
            'categoryId',
            { $set: { seq: 0 } },
            { upsert: true }
        );

        // Seed categories
        const categoryData = [
            {
                categoryName: "Smartphone",
                description: "Các loại điện thoại thông minh"
            },
            {
                categoryName: "Watch",
                description: "Đồng hồ thông minh các loại"
            },
            {
                categoryName: "Tablet",
                description: "Máy tính bảng các loại"
            }
        ];

        // Lưu categories và map theo categoryId ( để dùng cho việc tạo product )
        const categoryMap = new Map();
        for (const category of categoryData) {
            const savedCategory = await Category.create(category);
            categoryMap.set(savedCategory.categoryName.toLowerCase(), savedCategory.categoryId);
        }
        console.log("Categories created successfully");

        // Đọc file CSV
        const products = [];
        const parser = fs
            .createReadStream(
                path.join(__dirname, './data/devices.csv')
            )
            .pipe(parse({
                delimiter: ',',
                columns: ['productName', 'manufacturer', 'description', 'image',
                    'importPrice', 'retailPrice', 'stockQuantity', 'isActive', 'category'],
                trim: true,
                skip_empty_lines: true,
                from_line: 2
            }));

        for await (const row of parser) {
            //console.log('Row data:', row); 

            const categoryType = row.category.toLowerCase();
            //console.log('Category type:', categoryType);

            const categoryId = categoryMap.get(categoryType);
            //console.log('Category map:', Array.from(categoryMap.entries()));

            if (!categoryId) {
                console.warn(`Category not found for product: ${row.productName}`);
                continue;
            }

            // Tạo product 
            const product = await Product.create({
                productName: row.productName,
                barcode: generateBarcode(),
                categoryId: categoryId,
                importPrice: Number(row.importPrice),
                retailPrice: Number(row.retailPrice),
                manufacturer: row.manufacturer,
                description: row.description,
                image: [row.image],
                stockQuantity: Number(row.stockQuantity),
                isActive: row.isActive === 'true'
            });

            products.push(product);

            const productItems = Array(Number(row.stockQuantity)).fill().map(() => ({
                productId: product._id,
                serialNumber: row.manufacturer.slice(0, 3).toUpperCase() + uuidv4().replace(/-/g, '').slice(-9),
                status: 'IN_STOCK'
            }));

            await ProductItem.insertMany(productItems);
        }

        console.log("Products and ProductItems created successfully");

        // Seed data customer
        const customerData = [];
        for (let i = 0; i < 20; i++) {
            customerData.push({
                customerName: faker.person.fullName(),
                phoneNumber: faker.phone.number(),
                address: faker.location.streetAddress(),
                email: faker.internet.email(),
            })
        }
        const customers = await Customer.insertMany(customerData);

        console.log("Customers created successfully");

        // Seed data Orders 
        const orderData = [];
        for (let i = 0; i < 500; i++) {
            const customer = faker.helpers.arrayElement(customers);
            const employee = faker.helpers.arrayElement(users);

            const orderDate = faker.date.between({
                from: new Date('2022-01-01'),
                to: new Date('2024-09-11')
            });
            const totalItems = faker.number.int({ min: 1, max: 5 }); // Random number of items in the order
            let totalAmount = 0;

            const orderItems = [];

            for (let j = 0; j < totalItems; j++) {
                const product = faker.helpers.arrayElement(products);
                const quantity = faker.number.int({ min: 1, max: 3 });
                const priceAtPurchase = product.retailPrice * quantity;
                totalAmount += priceAtPurchase;

                // Kiểm tra số lượng sản phẩm trong kho
                if (product.stockQuantity < quantity) {
                    continue;
                }

                const productItems = await ProductItem.find({ productId: product._id, status: { $ne: ProductStatus.SOLD } }).limit(quantity);
                // Bỏ qua nếu không đủ ProductItems
                if (productItems.length < quantity) {
                    continue;
                }

                for (const productItem of productItems) {
                    const orderItem = new OrderItem({
                        orderId: undefined,
                        productId: product._id,
                        productItemId: productItem._id,
                        quantity: quantity,
                        price_at_purchase: priceAtPurchase,
                    });
                    productItem.status = ProductStatus.SOLD;
                    await productItem.save();
                    orderItems.push(orderItem);
                }

                product.stockQuantity -= quantity;
                await product.save();
            }

            // Tính tiền
            const amountReceived = totalAmount + faker.number.int({ min: 0, max: 100 });
            const changeGiven = amountReceived - totalAmount;

            const order = new Order({
                customerId: customer._id,
                employeeId: employee._id,
                total: totalAmount,
                amountReceived: amountReceived,
                changeGiven: changeGiven,
                orderDate: orderDate,
                status: faker.helpers.arrayElement(['COMPLETED']),
            });
            await order.save();

            for (const item of orderItems) {
                item.orderId = order._id;
            }
            await OrderItem.insertMany(orderItems);

        }

        console.log("Database seeded :)");

        // Đóng kết nối
        await mongoose.connection.close();
    } catch (err) {
        console.error("Error seeding database:", err);
    }
}

seedDB();
