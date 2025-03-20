# Deploying BetAnalyser to Render.com

This guide will help you deploy the BetAnalyser application to Render.com.

## Prerequisites

1. A Render.com account
2. Your project code pushed to a Git repository (GitHub, GitLab, etc.)

## Deployment Steps

### Option 1: Using the render.yaml Blueprint (Recommended)

1. Push your code to a Git repository if you haven't already
2. Log in to your Render.com account
3. Click on the "New" button and select "Blueprint"
4. Connect your Git repository
5. Render will automatically detect the `render.yaml` file and set up all services
6. Review the configuration and click "Apply"
7. Render will create and deploy all services defined in the blueprint

### Option 2: Manual Setup

If you prefer to set up services manually:

#### Database Setup

1. In Render dashboard, click "New" and select "PostgreSQL"
2. Name: `bet-analyser-db`
3. Database: `betanalyser`
4. User: Leave as default
5. Select the free plan
6. Click "Create Database"
7. Save the internal connection string for the next steps

#### Backend API Setup

1. Click "New" and select "Web Service"
2. Connect your Git repository
3. Name: `bet-analyser-api`
4. Environment: `Node`
5. Build Command: `npm install && npx prisma generate`
6. Start Command: `npm start`
7. Add the following environment variables:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `DATABASE_URL`: [Your PostgreSQL connection string from previous step]
   - `ADMIN_PASSWORD`: [Create a secure password]
8. Click "Create Web Service"

#### Frontend Setup

1. Click "New" and select "Static Site"
2. Connect your Git repository
3. Name: `bet-analyser-frontend`
4. Build Command: `cd frontend && npm install && npm run build`
5. Publish Directory: `frontend/build`
6. Add the following environment variable:
   - `REACT_APP_API_URL`: `https://bet-analyser-api.onrender.com` (replace with your actual API URL)
7. Click "Create Static Site"

## Post-Deployment

1. Once all services are deployed, visit your frontend URL
2. The application should be running with the backend connected to the database
3. You can upload data and start using the application

## Troubleshooting

- If the frontend can't connect to the backend, check that the `REACT_APP_API_URL` is set correctly
- If the backend can't connect to the database, verify the `DATABASE_URL` environment variable
- Check the logs in Render dashboard for any errors

## Data Migration

To import your existing data:

1. Use the Upload feature in the application with admin credentials
2. Upload your Excel files through the UI

Alternatively, you can use Prisma's migration tools to import data directly to the database.
