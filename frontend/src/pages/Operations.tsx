import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useApi } from '../hooks/useApi';
import '../styles/Operations.css';

type OperationRole = 'captain' | 'first_officer' | 'engineer' | 'crew_member';

interface OperationTask {
  id: string;
  title: string;
  description: string;
  requiredRole: OperationRole;
  completedBy?: string;
  completedAt?: string;
  canExecute: boolean;
}

interface OperationTasksResponse {
  tasks: OperationTask[];
  userRoles: string[];
}

const roleLabel: Record<OperationRole, string> = {
  captain: 'Captain',
  first_officer: 'First Officer',
  engineer: 'Engineer',
  crew_member: 'Crew Member',
};

export default function Operations() {
  const { user, logout, hasRole } = useAuth();
  const {
    data: taskData,
    request: fetchTasks,
    post: executeTask,
    isLoading,
    error,
  } = useApi<OperationTasksResponse>();
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      await fetchTasks('/api/operations/tasks');
    } catch {
      // Handled by error state.
    }
  };

  const handleExecuteTask = async (task: OperationTask) => {
    try {
      await executeTask(`/api/operations/tasks/${task.id}/execute`, {});
      setActionMessage(`Task completed: ${task.title}`);
      await loadTasks();
    } catch (err: any) {
      const deniedMessage =
        err?.message ||
        `You are not ${task.requiredRole} role and access denied`;
      setActionMessage(deniedMessage);
    }
  };

  const tasks = taskData?.tasks || [];

  const groupedTasks = useMemo(() => {
    return {
      available: tasks.filter((task) => task.canExecute),
      locked: tasks.filter((task) => !task.canExecute),
      completed: tasks.filter((task) => Boolean(task.completedAt)),
    };
  }, [tasks]);

  return (
    <div className="container">
      <div className="nav-header">
        <h1 className="nav-title">⚓ Ship Navigation Portal</h1>
        <nav className="nav-menu">
          <Link to="/dashboard">Dashboard</Link>
          {(hasRole('captain') || hasRole('first_officer')) && <Link to="/navigation">Navigation</Link>}
          {(hasRole('captain') || hasRole('first_officer') || hasRole('engineer')) && <Link to="/fuel">Fuel</Link>}
          {(hasRole('captain') || hasRole('engineer') || hasRole('crew_member')) && <Link to="/diagnostics">Diagnostics</Link>}
          <Link to="/operations">Operations</Link>
        </nav>
        <div className="user-info">
          <span className="user-name">{user?.username}</span>
          <button className="logout-btn" onClick={logout}>
            Logout
          </button>
        </div>
      </div>

      <div className="page-content">
        <h2 className="page-title">🧭 Role Operations Center</h2>
        <p className="operations-subtitle">
          Execute role-specific tasks below. If your role is missing, action will be denied.
        </p>

        <div className="role-chip-row">
          {(user?.roles || []).map((role) => (
            <span className="role-chip" key={role}>{role.replace('_', ' ')}</span>
          ))}
          {(!user?.roles || user.roles.length === 0) && (
            <span className="role-chip muted">No active roles</span>
          )}
        </div>

        {actionMessage && <div className="operation-message">{actionMessage}</div>}
        {error && <div className="error-message">{error.message}</div>}

        {isLoading ? (
          <p>Loading operation tasks...</p>
        ) : (
          <div className="operations-grid">
            <section className="operations-card">
              <h3>Available for You</h3>
              {groupedTasks.available.length === 0 && <p>No tasks available for your current role.</p>}
              {groupedTasks.available.map((task) => (
                <div key={task.id} className="task-item">
                  <h4>{task.title}</h4>
                  <p>{task.description}</p>
                  <p className="required-role">Required: {roleLabel[task.requiredRole]}</p>
                  <button className="submit-btn" onClick={() => handleExecuteTask(task)}>
                    Execute Task
                  </button>
                </div>
              ))}
            </section>

            <section className="operations-card">
              <h3>Restricted Tasks</h3>
              {groupedTasks.locked.length === 0 && <p>You can access every task.</p>}
              {groupedTasks.locked.map((task) => (
                <div key={task.id} className="task-item locked">
                  <h4>{task.title}</h4>
                  <p>{task.description}</p>
                  <p className="denied-text">You are not {task.requiredRole} role and access denied</p>
                  <button
                    className="cancel-btn"
                    onClick={() => handleExecuteTask(task)}
                  >
                    Try Anyway
                  </button>
                </div>
              ))}
            </section>

            <section className="operations-card">
              <h3>Completed Tasks</h3>
              {groupedTasks.completed.length === 0 && <p>No completed tasks yet.</p>}
              {groupedTasks.completed.map((task) => (
                <div key={task.id} className="task-item completed">
                  <h4>{task.title}</h4>
                  <p>
                    Completed by <strong>{task.completedBy}</strong>
                  </p>
                  {task.completedAt && (
                    <p className="timestamp">{new Date(task.completedAt).toLocaleString()}</p>
                  )}
                </div>
              ))}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
