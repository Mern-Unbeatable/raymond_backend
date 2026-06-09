# Property API — Postman Testing Guide

**Live Base URL:** `https://backend1raymond.mtscorporate.com/api/v1`  
**Local Base URL:** `http://localhost:3000/api/v1`

> Admin endpoints require `Authorization: Bearer {{token}}` from the admin login.

---

## Endpoint Reference

| #   | Method | Endpoint                          | Auth     | Description                            |
| --- | ------ | --------------------------------- | -------- | -------------------------------------- |
| 1   | POST   | `/properties`                     | 🔒 Admin | Create property (with optional images) |
| 2   | GET    | `/properties`                     | Public   | List properties (filters + pagination) |
| 3   | GET    | `/properties/suggestions`         | Public   | Address autocomplete for map search    |
| 4   | GET    | `/properties/:id`                 | Public   | Get single property with images        |
| 5   | PUT    | `/properties/:id`                 | 🔒 Admin | Update property fields                 |
| 6   | DELETE | `/properties/:id`                 | 🔒 Admin | Delete property                        |
| 7   | POST   | `/properties/:id/images`          | 🔒 Admin | Add images to existing property        |
| 8   | DELETE | `/properties/:id/images/:imageId` | 🔒 Admin | Remove a single image                  |

---

## Enums

### `propertyType`

`DETACHED` · `SEMI_DETACHED` · `TERRACE` · `FLAT` · `BUNGALOW` · `OFFICE_SPACE` · `LAND` · `WAREHOUSE`

### `listingType`

`WHOLESALE` · `REGULAR`

---

## 1. Create Property

**POST** `{{baseUrl}}/properties`

**Headers:**

```
Authorization: Bearer {{token}}
```

> Accepts **`multipart/form-data`**. Use the `images` key for file uploads (up to 30 files).  
> All price/number fields are optional and should be omitted if not applicable.

### Form Fields

| Field                     | Type     | Required | Notes                                                                    |
| ------------------------- | -------- | -------- | ------------------------------------------------------------------------ |
| `title`                   | Text     | ✅       |                                                                          |
| `propertyType`            | Text     | ✅       | See enum above                                                           |
| `listingType`             | Text     | ✅       | `REGULAR` or `WHOLESALE`                                                 |
| `area`                    | Text     | ✅       | e.g. `"1200 sqft"`                                                       |
| `description`             | Text     | ✅       |                                                                          |
| `streetAddress`           | Text     | ✅       |                                                                          |
| `city`                    | Text     | ✅       |                                                                          |
| `state`                   | Text     | ✅       |                                                                          |
| `zipCode`                 | Text     | ✅       |                                                                          |
| `contactName`             | Text     | ✅       |                                                                          |
| `contactNumber`           | Text     | ✅       |                                                                          |
| `contactEmail`            | Text     | ✅       |                                                                          |
| `bedrooms`                | Text     | ❌       | Integer                                                                  |
| `bathrooms`               | Text     | ❌       | Integer                                                                  |
| `video`                   | **File** | ❌       | MP4 / MOV / AVI / MKV / WebM, max 60000 MB                               |
| `askingPrice`             | Text     | ❌       | For `REGULAR` listings                                                   |
| `purchasePrice`           | Text     | ❌       | For `WHOLESALE` listings                                                 |
| `estimatedRenovationCost` | Text     | ❌       | For `WHOLESALE` listings                                                 |
| `arv`                     | Text     | ❌       | After-repair value — `WHOLESALE`                                         |
| `discount`                | Text     | ❌       | Percentage — `WHOLESALE`                                                 |
| `images`                  | **File** | ❌       | JPEG / PNG / WebP, max 30 MB each, up to 30 files (combined max 5000 MB) |

**Success Response `201`:**

```json
{
  "success": true,
  "message": "Property created successfully.",
  "data": {
    "id": "a1b2c3d4-...",
    "title": "Modern Detached House",
    "propertyType": "DETACHED",
    "bedrooms": 3,
    "bathrooms": 2,
    "area": "1500 sqft",
    "description": "A beautiful modern home...",
    "streetAddress": "12 Oak Lane",
    "city": "Austin",
    "state": "TX",
    "zipCode": "73301",
    "video": "https://backend1raymond.mtscorporate.com/uploads/uuid-video.mp4",
    "listingType": "REGULAR",
    "askingPrice": "450000.00",
    "purchasePrice": null,
    "estimatedRenovationCost": null,
    "arv": null,
    "discount": null,
    "contactName": "Raymond",
    "contactNumber": "+1234567890",
    "contactEmail": "raymond@example.com",
    "latitude": 30.2672,
    "longitude": -97.7431,
    "createdAt": "2026-04-19T10:00:00.000Z",
    "updatedAt": "2026-04-19T10:00:00.000Z",
    "images": [
      {
        "id": "img-uuid-1",
        "url": "https://backend1raymond.mtscorporate.com/uploads/uuid1.jpg",
        "createdAt": "2026-04-19T10:00:00.000Z"
      }
    ]
  }
}
```

