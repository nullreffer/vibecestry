# Vibecestry PWA

A Progressive Web Application with React Flow for the frontend and Node.js for the backend.

## Project Structure

```
vibecestry/
├── frontend/          # React PWA with React Flow
├── backend/           # Node.js Express API (note: typo in folder name kept as requested)
├── package.json       # Root package.json for managing both apps
└── README.md
```

## Features

### Frontend (React PWA)
- **React Flow**: Interactive node-based flow editor
- **PWA Support**: Service worker for offline functionality
- **Responsive Design**: Works on desktop and mobile
- **Modern React**: Uses React 18 with hooks

### Backend (Node.js API)
- **Express.js**: RESTful API server
- **CORS Support**: Configured for cross-origin requests
- **Security**: Helmet.js for security headers
- **Logging**: Morgan for request logging
- **Environment Variables**: dotenv for configuration

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Install all dependencies:**
   ```bash
   npm run install-all
   ```

   Or install individually:
   ```bash
   # Install frontend dependencies
   npm run install-frontend
   
   # Install backend dependencies
   npm run install-backend
   
   # Install root dependencies
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env file as needed
   ```

### Development

1. **Start both frontend and backend:**
   ```bash
   npm start
   ```

   Or start individually:
   ```bash
   # Start backend (runs on http://localhost:3001)
   npm run start-backend
   
   # Start frontend (runs on http://localhost:3000)
   npm run start-frontend
   ```

2. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

## API Endpoints

The backend provides the following endpoints:

- `GET /` - API status
- `GET /health` - Health check
- `GET /api/flow` - Get flow data
- `POST /api/flow` - Save flow data
- `GET /api/nodes` - Get all nodes
- `POST /api/nodes` - Add a new node
- `DELETE /api/nodes/:id` - Delete a node

## Building for Production

```bash
# Build frontend
npm run build-frontend
```

## PWA Features

The frontend includes:
- Service worker for offline functionality
- Web app manifest for "Add to Home Screen"
- Responsive design for mobile devices
- Fast loading with caching strategies

## Technology Stack

### Frontend
- React 18
- React Flow Renderer
- Create React App
- Service Worker (PWA)

### Backend
- Node.js
- Express.js
- CORS
- Helmet.js
- Morgan
- dotenv

## Development Notes

- The backend folder is intentionally named "backend" (with the typo) as requested
- Frontend runs on port 3000, backend on port 3001
- CORS is configured to allow requests from the frontend
- The app includes basic error handling and logging

## Next Steps

Consider adding:
- Database integration (MongoDB, PostgreSQL, etc.)
- User authentication and authorization
- Real-time features with WebSockets
- Advanced PWA features (push notifications, background sync)
- Testing suites for both frontend and backend
- Docker containerization
- CI/CD pipeline
