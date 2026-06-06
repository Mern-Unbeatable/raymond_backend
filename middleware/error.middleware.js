const { errorResponse } = require("../utils/response");

const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err.code === "P2002") {
    const field = err.meta?.target?.join(", ") || "field";
    return errorResponse(
      res,
      409,
      `A record with this ${field} already exists.`,
    );
  }


  if (err.code === "P2025") {
    return errorResponse(res, 404, "Record not found.");
  }

  
  if (err.code === "P2003") {
    return errorResponse(res, 400, "Related record not found.");
  }


  if (err.name === "JsonWebTokenError") {
    return errorResponse(res, 401, "Invalid token.");
  }

  if (err.name === "TokenExpiredError") {
    return errorResponse(res, 401, "Token has expired.");
  }

  return errorResponse(
    res,
    err.status || 500,
    err.message || "Internal Server Error",
  );
};

const notFound = (req, res) => {
  return errorResponse(
    res,
    404,
    `Route ${req.method} ${req.originalUrl} not found.`,
  );
};

module.exports = { errorHandler, notFound };
