# Forgot Password — Complete Process

## Overview

The password reset flow is split into **3 separate API calls**:

| Step | Route                               | Purpose                              |
| ---- | ----------------------------------- | ------------------------------------ |
| 1    | `POST /api/v1/auth/forgot-password` | Send OTP to user's email             |
| 2    | `POST /api/v1/auth/verify-otp`      | Verify OTP → receive `resetToken`    |
| 3    | `POST /api/v1/auth/reset-password`  | Use `resetToken` to set new password |

No authentication (Bearer token) is required for any of these three routes.

---

## Database: OtpToken Model

```prisma
model OtpToken {
  id         String   @id @default(uuid())
  email      String
  otp        String
  expiresAt  DateTime
  isVerified Boolean  @default(false)
  isUsed     Boolean  @default(false)
  createdAt  DateTime @default(now())
}
```

- `isVerified` — set to `true` after the user submits a correct OTP
- `isUsed` — set to `true` after the password is reset (or after a new OTP is requested, to invalidate old ones)
- `expiresAt` — 10 minutes from creation; OTP is rejected after this time

---

## Email Configuration

The project uses **Nodemailer** with Gmail SMTP to send OTP emails.

**File:** `utils/email.js`

```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=zaman.maktech@gmail.com
EMAIL_PASS=hbay bjsc wfrq ooss   ← Gmail App Password (not the account password)
EMAIL_FROM=zaman.maktech@gmail.com
```

The transporter is created once on startup:

```js
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST, // smtp.gmail.com
  port: Number(process.env.EMAIL_PORT), // 587
  secure: process.env.EMAIL_SECURE === "true", // false → STARTTLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Gmail App Password
  },
});
```

> **Note:** Gmail requires an **App Password** (not your Google account password).  
> Enable it at: Google Account → Security → 2-Step Verification → App passwords.

---

## Step 1 — POST /api/v1/auth/forgot-password

### Request

