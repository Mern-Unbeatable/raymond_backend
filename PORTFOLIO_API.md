# Portfolio API — Postman Testing Guide

**Live Base URL:** `https://backend1raymond.mtscorporate.com/api/v1`  
**Local Base URL:** `http://localhost:3000/api/v1`

---

## Endpoint Reference

| #   | Method | Endpoint                          | Auth     | Who                                      |
| --- | ------ | --------------------------------- | -------- | ---------------------------------------- |
| 1   | POST   | `/portfolios/:propertyId`         | 🔒 Admin | Create portfolio + upload gallery images |
| 2   | GET    | `/portfolios`                     | Public   | List all portfolios (paginated)          |
| 3   | GET    | `/portfolios/:id`                 | Public   | Get single portfolio                     |
| 4   | PUT    | `/portfolios/:id`                 | 🔒 Admin | Update portfolio details                 |
| 5   | DELETE | `/portfolios/:id`                 | 🔒 Admin | Delete portfolio + all images            |
| 6   | POST   | `/portfolios/:id/images`          | 🔒 Admin | Add gallery images                       |
| 7   | DELETE | `/portfolios/:id/images/:imageId` | 🔒 Admin | Remove a gallery image                   |

---

## 1. Create Portfolio

**POST** `{{baseUrl}}/portfolios/{{propertyId}}`

**Headers:**

```
Authorization: Bearer {{token}}
```

**Body: `form-data`**

| Field               | Type    | Required | Notes                                             |
| ------------------- | ------- | -------- | ------------------------------------------------- |
| `title`             | text    | ✅       | e.g. "The Skyline Penthouse"                      |
| `description`       | text    | ✅       | Short summary                                     |
| `projectOverview`   | text    | ✅       | Detailed overview paragraph                       |
| `location`          | text    | ✅       | e.g. "Dhaka, BD"                                  |
| `propertyType`      | text    | ✅       | e.g. "Penthouse"                                  |
| `area`              | text    | ✅       | e.g. "3200 sqft"                                  |
| `duration`          | text    | ✅       | e.g. "6 Months"                                   |
| `budget`            | text    | ❌       | e.g. "₹1.5 Crore"                                 |
| `roi`               | text    | ❌       | e.g. "35%"                                        |
| `tags`              | text    | ❌       | Comma-separated: "Interior Design,Premium Design" |
| `featuredHighlight` | text    | ✅       | Bullet points (newline-separated)                 |
| `images`            | File(s) | ❌       | Up to 20 images (JPEG/PNG/WebP, 5MB each)         |

**Success Response `201`:**

```json
{
  "success": true,
  "message": "Portfolio created.",
  "data": {
    "id": "portfolio-uuid",
    "title": "The Skyline Penthouse",
    "description": "...",
    "projectOverview": "...",
    "location": "Dhaka, BD",
    "propertyType": "Penthouse",
    "area": "3200 sqft",
    "duration": "6 Months",
    "budget": "₹1.5 Crore",
    "roi": "35%",
    "tags": ["Interior Design", "Premium Design", "Renovation"],
    "featuredHighlight": "Open-concept living\nPremium materials\nNatural lighting",
    "propertyId": "property-uuid",
    "createdAt": "...",
    "updatedAt": "...",
    "gallery": [
      {
        "id": "img-uuid",
        "url": "https://backend1raymond.mtscorporate.com/uploads/xxx.jpg",
        "createdAt": "..."
      }
    ],
    "property": {
      "id": "property-uuid",
      "title": "Skyline Penthouse Property",
      "propertyType": "FLAT",
      "listingType": "WHOLESALE",
      "city": "Dhaka",
      "state": "BD",
      "purchasePrice": "850000.00",
      "estimatedRenovationCost": "50000.00",
      "arv": "1100000.00",
      "askingPrice": null
    }
  }
}
```

**Tests:**

```js
pm.environment.set("portfolioId", pm.response.json().data.id);
```

**Error cases:**

- `400` — Validation failed
- `404` — Property not found
- `409` — Portfolio already exists for this property

---

## 2. List All Portfolios

**GET** `{{baseUrl}}/portfolios`

> Public — no auth required.

### Query Parameters (optional)

| Parameter | Default | Notes                                  |
| --------- | ------- | -------------------------------------- |
| `page`    | `1`     | Page number                            |
| `limit`   | `9`     | Items per page (matches 3-column grid) |

**Examples:**

```
GET {{baseUrl}}/portfolios
GET {{baseUrl}}/portfolios?page=2&limit=9
```

**Success Response `200`:**

