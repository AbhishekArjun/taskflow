import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Plus } from 'lucide-react';

export default function ProjectDetails() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [users, setUsers] = useState([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const { user: currentUser, token } = useContext(AuthContext);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    fetchProject();
    if (currentUser.role === 'Admin') {
      fetchUsers();
    }
  }, [id]);

  const fetchProject = async () => {
    try {
      const res = await axios.get(`/api/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProject(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
      if (res.data.length > 0) setAssignedTo(res.data[0].id);
    } catch (err) {
      console.error(err);
    }
  };

  const createTask = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/tasks', {
        project_id: id,
        title,
        description,
        assigned_to: assignedTo,
        due_date: dueDate
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowTaskModal(false);
      setTitle('');
      setDescription('');
      setDueDate('');
      fetchProject();
    } catch (err) {
      console.error(err);
    }
  };

  const updateStatus = async (taskId, status) => {
    try {
      await axios.put(`/api/tasks/${taskId}`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchProject();
    } catch (err) {
      console.error(err);
    }
  };

  if (!project) return <div className="container"><div className="glass-card text-center py-8">Loading project...</div></div>;

  return (
    <div className="container">
      <div className="glass-card mb-8">
        <h1 className="text-gradient mb-2">{project.name}</h1>
        <p className="text-muted">{project.description}</p>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2>Tasks</h2>
        {currentUser.role === 'Admin' && (
          <button className="btn btn-primary" onClick={() => setShowTaskModal(true)}>
            <Plus size={18} /> Add Task
          </button>
        )}
      </div>

      <div className="flex-col gap-4">
        {project.tasks && project.tasks.map(task => (
          <div key={task.id} className="glass-card flex justify-between items-center">
            <div>
              <h4 className="mb-1">{task.title}</h4>
              <p className="text-muted mb-2" style={{ fontSize: '0.9rem' }}>{task.description}</p>
              <div className="flex gap-4 text-secondary" style={{ fontSize: '0.85rem' }}>
                <span>Assignee: {task.assigned_username || 'Unassigned'}</span>
                {task.due_date && <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <select 
                className="form-control" 
                value={task.status}
                onChange={(e) => updateStatus(task.id, e.target.value)}
                style={{ width: 'auto', padding: '0.5rem' }}
                disabled={currentUser.role !== 'Admin' && currentUser.id !== task.assigned_to}
              >
                <option value="Todo">Todo</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
                <option value="Overdue">Overdue</option>
              </select>
              <span className={`badge badge-${task.status.toLowerCase().replace(' ', '-')}`}>
                {task.status}
              </span>
            </div>
          </div>
        ))}
        {(!project.tasks || project.tasks.length === 0) && (
          <div className="glass-card text-center text-muted py-8">
            No tasks in this project yet.
          </div>
        )}
      </div>

      {showTaskModal && (
        <div className="modal-overlay">
          <div className="glass-card modal-content">
            <div className="modal-header">
              <h3>Create Task</h3>
              <button className="close-btn" onClick={() => setShowTaskModal(false)}>&times;</button>
            </div>
            <form onSubmit={createTask}>
              <div className="form-group">
                <label className="form-label">Task Title</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea 
                  className="form-control" 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="2"
                ></textarea>
              </div>
              <div className="form-group">
                <label className="form-label">Assign To</label>
                <select 
                  className="form-control" 
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  required
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.username} ({u.role})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input 
                  type="date" 
                  className="form-control" 
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary w-full mt-4">Create Task</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
