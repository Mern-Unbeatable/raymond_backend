const { verifyToken } = require("../utils/jwt");
const prisma = require("../config/database");
const chatService = require("../services/chat.service");

const registerSocketHandlers = (io) => {
  io.use(async (socket, next) => {
    try {
      const rawToken =
        socket.handshake.auth?.token ||
        (socket.handshake.headers.authorization || "").replace(
          /^Bearer\s+/i,
          "",
        );

      if (!rawToken) {
        return next(new Error("Authentication token is required."));
      }

      const decoded = verifyToken(rawToken);

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          name: true,
          email: true,
          profileImage: true,
          role: true,
          tokenVersion: true,
        },
      });

      if (!user) return next(new Error("User not found."));

      if (decoded.tokenVersion !== user.tokenVersion) {
        return next(new Error("Session expired. Please login again."));
      }

      socket.user = user;
      next();
    } catch {
      next(new Error("Invalid or expired token."));
    }
  });

  io.on("connection", (socket) => {
    console.log(
      `[Socket] Connected: ${socket.user.name} (${socket.user.id}) — socket ${socket.id}`,
    );

    // Auto-join personal user room (for direct notifications)
    socket.join(`user:${socket.user.id}`);

    socket.on("join_room", async ({ roomId }) => {
      try {
        // Verify user is a participant (or admin)
        await chatService.getRoom(roomId, socket.user.id);
        socket.join(`room:${roomId}`);
        console.log(`[Socket] ${socket.user.name} joined room ${roomId}`);
      } catch (err) {
        socket.emit("error", { message: err.message });
      }
    });

    socket.on("leave_room", ({ roomId }) => {
      socket.leave(`room:${roomId}`);
    });

    socket.on("send_message", async ({ roomId, content }) => {
      try {
        if (!content || !content.trim()) {
          return socket.emit("error", {
            message: "Message content cannot be empty.",
          });
        }

        const message = await chatService.sendMessage(
          roomId,
          socket.user.id,
          content.trim(),
        );

        io.to(`room:${roomId}`).emit("new_message", { message });
      } catch (err) {
        socket.emit("error", { message: err.message });
      }
    });

    socket.on("mark_read", async ({ roomId }) => {
      try {
        await chatService.markMessagesRead(roomId, socket.user.id);
        // Notify others in room that messages were read
        socket.to(`room:${roomId}`).emit("message_read", {
          roomId,
          readBy: socket.user.id,
        });
      } catch (err) {
        socket.emit("error", { message: err.message });
      }
    });
   
    socket.on("typing", ({ roomId }) => {
      socket.to(`room:${roomId}`).emit("user_typing", {
        roomId,
        userId: socket.user.id,
        name: socket.user.name,
      });
    });

    socket.on("stop_typing", ({ roomId }) => {
      socket.to(`room:${roomId}`).emit("user_stop_typing", {
        roomId,
        userId: socket.user.id,
      });
    });

    socket.on("disconnect", () => {
      console.log(`[Socket] Disconnected: ${socket.user.name} (${socket.id})`);
    });
  });
};

module.exports = registerSocketHandlers;
