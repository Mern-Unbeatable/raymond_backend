const chatService = require("../services/chat.service");
const { successResponse, errorResponse } = require("../utils/response");

//User: get or create their room with admin
const getOrCreateRoom = async (req, res, next) => {
  try {
    const room = await chatService.getOrCreateRoom(req.user.id);
    return successResponse(res, 200, "Chat room ready.", room);
  } catch (error) {
    next(error);
  }
};

const getAllRooms = async (req, res, next) => {
  try {
    const rooms = await chatService.getAllRooms();
    return successResponse(res, 200, "Chat rooms retrieved.", rooms);
  } catch (error) {
    next(error);
  }
};

const getRoom = async (req, res, next) => {
  try {
    const room = await chatService.getRoom(req.params.roomId, req.user.id);
    return successResponse(res, 200, "Room retrieved.", room);
  } catch (error) {
    next(error);
  }
};


const getMessages = async (req, res, next) => {
  try {
    const messages = await chatService.getMessages(
      req.params.roomId,
      req.user.id,
    );
    return successResponse(res, 200, "Messages retrieved.", messages);
  } catch (error) {
    next(error);
  }
};


const sendMessage = async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return errorResponse(res, 400, "Message content is required.");
    }
    const message = await chatService.sendMessage(
      req.params.roomId,
      req.user.id,
      content.trim(),
    );
    return successResponse(res, 201, "Message sent.", message);
  } catch (error) {
    next(error);
  }
};


const markRead = async (req, res, next) => {
  try {
    await chatService.markMessagesRead(req.params.roomId, req.user.id);
    return successResponse(res, 200, "Messages marked as read.", null);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOrCreateRoom,
  getAllRooms,
  getRoom,
  getMessages,
  sendMessage,
  markRead,
};