```json
{
  "success": true,
  "message": "Portfolios retrieved.",
  "data": {
    "portfolios": [ { ... }, { ... } ],
    "pagination": {
      "total": 12,
      "page": 1,
      "limit": 9,
      "totalPages": 2
    }
  }
}
```

---

## 3. Get Single Portfolio

**GET** `{{baseUrl}}/portfolios/{{portfolioId}}`

> Public — no auth required.  
> Returns full portfolio including linked **property data** (purchasePrice, estimatedRenovationCost, ARV) for the PROJECT RESULTS section.

**Success Response `200`:**

```json
{
  "success": true,
  "message": "Portfolio retrieved.",
  "data": {
    "id": "portfolio-uuid",
    "title": "The Skyline Penthouse",
    "description": "...",
    "projectOverview": "...",
    "location": "Dhaka, BD",
    "propertyType": "Penthouse",
    "area": "3200 sqft",
    "duration": "6 Months",
    "budget": "₹1.5 Crore",
    "roi": "35%",
    "tags": ["Interior Design", "Premium Design"],
    "featuredHighlight": "Open-concept living\nPremium materials",
    "gallery": [ { "id": "...", "url": "...", "createdAt": "..." } ],
    "property": {
      "purchasePrice": "850000.00",
      "estimatedRenovationCost": "50000.00",
      "arv": "1100000.00",
      ...
    }
  }
}
```

---

## 4. Update Portfolio

**PUT** `{{baseUrl}}/portfolios/{{portfolioId}}`

> All fields are optional — send only what you want to update.  
> To manage gallery images, use endpoints 6 and 7.

**Headers:**

```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body (JSON) — all optional:**

```json
{
  "title": "Updated Title",
  "description": "Updated description...",
  "projectOverview": "Updated overview...",
  "location": "Austin, TX",
  "propertyType": "Penthouse",
  "area": "3500 sqft",
  "duration": "8 Months",
  "budget": "₹2 Crore",
  "roi": "40%",
  "tags": "Interior Design,Modern Architecture",
  "featuredHighlight": "New highlight 1\nNew highlight 2"
}
```

**Success Response `200`:**

```json
{
  "success": true,
  "message": "Portfolio updated.",
  "data": { ... }
}
```

---

## 5. Delete Portfolio

**DELETE** `{{baseUrl}}/portfolios/{{portfolioId}}`

**Headers:**

```
Authorization: Bearer {{token}}
```

> Deletes the portfolio and all its gallery images from disk.

**Success Response `200`:**

```json
{
  "success": true,
  "message": "Portfolio deleted.",
  "data": null
}
```

---

## 6. Add Gallery Images

**POST** `{{baseUrl}}/portfolios/{{portfolioId}}/images`

**Headers:**

```
Authorization: Bearer {{token}}
```

**Body: `form-data`**

| Field    | Type    | Notes                                     |
| -------- | ------- | ----------------------------------------- |
| `images` | File(s) | Up to 20 images (JPEG/PNG/WebP, 5MB each) |

**Success Response `200`:**

```json
{
  "success": true,
  "message": "Images added to portfolio.",
  "data": {
    "id": "portfolio-uuid",
    "gallery": [
      { "id": "img-uuid-1", "url": "...", "createdAt": "..." },
      { "id": "img-uuid-2", "url": "...", "createdAt": "..." }
    ],
    ...
  }
}
```

**Tests:**

```js
const gallery = pm.response.json().data.gallery;
pm.environment.set("portfolioImageId", gallery[gallery.length - 1].id);
```

---

## 7. Delete Gallery Image

**DELETE** `{{baseUrl}}/portfolios/{{portfolioId}}/images/{{portfolioImageId}}`

**Headers:**

```
Authorization: Bearer {{token}}
```

**Success Response `200`:**

```json
{
  "success": true,
  "message": "Image deleted.",
  "data": null
}
```

**Error cases:**

- `404` — Image not found or doesn't belong to this portfolio

---

## Project Results Data (from linked Property)

The `property` object in the response contains the financial data for the **PROJECT RESULTS** section:

| UI Label                     | API Field                          | Source         |
| ---------------------------- | ---------------------------------- | -------------- |
| Purchase price               | `property.purchasePrice`           | Property model |
| Estimated renovation cost    | `property.estimatedRenovationCost` | Property model |
| ARV (After Renovation Value) | `property.arv`                     | Property model |

---

## Common Error Responses

| Code  | Meaning                                    |
| ----- | ------------------------------------------ |
| `400` | Validation error                           |
| `401` | Missing or invalid token                   |
| `403` | Not admin                                  |
| `404` | Portfolio or image not found               |
| `409` | Portfolio already exists for this property |
