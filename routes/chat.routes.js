const express = require("express");
const {
  getOrCreateRoom,
  getAllRooms,
  getRoom,
  getMessages,
  sendMessage,
  markRead,
} = require("../controllers/chat.controller");
const {
  authenticate,
  authorizeAdmin,
} = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authenticate);

router.post("/room", getOrCreateRoom);

router.get("/rooms", authorizeAdmin, getAllRooms);

router.get("/rooms/:roomId", getRoom);

router.get("/rooms/:roomId/messages", getMessages);

router.post("/rooms/:roomId/messages", sendMessage);

router.put("/rooms/:roomId/read", markRead);

module.exports = router;
