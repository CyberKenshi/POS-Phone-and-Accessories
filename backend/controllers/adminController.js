const User = require("../models/userModel");
const AppError = require("../utils/AppError");
const crypto = require("crypto");
const client = require("../config/redisClient");
const { Order } = require("../models/orderModel");
const sendEmail = require("../utils/sendEmail");

// Hàm tạo tài khoản nhân viên với error handling
const createEmployee = async (req, res, next) => {
  try {
    const { fullName, email, mobile, avatar } = req.body;
    if (!fullName || !email) {
      return next(new AppError("Fullname and Email is required", 400));
    }
    // Check if employee already exists
    const employeeExists = await User.findOne({ email });
    if (employeeExists) {
      return next(new AppError("Employee already exists", 400));
    }
    // Username và Password mặc định
    const username = email.split("@")[0];
    const password = username;

    // Tạo token đăng nhập và set thời gian hết hạn login token
    const loginToken = crypto.randomBytes(32).toString("hex");
    const tokenExpires = Date.now() + 60 * 1000;

    // Create the user in the database
    const user = await User.create({
      fullName,
      email,
      mobile: mobile || "",
      password,
      username,
      role: "employee",
      avatar: avatar || "",
      loginToken,
      tokenExpires,
    });

    // Generate login link and send email
    const loginLink = `${req.protocol}://${req.get(
      "host"
    )}/api/auth/login/${loginToken}`;
    const additionalLink = `http://localhost:3001/reset-password/${loginToken}`;
    const emailData = {
      to: user.email,
      subject: "Login to POS",
      text: `Use this link to login: ${loginLink}. It expires in 1 minute. Additionally, you can use this link: ${additionalLink}`,
      htmlContent: `<p>Use this link to login: <a href="${loginLink}">${loginLink}</a>. It expires in 1 minute.</p><p>Additionally, you can use this link: <a href="${additionalLink}">${additionalLink}</a></p>`,
    };
    await sendEmail(
      emailData.to,
      emailData.subject,
      emailData.text,
      emailData.htmlContent
    );
    await client.del(`employees_list`);

    res.status(201).json({
      code: 201,
      success: true,
      message: "Employee created successfully.",
      result: "Login email sent.",
    });
  } catch (error) {
    return next(
      new AppError(`Error while creating new employee: ${error.message}`, 500)
    );
  }
};

// Hàm xem danh sách nhân viên
const getEmployees = async (req, res, next) => {
  try {
    const employees = await User.find({ role: "employee" }).select(
      "-password -loginToken -tokenExpires"
    );
    res.status(200).json({
      code: 200,
      success: true,
      message: "Employees fetched successfully.",
      result: employees,
    });
  } catch (error) {
    return next(
      new AppError(`Error while getting employee list: ${error.message}`, 500)
    );
  }
};

// Hàm khóa/mở khóa tài khoản nhân viên
const toggleEmployeeLock = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return next(new AppError("Employee not found"), 404);
    }

    user.isLocked = !user.isLocked;
    await user.save();

    await client.del(`employees_list`);
    await client.del(`employee_profile_${user._id}`);

    res.status(200).json({
      code: 200,
      success: true,
      message: "Employee account status updated successfully.",
      result: {
        message: `Employee account ${user.isLocked ? "locked" : "unlocked"}.`,
        isLocked: user.isLocked,
      },
    });
  } catch (error) {
    return next(
      new AppError(`Error at toggleEmployeeLock: ${error.message}`, 500)
    );
  }
};

// Hàm gửi lại email đăng nhập cho nhân viên
const resendLoginEmail = async (req, res, next) => {
  try {
    const { email } = req.params;
    const user = await User.findOne({ email });
    console.log(email);

    if (!user || user.role !== "employee") {
      return next(new AppError("Employee not found"), 404);
    }

    const loginToken = crypto.randomBytes(32).toString("hex");
    const tokenExpires = Date.now() + 60 * 1000;

    user.loginToken = loginToken;
    user.tokenExpires = tokenExpires;
    await user.save();

    const loginLink = `${req.protocol}://${req.get(
      "host"
    )}/api/auth/login/${loginToken}`;
    const additionalLink = `http://localhost:3001/reset-password/${loginToken}`;
    const emailData = {
      to: user.email,
      subject: "Login to POS",
      text: `Use this link to login: ${loginLink}. It expires in 1 minute. Additionally, you can use this link: ${additionalLink}`,
      htmlContent: `<p>Use this link to login: <a href="${loginLink}">${loginLink}</a>. It expires in 1 minute.</p><p>Additionally, you can use this link: <a href="${additionalLink}">${additionalLink}</a></p>`,
    };
    await sendEmail(
      emailData.to,
      emailData.subject,
      emailData.text,
      emailData.htmlContent
    );
    res.status(200).json({
      code: 200,
      success: true,
      message: "Login email resent successfully.",
      result: {
        message: "Login email resent with new token.",
      },
    });
  } catch (error) {
    return next(
      new AppError(`Error while resend login email: ${error.message}`, 500)
    );
  }
};

// Hàm xem hồ sơ nhân viên
const getProfile = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    if (!employeeId) {
      return next(new AppError("EmployeeId is required", 400));
    }
    const employee = await User.findById(employeeId);
    if (!employee) {
      return next(new AppError("Employee not found", 404));
    } else {
      const orders = await Order.find({ employeeId: employeeId });
      return res.status(200).json({
        code: 200,
        success: true,
        message: "Get employe's profile successfully.",
        result: {
          employee,
          orders,
        },
      });
    }
  } catch (error) {
    return next(
      new AppError(
        `Error while getting employee\'s profile: ${error.message}`,
        500
      )
    );
  }
};

module.exports = {
  createEmployee,
  getEmployees,
  toggleEmployeeLock,
  resendLoginEmail,
  getProfile,
};
