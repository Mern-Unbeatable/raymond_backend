const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../config/database");
const { generateToken } = require("../utils/jwt");
const { sendOtpEmail } = require("../utils/email");

const generateOtp = () => Math.floor(10000 + Math.random() * 90000).toString();

const userPublicSelect = {
  id: true,
  name: true,
  email: true,
  phoneNumber: true,
  address: true,
  postcode: true,
  profileImage: true,
  role: true,
  createdAt: true,
  updatedAt: true,
};

const register = async ({
  name,
  phoneNumber,
  email,
  address,
  postcode,
  password,
  profileImage,
}) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const error = new Error("Email is already registered.");
    error.status = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name,
      phoneNumber,
      email,
      address: address || null,
      postcode: postcode || null,
      password: hashedPassword,
      profileImage: profileImage || null,
    },
    select: { ...userPublicSelect, tokenVersion: true },
  });

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
    tokenVersion: user.tokenVersion,
  });

  const { tokenVersion: _tv, ...userOut } = user;
  return { user: userOut, token };
};

const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    const error = new Error("Invalid email or password.");
    error.status = 401;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const error = new Error("Invalid email or password.");
    error.status = 401;
    throw error;
  }

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
    tokenVersion: user.tokenVersion,
  });

  const { password: _pwd, tokenVersion: _tv, ...userOut } = user;
  return { user: userOut, token };
};

const verifyEmail = async ({ email, otp }) => {
  const record = await prisma.otpToken.findFirst({
    where: {
      email,
      otp,
      isUsed: false,
      isVerified: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!record) {
    const error = new Error("Invalid or expired OTP.");
    error.status = 400;
    throw error;
  }

  await prisma.otpToken.update({
    where: { id: record.id },
    data: { isUsed: true, isVerified: true },
  });

  const user = await prisma.user.update({
    where: { email },
    data: { isVerified: true },
    select: { ...userPublicSelect, tokenVersion: true },
  });

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
    tokenVersion: user.tokenVersion,
  });

  const { tokenVersion: _tv, ...userOut } = user;
  return { user: userOut, token };
};

const getProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: userPublicSelect,
  });

  if (!user) {
    const error = new Error("User not found.");
    error.status = 404;
    throw error;
  }

  return user;
};

const updateProfile = async (
  userId,
  { name, phoneNumber, address, postcode, profileImage },
) => {
  const data = {};
  if (name !== undefined) data.name = name;
  if (phoneNumber !== undefined) data.phoneNumber = phoneNumber;
  if (address !== undefined) data.address = address;
  if (postcode !== undefined) data.postcode = postcode;
  if (profileImage !== undefined) data.profileImage = profileImage;

  const user = await prisma.user.update({
    where: { id: userId },
    data,
    select: userPublicSelect,
  });

  return user;
};

const changePassword = async (
  userId,
  { oldPassword, newPassword, confirmedPassword },
) => {
  if (newPassword !== confirmedPassword) {
    const error = new Error(
      "New password and confirmed password do not match.",
    );
    error.status = 400;
    throw error;
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) {
    const error = new Error("Old password is incorrect.");
    error.status = 400;
    throw error;
  }

  const hashed = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashed },
  });
};

const forgotPassword = async (email) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) return;

  await prisma.otpToken.updateMany({
    where: { email, isUsed: false },
    data: { isUsed: true },
  });

  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await prisma.otpToken.create({
    data: { email, otp, expiresAt },
  });

  await sendOtpEmail(email, otp, user.name);
};

const verifyOtp = async ({ email, otp }) => {
  const record = await prisma.otpToken.findFirst({
    where: {
      email,
      otp,
      isUsed: false,
      isVerified: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!record) {
    const error = new Error("Invalid or expired OTP.");
    error.status = 400;
    throw error;
  }


  await prisma.otpToken.update({
    where: { id: record.id },
    data: { isVerified: true },
  });

  // Issue a short-lived reset token (15 min)
  const resetToken = jwt.sign(
    { email, otpId: record.id, purpose: "reset" },
    process.env.JWT_SECRET,
    { expiresIn: "15m" },
  );

  return { resetToken };
};

const resetPassword = async ({
  resetToken,
  newPassword,
  confirmedPassword,
}) => {
  if (newPassword !== confirmedPassword) {
    const error = new Error("Passwords do not match.");
    error.status = 400;
    throw error;
  }

  let decoded;
  try {
    decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
  } catch {
    const error = new Error("Invalid or expired reset token.");
    error.status = 400;
    throw error;
  }

  if (decoded.purpose !== "reset") {
    const error = new Error("Invalid reset token.");
    error.status = 400;
    throw error;
  }

  const record = await prisma.otpToken.findFirst({
    where: {
      id: decoded.otpId,
      email: decoded.email,
      isVerified: true,
      isUsed: false,
    },
  });

  if (!record) {
    const error = new Error("Reset token has already been used or is invalid.");
    error.status = 400;
    throw error;
  }

  const hashed = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { email: decoded.email },
    data: { password: hashed },
  });

  await prisma.otpToken.update({
    where: { id: record.id },
    data: { isUsed: true },
  });
};

const logout = async (userId) => {
  await prisma.user.update({
    where: { id: userId },
    data: { tokenVersion: { increment: 1 } },
  });
};

module.exports = {
  register,
  login,
  verifyEmail,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  verifyOtp,
  resetPassword,
  logout,
};
