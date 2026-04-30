# Team Task Manager

A full-stack web application for creating projects, assigning tasks, and tracking progress with role-based access control.

## 🚀 Features

- **Authentication**: Secure Signup and Login functionality using JWT.
- **Role-Based Access Control**:
  - **Admin**: Can create new projects and tasks, assign tasks to members, and update task statuses.
  - **Member**: Can view all projects and their assigned tasks, and update the status of tasks.
- **Project & Team Management**: Group tasks under specific projects.
- **Task Tracking**: Track tasks through different statuses (Todo, In Progress, Done, Overdue).
- **Dashboard**: Get a quick visual overview of task statuses and view personal assigned tasks.
- **Premium Design**: Built with a modern, glassmorphic dark theme for an excellent user experience.

## 🛠️ Tech Stack

- **Frontend**: React.js (Vite), Vanilla CSS, React Router DOM, Axios, Lucide React (Icons).
- **Backend**: Node.js, Express.js.
- **Database**: SQLite (using `sqlite3` driver).
- **Security**: `bcrypt` for password hashing, `jsonwebtoken` for secure API access.

## 💻 Running Locally

To run this project on your local machine, follow these steps:

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Setup Instructions

1. **Clone the repository** (or navigate to the project directory):
   ```bash
   cd path/to/your/project
   ```

2. **Build the application**:
   This command installs all necessary backend and frontend dependencies, and builds the static assets for the React app.
   ```bash
   npm run build
   ```

3. **Start the server**:
   ```bash
   npm start
   ```

4. **Access the application**:
   Open your browser and navigate to `http://localhost:5000`

### Default Roles for Testing
When you sign up, you can choose to register as an **Admin** or a **Member** to test out the different access permissions.

## 🌐 Deploying on Railway

This project is configured to be easily deployable on [Railway](https://railway.app/). Since it's a monolithic setup (backend serves the frontend build), you only need to deploy a single service.

1. Initialize a Git repository, commit all files, and push them to a new GitHub repository.
2. Log in to [Railway](https://railway.app/) and click **New Project** -> **Deploy from GitHub repo**.
3. Select your repository.
4. Railway will automatically detect the `package.json` file. It will run the `npm run build` script and start the application.
5. Railway will assign a public domain to your project once the build is complete.

*Note: Since the project currently uses SQLite, data is stored in a local file. On Railway's ephemeral file system, this database might reset upon redeployment. For persistent data, you can add a PostgreSQL plugin on Railway and update the `db.js` file to connect via a database URL.*
