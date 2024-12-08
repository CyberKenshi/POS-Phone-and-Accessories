const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Database connected.");
    // const collection = mongoose.connection.collection("productitems");
    // collection.dropIndex("barcode_1", (err, result) => {
    //   if (err) {
    //     console.error("Lỗi khi xóa chỉ mục:", err);
    //   } else {
    //     console.log("Xóa chỉ mục thành công:", result);
    //   }
    // });
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
