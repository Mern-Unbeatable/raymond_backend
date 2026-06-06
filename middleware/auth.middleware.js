const { verifyToken } = require("../utils/jwt");
const prisma = require("../config/database");
const { errorResponse } = require("../utils/response");


const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return errorResponse(res, 401, "Access denied. No token provided.");
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        profileImage: true,
        role: true,
        tokenVersion: true,
      },
    });

    if (!user) {
      return errorResponse(res, 401, "Invalid token. User not found.");
    }

  
    if (decoded.tokenVersion !== user.tokenVersion) {
      return errorResponse(
        res,
        401,
        "Session has been invalidated. Please login again.",
      );
    }

    req.user = user;
    next();
  } catch (error) {
    return errorResponse(res, 401, "Invalid or expired token.");
  }
};


const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== "ADMIN") {
    return errorResponse(res, 403, "Access denied. Admins only.");
  }
  next();
};

module.exports = { authenticate, authorizeAdmin };
