# FleetStar
FleetStar – Smart Fleet Management System
FleetStar is a full‑stack fleet management platform designed to manage vehicles, drivers, trips, and maintenance operations efficiently. It combines a structured backend API with a connected PostgreSQL database and a modern React frontend interface.

Tech Stack
Backend:

Node.js

Express.js

Prisma ORM

PostgreSQL (Render Hosted)

REST API Architecture

Frontend:

React (Vite)

TypeScript

Modern UI Components

Project Structure
FleetStar
├── backend
│ ├── prisma
│ ├── src
│ └── package.json
└── frontend
├── src
└── package.json

Backend Setup
Navigate to the backend folder.

Install dependencies using npm install.

Create a .env file inside the backend folder.

Add your PostgreSQL database URL in the .env file as:
DATABASE_URL="your_postgresql_database_url"

Sync the Prisma schema to the database using npx prisma db push.

Start the backend server using node src/server.js.

The backend runs on http://localhost:5000.

Frontend Setup
Navigate to the frontend folder.

Install dependencies using npm install.

Start the frontend development server using npm run dev.

The frontend runs on http://localhost:5173.

API Endpoints
Vehicles:

GET /vehicles

POST /vehicles

Drivers:

GET /drivers

POST /drivers

Trips:

GET /trips

POST /trips

Maintenance:

GET /maintenance

POST /maintenance

Database
PostgreSQL hosted on Render

Managed using Prisma ORM

Schema located in backend/prisma/schema.prisma

Demo Instructions
Start the backend server.

Start the frontend application.

Open the frontend in the browser.

Manage fleet data through the interface.

Status
Backend completed

Database integrated

Frontend completed

All branches consolidated into main
