# Auth API — Postman Testing Guide

**Live Base URL:** `https://backend1raymond.mtscorporate.com/api/v1`  
**Local Base URL:** `http://localhost:3000/api/v1`

> **Postman Setup**  
> Create an Environment with these variables:
> | Variable | Initial Value |
> |----------|---------------|
> | `baseUrl` | `https://backend1raymond.mtscorporate.com/api/v1` |
> | `token` | _(auto-filled by test scripts)_ |
> | `resetToken` | _(auto-filled by test scripts)_ |

---

## Registration & Verification Flow

```
1. POST /auth/register       → account created (unverified) → 5-digit OTP sent to email
2. POST /auth/verify-email   → submit OTP → account verified → returns token
3. POST /auth/login          → login (verified users only)
```

---

## 1. Register

**POST** `{{baseUrl}}/auth/register`

> Accepts **`multipart/form-data`** (to upload profile image) **or** `application/json`.  
> After registration an OTP is sent to the email. **No token is returned yet.**

### Option A — form-data (with image upload)

| Key            | Type     | Required | Notes                       |
| -------------- | -------- | -------- | --------------------------- |
| `name`         | Text     | ✅       |                             |
| `phoneNumber`  | Text     | ✅       |                             |
| `email`        | Text     | ✅       |                             |
| `password`     | Text     | ✅       | Min 6 characters            |
| `address`      | Text     | ❌       |                             |
| `profileImage` | **File** | ❌       | JPEG / PNG / WebP, max 5 MB |

### Option B — JSON

```json
{
  "name": "John Doe",
  "phoneNumber": "+1234567890",
  "email": "john@example.com",
  "password": "secret123",
  "address": "123 Main St"
}
```

**Success Response `201`:**

```json
{
  "success": true,
  "message": "Registration successful. Please check your email for a verification OTP.",
  "data": {
    "user": {
      "id": "3b7106b7-...",
      "name": "John Doe",
      "email": "john@example.com",
      "phoneNumber": "+1234567890",
      "address": "123 Main St",
      "profileImage": "https://backend1raymond.mtscorporate.com/uploads/uuid.png",
      "role": "USER",
      "isVerified": false,
      "createdAt": "2026-04-19T09:05:04.482Z",
      "updatedAt": "2026-04-19T09:05:04.482Z"
    }
  }
}
```

---

## 2. Verify Email (after Registration)

**POST** `{{baseUrl}}/auth/verify-email`

> Submit the 5-digit OTP sent to the registered email. Valid for **10 minutes**.  
> Returns the access token upon success.

**Body (JSON):**

```json
{
  "email": "john@example.com",
  "otp": "48291"
}
```

**Success Response `200`:**

```json
{
  "success": true,
  "message": "Email verified successfully.",
  "data": {
    "user": {
      "id": "3b7106b7-...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "USER",
      "isVerified": true,
      ...
    },
    "token": "<jwt — valid 30 days>"
  }
}
```

**Error cases:**

- `400` — Invalid or expired OTP

**Tests (Postman Scripts tab):**

```js
pm.environment.set("token", pm.response.json().data.token);
```

---

## 3. Login

**POST** `{{baseUrl}}/auth/login`

> Only verified accounts can log in. If unverified, a fresh OTP is automatically re-sent.

**Body (JSON):**

```json
{
  "email": "john@example.com",
  "password": "secret123"
}
```

**Success Response `200`:**

```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "user": { "id": "...", "name": "John Doe", "email": "john@example.com", "isVerified": true, ... },
    "token": "<jwt — valid 30 days>"
  }
}
```

**Error cases:**

- `401` — Invalid email or password
- `403` — Email not verified (new OTP re-sent automatically)

**Tests:**

```js
pm.environment.set("token", pm.response.json().data.token);
```

---

## 4. Get Own Profile

**GET** `{{baseUrl}}/auth/me`

**Headers:**

```
Authorization: Bearer {{token}}
```

**Success Response `200`:**

