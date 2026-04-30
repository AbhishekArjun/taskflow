require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./db');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Middleware to check Admin role
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// --- AUTH ROUTES ---
app.post('/api/auth/register', async (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role === 'Admin' ? 'Admin' : 'Member';
    
    db.run(`INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)`, 
      [username, hashedPassword, userRole], 
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE')) {
            return res.status(400).json({ error: 'Username already exists' });
          }
          return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: 'User created successfully', userId: this.lastID });
    });
  } catch (error) {
    res.status(500).json({ error: 'Error hashing password' });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  db.get(`SELECT * FROM users WHERE username = ?`, [username], async (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(400).json({ error: 'User not found' });
    
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) return res.status(400).json({ error: 'Invalid password' });
    
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
  });
});

app.get('/api/users', authenticateToken, (req, res) => {
  db.all(`SELECT id, username, role FROM users`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// --- PROJECT ROUTES ---
app.get('/api/projects', authenticateToken, (req, res) => {
  db.all(`SELECT * FROM projects`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/projects/:id', authenticateToken, (req, res) => {
  db.get(`SELECT * FROM projects WHERE id = ?`, [req.params.id], (err, project) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    
    db.all(`SELECT tasks.*, users.username as assigned_username 
            FROM tasks 
            LEFT JOIN users ON tasks.assigned_to = users.id 
            WHERE project_id = ?`, [project.id], (err, tasks) => {
      if (err) return res.status(500).json({ error: err.message });
      project.tasks = tasks;
      res.json(project);
    });
  });
});

app.post('/api/projects', authenticateToken, isAdmin, (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: 'Project name is required' });
  
  db.run(`INSERT INTO projects (name, description, created_by) VALUES (?, ?, ?)`, 
    [name, description, req.user.id], 
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID, name, description, created_by: req.user.id });
  });
});

// --- TASK ROUTES ---
app.get('/api/tasks', authenticateToken, (req, res) => {
  // If Member, maybe only see assigned tasks, but dashboard needs overview. We'll return all tasks, but members usually see theirs.
  db.all(`SELECT tasks.*, projects.name as project_name, users.username as assigned_username 
          FROM tasks 
          LEFT JOIN projects ON tasks.project_id = projects.id
          LEFT JOIN users ON tasks.assigned_to = users.id`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/tasks', authenticateToken, isAdmin, (req, res) => {
  const { project_id, title, description, assigned_to, due_date } = req.body;
  if (!project_id || !title) return res.status(400).json({ error: 'Project ID and title required' });
  
  db.run(`INSERT INTO tasks (project_id, title, description, assigned_to, due_date) VALUES (?, ?, ?, ?, ?)`,
    [project_id, title, description, assigned_to, due_date],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID, project_id, title, description, assigned_to, status: 'Todo', due_date });
    });
});

app.put('/api/tasks/:id', authenticateToken, (req, res) => {
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'Status is required' });
  
  // Both Admin and Member can update task status (Members can update their own or any, keeping it simple for now)
  db.run(`UPDATE tasks SET status = ? WHERE id = ?`, [status, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Task updated successfully' });
  });
});

// Serve static files for frontend in production
app.use(express.static(path.join(__dirname, 'client/dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
