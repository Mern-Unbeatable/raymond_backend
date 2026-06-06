# Postman Testing Guide — Investment

## Base URL

```
https://backend1raymond.maktechgroup.tech/api/v1
```

Set Postman **Environment Variables**:

- `baseUrl` = `https://backend1raymond.maktechgroup.tech/api/v1`
- `adminToken` = _(paste token after admin login)_
- `investmentId` = _(paste id from create investment response)_
- `applicationId` = _(paste id from submit application response)_

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

> Copy the `token` → save to `adminToken`.

---

## Part 1 — Investment Opportunities (Admin manages)

---

### 1. Create Investment Opportunity (Admin)

```
POST {{baseUrl}}/investments
Authorization: Bearer {{adminToken}}
Content-Type: application/json

{
  "title": "Residential Property Development",
  "description": "Ground-up construction of single-family and multi-family properties in high-growth markets.",
  "targetRoi": "20-35%",
  "timeline": "12-18 months",
  "minimumInvestment": "$100K"
}
```

**Expected Response (201):**

```json
{
  "success": true,
  "message": "Investment created successfully.",
  "data": {
    "id": "uuid-here",
    "title": "Residential Property Development",
    "description": "Ground-up construction of single-family and multi-family properties in high-growth markets.",
    "targetRoi": "20-35%",
    "timeline": "12-18 months",
    "minimumInvestment": "$100K",
    "createdAt": "2026-05-12T10:00:00.000Z",
    "updatedAt": "2026-05-12T10:00:00.000Z"
  }
}
```

> Save the `id` → `investmentId`.

---

### 2. Create with Required Fields Only

```
POST {{baseUrl}}/investments
Authorization: Bearer {{adminToken}}
Content-Type: application/json

{
  "title": "Commercial Office Space Fund",
  "description": "Acquiring and managing premium commercial office spaces in urban business districts."
}
```

---

### 3. List All Investment Opportunities (Public)

```
GET {{baseUrl}}/investments
```

**With pagination:**

```
GET {{baseUrl}}/investments?page=1&limit=5
```

**Expected Response (200):**

```json
{
  "success": true,
  "message": "Investments fetched successfully.",
  "data": {
    "investments": [ ... ],
    "pagination": {
      "total": 2,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
}
```

---

### 4. Get Single Investment Opportunity (Public)

```
GET {{baseUrl}}/investments/{{investmentId}}
```

**Expected Response (200):**

```json
{
  "success": true,
  "message": "Investment fetched successfully.",
  "data": {
    "id": "...",
    "title": "Residential Property Development",
    "description": "...",
    "targetRoi": "20-35%",
    "timeline": "12-18 months",
    "minimumInvestment": "$100K",
    "applications": [ ... ],
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

> Note: `applications` array is included — shows all users who applied.

---

### 5. Update Investment Opportunity (Admin)

```
PUT {{baseUrl}}/investments/{{investmentId}}
Authorization: Bearer {{adminToken}}
Content-Type: application/json

{
  "targetRoi": "25-40%",
  "timeline": "18-24 months",
  "minimumInvestment": "$150K"
}
```

> All fields are optional — only send what you want to update.

**Expected Response (200):**

```json
{
  "success": true,
  "message": "Investment updated successfully.",
  "data": {
    "id": "...",
    "targetRoi": "25-40%",
    "timeline": "18-24 months",
    "minimumInvestment": "$150K",
    ...
  }
}
```

---

### 6. Delete Investment Opportunity (Admin)

```
DELETE {{baseUrl}}/investments/{{investmentId}}
Authorization: Bearer {{adminToken}}
```

**Expected Response (200):**

```json
{
  "success": true,
  "message": "Investment deleted successfully.",
  "data": null
}
```

---

## Part 2 — Investment Applications (Users submit)

---

### 7. Submit Application — Linked to Investment (Public)

```
POST {{baseUrl}}/investments/applications
Content-Type: application/json

{
  "fullName": "Alice Johnson",
  "email": "alice@example.com",
  "phoneNumber": "+1234567890",
  "investmentInterest": "Residential Development, New Construction",
  "message": "Share your investment goals and financial objectives...",
  "investmentId": "{{investmentId}}"
}
```

**Expected Response (201):**

```json
{
  "success": true,
  "message": "Investment application submitted successfully.",
  "data": {
    "id": "uuid-here",
    "fullName": "Alice Johnson",
    "email": "alice@example.com",
    "phoneNumber": "+1234567890",
    "investmentInterest": "Residential Development, New Construction",
    "message": "Share your investment goals and financial objectives...",
    "investmentId": "...",
    "investment": {
      "id": "...",
      "title": "Residential Property Development",
      ...
    },
    "createdAt": "2026-05-12T10:00:00.000Z"
  }
}
```

> Save the `id` → `applicationId`.

---

### 8. Submit Application — Without Linking to Investment (Public)

```
POST {{baseUrl}}/investments/applications
Content-Type: application/json

