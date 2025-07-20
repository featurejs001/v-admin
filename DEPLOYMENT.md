# Deployment Guide

## Problem
You're getting a 404 error when trying to access `featurejs001.github.io/v-admin/` because the project hasn't been deployed to GitHub Pages yet.

## Solution

### Option 1: Deploy to GitHub Pages (Recommended)

1. **Push your code to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Build Vue admin project"
   git push origin main
   ```

2. **Enable GitHub Pages**:
   - Go to your repository on GitHub
   - Go to Settings → Pages
   - Set Source to "GitHub Actions"
   - The workflow file `.github/workflows/deploy.yml` will automatically build and deploy

3. **Access your site**:
   - After deployment, your site will be available at: `https://featurejs001.github.io/v-admin/`

### Option 2: Manual Deployment

1. **Build the project**:
   ```bash
   npm run build:pro
   ```

2. **Deploy the `dist` folder**:
   - Upload the contents of the `dist` folder to your web server
   - Make sure the server is configured to serve from the `/v-admin/` path

### Option 3: Test Locally

To test the built version locally:
```bash
npm run preview
```
Then visit: `http://localhost:4173/v-admin/`

## Project Structure

- **Base Path**: `/v-admin/` (configured in `vite.config.js`)
- **Build Output**: `dist/` folder
- **Framework**: Vue 3 + Vite + Ant Design Vue
- **Features**: Admin dashboard with various components

## Troubleshooting

- **404 Error**: Make sure the project is built and deployed
- **Assets not loading**: Check that the base path `/v-admin/` is correctly configured
- **Build errors**: Run `npm install` first to install dependencies 