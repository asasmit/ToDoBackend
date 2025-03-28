# Todo App Backend

This is the backend of the Todo App built using **Node.js**, **Express.js**, and **MongoDB**. It provides APIs for user authentication, task management, and OTP-based verification.

## Tech Stack
- **Node.js** – JavaScript runtime environment
- **Express.js** – Web framework for Node.js
- **MongoDB** – NoSQL database
- **JWT (JSON Web Tokens)** – Authentication
- **Bcrypt.js** – Password hashing

## API Endpoints

### Authentication APIs
| Method | Endpoint         | Description            |
|--------|-----------------|------------------------|
| POST   | `api/auth/signup`        | User registration      |
| POST   | `api/auth/login`         | User login            |
| POST   | `api/auth/verifyOTP`     | Verify signup OTP     |
| POST   | `api/auth/resetOTP`      | Generate reset OTP    |
| POST   | `api/auth/verifyResetOTP` | Verify reset OTP     |

### Task Management APIs (Requires Authentication)
| Method | Endpoint         | Description              |
|--------|-----------------|--------------------------|
| POST   | `api/task`        | Create a new task       |
| GET    | `api/task`        | Get all tasks           |
| PUT    | `api/task/:taskId` | Update task status     |
| DELETE | `api/task/:taskId` | Delete a task          |

## Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/asasmit/ToDoBackend.git
   cd ToDoBackend
2. Install dependencies
   ```sh
   npm install
3. Set up environment variables in .env:
   ```sh
     MONGO_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret_key
     EMAIL = your_email
     PASSWORD = your_email_password
4. Start the backend server
   ```sh
   npm start





