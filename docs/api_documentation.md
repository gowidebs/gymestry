# GoGym API Documentation

## Base URL
`https://api.gogym.com/v1`

## Authentication
All authenticated endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### Gyms

#### GET /gyms/nearby
Get nearby gyms based on location
```json
POST /gyms/nearby
{
  "latitude": 25.2048,
  "longitude": 55.2708,
  "radius": 10
}

Response:
{
  "gyms": [
    {
      "gymId": "uuid",
      "name": "Fitness First",
      "description": "Premium fitness center",
      "address": "Dubai Mall, Dubai",
      "latitude": 25.1972,
      "longitude": 55.2744,
      "rating": 4.5,
      "phone": "+971501234567",
      "images": ["url1", "url2"]
    }
  ]
}
```

#### GET /gyms/{gymId}
Get gym details
```json
Response:
{
  "gym": {
    "gymId": "uuid",
    "name": "Fitness First",
    "description": "Premium fitness center",
    "address": "Dubai Mall, Dubai",
    "latitude": 25.1972,
    "longitude": 55.2744,
    "rating": 4.5,
    "phone": "+971501234567",
    "images": ["url1", "url2"],
    "classes": [
      {
        "classId": "uuid",
        "name": "Morning Yoga",
        "type": "yoga",
        "duration": 60,
        "capacity": 20,
        "price": 50
      }
    ]
  }
}
```

### Bookings

#### POST /bookings
Create a new booking
```json
{
  "userId": "uuid",
  "scheduleId": "uuid",
  "classId": "uuid"
}

Response:
{
  "booking": {
    "bookingId": "uuid",
    "userId": "uuid",
    "scheduleId": "uuid",
    "classId": "uuid",
    "status": "confirmed",
    "bookingDate": "2024-01-15T10:00:00Z"
  }
}
```

#### GET /bookings/user/{userId}
Get user bookings
```json
Response:
{
  "bookings": [
    {
      "bookingId": "uuid",
      "userId": "uuid",
      "scheduleId": "uuid",
      "classId": "uuid",
      "status": "confirmed",
      "bookingDate": "2024-01-15T10:00:00Z"
    }
  ]
}
```

#### PUT /bookings/{bookingId}/cancel
Cancel a booking
```json
Response:
{
  "booking": {
    "bookingId": "uuid",
    "status": "cancelled"
  }
}
```

## Error Responses
```json
{
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

## Status Codes
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Internal Server Error