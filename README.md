# Task Management System

A secure, and scalable **distributed task processing system** built with **Node.js, Express, Sequelize, and MySQL**. Tasks are **explicitly assigned to worker nodes**, and **only the assigned node** is allowed to fetch, process, and update those tasks.

This project is designed with **real‑world backend practices** in mind and follows a clean **MVC + Service Layer architecture**.

## Table of Contents

- [Key Features](#key-features)
- [Project Architecture](#project-architecture)
- [Database & ORM](#database--orm)
- [Environment Setup](#environment-setup)
- [Install Dependencies](#install-dependencies-database-migration--seeding)
- [Start the Application](#start-the-application)
- [API Documentation](#api-documentation)

## Key Features

* **Security**

  * Node/user authentication using JWT
  * Strict authorization: only assigned node can access a task
  * Rate limiting & secure headers support

* **Node‑Assigned Task Execution**

  * Tasks are locked to a specific node (`assigned_node_id`)
  * Prevents unauthorized access or updates

* **Failover & Recovery**

  * Task timeout detection using `locked_at`
  * Cron job automatically marks expired tasks as `failed`
  * Tasks can be reassigned by admin

* **Task History / Audit Logs**

  * Tracks task lifecycle events:

    * Initial assignment
    * Status change
    * Assignee change

* **Cursor‑Based Pagination**

  * Efficient pagination using `cursor` + `limit`
  * If `limit` is not provided → fetches **all records**

* **Scalable Architecture**

  * Service layer abstraction
  * Centralized logging
  * Graceful shutdown support

#

## Project Architecture

```
src/
├── config/         # DB, logger config
├── controllers/    # Request/response handling
├── helpers/        # Helpers to perform specific task
├── logs/           # Application logs
├── middlewares/    # Auth, error handling
├── migrations/     # DB schema migrations
├── models/         # Sequelize models
├── routes/         # API routes
├── seeders/        # Initial & demo data
├── services/       # Business logic & DB transactions
├── validators/     # Input validators
└── app.js          # Server setup
└── server.js       # App entry point
```

## Database & ORM

* Database: **MySQL**
* ORM: **Sequelize**
* Sequelize is used for:

  * DB connection
  * Models
  * Migrations
  * Seeders


## Environment Setup

A sample `.env` file is provided. Example:

```
PORT=3000
NODE_ENV=development
DB_HOST=127.0.0.1
DB_USER=your_db_user
DB_PASSWORD=your_db_secret
DB_NAME=task_management
JWT_SECRET=your_jwt_secret
```


## Install Dependencies, Database Migration & Seeding

```bash
npm install
```

### Run Migrations

Creates all required tables (users, tasks, task_histories, etc.)

```bash
npx sequelize-cli db:migrate
```

### Run Seeders

Creates:

* Admin user (if not present)
* Demo nodes / tasks

```bash
npx sequelize-cli db:seed:all
```

### Undo (Optional)

```bash
npx sequelize-cli db:migrate:undo
npx sequelize-cli db:seed:undo:all
```

## Start the Application

```bash
npm run dev
```

Server will start on:

```
http://localhost:3000
```

## API Documentation

Below is a **high-level API reference** for GitHub readers.
(Detailed examples are available in the Postman collection.)


### Authentication and User Management APIs

#### ➤ Login

```
POST /api/auth/login
```

**Access:** Admin / Node

**Body Params:**

* `username` (string, required)
* `password` (string, required)

**Rules:**

* Generates a JWT token

---

#### ➤ Create Node / User

```
POST /api/auth/signup
```

**Access:** Admin

**Headers:** `Authorization: Bearer <token>`

**Body Params:**

* `name`     (string, required)
* `email`    (string, required)
* `password` (string, required)

---

#### ➤ Edit Profile

```
PUT /api/auth/edit-profile
```

**Access:** Admin / Node

**Headers:** `Authorization: Bearer <token>`

**Body Params:**

* `name`  (string, required)
* `email` (string, required)

---

#### ➤ Change Password

```
PUT /api/auth/update-password
```

**Access:** Admin / Node

**Headers:** `Authorization: Bearer <token>`

**Body Params:**

* `oldPassword` (string, required)
* `newPassword` (string, required)

---

#### ➤ Profile

```
GET /api/auth/profile
```

**Access:** Admin / Node

**Headers:** `Authorization: Bearer <token>`

---

#### ➤ User List

```
GET /api/auth/users
```

**Access:** Admin

**Headers:** `Authorization: Bearer <token>`

---

### Task APIs

#### ➤ Create Task

```
POST /api/tasks
```

**Access:** Admin

**Headers:** `Authorization: Bearer <token>`

**Body Params:**

* `taskName`     (string, required)
* `taskDetails`  (string, required)
* `assignedNode` (string, required)
* `lockedAt`     (datetime, required, must be a future time)

**Rules:**

* Task is locked to the assigned node
* History entry is created (initial assign)

---

#### ➤ Edit Task

```
PUT /api/tasks
```

**Access:** Admin

**Headers:** `Authorization: Bearer <token>`

**Body Params:**

* `taskId`       (string, required)
* `taskName`     (string, required)
* `taskDetails`  (string, required)
* `assignedNode` (string, required)
* `lockedAt`     (datetime, required, must be a future time)

---

#### ➤ Assign Task

```
PUT /api/tasks
```

**Access:** Admin

**Headers:** `Authorization: Bearer <token>`

**Body Params:**

* `taskId` (string, required)
* `nodeId` (string, required)

**Rules:**

* Task is locked to the assigned node
* History entry is created (Assignee change)
* Used to assign failed tasks

---

#### ➤ Delete Task

```
DELETE /api/tasks/:taskId
```

**Access:** Admin

**Headers:** `Authorization: Bearer <token>`

**Rules:**

* Task's active value got changed from 1 to 0
* Hide from system

---

#### ➤ Get All Tasks

```
GET /api/tasks/all
```

**Access:** Admin

**Headers:** `Authorization: Bearer <token>`

**Query Params:**

* `limit` (optional)
* `cursor` (optional)

**Pagination Rules:**

* If `limit` is not provided → all records are fetched
* First call: pass `limit` only
* Next calls: pass both `limit` and `cursor`

---

#### ➤ Get Tasks for Node

```
GET /api/tasks/node
```

**Access:** Node

**Headers:** `Authorization: Bearer <token>`

**Query Params:**

* `limit` (optional)
* `cursor` (optional)

**Pagination Rules:**

* If `limit` is not provided → all records are fetched
* First call: pass `limit` only
* Next calls: pass both `limit` and `cursor`

**Rules:**

* Only tasks assigned to the requesting node are returned

---

#### ➤ Filter Tasks

```
GET /api/tasks/filter/:status
```

**Access:** Admin/Node

**Headers:** `Authorization: Bearer <token>`

**Query Params:**

* `status` (all | pending | in_progress | completed | failed) (required)
* `limit`  (optional)
* `cursor` (optional)

**Pagination Rules:**

* If `limit` is not provided → all records are fetched
* First call: pass `limit` only
* Next calls: pass both `limit` and `cursor`

---

#### ➤ Update Task Status

```
PUT /api/tasks/shift-status
```

**Access:** Assigned Node only

**Headers:** `Authorization: Bearer <token>`

**Body Params:**

* `taskStatus` (in_progress | completed | failed)
* `taskId`

**Rules:**

* Only assigned node can update
* Status regression is not allowed
* Expired tasks cannot be completed

---

### Task Details & History APIs

#### ➤ Get Task Details

```
GET /api/tasks/:taskId
```

**Access:** Admin/Node

**Headers:** `Authorization: Bearer <token>`

**Rules:**

* Returns task details data

---

#### ➤ Get Task History

```
GET /api/tasks/history/:taskId
```

**Access:** Admin

**Headers:** `Authorization: Bearer <token>`

**Rules:**

* Returns history in descending order of creation

---

### Cron

#### ➤ Collect Expired Tasks

```
GET /cron/collect-failed
```

**Access:** Internal / Admin

**Rules:**

* Marks expired pending/in-progress tasks as failed
* Creates history entries automatically

---

## 📮 Postman Collection

A Postman collection is included with:

* Authentication APIs
* Task CRUD & filtering
* Node-specific task fetching
* Cron/maintenance endpoints

Simply import the collection into Postman and update the base URL & tokens.
