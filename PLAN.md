# Docker Compose & Deployment Plan for Notes App

## Overview

This plan outlines how to containerize the Notes App (Node.js Express backend + React frontend + MongoDB) and deploy it using Docker Compose, Terraform, Ansible, and GitHub Actions with a Nginx reverse proxy.

---

## Requirement #1: Dockerize the API & Setup Docker Compose

### 1.1 Create Dockerfile for Backend

**File:** `backend/Dockerfile`

**Purpose:** Containerize the Node.js Express API server

**Key Configuration:**

- Base image: `node:18-alpine` (lightweight)
- Working directory: `/app`
- Copy package.json and install dependencies
- Expose port 3001 (backend runs here)
- Use `npm run dev` for development, `npm start` for production
- Health check to verify container is running

**Considerations:**

- Multi-stage build (optional) to optimize image size
- Separate dev and prod Dockerfiles if needed
- Ensure `cross-env` compatibility in container

### 1.2 Create Dockerfile for Frontend (Optional)

**File:** `frontend/Dockerfile`

**Purpose:** Build React app with Vite and serve with Nginx or as static files

**Key Configuration:**

- Build stage: Node.js to run `npm run build`
- Runtime stage: Nginx or Node.js to serve built files
- Copy dist folder to backend static folder OR serve independently
- Expose port 3000 (or 5173 for Vite)

**Current Setup:** Frontend is built into backend's `dist/` folder, so separate containerization may be optional

### 1.3 Create docker-compose.yml

**File:** `docker-compose.yml` (in root)

**Services:**

1. **MongoDB Service**
   - Image: `mongo:latest`
   - Port: 27017 (internal) → 27017 (host)
   - Environment: Set `MONGO_INITDB_DATABASE=notes`
   - Volume: Named volume `mongodb_data` for persistence
   - Health check to verify database is ready

2. **Backend Service (Node.js API)**
   - Build from `./backend/Dockerfile`
   - Port: 3001 (internal) → 3001 (host)
   - Environment variables from `.env.local` or inline:
     - `PORT=3001`
     - `MONGODB_URI=mongodb://mongo:27017/notes`
     - `NODE_ENV=production`
   - Depends on MongoDB service
   - Volume for code (for development with nodemon)
   - Restart policy: `always`

3. **Frontend Service (Optional)**
   - Either:
     a. Build React app as part of backend startup
     b. Separate Node.js/Nginx container serving built files
   - Port: 3000 → 3000 (or 5173)
   - Depends on backend service

4. **Nginx Reverse Proxy (Bonus)**
   - Image: `nginx:alpine`
   - Port: 80 → 80, 443 → 443 (optional for HTTPS)
   - Config file: `nginx.conf` (custom configuration)
   - Routes requests to backend and frontend

**Volumes:**

- `mongodb_data`: Named volume for MongoDB persistence
- `./backend:/app`: Bind mount for code (dev mode)

**Networks:**

- Create custom Docker network `notes_network` for service communication

### 1.4 Update Environment Configuration

**File:** `.env.example` (in root and backend/)

**Variables to include:**

```
# Backend
PORT=3001
MONGODB_URI=mongodb://mongo:27017/notes
NODE_ENV=production
JWT_SECRET=your_secret_key_here

# Optional
LOG_LEVEL=info
```

**Note:** Create `.env.local` for local development, `.env.prod` for production

### 1.5 Update package.json Scripts

**File:** `backend/package.json`

**Add/Update scripts:**

```json
"docker:dev": "docker-compose -f docker-compose.dev.yml up",
"docker:prod": "docker-compose -f docker-compose.yml up -d",
"docker:down": "docker-compose down",
"docker:logs": "docker-compose logs -f"
```

### 1.6 Testing Docker Setup Locally

**Steps:**

1. Build images: `docker-compose build`
2. Start services: `docker-compose up`
3. Verify API: `curl http://localhost:3001/api/notes`
4. Verify MongoDB persistence: `docker-compose down && docker-compose up`
5. Check logs: `docker-compose logs -f`

---

## Requirement #2: Setup Remote Server (Terraform & Ansible)

### 2.1 Infrastructure Setup with Terraform

**File Structure:**

```
terraform/
├── main.tf              # VPS provider configuration (DO/AWS/GCP)
├── variables.tf         # Input variables (instance type, region)
├── outputs.tf           # Output values (IP address, etc.)
├── terraform.tfvars     # Variable values
└── .gitignore           # Ignore sensitive files
```

**Key Configuration:**

**Provider Options:**

- **DigitalOcean:** Droplet creation with specific region/size
- **AWS:** EC2 instance with security group configuration
- **GCP:** Compute Engine instance

**Resources to Create:**

