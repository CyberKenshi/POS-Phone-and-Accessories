const express = require("express");
const dotenv = require("dotenv").config();
const connectDB = require("./config/db");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const customerRoutes = require("./routes/customerRoutes");
const orderRoutes = require("./routes/orderRoutes");
const reportRoutes = require("./routes/reportRoutes");

const cookieParser = require("cookie-parser");

const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

// Kết nối MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

app.use(cookieParser(process.env.COOKIE_SECRET));

// app.use(
//   cors(
//     {
//       origin: [`http://localhost:3000`, `http://localhost:3001`],
//     }
//     // origin: "*",
//   )
// );
app.use(
  cors({
    origin: [`http://localhost:3000`, `http://localhost:3001`],
    credentials: true,
  })
);
// Cấu hình Swagger
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      version: "1.0.0",
      title: "POS API",
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./routes/*.js", "./utils/swaggerSchemas.js"],
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Middleware xác thực
app.use("/api/auth", authRoutes);

// Xử lý các tác vụ của admin
app.use("/api/admin", adminRoutes);

// Xử lý các tác vụ của employee
app.use("/api/employee", employeeRoutes);

// Xử lý các tác vụ của product
app.use("/api/products", productRoutes);

// Xử lý các tác vụ của category (for testing)
app.use("/api/categories", categoryRoutes);

// Xử lý các tác vụ của customer
app.use("/api/customers", customerRoutes);

// Xử lý các tác vụ của order
app.use("/api/orders", orderRoutes);

// Xử lý các tác vụ của repot
app.use("/api/reports/", reportRoutes);

// Middleware xử lý lỗi
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    code: err.statusCode || 500,
    success: false,
    message: err.message || "Internal Server Error",
    result: null,
  });
});

app.listen(PORT, () => {
  console.log(
    `Server running on http://localhost:${PORT};` +
    ` press Ctrl-C to terminate. `
  );
  console.log(
    `APIs documentation running on http://localhost:${PORT}/api-docs`
  );
});
