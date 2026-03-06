# Quick Reference Guide - Ship Navigation Portal

## Starting the Portal

```bash
# Navigate to project directory
cd C:\Users\dregd\Projects\ship-portal

# Start all services (Keycloak, Backend, Frontend, Database)
docker-compose up

# Services startup time: 30-60 seconds
# Then access: http://localhost:3000
```

## Accessing Services

| Service | URL | Default Login |
|---------|-----|---|
| **Ship Portal** | http://localhost:3000 | Use Keycloak login |
| **Keycloak Admin** | http://localhost:8080/admin | admin / admin |
| **Backend API** | http://localhost:5000 | No auth required for docs |
| **Database** | localhost:5432 | keycloak / keycloak-password |

## Common Tasks

### Create a New User in Keycloak

1. Go to http://localhost:8080/admin
2. Click **"Users"** → **"Add user"**
3. Enter username and email
4. Click **"Create"**
5. Go to **"Credentials"** tab and set password
6. Go to **"Role mapping"** → **"Assign role"** to add roles

### Assign Role to User

1. In Keycloak admin, go to **"Users"**
2. Click the user's name
3. Click **"Role mapping"** tab
4. Under **"Assign role"**, select roles:
   - `captain` - Full access
   - `first_officer` - Navigation view
   - `engineer` - Diagnostics & fuel
   - `crew_member` - Read-only

### Test Different Roles

```bash
# Terminal 1: Tail logs while testing
docker-compose logs -f

# In browser window 1: Login as captain
http://localhost:3000 → Login → captain1/password

# In browser window 2 (incognito): Login as engineer
http://localhost:3000 → Login → engineer1/password

# Compare what each can do
```

### Reset Everything (Clean Start)

```bash
# Stop all services
docker-compose down

# Remove all data (including database)
docker-compose down -v

# Rebuild from scratch
docker-compose build --no-cache

# Start fresh
docker-compose up
```

### View Logs

```bash
# All services
docker-compose logs

# Specific service
docker-compose logs backend
docker-compose logs frontend
docker-compose logs keycloak
docker-compose logs postgres

# Follow logs in real-time
docker-compose logs -f
```

### Stop Services

```bash
# Stop but keep data
docker-compose stop

# Stop and remove containers
docker-compose down

# Remove everything including data
docker-compose down -v
```

## Important Ports

- **3000** - Frontend (React)
- **5000** - Backend (Node.js)
- **8080** - Keycloak
- **5432** - PostgreSQL

Make sure these ports are available before starting!

## For Local Development (Without Docker)

### Backend Development

```bash
cd backend
npm install
npm run dev
# Port 5000 with hot reload
```

### Frontend Development

```bash
cd frontend
npm install
npm run dev
# Port 3000 with Vite hot reload
```

### Build for Production

```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
npm run preview
```

## Test Users (After Initial Setup)

After going through [SETUP.md](./SETUP.md) setup steps:

```
Username: captain1
Password: password
Role: captain
Access: Full

Username: officer1
Password: password
Role: first_officer
Access: Navigation view

Username: engineer1
Password: password
Role: engineer
Access: Diagnostics & Fuel

Username: crew1
Password: password
Role: crew_member
Access: Read-only
```

## Troubleshooting

### "Can't connect to localhost:3000"
```bash
# Check if frontend container is running
docker-compose ps frontend

# Check logs
docker-compose logs frontend

# Rebuild and restart
docker-compose restart frontend
```

### "Keycloak admin not accessible"
```bash
# Wait 60 seconds and try again - Keycloak takes time to start
# Check logs
docker-compose logs keycloak

# Restart if needed
docker-compose restart keycloak
```

### "Can't login to portal"
1. Clear browser cookies
2. Check if user has password set
3. Check if user has at least one role
4. Verify Keycloak is running: `docker-compose logs keycloak`

### "Port already in use"
```bash
# Check what's using the port
netstat -ano | findstr :3000

# Either stop the service or change docker-compose ports
```

## API Testing

### Get Current User

```bash
curl -b cookies.txt http://localhost:5000/api/user
```

### Get Navigation Data

```bash
curl -b cookies.txt http://localhost:5000/api/navigation
```

### Get Fuel Data

```bash
curl -b cookies.txt http://localhost:5000/api/fuel
```

### Get Diagnostics

```bash
curl -b cookies.txt http://localhost:5000/api/diagnostics
```

## Making Changes

### Backend Code
1. Edit files in `backend/src/`
2. With `docker-compose up`, changes auto-reload (via ts-node/nodemon)
3. Check logs for errors: `docker-compose logs backend`

### Frontend Code
1. Edit files in `frontend/src/`
2. Changes auto-reload in browser via Vite
3. Check browser console for errors (F12)

### Configuration
1. Edit `docker-compose.yml` for service configuration
2. Edit `.env` files for environment variables
3. Rebuild if needed: `docker-compose build`

## Lab Demonstration Flow

1. **Setup Phase** (5 min)
   - Start Docker: `docker-compose up`
   - Wait for services to initialize

2. **User Creation** (10 min)
   - Create multiple test users in Keycloak
   - Assign different roles

3. **Permission Demo** (15 min)
   - Login as Captain → Show all features
   - Login as Engineer → Show limited features
   - Login as Crew → Show read-only access

4. **Live Access Control** (10 min)
   - Remove a role from a user in Keycloak
   - Refresh browser → Feature disappears
   - Re-add role → Feature reappears

5. **Q&A** (5-10 min)
   - Discuss IAM concepts
   - Explore Keycloak admin features

**Total Time: 45-60 minutes**

## Documentation

- **SETUP.md** - Detailed setup and lab exercises
- **README.md** - Project overview and tech stack
- **This file** - Quick reference for common tasks

---

Need help? Check SETUP.md for detailed instructions!
