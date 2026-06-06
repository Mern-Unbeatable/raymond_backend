# Postman Testing Guide — Mortgage Application

## Base URL

```
https://backend1raymond.maktechgroup.tech/api/v1
```

Set Postman **Environment Variables**:

- `baseUrl` = `https://backend1raymond.maktechgroup.tech/api/v1`
- `adminToken` = _(paste token after admin login)_
- `mortgageId` = _(paste id from submit response)_

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

> Copy the `token` from response → save to `adminToken`.

---

## Mortgage Application Endpoints

---

### 1. Submit Full Application (Public — no login required)

Includes personal info + both calculator snapshots.

```
POST {{baseUrl}}/mortgage-applications
Content-Type: application/json

{
  "fullName": "John Smith",
  "email": "john@email.com",
  "phoneNumber": "(503) 555-0142",

  "employmentStatus": "Employed Full-Time",
  "annualIncome": 95000,

  "desiredLoanAmount": 425000,
  "loanType": "Fixed Rate",
  "loanTerm": 30,
  "propertyType": "DETACHED",

  "mortgagePurchaseAmount": 800000,
  "mortgageDownPayment": 160000,
  "mortgageInterestRate": 6.5,
  "mortgageLoanTerm": 20,
  "mortgageEstMonthly": 4861.90,
  "mortgagePrincipalInterest": 4045.24,
  "mortgagePropertyTax": 666.66,
  "mortgageHomeInsurance": 150,

  "refinanceLoanAmount": 800000,
  "refinanceHomeValue": 1000000,
  "refinanceInterestRate": 6.5,
  "refinanceFico": 740,
  "refinanceLoanTerm": 14,
  "refinanceEstMonthly": 6033.33,
  "refinancePrincipalInterest": 5050,
  "refinancePropertyTax": 833.33,
  "refinanceHomeInsurance": 150,
  "refinanceHoa": 0,

  "message": "I'm looking to purchase my first family home in the Portland area. Please reach out at your earliest convenience."
}
```

**Expected Response (201):**

```json
{
  "success": true,
  "message": "Mortgage application submitted successfully.",
  "data": {
    "id": "uuid-here",
    "fullName": "John Smith",
    "email": "john@email.com",
    "phoneNumber": "(503) 555-0142",
    "employmentStatus": "Employed Full-Time",
    "annualIncome": "95000",
    "desiredLoanAmount": "425000",
    "loanType": "Fixed Rate",
    "loanTerm": 30,
    "propertyType": "DETACHED",
    "mortgagePurchaseAmount": "800000",
    "mortgageDownPayment": "160000",
    "mortgageInterestRate": "6.5",
    "mortgageLoanTerm": 20,
    "mortgageEstMonthly": "4861.9",
    "mortgagePrincipalInterest": "4045.24",
    "mortgagePropertyTax": "666.66",
    "mortgageHomeInsurance": "150",
    "refinanceLoanAmount": "800000",
    "refinanceHomeValue": "1000000",
    "refinanceInterestRate": "6.5",
    "refinanceFico": 740,
    "refinanceLoanTerm": 14,
    "refinanceEstMonthly": "6033.33",
    "refinancePrincipalInterest": "5050",
    "refinancePropertyTax": "833.33",
    "refinanceHomeInsurance": "150",
    "refinanceHoa": "0",
    "message": "I'm looking to purchase my first family home...",
    "createdAt": "2026-05-12T10:00:00.000Z"
  }
}
```

> Save the `id` value to the `mortgageId` environment variable.

---

### 2. Submit Required Fields Only (minimal)

```
POST {{baseUrl}}/mortgage-applications
Content-Type: application/json

{
  "fullName": "Jane Doe",
  "email": "jane@example.com",
  "phoneNumber": "+447911123456"
}
```

**Expected Response (201)** — all optional fields will be `null`.

---

### 3. Submit with Only Mortgage Calculator Snapshot

