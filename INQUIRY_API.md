# Inquiry API — Postman Testing Guide

**Live Base URL:** `https://backend1raymond.mtscorporate.com/api/v1`  
**Local Base URL:** `http://localhost:3000/api/v1`

---

## Endpoint Reference

| #   | Method | Endpoint                | Auth          | Who                                   |
| --- | ------ | ----------------------- | ------------- | ------------------------------------- |
| 1   | POST   | `/inquiries`            | Optional      | Anyone (guest or logged-in user)      |
| 2   | GET    | `/inquiries/my`         | 🔒 User/Admin | Authenticated user — own inquiries    |
| 3   | GET    | `/inquiries`            | 🔒 Admin      | All inquiries (with optional filters) |
| 4   | GET    | `/inquiries/:id`        | 🔒 User/Admin | Admin or inquiry owner                |
| 5   | PATCH  | `/inquiries/:id/status` | 🔒 Admin      | Update inquiry status                 |
| 6   | DELETE | `/inquiries/:id`        | 🔒 Admin      | Delete inquiry                        |

---

## Status Values

| Status       | Meaning                     |
| ------------ | --------------------------- |
| `NEW`        | Just submitted (default)    |
| `CONTRACTED` | In progress / deal underway |
| `CLOSED`     | Completed or rejected       |

---

## 1. Submit Inquiry

**POST** `{{baseUrl}}/inquiries/propertyId`

> Works for **guests** (no token) and **logged-in users** (with token).  
> If a Bearer token is provided, the inquiry is automatically linked to that user.

**Headers (optional — for logged-in users):**

```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body (JSON):**

```json
{

  "fullName": "John Doe",
  "email": "john@example.com",
  "phoneNumber": "+1234567890",
  "message": "I am interested in this property. Please contact me."
}
```

**Success Response `201`:**

```json
{
  "success": true,
  "message": "Inquiry submitted successfully.",
  "data": {
    "id": "inquiry-uuid",
    "fullName": "John Doe",
    "email": "john@example.com",
    "phoneNumber": "+1234567890",
    "message": "I am interested in this property. Please contact me.",
    "status": "NEW",
    "propertyId": "property-uuid",
    "userId": "user-uuid-or-null",
    "createdAt": "2026-04-20T10:00:00.000Z",
    "updatedAt": "2026-04-20T10:00:00.000Z",
    "property": {
      "id": "property-uuid",
      "title": "Modern Detached House",
      "propertyType": "DETACHED",
      "listingType": "REGULAR",
      "city": "Austin",
      "state": "TX"
    },
    "user": null
  }
}
```

**Tests:**

```js
pm.environment.set("inquiryId", pm.response.json().data.id);
```

**Error cases:**

- `400` — Validation failed (missing required fields)
- `404` — Property not found

---

## 2. Get My Inquiries

**GET** `{{baseUrl}}/inquiries/my`

**Headers:**

```
Authorization: Bearer {{token}}
```

> Returns all inquiries submitted by the currently authenticated user.

**Success Response `200`:**

```json
{
  "success": true,
  "message": "Your inquiries retrieved.",
  "data": [
    {
      "id": "inquiry-uuid",
      "fullName": "John Doe",
      "status": "NEW",
      "createdAt": "...",
      "property": { "id": "...", "title": "Modern Detached House", ... },
      ...
    }
  ]
}
```

---

## 3. List All Inquiries (Admin)

**GET** `{{baseUrl}}/inquiries`

**Headers:**

```
Authorization: Bearer {{token}}
```

### Query Parameters (all optional)

| Parameter    | Values                          | Notes              |
| ------------ | ------------------------------- | ------------------ |
| `status`     | `NEW` / `CONTRACTED` / `CLOSED` | Filter by status   |
| `propertyId` | UUID                            | Filter by property |

**Examples:**

```
GET {{baseUrl}}/inquiries
GET {{baseUrl}}/inquiries?status=NEW
GET {{baseUrl}}/inquiries?status=CONTRACTED&propertyId={{propertyId}}
```

**Success Response `200`:**

```json
{
  "success": true,
  "message": "Inquiries retrieved.",
  "data": [
    {
      "id": "inquiry-uuid",
      "fullName": "John Doe",
      "email": "john@example.com",
      "phoneNumber": "+1234567890",
      "message": "...",
      "status": "NEW",
      "propertyId": "...",
      "userId": "...",
      "createdAt": "...",
      "updatedAt": "...",
      "property": {
        "id": "...",
        "title": "...",
        "city": "Austin",
        "state": "TX"
      },
      "user": {
        "id": "...",
        "name": "John Doe",
        "email": "...",
        "profileImage": null
      }
    }
  ]
}
```

---

## 4. Get Single Inquiry

**GET** `{{baseUrl}}/inquiries/{{inquiryId}}`

**Headers:**

```
Authorization: Bearer {{token}}
```

> Admin can view any inquiry. A regular user can only view their own.

**Success Response `200`:**

```json
{
  "success": true,
  "message": "Inquiry retrieved.",
  "data": { ... }
}
```

**Error cases:**

- `403` — Not your inquiry
- `404` — Inquiry not found

---

## 5. Update Inquiry Status (Admin)

**PATCH** `{{baseUrl}}/inquiries/{{inquiryId}}/status`

**Headers:**

```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body (JSON):**

```json
{
  "status": "CONTRACTED"
}
```

> Allowed values: `NEW`, `CONTRACTED`, `CLOSED`

**Success Response `200`:**

```json
{
  "success": true,
  "message": "Inquiry status updated.",
  "data": {
    "id": "inquiry-uuid",
    "status": "CONTRACTED",
    ...
  }
}
```

**Error cases:**

- `400` — Invalid status value
- `404` — Inquiry not found

---

## 6. Delete Inquiry (Admin)

**DELETE** `{{baseUrl}}/inquiries/{{inquiryId}}`

**Headers:**

```
Authorization: Bearer {{token}}
```

**Success Response `200`:**

```json
{
  "success": true,
  "message": "Inquiry deleted.",
  "data": null
}
```

**Error cases:**

- `404` — Inquiry not found

---

## Status Flow

```
Submit → NEW → CONTRACTED → CLOSED
              ↑______________↓  (admin can set any status freely)
```

---

## Common Error Responses

| Code  | Meaning                                         |
| ----- | ----------------------------------------------- |
| `400` | Validation error / invalid status               |
| `401` | Missing or invalid token                        |
| `403` | Not authorized (wrong role or not your inquiry) |
| `404` | Property or inquiry not found                   |
