# Postman Testing Guide

## Base URL

```
https://backend1raymond.maktechgroup.tech/api/v1
```

Set a Postman **Environment Variable**:

- `baseUrl` = `https://backend1raymond.maktechgroup.tech/api/v1`
- `adminToken` = _(paste token after admin login)_
- `userToken` = _(paste token after user login)_

---

## Auth

### Register

```
POST {{baseUrl}}/auth/register
Content-Type: multipart/form-data

name          = John Doe          (required)
phoneNumber   = +1234567890       (required)
email         = john@example.com  (required)
password      = password123       (required, min 6)
address       = 123 Main St       (optional)
postcode      = SW1A 1AA          (optional)
profileImage  = <file>            (optional)
```

### Login

```
POST {{baseUrl}}/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

> Copy the `token` from response → save to `userToken` variable.

### Admin Login

```
POST {{baseUrl}}/auth/login
Content-Type: application/json

{
  "email": "admin@raymond.com",
  "password": "Admin@1234"
}
```

> Copy the `token` → save to `adminToken` variable.

### Get My Profile

```
GET {{baseUrl}}/auth/me
Authorization: Bearer {{userToken}}
```

### Update Profile

```
PUT {{baseUrl}}/auth/update-profile
Authorization: Bearer {{userToken}}
Content-Type: multipart/form-data

name         = Updated Name  (optional)
phoneNumber  = +9876543210   (optional)
address      = New Address   (optional)
postcode     = EC1A 1BB      (optional)
profileImage = <file>        (optional)
```

### Change Password

```
PUT {{baseUrl}}/auth/change-password
Authorization: Bearer {{userToken}}
Content-Type: application/json

{
  "oldPassword": "password123",
  "newPassword": "newpass456",
  "confirmedPassword": "newpass456"
}
```

### Forgot Password (sends OTP email)

```
POST {{baseUrl}}/auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

### Verify OTP

```
POST {{baseUrl}}/auth/verify-otp
Content-Type: application/json

{
  "email": "john@example.com",
  "otp": "47382"
}
```

> Copy `resetToken` from response.

### Reset Password

```
POST {{baseUrl}}/auth/reset-password
Authorization: Bearer <resetToken>
Content-Type: application/json

{
  "newPassword": "newpass789",
  "confirmedPassword": "newpass789"
}
```

### Logout

```
POST {{baseUrl}}/auth/logout
Authorization: Bearer {{userToken}}
```

---

## Properties

### Create Property (Admin)

```
POST {{baseUrl}}/properties
Authorization: Bearer {{adminToken}}
Content-Type: multipart/form-data

title                  = Luxury Villa           (required)
propertyType           = DETACHED               (required) DETACHED|SEMI_DETACHED|TERRACE|FLAT|BUNGALOW|OFFICE_SPACE|LAND|WAREHOUSE
listingType            = REGULAR                (required) REGULAR|WHOLESALE
area                   = 2500 sqft              (required)
description            = Beautiful property...  (required)
streetAddress          = 10 Oak Street          (required)
city                   = Tampa                  (required)
state                  = FL                     (required)
zipCode                = 33601                  (required)
contactName            = Raymond Agent          (required)
contactNumber          = +18001234567           (required)
contactEmail           = agent@raymond.com      (required)
bedrooms               = 4                      (optional)
bathrooms              = 3                      (optional)
askingPrice            = 450000                 (optional, for REGULAR)
purchasePrice          = 300000                 (optional, for WHOLESALE)
estimatedRenovationCost= 50000                  (optional)
arv                    = 420000                 (optional)
discount               = 20000                  (optional)
images                 = <file(s)>              (optional, up to 20)
video                  = <file>                 (optional)
```

### List Properties (Public)

```
GET {{baseUrl}}/properties

Query params (all optional):
  page          = 1
  limit         = 10
  propertyType  = DETACHED          (repeatable: ?propertyType=FLAT&propertyType=DETACHED)
  listingType   = REGULAR
  city          = Tampa
  state         = FL
  location      = Tampa             (free-text: searches city/state/address/zip)
  minPrice      = 100000
  maxPrice      = 500000
  latitude      = 27.9506
  longitude     = -82.4572
  radius        = 25                (km, default 50)
```

### Get Property (Public)

```
GET {{baseUrl}}/properties/:id
```

### Location Suggestions (Public)

```
GET {{baseUrl}}/properties/suggestions?q=Tampa&limit=5
```

### Update Property (Admin)

```
PUT {{baseUrl}}/properties/:id
Authorization: Bearer {{adminToken}}
Content-Type: application/json

{
  "title": "Updated Title",
  "askingPrice": "480000"
}
```

### Add Images to Property (Admin)

```
POST {{baseUrl}}/properties/:id/images
Authorization: Bearer {{adminToken}}
Content-Type: multipart/form-data

images = <file(s)>
```

