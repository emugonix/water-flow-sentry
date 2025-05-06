# Water Leakage Detection System

A full-stack application for real-time water flow monitoring, leak detection, and remote valve control.

## Features

- **Real-time Monitoring**: Live dashboard displaying data from multiple water flow sensors
- **Automated Leak Detection**: System that identifies abnormal readings and triggers alerts
- **Remote Valve Control**: Interface to control water flow solenoid valves remotely
- **User Authentication**: Secure login and user management
- **Historical Data**: Tracking and visualization of past leak events
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: React, TailwindCSS, Shadcn UI, Chart.js
- **Backend**: Node.js, Express
- **Database**: PostgreSQL with Drizzle ORM
- **Real-time Communication**: WebSockets

## Installation

### Prerequisites

- Node.js (v20 or later)
- PostgreSQL database

### Setup

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/water-leakage-detection-system.git
cd water-leakage-detection-system
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following variables:
```
DATABASE_URL=postgresql://username:password@localhost:5432/water_leak_db
SESSION_SECRET=your_session_secret_here
```

4. Initialize the database:
```bash
npm run db:push
npm run db:seed
```

5. Start the application:
```bash
npm run dev
```

6. Open your browser and navigate to `http://localhost:5000`

## Usage

### Authentication

- Navigate to `/auth` to register or log in
- Default test account: 
  - Username: `admin`
  - Password: `password`

### Dashboard

The main dashboard provides:

- Real-time flow rate readings from all sensors
- Valve status and control interface
- Leak alerts and history
- Flow rate threshold settings

## Development

### Project Structure

```
├── client/             # Frontend React application
│   ├── src/
│   │   ├── components/ # UI components
│   │   ├── hooks/      # Custom React hooks
│   │   ├── lib/        # Utility functions
│   │   └── pages/      # Page components
├── db/                 # Database configuration
├── server/             # Backend Express server
├── shared/             # Shared types and schemas
└── README.md           # This file
```

### API Endpoints

- `/api/user` - Get current user info
- `/api/login` - User login
- `/api/register` - User registration
- `/api/logout` - User logout
- `/api/sensors` - Get sensor data
- `/api/readings` - Get sensor readings
- `/api/valve` - Get/update valve status
- `/api/leaks` - Get leak events
- `/api/settings` - Get/update system settings

### WebSocket

The system uses WebSockets for real-time data:

- Connection: `/ws`
- Message types:
  - `sensorData`: Real-time sensor readings
  - `valveStatus`: Valve state updates
  - `leakAlert`: New leak detection

## License

MIT