```
POST /api/v1/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

### What happens inside

**File:** `services/auth.service.js` → `forgotPassword()`

1. Look up the user by email in the database.
2. **If email is not found** — return silently (no error). This prevents **email enumeration** (attackers can't tell which emails are registered).
3. **Invalidate all previous unused OTPs** for this email:
   ```js
   await prisma.otpToken.updateMany({
     where: { email, isUsed: false },
     data: { isUsed: true },
   });
   ```
4. **Generate a new 5-digit OTP:**
   ```js
   const otp = Math.floor(10000 + Math.random() * 90000).toString();
   // e.g. "47382"
   ```
5. Set expiry to **10 minutes** from now:
   ```js
   const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
   ```
6. Save the OTP record to the `OtpToken` table:
   ```js
   await prisma.otpToken.create({
     data: { email, otp, expiresAt },
   });
   ```
7. Send the OTP email via Nodemailer:
   ```js
   await sendOtpEmail(email, otp, user.name);
   ```
   The email is HTML-formatted with the OTP displayed in large bold digits and includes a note that it expires in 10 minutes.

### Response

```json
{
  "success": true,
  "statusCode": 200,
  "message": "If this email is registered, an OTP has been sent."
}
```

> The response is always `200` regardless of whether the email exists — this is intentional to prevent email enumeration.

---

## Step 2 — POST /api/v1/auth/verify-otp

### Request

```
POST /api/v1/auth/verify-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "47382"
}
```

### Validation

- `email` — must be a valid email
- `otp` — must be exactly 5 digits

### What happens inside

**File:** `services/auth.service.js` → `verifyOtp()`

1. Look up the OTP record with all of these conditions:

   ```js
   {
     email,
     otp,
     isUsed: false,      // not already consumed
     isVerified: false,  // not already verified
     expiresAt: { gt: new Date() }, // not expired
   }
   ```

   If no matching record → **400 "Invalid or expired OTP."**

2. **Mark the OTP as verified** (not yet used — it is consumed only after the password is actually reset):

   ```js
   await prisma.otpToken.update({
     where: { id: record.id },
     data: { isVerified: true },
   });
   ```

3. **Issue a short-lived reset token** (JWT, expires in **15 minutes**):

   ```js
   const resetToken = jwt.sign(
     { email, otpId: record.id, purpose: "reset" },
     process.env.JWT_SECRET,
     { expiresIn: "15m" },
   );
   ```

   This token carries:
   - `email` — identifies which user is resetting
   - `otpId` — ties the token to the specific OTP record
   - `purpose: "reset"` — prevents using a regular login JWT to reset a password

4. Return the `resetToken` to the client.

### Response

```json
{
  "success": true,
  "statusCode": 200,
  "message": "OTP verified. Use the resetToken to reset your password.",
  "data": {
    "resetToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

> The client must store this `resetToken` temporarily and pass it in the next step.

---

## Step 3 — POST /api/v1/auth/reset-password

### Request

```
POST /api/v1/auth/reset-password
Authorization: Bearer <resetToken>
Content-Type: application/json

{
  "newPassword": "MyNewPass@123",
  "confirmedPassword": "MyNewPass@123"
}
```

The `resetToken` from Step 2 goes in the `Authorization` header as a Bearer token.

### Validation

- `newPassword` — minimum 3 characters
- `confirmedPassword` — required

### What happens inside

**File:** `services/auth.service.js` → `resetPassword()`

1. **Check passwords match:**

   ```js
   if (newPassword !== confirmedPassword)
     throw Error("Passwords do not match.");
   ```

2. **Extract resetToken from the Authorization header:**

   ```js
   const resetToken = authHeader.startsWith("Bearer ")
     ? authHeader.slice(7)
     : null;
   ```

   If missing → **401 "Reset token is required in Authorization header."**

3. **Verify and decode the JWT:**

   ```js
   decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
   ```

   If invalid or expired → **400 "Invalid or expired reset token."**

4. **Check `purpose: "reset"`** to ensure this is not a normal login token being misused:

   ```js
   if (decoded.purpose !== "reset") throw Error("Invalid reset token.");
   ```

5. **Fetch the OTP record** using `decoded.otpId` and `decoded.email`, ensuring it is still valid:

   ```js
   {
     id: decoded.otpId,
     email: decoded.email,
     isVerified: true,  // must have been verified in Step 2
     isUsed: false,     // must not have been consumed already
   }
   ```

   If not found → **400 "Reset token has already been used or is invalid."**

6. **Hash and save the new password:**

   ```js
   const hashed = await bcrypt.hash(newPassword, 12);
   await prisma.user.update({
     where: { email: decoded.email },
     data: { password: hashed },
   });
   ```

7. **Consume the OTP** so it cannot be reused:
   ```js
   await prisma.otpToken.update({
     where: { id: record.id },
     data: { isUsed: true },
   });
   ```

### Response

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Password reset successful. Please login."
}
```

The user must now log in with their new password.

---

## Full Flow Diagram

```
Client                              Server                          Gmail SMTP
  |                                    |                               |
  |  POST /auth/forgot-password        |                               |
  |  { email: "user@example.com" }     |                               |
  |----------------------------------->|                               |
  |                        1. Find user by email                       |
  |                        2. Invalidate old OTPs                      |
  |                        3. Generate 5-digit OTP                     |
  |                        4. Save OtpToken (expires 10 min)           |
  |                        5. sendOtpEmail()                           |
  |                                    |------------------------------>|
  |                                    |     SMTP send HTML email      |
  |                                    |<------------------------------|
  |  200 "OTP has been sent"           |
  |<-----------------------------------|
  |                                    |
  |  (user checks email, gets OTP)     |
  |                                    |
  |  POST /auth/verify-otp             |
  |  { email, otp: "47382" }           |
  |----------------------------------->|
  |                        1. Find OtpToken (not expired, not used)    |
  |                        2. Mark OtpToken isVerified = true          |
  |                        3. Sign JWT { email, otpId, purpose:"reset"}|
  |                           (expires 15 min)                         |
  |  200 { resetToken: "eyJ..." }      |
  |<-----------------------------------|
  |                                    |
  |  POST /auth/reset-password         |
  |  Authorization: Bearer <resetToken>|
  |  { newPassword, confirmedPassword }|
  |----------------------------------->|
  |                        1. Verify passwords match                   |
  |                        2. jwt.verify(resetToken)                   |
  |                        3. Check purpose === "reset"                |
  |                        4. Find OtpToken (isVerified=true,          |
  |                           isUsed=false)                            |
  |                        5. bcrypt.hash(newPassword, 12)             |
  |                        6. Update user.password in DB               |
  |                        7. Mark OtpToken isUsed = true              |
  |  200 "Password reset successful"   |
  |<-----------------------------------|
  |                                    |
  |  (user logs in with new password)  |
```

---

## Security Measures

| Threat               | Protection                                                                                    |
| -------------------- | --------------------------------------------------------------------------------------------- |
| Email enumeration    | Always return `200` from `/forgot-password` even if email doesn't exist                       |
| OTP brute force      | OTP expires in 10 minutes; only the latest OTP is valid (old ones invalidated on new request) |
| OTP reuse            | `isUsed: true` set after password reset; `isVerified: true` prevents re-verification          |
| Reset token misuse   | JWT has `purpose: "reset"` field; regular login JWTs are rejected                             |
| Reset token expiry   | Reset token (JWT) expires in 15 minutes                                                       |
| OTP record tampering | `otpId` is embedded in the JWT; tampered IDs won't match                                      |
| Password storage     | Hashed with `bcrypt` at cost factor `12`                                                      |
