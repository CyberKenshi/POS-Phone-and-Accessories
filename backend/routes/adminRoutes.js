const express = require("express");
const {
  createEmployee,
  getEmployees,
  toggleEmployeeLock,
  resendLoginEmail,
  getProfile
} = require("../controllers/adminController");
const {
  protect,
  checkPasswordReset,
} = require("../middlewares/authMiddleware"); // Middleware bảo vệ
const { isAdmin } = require("../middlewares/roleMiddleware"); // Middleware kiểm tra vai trò
const cacheMiddleware = require('../middlewares/cacheMiddleware');


const router = express.Router();

// Key generator functions for caching
const employeesKeyGenerator = (req) => 'employees_list';
const profileKeyGenerator = (req) => `employee_profile_${req.params.employeeId}`;

router.post('/create-employee', protect, isAdmin, createEmployee);
router.get('/employees', protect, isAdmin, cacheMiddleware(employeesKeyGenerator), getEmployees);
router.patch('/employees/:id/lock', protect, isAdmin, toggleEmployeeLock);
router.post('/employees/:email/resend-login-email', protect, isAdmin, resendLoginEmail);
router.get('/profile/:employeeId', protect, isAdmin, cacheMiddleware(profileKeyGenerator), getProfile);
/**
 * @swagger
 * /api/admin/create-employee:
 *   post:
 *     summary: Create a new employee account
 *     description: Admin can create a new employee account and send login link via email.
 *     tags:
 *       - Admin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *     responses:
 *       201:
 *         description: Employee created and login email sent.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 201
 *                 result:
 *                   type: string
 *                   example: Employee created. Login email sent.
 *       400:
 *         description: Employee already exists.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: Employee already exists
 */

/**
 * @swagger
 * /api/admin/employees:
 *   get:
 *     summary: Get all employees
 *     description: Admin can view a list of all employees.
 *     tags:
 *       - Admin
 *     responses:
 *       200:
 *         description: List of employees
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 result:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 60c72b2f5f1b2c001c8e4b9a
 *                       fullName:
 *                         type: string
 *                         example: John Doe
 *                       email:
 *                         type: string
 *                         example: johndoe@example.com
 *                       role:
 *                         type: string
 *                         example: employee
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/admin/employees/{id}/lock:
 *   patch:
 *     summary: Lock or unlock an employee account
 *     description: Admin can lock or unlock an employee account.
 *     tags:
 *       - Admin
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Employee ID
 *     responses:
 *       200:
 *         description: Employee account locked/unlocked
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 result:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Employee account locked/unlocked.
 *                     isLocked:
 *                       type: boolean
 *                       example: true
 *       404:
 *         description: Employee not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: Employee not found
 */

/**
 * @swagger
 * /api/admin/employees/{email}/resend-login-email:
 *   post:
 *     summary: Resend login email to employee
 *     description: Admin can resend the login email with a new token for an employee.
 *     tags:
 *       - Admin
 *     parameters:
 *       - in: path
 *         name: email
 *         schema:
 *           type: string
 *         required: true
 *         description: Employee's email
 *     responses:
 *       200:
 *         description: Login email resent with a new token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 result:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Login email resent with new token.
 *       404:
 *         description: Employee not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: Employee not found
 */

/**
 * @swagger
 * /api/admin/profile/{employeeId}:
 *   get:
 *     summary: Get employee profile
 *     description: Retrieve the profile of an employee by their ID.
 *     tags: 
 *        - Admin
 *     parameters:
 *       - name: employeeId
 *         in: path
 *         required: true
 *         description: The ID of the employee to retrieve.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Employee profile retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 'Login email resent successfully.'
 *                 result:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: '60d5ec49f1b2c8b8f8e4b8e4'
 *                     fullName:
 *                       type: string
 *                       example: 'John Doe'
 *                     email:
 *                       type: string
 *                       example: 'john.doe@example.com'
 *                     role:
 *                       type: string
 *                       example: 'employee'
 *       400:
 *         description: EmployeeId is required.
 *       404:
 *         description: Employee not found.
 *       500:
 *         description: Error while getting employee's profile.
 */

module.exports = router;