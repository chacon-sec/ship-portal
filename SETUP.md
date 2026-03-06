# Ship Navigation Portal - IAM Lab Setup Guide

Welcome to the Ship Navigation Portal, an interactive Identity and Access Management (IAM) lab built with Keycloak. This guide will help you set up and use the portal for teaching and learning IAM concepts.

## Prerequisites

- Docker and Docker Compose installed
- Git (optional, for version control)
- A text editor or IDE

## Quick Start

### 1. Clone or Download the Project

```bash
cd C:\Users\dregd\Projects\ship-portal
```

### 2. Start All Services

```bash
docker-compose up -d
```

This will start:
- **PostgreSQL** (port 5432) - Database for Keycloak
- **Keycloak** (port 8080) - Identity and Access Management Server
- **Backend** (port 5000) - Node.js/Express API server
- **Frontend** (port 3000) - React web application

**Tip:** If you want to see logs in real-time, run without `-d`:
```bash
docker-compose up
```

### 3. Wait for Services to Start

Give Keycloak about 30-60 seconds to fully initialize. You can verify services are running:

```bash
docker-compose logs
```

## Accessing the Services

| Service | URL | Purpose |
|---------|-----|---------|
| **Ship Portal** | http://localhost:3000 | Main web application |
| **Keycloak Admin** | http://localhost:8080/admin | User management console |
| **Backend API** | http://localhost:5000 | REST API endpoint |

## Initial Keycloak Setup

### First Time Setup

1. Go to http://localhost:8080/admin
2. Login with:
   - Username: `admin`
   - Password: `admin`

### Create the Ship Portal Realm

1. Click the realm dropdown (top left) → **"Create Realm"**
2. Enter **Realm name**: `ship-portal`
3. Click **"Create"**

### Register Client

1. In the left menu, go to **"Clients"**
2. Click **"Create client"**
3. Fill in details:
   - **Client ID**: `ship-portal-client`
   - **Client protocol**: `openid-connect`
   - **Client authentication**: OFF (Public client)
4. Click **"Next"**
5. On "Capability config" page, make sure **"Standard flow enabled"** is ON
6. Click **"Save"**
7. Go to the **"Valid Redirect URIs"** section and add:
   - `http://localhost:3000/*`
8. Click **"Save"** at the bottom

### Create Roles

1. In the left menu, go to **"Roles"**
2. Create these roles by clicking **"Create role"** for each:
   - `captain`
   - `first_officer`
   - `engineer`
   - `crew_member`

### Create Test Users

Now create users for different roles. For each user:

1. Go to **"Users"** in left menu
2. Click **"Add user"**
3. Fill in:
   - **Username**: (choose a username)
   - **Email** (optional): (enter email)
   - **First name** (optional)
   - **Last name** (optional)
   - Make sure **"Email verified"** is OFF for testing
4. Click **"Create"**

#### Set Password for User

1. Go to the **"Credentials"** tab
2. Click **"Set password"**
3. Enter a password and toggle **"Temporary"** to OFF
4. Click **"Set password"** (you may get a confirmation prompt)

#### Assign Roles to User

1. Go to the **"Role mapping"** tab
2. Under **"Assign role"**, select the role you want to assign (e.g., `captain`)
3. Click **"Assign"**

### Example Users to Create

Create these test users to demonstrate IAM:

| Username | Password | Role |
|----------|----------|------|
| captain1 | password | captain |
| officer1 | password | first_officer |
| engineer1 | password | engineer |
| crew1 | password | crew_member |

## Using the Ship Portal

### Access the Portal

1. Open http://localhost:3000 in your browser
2. Click **"Login with Keycloak"**
3. You'll be redirected to Keycloak login
4. Login with one of your test users

### What Each Role Can Access

#### Captain
- ✅ Navigation control - Reroute the ship, set waypoints
- ✅ Fuel management - Allocate fuel between tanks
- ✅ Ship diagnostics - View and clear alerts
- ✅ Full system access

#### First Officer
- ✅ View current route
- ✅ View navigation diagnostics
- ✅ Can request fuel reallocation
- ❌ Cannot modify routes
- ❌ Cannot clear critical alerts

#### Engineer
- ✅ Modify diagnostics settings
- ✅ View fuel status and consumption
- ✅ View engine metrics
- ❌ Cannot modify routes or navigation
- ❌ Cannot allocate fuel

#### Crew Member
- ✅ View ship status (read-only)
- ✅ View assigned diagnostics
- ❌ Cannot modify anything
- ❌ Limited dashboard access

## Lab Exercises

### Exercise 1: User Management - Add a User with Captain Role