1. **VPS Instance**
   - OS: Ubuntu 22.04 LTS (or latest)
   - Type: 2GB RAM, 2 vCPU minimum
   - Region: Based on preference (us-east, eu-west, etc.)
   - SSH key pair for access

2. **Firewall/Security Group**
   - Allow port 22 (SSH) - restricted to your IP
   - Allow port 80 (HTTP)
   - Allow port 443 (HTTPS)
   - Allow port 3001 (backend internal)

3. **Optional: Floating IP (DigitalOcean)**
   - For easy server replacement

**Outputs:**

```
server_ip_address
server_hostname
ssh_key_path
```

**References:**

- DigitalOcean Provider: https://registry.terraform.io/providers/digitalocean/digitalocean/latest
- AWS Provider: https://registry.terraform.io/providers/hashicorp/aws/latest
- Terraform Docs: https://www.terraform.io/docs

### 2.2 Server Configuration with Ansible

**File Structure:**

```
ansible/
├── inventory.ini        # Server IP and connection details
├── site.yml             # Main playbook
├── roles/
│   ├── docker/
│   │   ├── tasks/
│   │   │   └── main.yml
│   │   └── handlers/
│   │       └── main.yml
│   ├── docker-compose/
│   │   └── tasks/main.yml
│   └── app-deployment/
│       └── tasks/main.yml
└── templates/
    └── docker-compose.yml.j2
```

**Tasks to Automate:**

1. **Docker Installation**
   - Update system packages
   - Install Docker daemon
   - Start and enable Docker service
   - Add user to docker group

2. **Docker Compose Installation**
   - Download docker-compose binary
   - Make executable and verify version

3. **Application Deployment**
   - Clone repository from GitHub
   - Copy `.env` file from secrets manager
   - Pull latest Docker images from Docker Hub
   - Run `docker-compose up -d`
   - Verify services are running

4. **System Configuration**
   - Configure firewall (UFW)
   - Set up log rotation
   - Enable auto-updates
   - Configure fail2ban for security

**Key Considerations:**

- Use Ansible Vault for sensitive data (API keys, passwords)
- Implement idempotency (safe to run multiple times)
- Use handlers for service restarts
- Add health checks/monitoring tasks

**References:**

- Ansible Documentation: https://docs.ansible.com/
- Docker Ansible Module: https://docs.ansible.com/ansible/latest/collections/community/docker/
- Best Practices: https://docs.ansible.com/ansible/latest/user_guide/playbooks_best_practices.html

### 2.3 Deployment Steps

**Manual Deployment Flow:**

```
1. Provision infrastructure: terraform apply
2. Get server IP from terraform output
3. Update Ansible inventory with server IP
4. Run Ansible playbook: ansible-playbook -i inventory.ini site.yml
5. Verify application: curl http://<server_ip>
6. Monitor logs: docker-compose logs -f
```

---

## Requirement #3: CI/CD Pipeline with GitHub Actions

### 3.1 GitHub Actions Workflow Structure

**File Structure:**

```
.github/
└── workflows/
    ├── test.yml              # Run tests on PR
    ├── build-and-push.yml    # Build & push Docker images
    └── deploy.yml            # Deploy to production server
```

### 3.2 Test Workflow (test.yml)

**Triggers:**

- On push to main/develop branches
- On pull requests

**Jobs:**

1. **Backend Tests**
   - Setup Node.js
   - Install dependencies
   - Run `npm run lint`
   - Run `npm test`
   - Optional: Generate coverage report

2. **Frontend Tests**
   - Setup Node.js
   - Install frontend dependencies
   - Run tests with Vitest
   - Optional: Upload coverage to Codecov

**Example Structure:**

```yaml
name: Tests
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"
      # Install, lint, test

  frontend:
    runs-on: ubuntu-latest
    steps:
      # Similar setup and test steps
```

### 3.3 Build & Push to Docker Hub (build-and-push.yml)

**Triggers:**

- On push to main/develop (after tests pass)
- Manual trigger (workflow_dispatch)

**Steps:**

1. Checkout code
2. Set up Docker Buildx
3. Login to Docker Hub (use secrets)
4. Build and push backend image
   - Tag: `username/notes-app-backend:latest`, `:v1.2.3`
5. Build and push frontend image (if separate)
6. Update deployment manifests with new image tags

**Prerequisites:**

- Docker Hub account
- Store credentials in GitHub Secrets:
  - `DOCKER_USERNAME`
  - `DOCKER_PASSWORD`

**Example:**

```yaml
- name: Push to Docker Hub
  uses: docker/build-push-action@v4
  with:
    context: ./backend
    push: true
    tags: |
      ${{ secrets.DOCKER_USERNAME }}/notes-app-backend:latest
      ${{ secrets.DOCKER_USERNAME }}/notes-app-backend:${{ github.sha }}
```

