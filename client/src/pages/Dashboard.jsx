import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Clock, CheckCircle2, CircleDashed } from 'lucide-react';

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const { user, token } = useContext(AuthContext);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await axios.get('/api/tasks', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`/api/tasks/${id}`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const myTasks = tasks.filter(t => t.assigned_to === user.id);
  const todoCount = myTasks.filter(t => t.status === 'Todo').length;
  const progressCount = myTasks.filter(t => t.status === 'In Progress').length;
  const doneCount = myTasks.filter(t => t.status === 'Done').length;

  return (
    <div className="container">
      <h1 className="mb-8">Dashboard</h1>
      
      <div className="flex gap-4 mb-8" style={{ flexWrap: 'wrap' }}>
        <div className="glass-card flex-1" style={{ borderLeft: '4px solid var(--text-secondary)' }}>
          <div className="text-muted mb-2 flex items-center gap-2"><CircleDashed size={18} /> Todo</div>
          <h2>{todoCount}</h2>
        </div>
        <div className="glass-card flex-1" style={{ borderLeft: '4px solid var(--accent-secondary)' }}>
          <div className="text-muted mb-2 flex items-center gap-2"><Clock size={18} /> In Progress</div>
          <h2>{progressCount}</h2>
        </div>
        <div className="glass-card flex-1" style={{ borderLeft: '4px solid var(--success)' }}>
          <div className="text-muted mb-2 flex items-center gap-2"><CheckCircle2 size={18} /> Done</div>
          <h2>{doneCount}</h2>
        </div>
      </div>

      <h3 className="mb-4">My Assigned Tasks</h3>
      <div className="flex-col gap-4">
        {myTasks.length === 0 ? (
          <div className="glass-card text-center text-muted py-8">
            No tasks assigned to you yet.
          </div>
        ) : (
          myTasks.map(task => (
            <div key={task.id} className="glass-card flex items-center justify-between">
              <div>
                <h4 className="mb-1">{task.title}</h4>
                <div className="text-muted" style={{ fontSize: '0.9rem' }}>Project: {task.project_name}</div>
              </div>
              <div className="flex items-center gap-4">
                <select 
                  className="form-control" 
                  value={task.status}
                  onChange={(e) => updateStatus(task.id, e.target.value)}
                  style={{ width: 'auto', padding: '0.5rem' }}
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
          ))
        )}
      </div>
    </div>
  );
}