### Delete Image (Admin)

```
DELETE {{baseUrl}}/properties/:id/images/:imageId
Authorization: Bearer {{adminToken}}
```

### Delete Property (Admin)

```
DELETE {{baseUrl}}/properties/:id
Authorization: Bearer {{adminToken}}
```

---

## Portfolio

### Create Portfolio (Admin)

```
POST {{baseUrl}}/portfolios
Authorization: Bearer {{adminToken}}
Content-Type: multipart/form-data

title             = The Skyline Penthouse       (required)
description       = A premium renovation...     (required)
projectOverview   = Describe the overall...     (required)
location          = Highland Lake               (required)
propertyType      = DETACHED                    (required) DETACHED|SEMI_DETACHED|TERRACE|FLAT|BUNGALOW|OFFICE_SPACE|LAND|WAREHOUSE
area              = 3,400 sq ft                 (required)
duration          = 6 Months                    (required)
featuredHighlight = Open floor plan, marble...  (required)
budget            = $280,000                    (optional)
roi               = 18%                         (optional)
images            = <file(s)>                   (optional, up to 20)
```

### List Portfolios (Public)

```
GET {{baseUrl}}/portfolios?page=1&limit=9
```

### Get Portfolio (Public)

```
GET {{baseUrl}}/portfolios/:id
```

### Update Portfolio (Admin)

```
PUT {{baseUrl}}/portfolios/:id
Authorization: Bearer {{adminToken}}
Content-Type: application/json

{
  "title": "Updated Title",
  "budget": "$500,000"
}
```

### Add Images to Portfolio (Admin)

```
POST {{baseUrl}}/portfolios/:id/images
Authorization: Bearer {{adminToken}}
Content-Type: multipart/form-data

images = <file(s)>
```

### Delete Portfolio Image (Admin)

```
DELETE {{baseUrl}}/portfolios/:id/images/:imageId
Authorization: Bearer {{adminToken}}
```

### Delete Portfolio (Admin)

```
DELETE {{baseUrl}}/portfolios/:id
Authorization: Bearer {{adminToken}}
```

---

## Inquiries

### Submit Inquiry (Public / Optional Auth)

```
POST {{baseUrl}}/inquiries/:propertyId
Content-Type: application/json

{
  "fullName": "Jane Smith",
  "email": "jane@example.com",
  "phoneNumber": "+1234567890",
  "message": "I am interested in this property."
}
```

### My Inquiries (Authenticated User)

```
GET {{baseUrl}}/inquiries/my
Authorization: Bearer {{userToken}}
```

### List All Inquiries (Admin)

```
GET {{baseUrl}}/inquiries
Authorization: Bearer {{adminToken}}

Query params (optional):
  status = NEW | CONTRACTED | CLOSED
```

### Get Inquiry (Admin)

```
GET {{baseUrl}}/inquiries/:id
Authorization: Bearer {{adminToken}}
```

### Update Inquiry Status (Admin)

```
PATCH {{baseUrl}}/inquiries/:id/status
Authorization: Bearer {{adminToken}}
Content-Type: application/json

{
  "status": "CONTRACTED"
}
```

### Delete Inquiry (Admin)

```
DELETE {{baseUrl}}/inquiries/:id
Authorization: Bearer {{adminToken}}
```

---

## Fee Builder

### Submit Fee Builder Request (Public)

```
POST {{baseUrl}}/fee-builder
Content-Type: application/json

{
  "fullName": "Alice Johnson",
  "email": "alice@example.com",
  "phone": "+1234567890",
  "projectType": "ARCHITECTURAL_PLANNING",
  "estimatedBudget": "$500K - $1M",
  "projectDescription": "Looking to build a custom home with 4 bedrooms."
}
```

> **projectType values:** `ARCHITECTURAL_PLANNING` | `CUSTOM_HOME_BUILD` | `DESIGN_BUILD_MANAGEMENT` | `TURNKEY_FINISH`

### List All Requests (Admin)

```
GET {{baseUrl}}/fee-builder
Authorization: Bearer {{adminToken}}

Query params (optional):
  page  = 1
  limit = 10
```

### Get Single Request (Admin)

```
GET {{baseUrl}}/fee-builder/:id
Authorization: Bearer {{adminToken}}
```

### Delete Request (Admin)

```
DELETE {{baseUrl}}/fee-builder/:id
Authorization: Bearer {{adminToken}}
```

---

## New Construction

### Create Construction (Admin)

