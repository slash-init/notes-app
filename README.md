# Notes App

A full stack notes application with a React frontend and a Node.js + Express backend. Users can create, view, and manage notes. The project is under active development with ongoing improvements.

## Features
- Create, list, and manage notes
- RESTful API with JSON responses
- Clear separation of frontend and backend

## Tech Stack
- Frontend: React
- Backend: Node.js, Express
- Database: MongoDB (configure via environment variables)

## Project Structure
```
notes-app/
├── backend/      # Express server, routes, controllers, models
├── frontend/     # React app (Vite)
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (LTS)
- npm or yarn

### Backend
```sh
cd backend
npm install
# Set environment variables (see below)
npm run dev   # or npm start
```

### Frontend
```sh
cd frontend
npm install
npm run dev   # or npm start
```

### Environment Variables (backend)
Create a `.env` in `backend/`:
```
PORT=3001
MONGODB_URI=<your-mongodb-uri>
```

## API (backend)
- `GET /api/notes` — list notes
- `POST /api/notes` — create a note `{ content: string, important?: boolean }`
- `GET /api/notes/:id` — fetch a note
- `PUT /api/notes/:id` — update a note
- `DELETE /api/notes/:id` — delete a note

## Scripts
- Backend: `npm run dev` (dev), `npm start` (prod)
- Frontend: `npm run dev` (dev), `npm run build` (prod build)

## Testing
Add and run tests with your preferred framework (for example, Jest for backend, Vitest/React Testing Library for frontend).

## Roadmap
- Add authentication
- Improve error handling and validation
- Add filtering and search for notes
