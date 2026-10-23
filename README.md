# Task Manager (MERN)

A full-stack task manager with secure login. Users can create, edit, complete, delete,
search and filter their own tasks, with priority levels and due dates.

## Tech stack
MongoDB, Express.js, React (Vite), Node.js, JWT authentication, bcrypt password hashing, REST API

## Features
- Register / login with JWT (tokens expire in 7 days), passwords hashed with bcrypt
- Protected CRUD REST APIs; each user can only access their own tasks
- Priority (low / medium / high), due dates, overdue highlighting
- Search and filter (all / pending / done)
- Responsive UI, centralized error handling

## Run locally
Needs Node.js 18+ and MongoDB (local or Atlas).

```bash
# 1. Backend
cd server
cp .env.example .env      # then edit MONGO_URI and JWT_SECRET
npm install
npm run dev               # http://localhost:5000

# 2. Frontend (new terminal)
cd client
cp .env.example .env
npm install
npm run dev               # http://localhost:5173
```

## API
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Log in, returns JWT |
| GET | /api/tasks | List my tasks |
| POST | /api/tasks | Add task |
| PUT | /api/tasks/:id | Update task |
| DELETE | /api/tasks/:id | Delete task |

## Deploy
Backend on Render, database on MongoDB Atlas, frontend on Vercel or Netlify
(set `VITE_API_URL` to the backend URL and `CLIENT_URL` on the backend).
