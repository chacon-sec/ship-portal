# Ship Navigation Portal - Keycloak IAM Lab

A modern, interactive web application for teaching Identity and Access Management (IAM) concepts using Keycloak. The portal is themed as a ship navigation system with role-based access control to different ship operations.

## Features

### 🚢 Ship Portal Features
- **Navigation Control** - Reroute the ship and manage waypoints (Captain only)
- **Fuel Management** - Monitor and reallocate fuel reserves (Captain & Engineer)
- **Ship Diagnostics** - View system status, alerts, and performance metrics (Captain & Engineer)
- **Role-Based Dashboard** - Dynamic interface based on user permissions

### 🔐 IAM Features
- **Keycloak Integration** - Industry-standard identity management
- **Role-Based Access Control (RBAC)** - 4 predefined roles with different permissions
- **Real-time Permission Changes** - Revoke/grant access instantly
- **Session Management** - Secure user sessions with automatic logout
- **OAuth 2.0/OpenID Connect** - Standards-based authentication

### 👥 User Roles

| Role | Access Level | Permissions |
|------|--------------|-------------|
| **Captain** | Full | All features + administrative controls |
| **First Officer** | Medium | View-only navigation & diagnostics |
| **Engineer** | Medium | Diagnostics & fuel management |
| **Crew Member** | Low | Read-only dashboard view |

## Project Structure

```
ship-portal/
├── backend/                 # Node.js/Express API
│   ├── src/
│   │   ├── server.ts       # Main Express app
│   │   ├── config/keycloak.ts
│   │   ├── routes/         # API endpoints
│   │   └── middleware/     # Auth middleware
│   ├── package.json
│   └── Dockerfile
├── frontend/               # React/TypeScript Web App
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable components
│   │   ├── hooks/         # Custom hooks
│   │   ├── styles/        # CSS styling
│   │   └── App.tsx
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml     # Container orchestration
└── SETUP.md              # Lab setup guide
```

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local development)

### Running with Docker

```bash
# Navigate to project directory
cd ship-portal

# Start all services
docker-compose up

# Services will be available at:
# - Frontend: http://localhost:3000
# - Backend: http://localhost:5000
# - Keycloak: http://localhost:8080
```

See [SETUP.md](./SETUP.md) for detailed setup instructions and lab exercises.

## Technology Stack

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **Passport.js** with OpenID Connect strategy
- **Express-Session** for session management

### Frontend
- **React 18** with TypeScript
- **React Router** for navigation
- **Axios** for API calls
- **Vite** for build tooling

### Infrastructure
- **Keycloak** - OpenID Connect Provider
- **PostgreSQL** - Database for Keycloak
- **Docker** - Containerization
- **Docker Compose** - Service orchestration

## API Endpoints

### Authentication
- `GET /auth/login` - Redirect to Keycloak login
- `GET /auth/callback` - OAuth callback endpoint
- `GET /auth/logout` - Logout (clears session)

### Navigation (Captain only)
- `GET /api/navigation` - Get current route
- `POST /api/navigation/reroute` - Update route
- `GET /api/navigation/history` - View route history

### Fuel Management
- `GET /api/fuel` - Get fuel status (all users)
- `POST /api/fuel/request-reallocation` - Reallocate fuel (authorized users)

### Diagnostics
- `GET /api/diagnostics` - Get system status (all users)
- `GET /api/diagnostics/alerts` - View alerts (engineers & captains)
- `POST /api/diagnostics/update` - Update diagnostics (engineers only)

### User
- `GET /api/user` - Get current user info

## Development

### Local Development (without Docker)

#### Backend
```bash
cd backend
npm install
npm run dev
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Building
```bash
# Build for production
docker-compose build --no-cache
```

## Lab Exercises

The project includes comprehensive lab exercises for teaching IAM concepts:

1. **User Management** - Create users and assign roles
2. **Permission Testing** - Test role-based access restrictions
3. **Permission Removal** - Revoke access in real-time
4. **Role Modification** - Change user permissions and observe effects

See [SETUP.md](./SETUP.md) for full exercise details.

## Security Considerations

- ✅ Session-based authentication with secure cookies
- ✅ Backend validates user roles for each endpoint
- ✅ CORS configured for localhost development
- ✅ User credentials never stored in frontend
- ✅ Role-based access control at API level

**Note:** This is an educational project. For production use:
- Use HTTPS/TLS
- Implement stronger CSRF protection
- Add rate limiting
- Use environment variables for secrets
- Implement audit logging

## Troubleshooting

### Services won't start
- Check if ports 3000, 5000, 8080, 5432 are available
- Ensure Docker daemon is running
- See [SETUP.md](./SETUP.md) for detailed troubleshooting

### Can't login
- Clear browser cookies
- Verify Keycloak is running: `docker-compose logs keycloak`
- Ensure user exists and has a password set
- User must be assigned at least one role

### Backend/Frontend not connecting
- Check if services are on same Docker network
- Verify API URLs in environment variables
- Check browser console for errors (F12)

## Contributing

This is an educational project. Feel free to:
- Add more features
- Improve UI/UX
- Add more realistic ship operations
- Create additional lab exercises

## License

Educational - Feel free to use and modify for learning purposes.

## Support

For questions or issues:
1. Check [SETUP.md](./SETUP.md)
2. Review Docker logs: `docker-compose logs`
3. Verify services: `docker-compose ps`
4. Check Keycloak admin console configuration

---

**Happy Learning!** 🚢⚓