**Objective:** Learn how to create users and assign roles in Keycloak

**Steps:**
1. Access Keycloak admin console (http://localhost:8080/admin)
2. Create a new user named `captain_test`
3. Set a temporary password
4. Assign the `captain` role
5. Login to the Ship Portal with this user
6. Verify you can access Navigation control

**Questions:**
- What happens if you try to access navigation without the captain role?
- How does Keycloak prevent unauthorized access?

### Exercise 2: Permission Restriction - Test Role-Based Access

**Objective:** Understand how different roles have different permissions

**Steps:**
1. Login as `engineer1` (engineer role)
2. Try to access the Navigation page
3. Observe the permission error message
4. Logout and login as `captain1`
5. Verify you can access Navigation

**Questions:**
- Why is Engineer unable to access Navigation?
- What role would an officer need to see route recommendations?

### Exercise 3: Permission Removal - Remove Access

**Objective:** See real-time permission changes when roles are modified

**Steps:**
1. Create a user with `captain` role (e.g., `test_captain`)
2. Login to the Ship Portal as this user
3. Verify you can access all features
4. In Keycloak admin console, remove the `captain` role from this user
5. Refresh the Ship Portal page or logout/login
6. Observe that features are now inaccessible

**Questions:**
- How quickly does the access change take effect?
- What are the implications for security?

### Exercise 4: Role Modification - Change User Permissions

**Objective:** Understand how role changes affect access

**Steps:**
1. Create user `engineer_to_captain` with `engineer` role
2. Login and verify limited access
3. In Keycloak, add `captain` role to this user
4. Logout and login again
5. Verify you now have full access

**Questions:**
- How can you transition crew members to higher positions?
- What roles can be combined?

## Troubleshooting

### Services Won't Start

**Problem:** `docker-compose up` fails with error

**Solution:**
1. Ensure Docker daemon is running
2. Check if ports are already in use:
   ```bash
   netstat -ano | findstr :3000  # For port 3000
   netstat -ano | findstr :5000  # For port 5000
   netstat -ano | findstr :8080  # For port 8080
   ```
3. Stop conflicting services or use different ports

### Keycloak Won't Initialize

**Problem:** Getting errors when accessing Keycloak admin portal

**Solution:**
1. Give Keycloak more time (60+ seconds)
2. Check logs: `docker-compose logs keycloak`
3. Verify database is running: `docker-compose logs postgres`
4. Restart services: `docker-compose restart`

### Can't Login to Ship Portal

**Problem:** Login fails or redirects to login page

**Solution:**
1. Clear browser cookies
2. Verify Keycloak is running and accessible
3. Check backend logs: `docker-compose logs backend`
4. Verify user exists and has password set in Keycloak
5. Ensure user has at least one role assigned

### Backend/Frontend Not Building

**Problem:** Docker build fails

**Solution:**
1. Clear Docker cache: `docker system prune`
2. Rebuild without cache: `docker-compose build --no-cache`
3. Check Node modules: `docker-compose logs backend` (for backend errors)

## Stopping Services

To stop all services:

```bash
docker-compose down
```

To stop and remove all data:

```bash
docker-compose down -v
```

## Additional Resources

- **Keycloak Documentation:** https://www.keycloak.org/documentation
- **OAuth 2.0/OpenID Connect:** https://openid.net/specs/openid-connect-core-1_0.html
- **React Router:** https://reactrouter.com/
- **Express.js:** https://expressjs.com/

## LAB NOTES FOR INSTRUCTORS

### Lab Duration
- Setup: 10-15 minutes
- Exercises: 30-45 minutes
- Total: 1-2 hours

### Key Learning Outcomes

Students should understand:
1. **Authentication vs. Authorization** - How Keycloak identifies users and controls access
2. **Role-Based Access Control (RBAC)** - How features are restricted by role
3. **Real-time Permission Changes** - How access can be revoked immediately
4. **User Management** - How to create, update, and manage users in an IAM system
5. **API Security** - How backend protects endpoints with role validation

### Extension Activities

- **Add more complex roles** (e.g., role hierarchies)
- **Implement attribute-based access control** (ABAC)
- **Add audit logging** to track permission changes
- **Test session management** (timeouts, token refresh)
- **Multi-factor authentication (MFA)** setup
- **Integration with Active Directory** or LDAP

## Support

For issues or questions:
1. Check Docker logs: `docker-compose logs`
2. Verify all services are running: `docker-compose ps`
3. Review Keycloak admin console for user/role configuration
4. Check browser console for frontend errors (F12)

Good luck with your IAM lab!
