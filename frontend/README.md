# SmartPark-Chelsea

SmartPark-Chelsea is a fullstack Smart Parking Web Application prototype built for a Fullstack Developer Intern case study.  
It helps users find available parking slots and allows admins to manage parking lots and simulate real-time slot status changes.

---

## Table of Contents
- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Database Schema](#database-schema)
- [API Documentation](#api-documentation)
- [Authentication & Roles](#authentication--roles)
- [Seed / Initial Data](#seed--initial-data)
- [How to Run (Backend)](#how-to-run-backend)
- [How to Run (Frontend)](#how-to-run-frontend)
- [Testing with Postman](#testing-with-postman)
- [Error Handling](#error-handling)
- [Challenges & Future Improvements](#challenges--future-improvements)
- [Project Structure](#project-structure)
- [Submission Checklist](#submission-checklist)

## Project Overview
SmartPark-Chelsea implements the MVP for a smart parking system:
- Users can register, login, view parking lots and slot availability, and book available slots.
- Admins can create/update/delete parking lots, create slots, update slot status (AVAILABLE / RESERVED / OCCUPIED), clear slots, and view analytics.

Bonus features implemented:
- Admin analytics

## Application's Architecture

+-------------------------------------------------------------+
|                          Frontend                           |
|-------------------------------------------------------------|
| React (Vite)                                                |
| React Router DOM                                            |
| Tailwind CSS                                                |
| Context API (Auth State)                                    |
|                                                             |
| Fetches data from backend through REST API                  |
| Stores JWT in memory (Context)                              |
+-----------------------------▲-------------------------------+
                              | HTTP Requests (JSON)
                              | Authorization: Bearer <token>
                              ▼
+-------------------------------------------------------------+
|                          Backend                            |
|-------------------------------------------------------------|
| Node.js + Express                                           |
| REST API (Auth, Lots, Slots, Admin Analytics)               |
| JWT-based authentication & RBAC                             |
| Controllers + Routes + Middleware                           |
| Mongoose Models (User, ParkingLot, ParkingSlot)             |
+-----------------------------▲-------------------------------+
                              | Mongoose ODM
                              |
                              ▼
+-------------------------------------------------------------+
|                          MongoDB                            |
|-------------------------------------------------------------|
| Stores:                                                     |
| - Users                                                     |
| - Parking Lots                                              |
| - Parking Slots                                             |
+-------------------------------------------------------------+

## Database Schema

+------------------+                               +----------------------+
|    parking_lots  | 1                           N |    parking_slots     |
+------------------+-------------------------------+----------------------+
| PK  _id          |                               | PK  _id              |
|     name         |                               |     lot (FK)         |
|     capacity     |<------------------------------|     code             |
|     description  |   (1 parking lot has many     |     status           |
|     createdAt    |            slots)             |     createdAt        |
|     updatedAt    |                               |     updatedAt        |
+------------------+                               +----------------------+

                        +------------------+
                        |      users       |
                        +------------------+
                        | PK  _id          |
                        |     name         |
                        |     email        |
                        |     passwordHash |
                        |     role         |
                        |     createdAt    |
                        |     updatedAt    |
                        +------------------+

            (users interact through the system but do not have
            direct foreign-key relationships to other collections.)

## Technology Choices

### Overall Stack: MERN (MongoDB, Express, React, Node.js)

I chose the MERN stack because it cleanly separates the backend and frontend, which fits the architecture required for this project and makes development easier to manage. MERN also allows me to work entirely in JavaScript end-to-end, making API development and integration with React more seamless.

### Backend
- Node.js + Express — I chose Express because it’s one of the most widely used backend frameworks, and it's well-suited for building REST APIs. I found it straightforward to learn and flexible enough to handle authentication, routing, and admin/user permissions cleanly.
- MongoDB + Mongoose — I selected MongoDB because its document-based structure fits naturally with the parking lot and parking slot data model. Mongoose helped simplify schema definitions and database queries. 
- JWT Authentication — I implemented JWT because it integrates smoothly with SPAs and keeps the backend stateless. It also aligns well with modern authentication patterns.
- bcryptjs — I used bcryptjs for secure password hashing. It’s lightweight, easy to set up, and commonly used in Node-based applications.
- dotenv & cors — These are essential utilities for managing environment variables and enabling secure cross-origin requests, especially when developing frontend and backend separately.

### Frontend
- React — I’ve used React in several of my past projects, so it allows me to build pages quickly with a structure I’m already comfortable with.
- Vite — I prefer Vite because it’s extremely fast and I’ve consistently had a smooth development with it.
- React Router DOM 
- React Context API
- Tailwind CSS — I use Tailwind often, and its utility-first approach helps me style UI faster and more consistently across components.
- Axios

## API Design

This web uses a RESTful API design. Each controller handles one type of resource (auth, lots, slots, admin), and all endpoints return JSON responses.
Authentication uses JWT, sent via Authorization: Bearer <token>.

Below are the main endpoints grouped by resource, including method, purpose, and example payloads.

### AUTH ROUTES — /api/auth
- POST /api/auth/register
Register a new user.

Body Example

{
  "name": "Chelsea",
  "email": "chelsea@example.com",
  "password": "password123"
}

Response

{
  "message": "User registered successfully",
  "user": {
    "id": "67a0b4...",
    "name": "Chelsea",
    "email": "chelsea@example.com",
    "role": "USER"
  }
}

- POST /api/auth/login
Authenticate user and return JWT token.

Body Example
{
  "email": "admin@example.com",
  "password": "admin123"
}

Response
{
  "user": {
    "id": "67a0c1...",
    "name": "Admin",
    "email": "admin@example.com",
    "role": "ADMIN"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI..."
}

### PARKING LOT ROUTES — /api/lots
- GET /api/lots
List all parking lots with availability summary (public endpoint).

Response Example
[
  {
    "id": "67a0d...",
    "name": "Mall A - Floor 1",
    "capacity": 15,
    "available": 12,
    "occupied": 3
  }
]

- POST /api/lots (ADMIN)
Create a new parking lot.

Body Example
{
  "name": "Mall C - Level 2",
  "capacity": 20,
  "description": "Second floor parking"
}

- PUT /api/lots/:lotId (ADMIN)
Update parking lot details.

Body Example
{
  "name": "Mall C - Updated Level",
  "capacity": 25
}

- DELETE /api/lots/:lotId` (ADMIN)
Delete a parking lot.

### PARKING SLOT ROUTES — /api/slots
- GET /api/slots/lot/:lotId
Get all slots for a specific parking lot.

Response Example
[
  {
    "id": "67a0ef...",
    "code": "A1",
    "status": "AVAILABLE"
  },
  {
    "id": "67a0f1...",
    "code": "A2",
    "status": "OCCUPIED"
  }
]

- POST /api/slots/lot/:lotId` (ADMIN)
Create multiple slots for a parking lot.

Body Example
{
  "count": 10,
  "prefix": "C"
}

- PUT /api/slots/:slotId` (ADMIN)
Manually update slot status.

Body Example
{
  "status": "OCCUPIED"
}

- PUT /api/slots/:slotId/clear` (ADMIN)
Reset slot → AVAILABLE.

### ADMIN ROUTES — /api/admin
- GET /api/admin/statistics (ADMIN)
Returns occupancy data per lot + overall totals.

Response Example
{
  "lots": [
    {
      "name": "Mall A - Floor 1",
      "total": 15,
      "occupied": 3,
      "available": 12
    }
  ],
  "overall": {
    "occupiedTotal": 5,
    "availableTotal": 22
  }
}

## Error Handling

My application handles errors consistently using structured JSON messages across all API endpoints. The main categories of errors include:

1. Authentication Errors
If a user tries to access a protected route without sending a valid JWT token:

{ "error": "Unauthorized" }

If a token is invalid or expired, middleware responds with:

{ "error": "Invalid token" }

2. Authorization Errors
If a USER tries to access an ADMIN-only endpoint:

{ "error": "Forbidden - Admin only" }

3. Validation Errors
If required fields (e.g., name, email, password) are missing during register/login:

{ "error": "Missing fields" }


If the payload is invalid (incorrect status, invalid ID, etc.), the API returns:

{ "error": "Invalid request payload" }

4. Resource Errors
If a slot, lot, or user is not found:

{ "error": "Resource not found" }

5. Server Errors
All unexpected exceptions return a uniform message:

{ "error": "Server error" }

This keeps the API consistent and predictable for the frontend.

## Challenges & Future Improvements

The biggest challenge for me was not a specific feature, but understanding how to design the entire application and complete all the requirements. Even though I’ve built CRUD-based systems before, this project required me to think more broadly about application structure — from planning the data models and API routes to organizing role-based access, slot status workflows, and the separation between frontend and backend. It was the first time I had to design an end-to-end architecture entirely by myself. To overcome this, I broke the requirements into smaller steps, starting with the database schema, then mapping out the REST API, defining the behavior for USER and ADMIN roles, and finally building the frontend pages around those APIs. This structured approach helped me stay organized and complete all required features on time.