```
POST {{baseUrl}}/constructions
Authorization: Bearer {{adminToken}}
Content-Type: multipart/form-data

title              = Skyline Residences    (required)
price              = 350000               (optional)
bedrooms           = 3                    (optional)
bathrooms          = 2                    (optional)
area               = 1800 sqft            (optional)
developer          = Raymond Developers   (optional)
location           = Miami, FL            (optional)
description        = Luxury apartments... (optional)
expectedRoi        = 15%                  (optional)
areaGrowth         = 8% per year          (optional)
atBooking          = Initial deposit 5%   (optional)
foundationComplete = Foundation 20%       (optional)
structureComplete  = Structure 20%        (optional)
ninetyDaysHandover = Pre-completion 30%   (optional)
atCompletion       = Final payment 25%    (optional)
paymentNote        = Flexible terms...    (optional)
images             = <file(s)>            (optional, up to 20)
```

### List Constructions (Public)

```
GET {{baseUrl}}/constructions?page=1&limit=10
```

### Get Construction (Public)

```
GET {{baseUrl}}/constructions/:id
```

> Response includes `registrations` array.

### Update Construction (Admin)

```
PUT {{baseUrl}}/constructions/:id
Authorization: Bearer {{adminToken}}
Content-Type: multipart/form-data

title  = Updated Title   (optional)
price  = 380000          (optional)
images = <file(s)>       (optional, replaces current images)
```

### Delete Construction (Admin)

```
DELETE {{baseUrl}}/constructions/:id
Authorization: Bearer {{adminToken}}
```

### Register Interest in Construction (Public)

```
POST {{baseUrl}}/constructions/:id/register
Content-Type: application/json

{
  "fullName": "Bob Williams",
  "email": "bob@example.com",
  "phoneNumber": "+9876543210"
}
```

### List Registrations for a Construction (Admin)

```
GET {{baseUrl}}/constructions/:id/registrations
Authorization: Bearer {{adminToken}}

Query params (optional):
  page  = 1
  limit = 10
```

---

## Renovation

### Submit Renovation Request (Public)

```
POST {{baseUrl}}/renovations
Content-Type: application/json

{
  "fullName": "Carol White",
  "email": "carol@example.com",
  "phoneNumber": "+1122334455",
  "propertyLocation": "45 Elm Street, Orlando, FL",
  "propertyType": "FLAT",
  "renovationType": "KITCHEN_RENOVATION",
  "budgetRange": "$20,000 - $50,000",
  "projectDetails": "Full kitchen renovation including new cabinets and countertops."
}
```

> **propertyType values:** `DETACHED` | `SEMI_DETACHED` | `TERRACE` | `FLAT` | `BUNGALOW` | `OFFICE_SPACE` | `LAND` | `WAREHOUSE`

> **renovationType values:** `KITCHEN_RENOVATION` | `BATHROOM_REMODELING` | `FULL_HOME_MAKEOVER` | `OFFICE_RENOVATION`

### List All Requests (Admin)

```
GET {{baseUrl}}/renovations
Authorization: Bearer {{adminToken}}

Query params (optional):
  page  = 1
  limit = 10
```

### Get Single Request (Admin)

```
GET {{baseUrl}}/renovations/:id
Authorization: Bearer {{adminToken}}
```

### Delete Request (Admin)

```
DELETE {{baseUrl}}/renovations/:id
Authorization: Bearer {{adminToken}}
```

---

## Chat

### Create or Get Chat Room

```
POST {{baseUrl}}/chat/rooms
Authorization: Bearer {{userToken}}
Content-Type: application/json

{
  "participantId": "<other-user-id>"
}
```

### List My Chat Rooms

```
GET {{baseUrl}}/chat/rooms
Authorization: Bearer {{userToken}}
```

### Get Messages in a Room

```
GET {{baseUrl}}/chat/rooms/:roomId/messages?page=1&limit=20
Authorization: Bearer {{userToken}}
```

### Send Message (REST fallback)

```
POST {{baseUrl}}/chat/rooms/:roomId/messages
Authorization: Bearer {{userToken}}
Content-Type: application/json

{
  "content": "Hello!"
}
```

### Mark Messages as Read

```
PATCH {{baseUrl}}/chat/rooms/:roomId/read
Authorization: Bearer {{userToken}}
```

---

## Health Check

```
GET https://backend1raymond.maktechgroup.tech/health
```

Expected response:

```json
{
  "status": "OK",
  "message": "Raymond backend is running.",
  "timestamp": "2026-05-11T10:00:00.000Z"
}
```

---

## Common Response Format

### Success

```json
{
  "success": true,
  "message": "...",
  "data": { ... }
}
```

### Error

```json
{
  "success": false,
  "message": "...",
  "errors": [ ... ]
}
```

---

## HTTP Status Codes

| Code | Meaning                         |
| ---- | ------------------------------- |
| 200  | OK                              |
| 201  | Created                         |
| 400  | Validation error                |
| 401  | Unauthorized / invalid token    |
| 403  | Forbidden (not admin)           |
| 404  | Not found                       |
| 409  | Conflict (e.g. duplicate email) |
| 500  | Server error                    |
