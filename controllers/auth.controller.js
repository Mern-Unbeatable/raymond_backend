const { validationResult } = require("express-validator");
const authService = require("../services/auth.service");
const { successResponse, errorResponse } = require("../utils/response");

const validate = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errorResponse(res, 400, "Validation failed.", errors.array());
    return false;
  }
  return true;
};

const fileUrl = (filename) => {
  const base =
    process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
  return `${base}/uploads/profile/${filename}`;
};

const register = async (req, res, next) => {
  try {
    if (!validate(req, res)) return;
    const { name, phoneNumber, email, address, postcode, password } = req.body;
    // profileImage can be an uploaded file OR a URL string in body
    const profileImage = req.file
      ? fileUrl(req.file.filename)
      : req.body.profileImage || null;
    const result = await authService.register({
      name,
      phoneNumber,
      email,
      address,
      postcode,
      password,
      profileImage,
    });
    return successResponse(res, 201, "Registration successful.", result);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    if (!validate(req, res)) return;
    const { email, password } = req.body;
    const result = await authService.login({ email, password });
    return successResponse(res, 200, "Login successful.", result);
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const user = await authService.getProfile(req.user.id);
    return successResponse(res, 200, "Profile retrieved.", user);
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    if (!validate(req, res)) return;
    const { name, phoneNumber, address, postcode } = req.body;
    const profileImage = req.file
      ? fileUrl(req.file.filename)
      : req.body.profileImage || undefined;
    const user = await authService.updateProfile(req.user.id, {
      name,
      phoneNumber,
      address,
      postcode,
      profileImage,
    });
    return successResponse(res, 200, "Profile updated.", user);
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    if (!validate(req, res)) return;
    const { oldPassword, newPassword, confirmedPassword } = req.body;
    await authService.changePassword(req.user.id, {
      oldPassword,
      newPassword,
      confirmedPassword,
    });
    return successResponse(res, 200, "Password changed successfully.");
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    if (!validate(req, res)) return;
    await authService.forgotPassword(req.body.email);
    // Always return success to prevent email enumeration
    return successResponse(
      res,
      200,
      "If this email is registered, an OTP has been sent.",
    );
  } catch (error) {
    next(error);
  }
};

const verifyOtp = async (req, res, next) => {
  try {
    if (!validate(req, res)) return;
    const { email, otp } = req.body;
    const result = await authService.verifyOtp({ email, otp });
    return successResponse(
      res,
      200,
      "OTP verified. Use the resetToken to reset your password.",
      result,
    );
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    if (!validate(req, res)) return;
    const authHeader = req.headers.authorization || "";
    const resetToken = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;
    if (!resetToken) {
      return errorResponse(
        res,
        401,
        "Reset token is required in Authorization header.",
      );
    }
    const { newPassword, confirmedPassword } = req.body;
    await authService.resetPassword({
      resetToken,
      newPassword,
      confirmedPassword,
    });
    return successResponse(
      res,
      200,
      "Password reset successful. Please login.",
    );
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    await authService.logout(req.user.id);
    return successResponse(res, 200, "Logged out successfully.");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  // verifyEmail,
  login,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  verifyOtp,
  resetPassword,
  logout,
};
