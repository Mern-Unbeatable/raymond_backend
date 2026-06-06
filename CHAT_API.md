# Chat API — Postman & Socket.IO Testing Guide

**Live Base URL:** `https://backend1raymond.mtscorporate.com/api/v1`  
**Local Base URL:** `http://localhost:3000/api/v1`  
**Socket URL:** `https://backend1raymond.mtscorporate.com` (or `http://localhost:3000`)

> All endpoints require `Authorization: Bearer {{token}}`.

---

## Architecture Overview

```
USER ──────── POST /chat/room ──────── creates/gets a ChatRoom with ADMIN
USER / ADMIN ─ Socket.IO ─────────── real-time messaging inside the room
ADMIN ─────── GET /chat/rooms ─────── see all user conversations
```

- Each user has **one chat room** shared with the admin.
- Both REST (Postman testing) and Socket.IO (real-time) are supported.
- JWT authentication is required for both REST and Socket connections.

---

## REST Endpoint Reference

| #   | Method | Endpoint                       | Auth          | Description                 |
| --- | ------ | ------------------------------ | ------------- | --------------------------- |
| 1   | POST   | `/chat/room`                   | 🔒 User/Admin | Get or create own chat room |
| 2   | GET    | `/chat/rooms`                  | 🔒 Admin only | List all chat rooms         |
| 3   | GET    | `/chat/rooms/:roomId`          | 🔒 Member     | Get room details            |
| 4   | GET    | `/chat/rooms/:roomId/messages` | 🔒 Member     | Get paginated messages      |
| 5   | POST   | `/chat/rooms/:roomId/messages` | 🔒 Member     | Send a message (REST)       |
| 6   | PUT    | `/chat/rooms/:roomId/read`     | 🔒 Member     | Mark all messages as read   |
| 7   | GET    | `/chat/unread`                 | 🔒 User/Admin | Get total unread count      |

---

## 1. Get or Create Chat Room

**POST** `{{baseUrl}}/chat/room`

**Headers:**

```
Authorization: Bearer {{token}}
```

> Call this first. If the user already has a room it returns the existing one;  
> otherwise creates a new room between the user and the admin.

**Success Response `200`:**

```json
{
  "success": true,
  "message": "Chat room ready.",
  "data": {
    "id": "room-uuid-...",
    "createdAt": "2026-04-20T09:00:00.000Z",
    "updatedAt": "2026-04-20T09:00:00.000Z",
    "participants": [
      {
        "id": "part-uuid-1",
        "userId": "user-uuid",
        "joinedAt": "...",
        "user": {
          "id": "...",
          "name": "John Doe",
          "role": "USER",
          "profileImage": null
        }
      },
      {
        "id": "part-uuid-2",
        "userId": "admin-uuid",
        "joinedAt": "...",
        "user": {
          "id": "...",
          "name": "Admin",
          "role": "ADMIN",
          "profileImage": null
        }
      }
    ]
  }
}
```

**Tests:**

```js
pm.environment.set("roomId", pm.response.json().data.id);
```

---

## 2. List All Chat Rooms (Admin)

**GET** `{{baseUrl}}/chat/rooms`

**Headers:**

```
Authorization: Bearer {{token}}
```

### Query Parameters

| Parameter | Default | Notes   |
| --------- | ------- | ------- |
| `page`    | `1`     |         |
| `limit`   | `20`    | Max 100 |

**Success Response `200`:**

```json
{
  "success": true,
  "message": "Chat rooms retrieved.",
  "data": {
    "rooms": [
      {
        "id": "room-uuid",
        "participants": [ ... ],
        "messages": [
          {
            "id": "msg-uuid",
            "content": "Hello!",
            "isRead": false,
            "createdAt": "...",
            "sender": { "id": "...", "name": "John", "role": "USER" }
          }
        ]
      }
    ],
    "pagination": { "total": 5, "page": 1, "limit": 20, "totalPages": 1 }
  }
}
```

---

## 3. Get Room Details

**GET** `{{baseUrl}}/chat/rooms/{{roomId}}`

**Headers:**

```
Authorization: Bearer {{token}}
```

**Success Response `200`:**

```json
{
  "success": true,
  "message": "Room retrieved.",
  "data": { "id": "room-uuid", "participants": [ ... ], "createdAt": "..." }
}
```

**Error cases:**

- `403` — Not a participant of this room
- `404` — Room not found

---

## 4. Get Message History

**GET** `{{baseUrl}}/chat/rooms/{{roomId}}/messages`

**Headers:**

```
Authorization: Bearer {{token}}
```

### Query Parameters

| Parameter | Default | Notes   |
| --------- | ------- | ------- |
| `page`    | `1`     |         |
| `limit`   | `50`    | Max 100 |

> Messages are returned oldest-first within the page.

**Success Response `200`:**

