const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const moment = require('moment');

function formatCurrency(amount) {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ";
}

function createInvoicePDF(order, products, customer) {
    return new Promise((resolve, reject) => {
        const invoicesDir = path.join(__dirname, '../invoices');

        if (!fs.existsSync(invoicesDir)) {
            fs.mkdirSync(invoicesDir, { recursive: true });
        }

        const filePath = path.join(invoicesDir, `invoice_${order._id}.pdf`);
        const doc = new PDFDocument({ size: "A4", margin: 50 });

        generateHeader(doc);
        generateCustomerInformation(doc, order, customer);
        generateInvoiceTable(doc, products, order);
        generateFooter(doc);

        doc.end();
        doc.pipe(fs.createWriteStream(filePath))
            .on('finish', () => resolve(filePath))
            .on('error', reject);
    });
}

function generateHeader(doc) {
    doc
        .image(path.join(__dirname, '../public/images/logo.png'), 50, 45, { width: 50 })
        .fillColor("#444444")
        .fontSize(20)
        .text("POS Phones and Accessories", 110, 57)
        .fontSize(10)
        .text("Ton Duc Thang University", 200, 50, { align: "right" })
        .text("District 7, Ho Chi Minh City", 200, 65, { align: "right" });
}

function generateCustomerInformation(doc, order, customer) {
    doc
        .fillColor("#444444")
        .fontSize(20)
        .text("Invoice", 50, 160);

    generateHr(doc, 185);

    const customerInformationTop = 200;
    const lineHeight = 15;

    doc.fontSize(10)
        .text("Order ID:", 50, customerInformationTop, { align: 'right', width: 90 })
        .text(order._id, 150, customerInformationTop)
        .text("Customer Name:", 50, customerInformationTop + lineHeight, { align: 'right', width: 90 })
        .text(customer.customerName, 150, customerInformationTop + lineHeight)
        .text("Customer's phone:", 50, customerInformationTop + lineHeight * 2, { align: 'right', width: 90 })
        .text(customer.phoneNumber, 150, customerInformationTop + lineHeight * 2)
        .text("Customer's email:", 50, customerInformationTop + lineHeight * 3, { align: 'right', width: 90 })
        .text(customer.email, 150, customerInformationTop + lineHeight * 3)
        .text("Order Date:", 50, customerInformationTop + lineHeight * 4, { align: 'right', width: 90 })
        .text(moment(order.orderDate).format('DD/MM/YYYY HH:mm:ss'), 150, customerInformationTop + lineHeight * 4);

    generateHr(doc, 280);

}

function generateInvoiceTable(doc, products, order) {
    const invoiceTableTop = 330;
    doc.font("Helvetica-Bold");
    generateTableRow(doc, invoiceTableTop, "Product", "Unit Price", "Quantity", "Total");
    generateHr(doc, invoiceTableTop + 20);
    doc.font("Helvetica");

    products.forEach((product, i) => {
        const position = invoiceTableTop + (i + 1) * 30;
        generateTableRow(
            doc,
            position,
            product.productName,
            formatCurrency(product.unitPrice),
            product.quantity,
            formatCurrency(product.totalPrice)
        );
        generateHr(doc, position + 20);
    });

    const totalPosition = invoiceTableTop + (products.length + 1) * 30;
    generateTableRow(doc, totalPosition, "", "", "Total", formatCurrency(order.total));
}

function generateFooter(doc) {
    doc.fontSize(10).text("Thank you for your purchase!", 50, 780, { align: "center", width: 500 });
}

function generateTableRow(doc, y, item, unitCost, quantity, lineTotal) {
    doc.fontSize(10)
        .text(item, 50, y)
        .text(unitCost, 280, y, { width: 90, align: "right" })
        .text(quantity, 370, y, { width: 90, align: "right" })
        .text(lineTotal, 0, y, { align: "right" });
}

function generateHr(doc, y) {
    doc.strokeColor("#aaaaaa").lineWidth(1).moveTo(50, y).lineTo(550, y).stroke();
}

module.exports = createInvoicePDF;
