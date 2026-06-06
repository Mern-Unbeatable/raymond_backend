# Property Location & Map Search Guide

**Live Base URL:** `https://backend1raymond.mtscorporate.com/api/v1`  
**Local Base URL:** `http://localhost:3000/api/v1`

> When you create or update a property, the backend **automatically geocodes** the address using OpenStreetMap and stores `latitude` + `longitude`. No extra step needed.

---

## How It Works

```
Create Property (streetAddress + city + state + zipCode)
        ↓
Backend auto-calls OpenStreetMap Nominatim
        ↓
Stores latitude + longitude on the property
        ↓
Frontend can show property pin on map
        ↓
User searches "Palm Harbor" → GET /suggestions → picks location
        ↓
GET /properties?latitude=28.07&longitude=-82.75&radius=30
        ↓
Returns all properties within 30 km of that point
```

---

## Step 1 — Create a Property with a Real Address

**POST** `{{baseUrl}}/properties`

**Headers:**

```
Authorization: Bearer {{token}}
```

**Body: `form-data`**

> Use real addresses so geocoding works correctly.

### Example A — REGULAR listing (asking price)

| Field           | Value                                            |
| --------------- | ------------------------------------------------ |
| `title`         | Palm Harbor Family Home                          |
| `propertyType`  | `DETACHED`                                       |
| `listingType`   | `REGULAR`                                        |
| `bedrooms`      | 3                                                |
| `bathrooms`     | 2                                                |
| `area`          | 1500 sqft                                        |
| `description`   | Beautiful family home in a peaceful neighborhood |
| `streetAddress` | 2699 Dream Valley                                |
| `city`          | Highland Lake                                    |
| `state`         | FL                                               |
| `zipCode`       | 33813                                            |
| `askingPrice`   | 2095.00                                          |
| `contactName`   | Raymond                                          |
| `contactNumber` | +1234567890                                      |
| `contactEmail`  | raymond@example.com                              |
| `images`        | _(optional: attach image files)_                 |

### Example B — WHOLESALE listing (investment deal)

| Field                     | Value                              |
| ------------------------- | ---------------------------------- |
| `title`                   | Beverly Springfield Investment     |
| `propertyType`            | `SEMI_DETACHED`                    |
| `listingType`             | `WHOLESALE`                        |
| `bedrooms`                | 4                                  |
| `bathrooms`               | 2                                  |
| `area`                    | 2000 sqft                          |
| `description`             | Great wholesale deal with high ROI |
| `streetAddress`           | 2821 Lake Seville                  |
| `city`                    | Palm Harbor                        |
| `state`                   | TX                                 |
| `zipCode`                 | 77001                              |
| `purchasePrice`           | 2095.00                            |
| `estimatedRenovationCost` | 5000.00                            |
| `arv`                     | 12000.00                           |
| `discount`                | 10                                 |
| `contactName`             | Raymond                            |
| `contactNumber`           | +1234567890                        |
| `contactEmail`            | raymond@example.com                |

**Success Response `201`:**

```json
{
  "success": true,
  "message": "Property created successfully.",
  "data": {
    "id": "a1b2c3d4-uuid",
    "title": "Palm Harbor Family Home",
    "propertyType": "DETACHED",
    "listingType": "REGULAR",
    "streetAddress": "2699 Dream Valley",
    "city": "Highland Lake",
    "state": "FL",
    "zipCode": "33813",
    "latitude": 27.9881,
    "longitude": -81.8773,
    "askingPrice": "2095.00",
    "images": [],
    ...
  }
}
```

> `latitude` and `longitude` are **auto-filled** — you don't send them. The backend geocodes the address automatically.

**Tests:**

```js
pm.environment.set("propertyId", pm.response.json().data.id);
pm.environment.set("propertyLat", pm.response.json().data.latitude);
pm.environment.set("propertyLng", pm.response.json().data.longitude);
```

---

## Step 2 — Get Address Suggestions (Map Search Autocomplete)

**GET** `{{baseUrl}}/properties/suggestions?q={{searchQuery}}`

> Public — no auth needed.  
> User types a location in the search box → frontend calls this → shows dropdown → user picks one → search by radius.

### Query Parameters

| Parameter | Required | Notes                                    |
| --------- | -------- | ---------------------------------------- |
| `q`       | ✅       | Partial location name (min 2 characters) |
| `limit`   | ❌       | Number of results (1–10, default `8`)    |

