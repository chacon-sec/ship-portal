interface PermissionErrorProps {
  title?: string;
  message?: string;
  requiredRoles?: string[];
}

export function PermissionError({
  title = 'Access Denied',
  message = 'You do not have permission to access this page.',
  requiredRoles,
}: PermissionErrorProps) {
  return (
    <div className="permission-error">
      <div className="error-content">
        <div className="error-icon">🔒</div>
        <h2>{title}</h2>
        <p>{message}</p>
        {requiredRoles && requiredRoles.length > 0 && (
          <div className="required-roles">
            <p>Required roles:</p>
            <ul>
              {requiredRoles.map((role) => (
                <li key={role}>{role}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
