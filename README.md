# 🚀 Team Task Manager (Full-Stack SaaS)

A production-ready **Team Task Management Web Application** that enables organizations to manage projects, assign tasks, and track progress with **role-based access (Admin & Member)**.

---

## 🌐 Live Links

* 🔗 **Frontend URL:** https://taskmanager-production-7ec0.up.railway.app
* 🔗 **Backend API URL:** https://taskmanager-production-9f24.up.railway.app/api

---

## 📌 Overview

Team Task Manager is a modern SaaS platform designed to streamline team collaboration.
It allows workspace owners (Admins) to manage projects and assign tasks, while team members execute and update task progress through an intuitive workflow.

---

## 👥 User Roles & Access

### 🔐 Admin

* Create and manage workspace
* Create projects
* Assign tasks to members
* Invite team members via email
* Review submitted tasks
* Monitor overall progress

### 👤 Member

* Access assigned tasks
* Update task progress (Kanban workflow)
* Submit work for review
* Track deadlines and priorities

---

## ✨ Core Features

### 🔑 Authentication & Security

* JWT-based authentication
* Secure password hashing
* Role-based authorization (Admin / Member)
* Google OAuth (optional)

---

### 🏢 Workspace & Team Management

* Create workspace during signup
* Invite members via email (SendGrid integration)
* Accept invite via secure link
* Role-based onboarding

---

### 📁 Project Management

* Create multiple projects within a workspace
* View all projects in dashboard
* Project-specific Kanban boards

---

### ✅ Task Management System

* Create tasks with:

  * Title
  * Description
  * Priority (Low / Medium / High)
  * Deadline
  * Assigned member
* Track task lifecycle

---

### 📊 Kanban Workflow

Tasks move through structured stages:

```
To Do → In Progress → In Review → Done
```

* **To Do** → Task created
* **In Progress** → Member starts working
* **In Review** → Member submits work (with description)
* **Done** → Admin approves

---

### 🔍 Admin Review System

* Members must add submission notes before moving to "In Review"
* Admin reviews and:

  * Approves → moves to Done
  * Rejects → sends back to In Progress

---

### 📈 Dashboard & Analytics

#### Admin Dashboard

* Active projects
* Pending tasks
* Completed tasks
* Overdue tasks

#### Member Dashboard

* Personal task pipeline
* Assigned projects
* Task deadlines & priorities

---

### 👥 Team Page

* View all members
* Role & status tracking
* Member actions:

  * Change role
  * Remove member
  * Resend invite
* Export team data (CSV)

---

### ⚙️ Settings

* Profile management
* Workspace settings
* Password update
* Logout functionality

---

### 📧 Email Integration

* SendGrid used for:

  * Member invitations
  * Invite acceptance flow

---

## 🛠️ Tech Stack

### Frontend

* React (Vite)
* TypeScript
* Tailwind CSS
* Framer Motion

### Backend

* Node.js
* Express.js

### Database

* MongoDB (Mongoose)

### Authentication

* JWT (JSON Web Tokens)
* Google OAuth

### Email Service

* SendGrid API

### Deployment

* Railway

---

## 📂 Project Structure

```
root/
│
├── frontend/        # React app
├── backend/         # Express server
├── .env.example     # Environment variables template
├── README.md
```

---

## 🔐 Environment Variables

Create a `.env` file in `backend/`:

```
MONGO_URI=
JWT_SECRET=
SENDGRID_API_KEY=
EMAIL_FROM=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

---

## ⚙️ Installation & Setup

### 1. Clone Repository

```
git clone https://github.com/your-username/team-task-manager.git
cd team-task-manager
```

---

### 2. Install Dependencies

#### Backend

```
cd backend
npm install
```

#### Frontend

```
cd frontend
npm install
```

---

### 3. Run Locally

#### Backend

```
npm run dev
```

#### Frontend

```
npm run dev
```

---

## 🚀 Deployment

The application is deployed using **Railway**:

* Backend deployed as Node service
* MongoDB connected via cloud (Atlas)
* Environment variables configured in Railway dashboard

---

## 📌 Key Highlights

* 🔐 Secure role-based architecture
* 📊 Real-time task workflow tracking
* 📧 Email-based team onboarding
* 📁 Scalable project structure
* ⚡ Clean UI/UX with modern design
* 🚀 Production-ready deployment

---

## 🎯 Future Improvements

* Real-time notifications (WebSockets)
* Team chat system
* File attachments in tasks
* Activity logs
* Advanced analytics dashboard

---


## 🙌 Author

**Steven Abraham**

---

## 📄 License

This project is built for evaluation and educational purposes.