**Test Requests:**

```
GET {{baseUrl}}/properties/suggestions?q=Palm Harbor
GET {{baseUrl}}/properties/suggestions?q=Highland Lake FL
GET {{baseUrl}}/properties/suggestions?q=Austin Texas
GET {{baseUrl}}/properties/suggestions?q=123 main st Florida
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

**Tests (save first suggestion for next step):**

```js
const data = pm.response.json().data;
if (data && data.length > 0) {
  pm.environment.set("searchLat", data[0].latitude);
  pm.environment.set("searchLng", data[0].longitude);
  console.log("Location:", data[0].display);
}
```

---

## Step 3 — Search Properties by Location + Radius

**GET** `{{baseUrl}}/properties?latitude={{searchLat}}&longitude={{searchLng}}&radius=30`

> Returns all properties within `radius` km of the given coordinates.

### All Location + Filter Options

| Parameter      | Type   | Default | Notes                                     |
| -------------- | ------ | ------- | ----------------------------------------- |
| `latitude`     | Number | —       | Centre point latitude (from suggestions)  |
| `longitude`    | Number | —       | Centre point longitude (from suggestions) |
| `radius`       | Number | `50`    | Search radius in **km** (0.1 – 500)       |
| `propertyType` | String | —       | Filter by type (can repeat)               |
| `listingType`  | String | —       | `REGULAR` or `WHOLESALE`                  |
| `minPrice`     | Number | —       | Minimum asking/purchase price             |
| `maxPrice`     | Number | —       | Maximum asking/purchase price             |
| `page`         | Number | `1`     |                                           |
| `limit`        | Number | `10`    | Max `100`                                 |

### Test Requests

**All properties near Palm Harbor (50 km radius):**

```
GET {{baseUrl}}/properties?latitude=28.0783&longitude=-82.7593
```

**Properties within 25 km:**

```
GET {{baseUrl}}/properties?latitude=28.0783&longitude=-82.7593&radius=25
```

**Detached homes within 30 km under $50,000:**

```
GET {{baseUrl}}/properties?latitude=28.0783&longitude=-82.7593&radius=30&propertyType=DETACHED&maxPrice=50000
```

**Multiple property types near location:**

```
GET {{baseUrl}}/properties?latitude=28.0783&longitude=-82.7593&radius=30&propertyType=FLAT&propertyType=DETACHED
```

**Using saved environment variables (after Step 2 tests):**

```
GET {{baseUrl}}/properties?latitude={{searchLat}}&longitude={{searchLng}}&radius=30
```

**Success Response `200`:**

```json
{
  "success": true,
  "message": "Properties retrieved.",
  "data": {
    "properties": [
      {
        "id": "uuid",
        "title": "Palm Harbor Family Home",
        "latitude": 27.9881,
        "longitude": -81.8773,
        "city": "Highland Lake",
        "state": "FL",
        "askingPrice": "2095.00",
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

## Full Postman Flow (Copy-Paste Order)

| #   | Request                                                                                                         | Purpose                                              |
| --- | --------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| 1   | `POST /properties` (form-data, real address)                                                                    | Create property → auto-geocodes → saves `propertyId` |
| 2   | `GET /properties/suggestions?q=Palm Harbor`                                                                     | Get location coords → saves `searchLat`, `searchLng` |
| 3   | `GET /properties?latitude={{searchLat}}&longitude={{searchLng}}&radius=30`                                      | Find nearby properties on map                        |
| 4   | `GET /properties?latitude={{searchLat}}&longitude={{searchLng}}&radius=30&propertyType=DETACHED&maxPrice=50000` | Filtered map search                                  |

---

## Radius Reference

| Radius   | Approx Coverage                  |
| -------- | -------------------------------- |
| `5` km   | Walking distance / neighbourhood |
| `10` km  | Local area                       |
| `25` km  | City-wide                        |
| `50` km  | Regional (default)               |
| `100` km | County/state area                |

---

## Notes

- Properties with **no coordinates** (address couldn't be geocoded) are **excluded** from location-radius search but still appear in normal text-based searches (`city`, `state`).
- Geocoding uses [OpenStreetMap Nominatim](https://nominatim.openstreetmap.org) — works best with real, recognisable addresses.
- If geocoding fails silently, `latitude` and `longitude` will be `null` in the response.
