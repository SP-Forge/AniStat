# AniStat Docker Setup

This project uses a single Docker container to run both the frontend (Next.js) and backend (Deno) services.

## Prerequisites

- Docker and Docker Compose installed
- MyAnimeList API Client ID

## Setup

1. **Configure Backend Environment Variables**
   ```bash
   cd anistat/backend
   cp .env.example .env
   # Edit .env and add your MyAnimeList CLIENT_ID
   ```

2. **Build and Run with Docker Compose**
   ```bash
   # From the root directory
   docker-compose up --build
   ```

3. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3333

## Single Container Build

You can also build and run the container directly:

```bash
cd anistat
docker build -t anistat-app .
docker run -p 3000:3000 -p 3333:3333 --env-file backend/.env anistat-app
```

## Deploying to Render

**CRITICAL: Fix the root package.json issue first!**

Your repository has an empty `package.json` in the root that interferes with Docker builds. 
**Delete these files from the repository root:**
```bash
git rm package.json package-lock.json
git commit -m "Remove empty root package files"
git push
```

**Then configure Render:**

1. **Create a new Web Service** in Render
2. **Connect your GitHub repository**
3. **Configure with these EXACT settings:**
   - **Environment**: Docker
   - **Root Directory**: `anistat`
   - **Dockerfile Path**: `Dockerfile`
   - **Docker Build Context Directory**: `.`

4. **Add Environment Variable:**
   - Key: `CLIENT_ID`
   - Value: Your MyAnimeList API Client ID

5. **Deploy!**

**Alternative:** If you don't want to delete the root package.json, use these Render settings instead:
   - **Root Directory**: Leave blank
   - **Dockerfile Path**: `anistat/Dockerfile`
   - **Docker Build Context Directory**: `anistat`

## Stop Services
```bash
docker-compose down
```

## Rebuild After Changes
```bash
docker-compose up --build
```

## Container Details

Both services run in a single container:
- **Backend (Deno)**: Runs on port 3333
- **Frontend (Next.js)**: Runs on port 3000

The container starts both services automatically using a startup script.
