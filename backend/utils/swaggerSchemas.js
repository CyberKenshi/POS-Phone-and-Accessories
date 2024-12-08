/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: ID của người dùng
 *         fullName:
 *           type: string
 *           description: Tên đầy đủ của người dùng
 *         email:
 *           type: string
 *           description: Email của người dùng
 *           format: email
 *         mobile:
 *           type: string
 *           description: Số điện thoại
 *         username:
 *           type: string
 *           description: Tên đăng nhập
 *         password:
 *           type: string
 *           description: Mật khẩu người dùng
 *           format: password
 *         role:
 *           type: string
 *           enum: [admin, employee]
 *           description: Vai trò của người dùng
 *         isLocked:
 *           type: boolean
 *           description: Tài khoản có bị khóa hay không
 *         avatar:
 *           type: string
 *           description: URL ảnh đại diện của người dùng
 *         loginToken:
 *           type: string
 *           description: Token dùng để đăng nhập qua link
 *         tokenExpires:
 *           type: string
 *           format: date-time
 *           description: Thời điểm hết hạn của token
 *         passwordResetRequired:
 *           type: boolean
 *           description: Người dùng có cần phải đổi mật khẩu không
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Thời điểm tạo người dùng
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Thời điểm cập nhật người dùng gần nhất
 *       required:
 *         - fullName
 *         - email
 *         - username
 *         - password
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Product ID
 *         barcode:
 *           type: string
 *           description: Product barcode
 *         productName:
 *           type: string
 *           description: Product name
 *         importPrice:
 *           type: number
 *           description: Import price of the product
 *         retailPrice:
 *           type: number
 *           description: Retail price of the product
 *         category:
 *           type: string
 *           description: Product category
 *         images:
 *           type: array
 *           description: Array of image URLs
 *           items:
 *             type: string
 *       required:
 *         - productName
 *         - importPrice
 *         - retailPrice
 *         - category
 */