```json
{
  "success": true,
  "message": "Profile retrieved.",
  "data": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "phoneNumber": "+1234567890",
    "address": "123 Main St",
    "profileImage": "https://backend1raymond.mtscorporate.com/uploads/uuid.png",
    "role": "USER",
    "isVerified": true,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

## 5. Update Profile

**PUT** `{{baseUrl}}/auth/update-profile`

**Headers:**

```
Authorization: Bearer {{token}}
```

> Accepts **`multipart/form-data`** (to upload a new profile image) **or** `application/json`.  
> All fields are optional — send only what you want to change.

### Option A — form-data (with image upload)

| Key            | Type     | Notes                                  |
| -------------- | -------- | -------------------------------------- |
| `name`         | Text     | Optional                               |
| `phoneNumber`  | Text     | Optional                               |
| `address`      | Text     | Optional                               |
| `profileImage` | **File** | Optional — JPEG / PNG / WebP, max 5 MB |

### Option B — JSON

```json
{
  "name": "John Updated",
  "phoneNumber": "+9876543210",
  "address": "456 New Street"
}
```

**Success Response `200`:**

```json
{
  "success": true,
  "message": "Profile updated.",
  "data": { "id": "...", "name": "John Updated", ... }
}
```

---

## 6. Change Password

**PUT** `{{baseUrl}}/auth/change-password`

**Headers:**

```
Authorization: Bearer {{token}}
```

**Body (JSON):**

```json
{
  "oldPassword": "secret123",
  "newPassword": "newSecret456",
  "confirmedPassword": "newSecret456"
}
```

**Success Response `200`:**

```json
{
  "success": true,
  "message": "Password changed successfully.",
  "data": null
}
```

**Error cases:**

- `400` — Old password is incorrect
- `400` — New password and confirmed password do not match

---

## 7. Forgot Password

**POST** `{{baseUrl}}/auth/forgot-password`

**Body (JSON):**

```json
{
  "email": "john@example.com"
}
```

**Success Response `200`:**

```json
{
  "success": true,
  "message": "If this email is registered, an OTP has been sent.",
  "data": null
}
```

> Always returns `200` to prevent email enumeration.  
> A 5-digit OTP is sent to the inbox. Valid for **10 minutes**.

---

## 8. Verify OTP (Forgot Password)

**POST** `{{baseUrl}}/auth/verify-otp`

**Body (JSON):**

```json
{
  "email": "john@example.com",
  "otp": "48291"
}
```

**Success Response `200`:**

```json
{
  "success": true,
  "message": "OTP verified. Use the resetToken to reset your password.",
  "data": {
    "resetToken": "<short-lived jwt — valid 15 minutes>"
  }
}
```

**Error cases:**

- `400` — Invalid or expired OTP

**Tests:**

```js
pm.environment.set("resetToken", pm.response.json().data.resetToken);
```

---

## 9. Reset Password

**POST** `{{baseUrl}}/auth/reset-password`

**Headers:**

```
Authorization: Bearer {{resetToken}}
```

**Body (JSON):**

```json
{
  "newPassword": "brandNew789",
  "confirmedPassword": "brandNew789"
}
```

**Success Response `200`:**

```json
{
  "success": true,
  "message": "Password reset successful. Please login.",
  "data": null
}
```

**Error cases:**

- `400` — Invalid or expired reset token
- `400` — Passwords do not match
- `400` — Reset token already used

---

## 10. Logout

**POST** `{{baseUrl}}/auth/logout`

**Headers:**

```
Authorization: Bearer {{token}}
```

**Success Response `200`:**

```json
{
  "success": true,
  "message": "Logged out successfully.",
  "data": null
}
```

> Logout **invalidates the token server-side** via `tokenVersion`. Any request using the old token immediately returns `401`.

---

## Complete Endpoint Reference

| #   | Method | Endpoint                | Auth      | Description                                   |
| --- | ------ | ----------------------- | --------- | --------------------------------------------- |
| 1   | POST   | `/auth/register`        | Public    | Register new account, sends verification OTP  |
| 2   | POST   | `/auth/verify-email`    | Public    | Verify email with OTP, returns token          |
| 3   | POST   | `/auth/login`           | Public    | Login (verified users only)                   |
| 4   | GET    | `/auth/me`              | 🔒 Bearer | Get own profile                               |
| 5   | PUT    | `/auth/update-profile`  | 🔒 Bearer | Update name / phone / address / profile image |
| 6   | PUT    | `/auth/change-password` | 🔒 Bearer | Change password (requires old password)       |
| 7   | POST   | `/auth/forgot-password` | Public    | Request password reset OTP                    |
| 8   | POST   | `/auth/verify-otp`      | Public    | Verify reset OTP, returns resetToken          |
| 9   | POST   | `/auth/reset-password`  | Public    | Reset password using resetToken               |
| 10  | POST   | `/auth/logout`          | 🔒 Bearer | Invalidate token server-side                  |

---

## Password Reset Flow (Step-by-Step)

```
1. POST /auth/forgot-password   { email }                              → OTP sent
2. POST /auth/verify-otp        { email, otp }                         → resetToken
3. POST /auth/reset-password    { resetToken, newPassword,
                                  confirmedPassword }                  → success
