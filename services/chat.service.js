const prisma = require("../config/database");

const participantSelect = {
  id: true,
  userId: true,
  joinedAt: true,
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      profileImage: true,
      role: true,
    },
  },
};

const messageSelect = {
  id: true,
  content: true,
  isRead: true,
  createdAt: true,
  sender: {
    select: {
      id: true,
      name: true,
      profileImage: true,
      role: true,
    },
  },
};

const getOrCreateRoom = async (userId) => {
  // Find existing room that contains this user
  const existing = await prisma.chatRoom.findFirst({
    where: {
      participants: {
        some: { userId },
      },
    },
    include: {
      participants: { select: participantSelect },
    },
  });

  if (existing) return existing;

  // Find any admin to pair with
  const admin = await prisma.user.findFirst({
    where: { role: "ADMIN" },
    select: { id: true },
  });

  if (!admin) {
    const error = new Error("No admin available to start a chat.");
    error.status = 503;
    throw error;
  }

  const room = await prisma.chatRoom.create({
    data: {
      participants: {
        create: [{ userId }, { userId: admin.id }],
      },
    },
    include: {
      participants: { select: participantSelect },
    },
  });

  return room;
};

const getAllRooms = async () => {
  const rooms = await prisma.chatRoom.findMany({
    include: {
      participants: { select: participantSelect },
      messages: {
        select: messageSelect,
        orderBy: { createdAt: "desc" },
        take: 1, // latest message preview
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return rooms;
};

const getRoom = async (roomId, userId) => {
  const room = await prisma.chatRoom.findUnique({
    where: { id: roomId },
    include: {
      participants: { select: participantSelect },
    },
  });

  if (!room) {
    const error = new Error("Chat room not found.");
    error.status = 404;
    throw error;
  }

  const isMember = room.participants.some((p) => p.userId === userId);
  if (!isMember) {
    const error = new Error("Access denied. You are not in this room.");
    error.status = 403;
    throw error;
  }

  return room;
};

const getMessages = async (roomId, userId) => {
  await getRoom(roomId, userId);

  const messages = await prisma.message.findMany({
    where: { chatRoomId: roomId },
    select: messageSelect,
    orderBy: { createdAt: "asc" },
  });

  return messages;
};

const sendMessage = async (roomId, senderId, content) => {
  await getRoom(roomId, senderId);

  const message = await prisma.message.create({
    data: { content, senderId, chatRoomId: roomId },
    select: messageSelect,
  });

  await prisma.chatRoom.update({
    where: { id: roomId },
    data: { updatedAt: new Date() },
  });

  return message;
};

const markMessagesRead = async (roomId, userId) => {
  await getRoom(roomId, userId); // access check

  await prisma.message.updateMany({
    where: {
      chatRoomId: roomId,
      isRead: false,
      senderId: { not: userId },
    },
    data: { isRead: true },
  });
};

module.exports = {
  getOrCreateRoom,
  getAllRooms,
  getRoom,
  getMessages,
  sendMessage,
  markMessagesRead,
};