```json
{
  "success": true,
  "message": "Messages retrieved.",
  "data": {
    "messages": [
      {
        "id": "msg-uuid",
        "content": "Hello, I need help with property X.",
        "isRead": true,
        "createdAt": "2026-04-20T09:05:00.000Z",
        "sender": {
          "id": "...",
          "name": "John Doe",
          "profileImage": null,
          "role": "USER"
        }
      }
    ],
    "pagination": { "total": 12, "page": 1, "limit": 50, "totalPages": 1 }
  }
}
```

---

## 5. Send Message (REST)

**POST** `{{baseUrl}}/chat/rooms/{{roomId}}/messages`

**Headers:**

```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body (JSON):**

```json
{
  "content": "Hello, I am interested in the property."
}
```

**Success Response `201`:**

```json
{
  "success": true,
  "message": "Message sent.",
  "data": {
    "id": "msg-uuid",
    "content": "Hello, I am interested in the property.",
    "isRead": false,
    "createdAt": "2026-04-20T09:10:00.000Z",
    "sender": { "id": "...", "name": "John Doe", "role": "USER" }
  }
}
```

---

## 6. Mark Messages as Read

**PUT** `{{baseUrl}}/chat/rooms/{{roomId}}/read`

**Headers:**

```
Authorization: Bearer {{token}}
```

> Marks all messages sent by the **other participant** as read.

**Success Response `200`:**

```json
{
  "success": true,
  "message": "Messages marked as read.",
  "data": null
}
```

---

## 7. Get Unread Count

**GET** `{{baseUrl}}/chat/unread`

**Headers:**

```
Authorization: Bearer {{token}}
```

**Success Response `200`:**

```json
{
  "success": true,
  "message": "Unread count retrieved.",
  "data": { "unread": 3 }
}
```

---

## Socket.IO — Real-Time Chat

### Connection

Connect to the Socket.IO server with your JWT token:

```js
const socket = io("https://backend1raymond.mtscorporate.com", {
  auth: { token: "YOUR_JWT_TOKEN" },
});
```

Or pass it as a header:

```js
const socket = io("https://backend1raymond.mtscorporate.com", {
  extraHeaders: { authorization: "Bearer YOUR_JWT_TOKEN" },
});
```

### Connection Errors

| Error message                          | Cause                  |
| -------------------------------------- | ---------------------- |
| `Authentication token is required.`    | No token provided      |
| `Invalid or expired token.`            | Bad/expired JWT        |
| `Session expired. Please login again.` | Logged out server-side |

---

### Client → Server Events

#### `join_room`

Join a chat room to start receiving messages.

```js
socket.emit("join_room", { roomId: "room-uuid" });
```

#### `leave_room`

Leave a room (stop receiving its events).

```js
socket.emit("leave_room", { roomId: "room-uuid" });
```

#### `send_message`

Send a message in a room.

```js
socket.emit("send_message", {
  roomId: "room-uuid",
  content: "Hello!",
});
```

#### `mark_read`

Mark all messages in a room as read.

```js
socket.emit("mark_read", { roomId: "room-uuid" });
```

#### `typing`

Notify others you are typing.

```js
socket.emit("typing", { roomId: "room-uuid" });
```

#### `stop_typing`

Notify others you stopped typing.

```js
socket.emit("stop_typing", { roomId: "room-uuid" });
```

---

### Server → Client Events

#### `new_message`

Fired when a new message is sent in a room you joined.

```js
socket.on("new_message", ({ message }) => {
  console.log(message.sender.name, ":", message.content);
});
```

**Payload:**

```json
{
  "message": {
    "id": "msg-uuid",
    "content": "Hello!",
    "isRead": false,
    "createdAt": "...",
    "sender": {
      "id": "...",
      "name": "John",
      "profileImage": null,
      "role": "USER"
    }
  }
}
```

#### `message_read`

Fired when the other participant reads messages.

```js
socket.on("message_read", ({ roomId, readBy }) => {
  console.log("Read by", readBy, "in room", roomId);
});
```

#### `user_typing`

Fired when another user in the room is typing.

```js
socket.on("user_typing", ({ roomId, userId, name }) => {
  console.log(name, "is typing...");
});
```

#### `user_stop_typing`

Fired when a user stops typing.

```js
socket.on("user_stop_typing", ({ roomId, userId }) => {});
```

#### `error`

Fired when an action fails (e.g. not authorized for a room).

```js
socket.on("error", ({ message }) => {
  console.error("Socket error:", message);
});
```

---

## Recommended Flow

### User Side

```
1. POST  /chat/room              → get roomId
2. socket.emit("join_room", { roomId })
3. socket.emit("send_message", { roomId, content })
4. socket.on("new_message", ...)    → display incoming messages
5. socket.emit("mark_read", { roomId })
```

### Admin Side

```
1. GET   /chat/rooms             → see all conversations
2. socket.emit("join_room", { roomId })  → join a specific user's room
3. socket.emit("send_message", { roomId, content })
4. socket.on("new_message", ...)    → display incoming messages
```