### 3.4 Deploy to Production (deploy.yml)

**Triggers:**

- On successful image push to main branch
- Manual trigger

**Deployment Methods:**

**Option A: SSH + Docker Compose**

1. SSH into server
2. Pull latest code from GitHub
3. Update docker-compose.yml with new image tags
4. Run `docker-compose up -d`
5. Verify deployment

**Option B: SSH + Direct docker pull and run**

1. SSH into server
2. Pull new images from Docker Hub
3. Stop old containers
4. Run new containers
5. Clean up old images

**Implementation:**

```yaml
- name: Deploy via SSH
  uses: appleboy/ssh-action@master
  with:
    host: ${{ secrets.DEPLOY_HOST }}
    username: ${{ secrets.DEPLOY_USER }}
    key: ${{ secrets.DEPLOY_SSH_KEY }}
    script: |
      cd /app/notes-app
      docker-compose pull
      docker-compose up -d
      docker-compose logs -f
```

**Prerequisites:**

- Store in GitHub Secrets:
  - `DEPLOY_HOST`: Server IP
  - `DEPLOY_USER`: SSH username
  - `DEPLOY_SSH_KEY`: Private SSH key
  - `DEPLOY_PASSWORD`: (optional) for sudo

### 3.5 Rollback Strategy

**Implementation:**

- Keep previous image versions in Docker Hub
- Tag deployments with version numbers
- Create manual GitHub Actions workflow to rollback
- Monitor application health after deployment

---

## Requirement #Bonus: Nginx Reverse Proxy

### 4.1 Nginx Configuration

**File:** `nginx/nginx.conf`

**Key Features:**

```
Server Block 1 (HTTP → HTTPS redirect)
- Listen on port 80
- Redirect all traffic to HTTPS

Server Block 2 (HTTPS main)
- Listen on port 443
- SSL certificate configuration
- Upstream services:
  - Backend: http://backend:3001
  - Frontend: http://backend:3000 (or frontend container)

Routing Rules:
- / → Frontend (static files)
- /api/* → Backend API
- /api/docs → API documentation (Swagger/OpenAPI)
```

### 4.2 SSL Certificate Management

**Options:**

1. **Let's Encrypt (Free + Auto-renewal)**
   - Use Certbot with Docker
   - Set up auto-renewal with cron job
   - Files: `/etc/letsencrypt/live/your-domain.com/`

2. **Self-signed (Development)**
   - Quick setup for testing
   - Not suitable for production

3. **Paid Certificate (Enterprise)**
   - From providers like DigiCert, GoDaddy

**Integration with Docker Compose:**

```yaml
nginx:
  image: nginx:alpine
  volumes:
    - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    - ./ssl:/etc/nginx/ssl:ro # SSL certificates
  ports:
    - "80:80"
    - "443:443"
  depends_on:
    - backend
```

### 4.3 DNS & Domain Setup

**Steps:**

1. Register domain name (GoDaddy, Namecheap, etc.)
2. Point domain's nameservers to cloud provider
3. Create DNS A record → Server IP
4. Create CNAME for www subdomain
5. Verify DNS propagation: `nslookup your-domain.com`

**Cloud Provider DNS:**

- DigitalOcean: Use DigitalOcean Spaces NS servers
- AWS: Use Route53
- GCP: Use Cloud DNS

### 4.4 Testing Nginx Configuration

**Steps:**

```bash
# Validate Nginx config
docker exec notes-app-nginx nginx -t

# Check Nginx logs
docker-compose logs nginx

# Test endpoint routing
curl -I http://localhost/api/notes
curl -I http://localhost/
```

---

## Project File Structure (After Implementation)

```
notes-app/
├── .github/
│   └── workflows/
│       ├── test.yml
│       ├── build-and-push.yml
│       └── deploy.yml
├── terraform/
│   ├── main.tf
│   ├── variables.tf
│   ├── outputs.tf
│   └── terraform.tfvars.example
├── ansible/
│   ├── inventory.ini
│   ├── site.yml
│   └── roles/
├── nginx/
│   ├── nginx.conf
│   └── ssl/           # Store certificates (gitignore)
├── backend/
│   ├── Dockerfile
│   ├── .env.example
│   └── ... (existing files)
├── frontend/
│   ├── Dockerfile     # (optional)
│   └── ... (existing files)
├── docker-compose.yml
├── docker-compose.dev.yml  # Development variant
├── .env.example
├── .gitignore
└── PLAN.md (this file)
```

---

## Implementation Roadmap

### Phase 1: Local Docker Setup (Estimated: 2-3 days)

- [ ] Create backend Dockerfile
- [ ] Create frontend Dockerfile (if needed)
- [ ] Create docker-compose.yml
- [ ] Test locally and verify data persistence