{
  "fullName": "Bob Smith",
  "email": "bob@example.com",
  "phoneNumber": "+0987654321",
  "investmentInterest": "Commercial Office Space",
  "message": "I am interested in long-term commercial investments."
}
```

---

### 9. Submit Application — Required Fields Only (Public)

```
POST {{baseUrl}}/investments/applications
Content-Type: application/json

{
  "fullName": "Carol White",
  "email": "carol@example.com",
  "phoneNumber": "+1122334455"
}
```

---

### 10. List All Applications (Admin)

```
GET {{baseUrl}}/investments/applications
Authorization: Bearer {{adminToken}}
```

**With pagination:**

```
GET {{baseUrl}}/investments/applications?page=1&limit=10
Authorization: Bearer {{adminToken}}
```

**Expected Response (200):**

```json
{
  "success": true,
  "message": "Investment applications fetched successfully.",
  "data": {
    "applications": [
      {
        "id": "...",
        "fullName": "Alice Johnson",
        "investment": { "title": "Residential Property Development", ... },
        ...
      }
    ],
    "pagination": {
      "total": 3,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
}
```

---

### 11. Get Single Application (Admin)

```
GET {{baseUrl}}/investments/applications/{{applicationId}}
Authorization: Bearer {{adminToken}}
```

**Expected Response (200):**

```json
{
  "success": true,
  "message": "Investment application fetched successfully.",
  "data": {
    "id": "...",
    "fullName": "Alice Johnson",
    "email": "alice@example.com",
    "phoneNumber": "+1234567890",
    "investmentInterest": "Residential Development, New Construction",
    "message": "...",
    "investment": { ... },
    "createdAt": "..."
  }
}
```

---

### 12. Delete Application (Admin)

```
DELETE {{baseUrl}}/investments/applications/{{applicationId}}
Authorization: Bearer {{adminToken}}
```

**Expected Response (200):**

```json
{
  "success": true,
  "message": "Investment application deleted successfully.",
  "data": null
}
```

---

## Validation Error Examples

### Missing `title` on create investment

```
POST {{baseUrl}}/investments
Authorization: Bearer {{adminToken}}
Content-Type: application/json

{
  "description": "Some description"
}
```

**Response (400):**

```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": [
    { "msg": "Title is required.", "path": "title", "location": "body" }
  ]
}
```

### Missing required field on application

```
POST {{baseUrl}}/investments/applications
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

### Invalid `investmentId` (not a UUID)

```
POST {{baseUrl}}/investments/applications
Content-Type: application/json

{
  "fullName": "Alice Johnson",
  "email": "alice@example.com",
  "phoneNumber": "+1234567890",
  "investmentId": "not-a-uuid"
}
```

**Response (400):**

```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": [
    {
      "msg": "investmentId must be a valid UUID.",
      "path": "investmentId",
      "location": "body"
    }
  ]
}
```

### Non-existent investment ID

```
GET {{baseUrl}}/investments/non-existent-id
```

**Response (404):**

```json
{
  "success": false,
  "message": "Investment not found.",
  "errors": null
}
```

### Admin endpoint without token

```
GET {{baseUrl}}/investments/applications
```

**Response (401):** Unauthorized

---

## Quick Test Checklist

**Investment Opportunities:**

- [ ] Create investment (admin, all fields) → 201
- [ ] Create investment (admin, required only) → 201
- [ ] Create investment (no token) → 401
- [ ] Create investment without `title` → 400
- [ ] List all investments (public, no token needed) → 200
- [ ] Get single by valid ID → 200 (includes `applications` array)
- [ ] Get single by invalid ID → 404
- [ ] Update investment (admin) → 200
- [ ] Delete investment (admin) → 200
- [ ] Delete already-deleted → 404

**Investment Applications:**

- [ ] Submit application with `investmentId` (public) → 201, includes linked investment
- [ ] Submit application without `investmentId` (public) → 201
- [ ] Submit required fields only → 201
- [ ] Submit without `email` → 400
- [ ] Submit without `phoneNumber` → 400
- [ ] Submit with invalid `investmentId` format → 400
- [ ] Submit with non-existent `investmentId` → 404
- [ ] List all applications (admin) → 200 with pagination
- [ ] List applications (no token) → 401
- [ ] Get single application by valid ID (admin) → 200
- [ ] Get single application by invalid ID (admin) → 404
- [ ] Delete application (admin) → 200