4. POST /auth/login             { email, newPassword }                 → new token
```

---

## Common Error Responses

| Code  | Meaning                                      |
| ----- | -------------------------------------------- |
| `400` | Validation error / bad input                 |
| `401` | Missing / invalid / expired token            |
| `403` | Forbidden — email not verified or wrong role |
| `404` | Resource not found                           |
| `409` | Conflict — email already registered          |
| `500` | Internal server error                        |

---

## 1. Register

**POST** `{{baseUrl}}/auth/register`

**Body (JSON):**

```json
{
  "name": "John Doe",
  "phoneNumber": "+1234567890",
  "email": "john@example.com",
  "password": "secret123",
  "confirmedPassword": "secret123",
  "address": "123 Main St",
  "profileImage": "https://example.com/avatar.jpg"
}
```

> `address` and `profileImage` are optional.

**Success Response `201`:**

```json
{
  "success": true,
  "message": "Registration successful.",
  "data": {
    "user": { "id": "...", "name": "John Doe", "email": "john@example.com", "role": "USER", ... },
    "token": "<jwt>"
  }
}
```

**Tests (Postman Scripts tab):**

```js
pm.environment.set("token", pm.response.json().data.token);
```

---

## 2. Login

**POST** `{{baseUrl}}/auth/login`

**Body (JSON):**

```json
{
  "email": "john@example.com",
  "password": "secret123"
}
```

**Success Response `200`:**

```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "user": { ... },
    "token": "<jwt>"
  }
}
```

**Tests:**

```js
pm.environment.set("token", pm.response.json().data.token);
```

---

## 3. Get Own Profile

**GET** `{{baseUrl}}/auth/me`

**Headers:**

```
Authorization: Bearer {{token}}
```

**Success Response `200`:**

```json
{
  "success": true,
  "message": "Profile retrieved.",
  "data": { "id": "...", "name": "John Doe", "email": "john@example.com", ... }
}
```

## dsds

## 4. Update Profile

**PUT** `{{baseUrl}}/auth/update-profile`

**Headers:**

```
Authorization: Bearer {{token}}
```

**Body (JSON)** — all fields optional, send only what you want to change:

```json
{
  "name": "John Updated",
  "phoneNumber": "+9876543210",
  "address": "456 New Street",
  "profileImage": "https://example.com/new-avatar.jpg"
}
```

**Success Response `200`:**

```json
{
  "success": true,
  "message": "Profile updated.",
  "data": { "id": "...", "name": "John Updated", ... }
}
```

---

## 5. Change Password

**PUT** `{{baseUrl}}/auth/change-password`

**Headers:**

```
Authorization: Bearer {{token}}
```

**Body (JSON):**

```json
{
  "oldPassword": "secret123",
  "newPassword": "newSecret456",
  "confirmedPassword": "newSecret456"
}
```

**Success Response `200`:**

```json
{
  "success": true,
  "message": "Password changed successfully.",
  "data": null
}
```

**Error cases:**

- `400` — Old password is incorrect
- `400` — New password and confirmed password do not match

---

## 6. Forgot Password

**POST** `{{baseUrl}}/auth/forgot-password`

**Body (JSON):**

```json
{
  "email": "john@example.com"
}
```

**Success Response `200`:**

```json
{
  "success": true,
  "message": "If this email is registered, an OTP has been sent.",
  "data": null
}
```

> Always returns 200 (prevents email enumeration).  
> Check the inbox for a 6-digit OTP. Valid for **10 minutes**.

---

## 7. Verify OTP

**POST** `{{baseUrl}}/auth/verify-otp`

**Body (JSON):**

```json
{
  "email": "john@example.com",
  "otp": "482931"
}
```

**Success Response `200`:**

```json
{
  "success": true,
  "message": "OTP verified. Use the resetToken to reset your password.",
  "data": {
    "resetToken": "<short-lived-jwt>"
  }
}
```

**Error cases:**

- `400` — Invalid or expired OTP

**Tests:**

```js
pm.environment.set("resetToken", pm.response.json().data.resetToken);
```

> `resetToken` is valid for **15 minutes**. Use it immediately in the next step.

---

## 8. Reset Password

**POST** `{{baseUrl}}/auth/reset-password`

**Body (JSON):**

```json
{
  "resetToken": "{{resetToken}}",
  "newPassword": "brandNew789",
  "confirmedPassword": "brandNew789"
}
```

**Success Response `200`:**

```json
{
  "success": true,
  "message": "Password reset successful. Please login.",
  "data": null
}
```

**Error cases:**

- `400` — Invalid or expired reset token
- `400` — Passwords do not match
- `400` — Reset token already used

---

## 9. Logout

**POST** `{{baseUrl}}/auth/logout`

**Headers:**

```
Authorization: Bearer {{token}}
```

**Success Response `200`:**

```json
{
  "success": true,
  "message": "Logged out successfully.",
  "data": null
}
```

> Logout **invalidates the token server-side** via `tokenVersion`. Any request with the old token will return `401`.

---

## Full Password Reset Flow (Step-by-Step)

```
1.  POST /forgot-password     { email }            → OTP sent to email
2.  POST /verify-otp          { email, otp }        → returns resetToken
3.  POST /reset-password      { resetToken,
                                newPassword,
                                confirmedPassword } → password updated
4.  POST /login               { email, newPassword} → get new access token
```

---

## Common Error Responses

| Code  | Meaning                             |
| ----- | ----------------------------------- |
| `400` | Validation error / bad input        |
| `401` | Missing / invalid / expired token   |
| `403` | Forbidden (wrong role)              |
| `404` | Resource not found                  |
| `409` | Conflict (email already registered) |
| `500` | Internal server error               |