### Phase 2: Remote Infrastructure (Estimated: 2-3 days)

- [ ] Set up Terraform configuration
- [ ] Create VPS instance and security groups
- [ ] Test SSH access to server
- [ ] Create Ansible playbook for server setup

### Phase 3: CI/CD Pipeline (Estimated: 3-4 days)

- [ ] Set up GitHub Actions test workflow
- [ ] Build and push Docker images workflow
- [ ] Create deployment workflow
- [ ] Test end-to-end deployment

### Phase 4: Reverse Proxy & DNS (Estimated: 2 days)

- [ ] Configure Nginx reverse proxy
- [ ] Set up SSL/TLS certificates
- [ ] Configure domain DNS records
- [ ] Test HTTPS access

### Phase 5: Monitoring & Optimization (Estimated: 2-3 days)

- [ ] Set up application monitoring
- [ ] Configure log aggregation
- [ ] Add health checks
- [ ] Optimize Docker images and docker-compose

---

## Key Considerations & Best Practices

### Security

- Use environment variables for sensitive data (secrets)
- Implement SSH key-based authentication (no passwords)
- Use Ansible Vault for sensitive playbook data
- Enable firewall rules restricting access by IP
- Use private Docker registry if code is sensitive
- Enable HTTPS with valid SSL certificates
- Implement rate limiting on API endpoints
- Add authentication to MongoDB (username/password)

### Database Persistence

- Use named Docker volumes for MongoDB
- Implement automated backups
- Test restore procedures
- Monitor disk space usage

### Monitoring & Logging

- Centralize logs using ELK Stack or similar
- Set up alerts for application errors
- Monitor server resources (CPU, memory, disk)
- Track deployment history

### Cost Optimization

- Use smallest appropriate server size (2GB RAM minimum)
- Consider reserved instances for long-term deployments
- Use CDN for static assets
- Implement image optimization

### Development Workflow

- Create separate docker-compose files for dev/prod
- Use `.env.local` for local overrides
- Document environment setup
- Automate database seeding for local development

---

## Resources & Documentation

### Docker

- Docker Documentation: https://docs.docker.com/
- Docker Compose: https://docs.docker.com/compose/
- Best Practices: https://docs.docker.com/develop/dev-best-practices/

### Terraform

- Terraform Docs: https://www.terraform.io/
- DigitalOcean Provider: https://registry.terraform.io/providers/digitalocean/digitalocean/latest
- AWS Provider: https://registry.terraform.io/providers/hashicorp/aws/latest

### Ansible

- Ansible Docs: https://docs.ansible.com/
- Galaxy (Community Roles): https://galaxy.ansible.com/
- Best Practices: https://docs.ansible.com/ansible/latest/user_guide/playbooks_best_practices.html

### GitHub Actions

- Actions Documentation: https://docs.github.com/en/actions
- Marketplace: https://github.com/marketplace?type=actions
- Secrets Management: https://docs.github.com/en/actions/security-guides/encrypted-secrets

### Nginx

- Nginx Documentation: https://nginx.org/en/docs/
- Reverse Proxy Setup: https://nginx.org/en/docs/http/ngx_http_proxy_module.html

### Let's Encrypt

- Certbot: https://certbot.eff.org/
- Docker Integration: https://github.com/certbot/certbot/tree/master/certbot-nginx

---

## Notes & Assumptions

1. **MongoDB URI:** Currently hardcoded in docker-compose as `mongodb://mongo:27017/notes`. Adjust database name as needed.

2. **Frontend Bundling:** The current setup bundles frontend into backend's `dist/` folder. This may be simplified if frontend is served separately.

3. **JWT Secret:** Ensure `JWT_SECRET` is properly set in production with a strong, random value.

4. **Port Configuration:**
   - Backend runs on port 3001
   - Frontend/Nginx on port 3000 (or 80/443 with Nginx proxy)
   - MongoDB on port 27017
   - Adjust as needed for your setup

5. **Email Notifications:** Consider adding email alerts for failed deployments via GitHub Actions.

6. **Backup Strategy:** Implement MongoDB backup strategy (automated backups to S3 or similar).

7. **Version Control:** Add `.dockerignore`, `.gitignore` entries for sensitive files, build outputs, and dependencies.

---

## Estimated Timeline

**Total Implementation:** 2-3 weeks depending on experience level

- Phase 1 (Docker): 2-3 days
- Phase 2 (Infrastructure): 2-3 days
- Phase 3 (CI/CD): 3-4 days
- Phase 4 (Reverse Proxy): 2 days
- Phase 5 (Monitoring): 2-3 days
- Testing & Optimization: 3-5 days

---

**Last Updated:** February 2026
**Status:** Planning Phase