**Tests:**

```js
pm.environment.set("propertyId", pm.response.json().data.id);
```

> **Auto-geocoding:** When you create a property, the backend automatically geocodes the `streetAddress + city + state + zipCode` using OpenStreetMap and stores `latitude` + `longitude`. These are used for map display and location-radius search.

---

## 2. List Properties

**GET** `{{baseUrl}}/properties`

> Public endpoint. Supports filters and pagination via query parameters.

### Query Parameters

| Parameter      | Type   | Default | Notes                                                                                                                                  |
| -------------- | ------ | ------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `page`         | Number | `1`     |                                                                                                                                        |
| `limit`        | Number | `10`    | Max `100`                                                                                                                              |
| `propertyType` | String | —       | One or multiple types (repeat param). Values: `DETACHED` `SEMI_DETACHED` `TERRACE` `FLAT` `BUNGALOW` `OFFICE_SPACE` `LAND` `WAREHOUSE` |
| `listingType`  | String | —       | `REGULAR` or `WHOLESALE`                                                                                                               |
| `city`         | String | —       | Case-insensitive partial match                                                                                                         |
| `state`        | String | —       | Case-insensitive partial match                                                                                                         |
| `minPrice`     | Number | —       | Min price — applies to `askingPrice` (REGULAR) or `purchasePrice` (WHOLESALE)                                                          |
| `maxPrice`     | Number | —       | Max price                                                                                                                              |
| `latitude`     | Number | —       | Latitude of the search centre point (e.g. `30.2672`)                                                                                   |
| `longitude`    | Number | —       | Longitude of the search centre point (e.g. `-97.7431`)                                                                                 |
| `radius`       | Number | `50`    | Search radius in **km** (0.1 – 500). Only used when `latitude` + `longitude` are provided.                                             |

### Price Range Presets

| Label             | Query                           |
| ----------------- | ------------------------------- |
| All Prices        | _(omit minPrice & maxPrice)_    |
| Under $10,000     | `maxPrice=10000`                |
| $10,000 – $20,000 | `minPrice=10000&maxPrice=20000` |
| $20,000 – $30,000 | `minPrice=20000&maxPrice=30000` |
| $30,000 – $40,000 | `minPrice=30000&maxPrice=40000` |
| $40,000 – $60,000 | `minPrice=40000&maxPrice=60000` |
| $60,000 – $80,000 | `minPrice=60000&maxPrice=80000` |
| Above $80,000     | `minPrice=80000`                |

**Examples:**

```
GET {{baseUrl}}/properties
GET {{baseUrl}}/properties?minPrice=10000&maxPrice=20000
GET {{baseUrl}}/properties?propertyType=FLAT&listingType=REGULAR
GET {{baseUrl}}/properties?propertyType=DETACHED&propertyType=FLAT&minPrice=30000&maxPrice=60000
GET {{baseUrl}}/properties?listingType=REGULAR&city=Austin&page=1&limit=5
GET {{baseUrl}}/properties?latitude=30.2672&longitude=-97.7431&radius=30
GET {{baseUrl}}/properties?latitude=30.2672&longitude=-97.7431&radius=30&minPrice=10000&propertyType=FLAT
```

**Success Response `200`:**

```json
{
  "success": true,
  "message": "Properties retrieved.",
  "data": {
    "properties": [ ... ],
    "pagination": {
      "total": 42,
      "page": 1,
      "limit": 5,
      "totalPages": 9
    }
  }
}
```

---

## 3. Address Suggestions (for Map Search)

**GET** `{{baseUrl}}/properties/suggestions`

> Public — no auth required.  
> Type a partial location name to get autocomplete results. Use the returned `latitude` + `longitude` to then call `GET /properties` with location search.

### Query Parameters

| Parameter | Required | Notes                                                  |
| --------- | -------- | ------------------------------------------------------ |
| `q`       | ✅       | Partial address / city / location string (min 2 chars) |
| `limit`   | ❌       | Max results to return (1–10, default `8`)              |

