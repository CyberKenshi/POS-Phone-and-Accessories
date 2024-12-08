import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Định nghĩa styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
    fontFamily: 'Helvetica'
  },
  header: {
    marginBottom: 20,
    textAlign: 'center'
  },
  title: {
    fontSize: 20,
    marginBottom: 10,
    fontFamily: 'Helvetica-Bold'
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 5
  },
  info: {
    marginBottom: 20
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 5
  },
  label: {
    width: 120,
    fontFamily: 'Helvetica-Bold'
  },
  value: {
    flex: 1
  },
  table: {
    display: 'table',
    width: '100%',
    marginBottom: 20
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    borderBottomStyle: 'solid',
    padding: 5
  },
  tableHeader: {
    backgroundColor: '#f0f0f0',
    fontFamily: 'Helvetica-Bold'
  },
  tableCell: {
    flex: 1,
    textAlign: 'left'
  },
  rightAlign: {
    textAlign: 'right'
  },
  summary: {
    marginTop: 20
  },
  footer: {
    marginTop: 30,
    textAlign: 'center',
    fontSize: 10,
    color: '#666'
  }
});

const InvoicePDF = ({ orderData, cartItems, customerPhone, customerName = 'Guest', staffName = 'Admin' }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>SALES INVOICE</Text>
        <Text style={styles.subtitle}>Mobile Phone Store</Text>
        <Text>Address: 123 Mobile Street, Tech City</Text>
        <Text>Phone: (123) 456-7890</Text>
      </View>

      <View style={styles.info}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Invoice No:</Text>
          <Text style={styles.value}>{orderData.orderId}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Date:</Text>
          <Text style={styles.value}>{new Date().toLocaleDateString('en-US')}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Customer Name:</Text>
          <Text style={styles.value}>{customerName}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Customer Phone:</Text>
          <Text style={styles.value}>{customerPhone}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Staff:</Text>
          <Text style={styles.value}>{staffName}</Text>
        </View>
      </View>

      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.tableCell, { flex: 3 }]}>Product</Text>
          <Text style={[styles.tableCell, styles.rightAlign]}>Quantity</Text>
          <Text style={[styles.tableCell, styles.rightAlign]}>Unit Price</Text>
          <Text style={[styles.tableCell, styles.rightAlign]}>Amount</Text>
        </View>

        {cartItems.map((item, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={[styles.tableCell, { flex: 3 }]}>{item.productName}</Text>
            <Text style={[styles.tableCell, styles.rightAlign]}>{item.quantity}</Text>
            <Text style={[styles.tableCell, styles.rightAlign]}>{item.retailPrice.toLocaleString('vi-VN')}</Text>
            <Text style={[styles.tableCell, styles.rightAlign]}>{(item.quantity * item.retailPrice).toLocaleString('vi-VN')}</Text>
          </View>
        ))}
      </View>

      <View style={styles.summary}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Total Amount:</Text>
          <Text style={[styles.value, styles.rightAlign]}>{orderData.total.toLocaleString('vi-VN')}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Received:</Text>
          <Text style={[styles.value, styles.rightAlign]}>{orderData.amountReceived.toLocaleString('vi-VN')}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Change:</Text>
          <Text style={[styles.value, styles.rightAlign]}>{orderData.changeGiven.toLocaleString('vi-VN')}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text>Thank you for your purchase!</Text>
        <Text>Please keep this invoice for warranty purposes.</Text>
      </View>
    </Page>
  </Document>
);

export default InvoicePDF;
