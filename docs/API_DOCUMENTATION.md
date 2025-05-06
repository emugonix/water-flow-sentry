# API Documentation

## Authentication Endpoints

### POST /api/register

Registers a new user in the system.

**Request Body:**
```json
{
  "username": "johndoe",
  "password": "securepassword",
  "email": "john@example.com",
  "fullName": "John Doe"
}
```

**Response:**
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "fullName": "John Doe",
  "createdAt": "2023-05-06T12:00:00.000Z"
}
```

### POST /api/login

Authenticates a user and creates a session.

**Request Body:**
```json
{
  "username": "johndoe",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "fullName": "John Doe"
}
```

### POST /api/logout

Logs out the current user and destroys the session.

**Response:**
```
Status: 200 OK
```

### GET /api/user

Retrieves the currently authenticated user's information.

**Response:**
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "fullName": "John Doe"
}
```

## Sensor Data Endpoints

### GET /api/sensors

Retrieves all sensors in the system.

**Response:**
```json
[
  {
    "id": 1,
    "name": "Main Inlet",
    "location": "Basement",
    "type": "flow",
    "status": "online",
    "installDate": "2023-01-15T00:00:00.000Z"
  },
  {
    "id": 2,
    "name": "Kitchen Line",
    "location": "First Floor",
    "type": "flow",
    "status": "online",
    "installDate": "2023-01-16T00:00:00.000Z"
  }
]
```

### GET /api/readings

Retrieves sensor readings with optional filtering.

**Query Parameters:**
- `sensorId` (optional): Filter by sensor ID
- `from` (optional): Start timestamp (ISO format)
- `to` (optional): End timestamp (ISO format)
- `limit` (optional): Maximum number of readings to return

**Response:**
```json
[
  {
    "id": 101,
    "sensorId": 1,
    "value": 5.7,
    "timestamp": "2023-05-06T11:00:00.000Z",
    "unit": "L/min"
  },
  {
    "id": 102,
    "sensorId": 1,
    "value": 5.8,
    "timestamp": "2023-05-06T11:01:00.000Z",
    "unit": "L/min"
  }
]
```

## Valve Control Endpoints

### GET /api/valve

Retrieves the current valve status.

**Response:**
```json
{
  "id": 1,
  "isOpen": true,
  "lastChanged": "2023-05-06T10:30:00.000Z",
  "changedBy": "johndoe"
}
```

### POST /api/valve

Updates the valve status.

**Request Body:**
```json
{
  "isOpen": false
}
```

**Response:**
```json
{
  "id": 1,
  "isOpen": false,
  "lastChanged": "2023-05-06T12:05:00.000Z",
  "changedBy": "johndoe"
}
```

## Leak Events Endpoints

### GET /api/leaks

Retrieves leak events with optional filtering.

**Query Parameters:**
- `status` (optional): Filter by status ("active", "resolved")
- `from` (optional): Start timestamp (ISO format)
- `to` (optional): End timestamp (ISO format)

**Response:**
```json
[
  {
    "id": 1,
    "sensorId": 2,
    "timestamp": "2023-05-05T14:30:00.000Z",
    "value": 12.5,
    "threshold": 10.0,
    "status": "resolved",
    "resolvedAt": "2023-05-05T15:00:00.000Z",
    "resolvedBy": "johndoe",
    "notes": "False alarm during maintenance"
  },
  {
    "id": 2,
    "sensorId": 1,
    "timestamp": "2023-05-06T09:15:00.000Z",
    "value": 20.3,
    "threshold": 15.0,
    "status": "active",
    "resolvedAt": null,
    "resolvedBy": null,
    "notes": null
  }
]
```

### POST /api/leaks/:id/resolve

Resolves a leak event.

**URL Parameters:**
- `id`: The ID of the leak event to resolve

**Request Body:**
```json
{
  "notes": "Fixed pipe leak in basement"
}
```

**Response:**
```json
{
  "id": 2,
  "sensorId": 1,
  "timestamp": "2023-05-06T09:15:00.000Z",
  "value": 20.3,
  "threshold": 15.0,
  "status": "resolved",
  "resolvedAt": "2023-05-06T12:10:00.000Z",
  "resolvedBy": "johndoe",
  "notes": "Fixed pipe leak in basement"
}
```

## System Settings Endpoints

### GET /api/settings

Retrieves the system settings.

**Response:**
```json
{
  "id": 1,
  "flowRateThreshold": 15.0,
  "alertEmailEnabled": true,
  "alertSmsEnabled": false,
  "alertEmail": "admin@example.com",
  "alertPhone": null,
  "autoShutoffEnabled": true,
  "lastUpdated": "2023-05-01T00:00:00.000Z",
  "updatedBy": "admin"
}
```

### POST /api/settings

Updates the system settings.

**Request Body:**
```json
{
  "flowRateThreshold": 20.0,
  "alertEmailEnabled": true,
  "alertSmsEnabled": true,
  "alertEmail": "admin@example.com",
  "alertPhone": "+15551234567",
  "autoShutoffEnabled": true
}
```

**Response:**
```json
{
  "id": 1,
  "flowRateThreshold": 20.0,
  "alertEmailEnabled": true,
  "alertSmsEnabled": true,
  "alertEmail": "admin@example.com",
  "alertPhone": "+15551234567",
  "autoShutoffEnabled": true,
  "lastUpdated": "2023-05-06T12:15:00.000Z",
  "updatedBy": "johndoe"
}
```

## WebSocket API

The application uses WebSockets for real-time data communication.

### Connection

Connect to the WebSocket server at: `/ws`

### Message Types

#### Sensor Readings

Server sends real-time sensor readings:

```json
{
  "type": "sensorData",
  "data": [
    {
      "sensorId": 1,
      "value": 6.2,
      "timestamp": "2023-05-06T12:20:00.000Z",
      "unit": "L/min"
    },
    {
      "sensorId": 2,
      "value": 3.5,
      "timestamp": "2023-05-06T12:20:00.000Z",
      "unit": "L/min"
    }
  ]
}
```

#### Valve Status Update

Server sends valve status updates:

```json
{
  "type": "valveStatus",
  "data": {
    "isOpen": true,
    "lastChanged": "2023-05-06T12:25:00.000Z",
    "changedBy": "johndoe"
  }
}
```

#### Leak Alert

Server sends leak alerts when a new leak is detected:

```json
{
  "type": "leakAlert",
  "data": {
    "id": 3,
    "sensorId": 2,
    "sensorName": "Kitchen Line",
    "timestamp": "2023-05-06T12:30:00.000Z",
    "value": 22.1,
    "threshold": 20.0,
    "status": "active"
  }
}
```

#### Client Commands

Client can send commands to control the valve:

```json
{
  "type": "valveToggle",
  "data": {
    "isOpen": false
  }
}
```

Emergency shutdown command:

```json
{
  "type": "emergencyShutdown",
  "data": {}
}
```

Update threshold settings:

```json
{
  "type": "updateThresholds",
  "data": {
    "flowRateThreshold": 18.0,
    "autoShutoffEnabled": true
  }
}
```

Resolve a leak event:

```json
{
  "type": "resolveLeakEvent",
  "data": {
    "leakId": 3,
    "notes": "Fixed issue with kitchen sink" 
  }
}
```