```
POST {{baseUrl}}/mortgage-applications
Content-Type: application/json

{
  "fullName": "Bob Wilson",
  "email": "bob@example.com",
  "phoneNumber": "+12025551234",
  "desiredLoanAmount": 640000,
  "loanType": "Fixed Rate",
  "loanTerm": 30,
  "propertyType": "SEMI_DETACHED",
  "mortgagePurchaseAmount": 800000,
  "mortgageDownPayment": 160000,
  "mortgageInterestRate": 6.5,
  "mortgageLoanTerm": 30,
  "mortgageEstMonthly": 4861.90,
  "mortgagePrincipalInterest": 4045.24,
  "mortgagePropertyTax": 666.67,
  "mortgageHomeInsurance": 150,
  "message": "Interested in a fixed rate mortgage."
}
```

---

### 4. List All Applications (Admin)

```
GET {{baseUrl}}/mortgage-applications
Authorization: Bearer {{adminToken}}
```

**With pagination:**

```
GET {{baseUrl}}/mortgage-applications?page=1&limit=5
Authorization: Bearer {{adminToken}}
```

**Expected Response (200):**

```json
{
  "success": true,
  "message": "Mortgage applications fetched successfully.",
  "data": {
    "applications": [ ... ],
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

### 5. Get Single Application (Admin)

```
GET {{baseUrl}}/mortgage-applications/{{mortgageId}}
Authorization: Bearer {{adminToken}}
```

**Expected Response (200):**

```json
{
  "success": true,
  "message": "Mortgage application fetched successfully.",
  "data": {
    "id": "...",
    "fullName": "John Smith",
    ...all fields...
  }
}
```

---

### 6. Delete Application (Admin)

```
DELETE {{baseUrl}}/mortgage-applications/{{mortgageId}}
Authorization: Bearer {{adminToken}}
```

**Expected Response (200):**

```json
{
  "success": true,
  "message": "Mortgage application deleted successfully.",
  "data": null
}
```

---

## propertyType Enum Values

```
DETACHED | SEMI_DETACHED | TERRACE | FLAT | BUNGALOW | OFFICE_SPACE | LAND | WAREHOUSE
```

---

## Validation Error Examples

### Missing required field (`fullName`)

```
POST {{baseUrl}}/mortgage-applications
Content-Type: application/json

{
  "email": "john@email.com",
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
      "msg": "Full name is required.",
      "path": "fullName",
      "location": "body"
    }
  ]
}
```

### Invalid FICO score (must be 300–850)

```
POST {{baseUrl}}/mortgage-applications
Content-Type: application/json

{
  "fullName": "John Smith",
  "email": "john@email.com",
  "phoneNumber": "+1234567890",
  "refinanceFico": 900
}
```

**Response (400):**

```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": [
    {
      "msg": "FICO score must be between 300 and 850.",
      "path": "refinanceFico",
      "location": "body"
    }
  ]
}
```

### Invalid propertyType

```
POST {{baseUrl}}/mortgage-applications
Content-Type: application/json

{
  "fullName": "John Smith",
  "email": "john@email.com",
  "phoneNumber": "+1234567890",
  "propertyType": "INVALID_TYPE"
}
```

**Response (400):**

```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": [
    {
      "msg": "propertyType must be one of: DETACHED, SEMI_DETACHED, ...",
      "path": "propertyType",
      "location": "body"
    }
  ]
}
```

### Admin endpoint without token

```
GET {{baseUrl}}/mortgage-applications
```

**Response (401):** Unauthorized

### Non-existent ID

```
GET {{baseUrl}}/mortgage-applications/non-existent-id
Authorization: Bearer {{adminToken}}
```

**Response (404):**

```json
{
  "success": false,
  "message": "Mortgage application not found.",
  "errors": null
}
```

---

## Quick Test Checklist

- [ ] Submit full application (all fields) → 201
- [ ] Submit required fields only → 201
- [ ] Submit without `fullName` → 400
- [ ] Submit without `email` → 400
- [ ] Submit without `phoneNumber` → 400
- [ ] Submit with invalid `propertyType` → 400
- [ ] Submit with `refinanceFico` = 900 → 400
- [ ] List all applications (admin token) → 200 with pagination
- [ ] List applications (no token) → 401
- [ ] Get single by valid ID (admin token) → 200
- [ ] Get single by invalid ID (admin token) → 404
- [ ] Delete by valid ID (admin token) → 200
- [ ] Delete already-deleted ID (admin token) → 404
