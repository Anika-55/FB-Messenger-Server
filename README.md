# Facebook Messenger Clone (Full Stack)

A full-stack Facebook Messenger style app with a Vite + React client and an Express + Prisma (MongoDB) API. The frontend delivers a polished chat UI, while the backend provides authentication, users, conversations, and messages endpoints.

## Features
- Messenger-style inbox, conversation list, and chat view
- Light/dark theme support
- Auth-ready backend with JWT
- Conversations and messages API
- Prisma schema targeting MongoDB

## Tech Stack
- Client: React 19, TypeScript, Vite, Tailwind CSS v4, Zustand
- Server: Node.js, Express, TypeScript, Prisma
- Database: MongoDB

## Folder Structure
- `client/` Frontend app (Vite + React)
- `client/src/components/` UI components (chat, conversation, shared)
- `client/src/pages/` Page-level layouts
- `client/src/store/` Zustand state
- `server/` Backend API (Express + Prisma)
- `server/src/routes/` API routes (auth, users, conversations, messages)
- `server/src/controllers/` Route handlers
- `server/src/prisma/` Prisma schema and client setup

## How It Works
1. The client talks to the API via `VITE_API_BASE_URL`.
2. The server exposes REST endpoints under `/api`.
3. Prisma connects to MongoDB using `DATABASE_URL`.
4. JWT is used for auth-protected routes.

## Getting Started

### Prerequisites
- Node.js 18+ (recommended)
- MongoDB instance (Atlas or local)

### 1) Install Dependencies
```bash
cd client
npm install

cd ../server
npm install
```

### 2) Configure Environment Variables
Create `.env` files from the examples.

Client (`client/.env`):
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Server (`server/.env`):
```env
PORT=5000
DATABASE_URL="mongodb+srv://USER:PASSWORD@HOST/DATABASE?retryWrites=true&w=majority"
JWT_SECRET="your_jwt_secret"
```

### 3) Generate Prisma Client + Push Schema
```bash
cd server
npm run prisma:generate
npm run prisma:push
```

### 4) Run the App
Start the API:
```bash
cd server
npm run dev
```

Start the client:
```bash
cd client
npm run dev
```

Open the dev server URL printed by Vite (typically `http://localhost:5173`).

## API Routes (Server)
Base path: `/api`
- `GET /health` Health check
- `POST /auth/register` Register
- `POST /auth/login` Login
- `GET /users` List users
- `GET /users/:id` Get user by id
- `GET /users/search` Search users
- `GET /users/me` Get current user (auth)
- `PATCH /users/me/online` Update online status (auth)
- `GET /conversations` List conversations (auth)
- `POST /conversations` Create conversation (auth)
- `GET /conversations/:id` Get conversation (auth)
- `POST /conversations/:id/seen` Mark seen (auth)
- `PATCH /conversations/:id/avatar` Set avatar (auth)
- `POST /conversations/:id/leave` Leave conversation (auth)
- `GET /messages/:conversationId` List messages (auth)
- `POST /messages` Send message (auth)
- `DELETE /messages/:id` Delete message (auth)

## Scripts

Client (`client/package.json`):
```bash
npm run dev
npm run build
npm run preview
npm run lint
```

Server (`server/package.json`):
```bash
npm run dev
npm run build
npm run start
npm run prisma:generate
npm run prisma:push
```

## Notes
- Ensure MongoDB is reachable before starting the server.
- Auth-protected routes require a valid JWT.

## License
MIT (update if different).
