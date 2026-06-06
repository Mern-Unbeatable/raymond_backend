require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");
const prisma = require("./config/database");
const registerSocketHandlers = require("./socket/chat.socket");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await prisma.$connect();
    console.log("Database connected successfully.");

    // Create HTTP server so Express and Socket.IO share the same port
    const httpServer = http.createServer(app);

    const io = new Server(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    // Attach Socket.IO instance to app so routes can access it if needed
    app.set("io", io);

    registerSocketHandlers(io);

    httpServer.listen(PORT, () => {
      console.log(
        `Server running on port ${PORT} [${process.env.NODE_ENV || "development"}]`,
      );
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

const gracefulShutdown = async (signal) => {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  await prisma.$disconnect();
  process.exit(0);
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

startServer();
