# Postman Testing Guide — Consultation

## Base URL

```
https://backend1raymond.maktechgroup.tech/api/v1
```

Set a Postman **Environment Variable**:

- `baseUrl` = `https://backend1raymond.maktechgroup.tech/api/v1`
- `adminToken` = _(paste token after admin login — see step below)_

---

## Prerequisites

### Admin Login (get `adminToken`)

```
POST {{baseUrl}}/auth/login
Content-Type: application/json

{
  "email": "admin@raymond.com",
  "password": "Admin@1234"
}
```

> Copy the `token` from the response and save it to the `adminToken` environment variable.

---

## Consultation Endpoints

### 1. Submit Consultation Request (Public — no login required)

```
POST {{baseUrl}}/consultations
Content-Type: application/json

{
  "fullName": "Alice Johnson",
  "email": "alice@example.com",
  "phoneNumber": "+1234567890",
  "preferredConsultationDate": "2026-06-15T00:00:00.000Z",
  "preferredTime": "10:00 AM",
  "additionalInformation": "I am interested in buying a 3-bedroom property in central London."
}
```

**Required fields:**
| Field | Type | Notes |
|---|---|---|
| `fullName` | string | Required |
| `email` | string | Required, valid email format |
| `phoneNumber` | string | Required |

**Optional fields:**
| Field | Type | Notes |
|---|---|---|
| `preferredConsultationDate` | string (ISO 8601) | e.g. `2026-06-15T00:00:00.000Z` |
| `preferredTime` | string | e.g. `10:00 AM`, `Afternoon`, etc. |
| `additionalInformation` | string | Any extra details |

**Expected Response (201):**

```json
{
  "success": true,
  "message": "Consultation request submitted successfully.",
  "data": {
    "id": "uuid-here",
    "fullName": "Alice Johnson",
    "email": "alice@example.com",
    "phoneNumber": "+1234567890",
    "preferredConsultationDate": "2026-06-15T00:00:00.000Z",
    "preferredTime": "10:00 AM",
    "additionalInformation": "I am interested in buying a 3-bedroom property in central London.",
    "createdAt": "2026-05-12T10:00:00.000Z"
  }
}
```

> Save the returned `id` as `consultationId` for use in the admin endpoints below.

---

### 2. Submit with Required Fields Only (minimal request)

```
POST {{baseUrl}}/consultations
Content-Type: application/json

{
  "fullName": "Bob Smith",
  "email": "bob@example.com",
  "phoneNumber": "+0987654321"
}
```

---

### 3. List All Consultations (Admin)

```
GET {{baseUrl}}/consultations
Authorization: Bearer {{adminToken}}
```

**Query params (optional):**

| Param   | Default | Description    |
| ------- | ------- | -------------- |
| `page`  | `1`     | Page number    |
| `limit` | `10`    | Items per page |

**Example with pagination:**

```
GET {{baseUrl}}/consultations?page=1&limit=5
Authorization: Bearer {{adminToken}}
```

**Expected Response (200):**

```json
{
  "success": true,
  "message": "Consultations fetched successfully.",
  "data": {
    "consultations": [ ... ],
    "pagination": {
      "total": 12,
      "page": 1,
      "limit": 10,
      "totalPages": 2
    }
  }
}
```

---

### 4. Get Single Consultation (Admin)

```
GET {{baseUrl}}/consultations/:id
Authorization: Bearer {{adminToken}}
```

Replace `:id` with the `consultationId` saved earlier.

**Expected Response (200):**

```json
{
  "success": true,
  "message": "Consultation fetched successfully.",
  "data": {
    "id": "uuid-here",
    "fullName": "Alice Johnson",
    "email": "alice@example.com",
    "phoneNumber": "+1234567890",
    "preferredConsultationDate": "2026-06-15T00:00:00.000Z",
    "preferredTime": "10:00 AM",
    "additionalInformation": "I am interested in buying a 3-bedroom property in central London.",
    "createdAt": "2026-05-12T10:00:00.000Z"
  }
}
```

---

### 5. Delete Consultation (Admin)

```
DELETE {{baseUrl}}/consultations/:id
Authorization: Bearer {{adminToken}}
```

Replace `:id` with the `consultationId` to delete.

**Expected Response (200):**

```json
{
  "success": true,
  "message": "Consultation deleted successfully.",
  "data": null
}
```

---

## Validation Error Examples

### Missing required field

```
POST {{baseUrl}}/consultations
Content-Type: application/json

{
  "fullName": "Alice Johnson",
  "phoneNumber": "+1234567890"
}
```

**Response (400):**

```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": [
    {
      "msg": "A valid email address is required.",
      "path": "email",
      "location": "body"
    }
  ]
}
```

### Invalid date format

```
POST {{baseUrl}}/consultations
Content-Type: application/json

{
  "fullName": "Alice Johnson",
  "email": "alice@example.com",
  "phoneNumber": "+1234567890",
  "preferredConsultationDate": "not-a-date"
}
```

**Response (400):**

```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": [
    {
      "msg": "Preferred consultation date must be a valid ISO 8601 date.",
      "path": "preferredConsultationDate",
      "location": "body"
    }
  ]
}
```

### Accessing admin endpoint without token

```
GET {{baseUrl}}/consultations
```

**Response (401):** Unauthorized

---

## Quick Test Checklist

- [ ] Submit consultation with all fields → 201
- [ ] Submit consultation with required fields only → 201
- [ ] Submit without `email` → 400 validation error
- [ ] Submit without `fullName` → 400 validation error
- [ ] Submit without `phoneNumber` → 400 validation error
- [ ] Submit with invalid date → 400 validation error
- [ ] List all (admin token) → 200 with pagination
- [ ] List all (no token) → 401
- [ ] Get single by valid ID (admin token) → 200
- [ ] Get single by invalid ID (admin token) → 404
- [ ] Delete by valid ID (admin token) → 200
- [ ] Delete by invalid ID (admin token) → 404