**Examples:**

```
GET {{baseUrl}}/properties/suggestions?q=Palm Harbor
GET {{baseUrl}}/properties/suggestions?q=Austin TX&limit=5
GET {{baseUrl}}/properties/suggestions?q=Highland Lake
```

**Success Response `200`:**

```json
{
  "success": true,
  "message": "Suggestions retrieved.",
  "data": [
    {
      "display": "Palm Harbor, Pinellas County, Florida, United States",
      "type": "suburb",
      "latitude": 28.0783,
      "longitude": -82.7593
    },
    {
      "display": "Palm Harbor Marina, Palm Harbor, Florida, United States",
      "type": "marina",
      "latitude": 28.0712,
      "longitude": -82.7601
    }
  ]
}
```

**Postman workflow:**

1. Call `GET /suggestions?q=Palm Harbor` → pick a result
2. Copy `latitude` and `longitude` from that result
3. Call `GET /properties?latitude=28.0783&longitude=-82.7593&radius=25`

**Tests (auto-save first suggestion coords):**

```js
const data = pm.response.json().data;
if (data && data.length > 0) {
  pm.environment.set("searchLat", data[0].latitude);
  pm.environment.set("searchLng", data[0].longitude);
}
```

---

## 4. Get Single Property

**GET** `{{baseUrl}}/properties/:id`

> Public endpoint. Returns the full property object including all images.

**Example:**

```
GET {{baseUrl}}/properties/{{propertyId}}
```

**Success Response `200`:**

```json
{
  "success": true,
  "message": "Property retrieved.",
  "data": { ... }
}
```

**Error cases:**

- `404` — Property not found

---

## 5. Update Property

**PUT** `{{baseUrl}}/properties/{{propertyId}}`

**Headers:**

```
Authorization: Bearer {{token}}
Content-Type: application/json
```

> All fields are optional — send only what you want to change.  
> To manage images use endpoints #6 and #7.

**Body (JSON):**

```json
{
  "title": "Updated Title",
  "askingPrice": "480000.00",
  "city": "Dallas",
  "state": "TX"
}
```

**Success Response `200`:**

```json
{
  "success": true,
  "message": "Property updated.",
  "data": { ... }
}
```

---

## 6. Delete Property

**DELETE** `{{baseUrl}}/properties/{{propertyId}}`

**Headers:**

```
Authorization: Bearer {{token}}
```

> Deletes the property and all associated images (cascade).

**Success Response `200`:**

```json
{
  "success": true,
  "message": "Property deleted.",
  "data": null
}
```

---

## 7. Add Images to Property

**POST** `{{baseUrl}}/properties/{{propertyId}}/images`

**Headers:**

```
Authorization: Bearer {{token}}
```

> Accepts **`multipart/form-data`**. Use the `images` key for file uploads (up to 30 files).

| Key      | Type     | Required | Notes                                                                |
| -------- | -------- | -------- | -------------------------------------------------------------------- |
| `images` | **File** | ✅       | At least 1 — JPEG / PNG / WebP, max 30 MB each, combined max 5000 MB |

**Success Response `201`:**

```json
{
  "success": true,
  "message": "Images added.",
  "data": [
    {
      "id": "img-uuid-1",
      "url": "https://backend1raymond.mtscorporate.com/uploads/uuid1.jpg",
      "createdAt": "2026-04-19T10:05:00.000Z"
    },
    {
      "id": "img-uuid-2",
      "url": "https://backend1raymond.mtscorporate.com/uploads/uuid2.jpg",
      "createdAt": "2026-04-19T10:05:01.000Z"
    }
  ]
}
```

**Tests:**

```js
const images = pm.response.json().data;
if (images.length > 0) {
  pm.environment.set("imageId", images[0].id);
}
```

---

## 8. Delete a Single Image

**DELETE** `{{baseUrl}}/properties/{{propertyId}}/images/{{imageId}}`

**Headers:**

```
Authorization: Bearer {{token}}
```

**Example:**

```
DELETE {{baseUrl}}/properties/{{propertyId}}/images/{{imageId}}
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

- `404` — Image not found or doesn't belong to this property

---

## Notes

- **REGULAR listing** — typically uses `askingPrice`.
- **WHOLESALE listing** — typically uses `purchasePrice`, `estimatedRenovationCost`, `arv`, `discount`.
- Images are stored on the server under `/uploads/` and served as public URLs.
- Deleting a property automatically removes all its images from the database (cascade).
