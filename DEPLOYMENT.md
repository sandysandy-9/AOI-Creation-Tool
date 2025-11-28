# Deployment Guide

This guide covers deploying the AOI Creation Tool to various hosting platforms.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Build Configuration](#build-configuration)
- [Vercel Deployment](#vercel-deployment)
- [Netlify Deployment](#netlify-deployment)
- [GitHub Pages](#github-pages)
- [AWS S3 + CloudFront](#aws-s3--cloudfront)
- [Docker Deployment](#docker-deployment)
- [Environment Variables](#environment-variables)

---

## Prerequisites

Before deploying, ensure:

- ✅ All tests pass: `npm run test`
- ✅ Build succeeds: `npm run build`
- ✅ No linting errors: `npm run lint`
- ✅ Environment variables configured

---

## Build Configuration

### Production Build

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory:

- Minified JavaScript (~123KB gzipped)
- Optimized CSS (~4.4KB gzipped)
- Source maps for debugging
- Static assets with cache-busting hashes

### Build Output Structure

```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   └── index-[hash].css
└── vite.svg
```

---

## Vercel Deployment

### Option 1: Vercel CLI

1. **Install Vercel CLI**

   ```bash
   npm i -g vercel
   ```

2. **Deploy**

   ```bash
   vercel
   ```

3. **Deploy to Production**
   ```bash
   vercel --prod
   ```

### Option 2: GitHub Integration

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Configure:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Click "Deploy"

### Vercel Configuration (`vercel.json`)

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## Netlify Deployment

### Option 1: Netlify CLI

1. **Install Netlify CLI**

   ```bash
   npm i -g netlify-cli
   ```

2. **Build and Deploy**
   ```bash
   npm run build
   netlify deploy --prod --dir=dist
   ```

### Option 2: GitHub Integration

1. Go to [netlify.com](https://netlify.com)
2. Click "New site from Git"
3. Choose your repository
4. Configure:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. Click "Deploy site"

### Netlify Configuration (`netlify.toml`)

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

---

## GitHub Pages

### Using `gh-pages` package

1. **Install**

   ```bash
   npm install -D gh-pages
   ```

2. **Add deploy script to `package.json`**

   ```json
   {
     "scripts": {
       "deploy": "npm run build && gh-pages -d dist"
     }
   }
   ```

3. **Configure Vite base path (`vite.config.ts`)**

   ```typescript
   export default defineConfig({
     base: '/your-repo-name/',
     // ... rest of config
   });
   ```

4. **Deploy**
   ```bash
   npm run deploy
   ```

### GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

---

## AWS S3 + CloudFront

### 1. Build the Application

```bash
npm run build
```

### 2. Create S3 Bucket

```bash
aws s3 mb s3://aoi-creation-tool
```

### 3. Configure Bucket for Static Hosting

```bash
aws s3 website s3://aoi-creation-tool \
  --index-document index.html \
  --error-document index.html
```

### 4. Upload Files

```bash
aws s3 sync dist/ s3://aoi-creation-tool \
  --delete \
  --cache-control "public, max-age=31536000, immutable"
```

### 5. Create CloudFront Distribution

```bash
aws cloudfront create-distribution \
  --origin-domain-name aoi-creation-tool.s3.amazonaws.com
```

### 6. Configure Custom Error Pages

Redirect all 404s to `/index.html` for SPA routing.

---

## Docker Deployment

### Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### nginx.conf

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Build and Run

```bash
# Build image
docker build -t aoi-creation-tool .

# Run container
docker run -p 8080:80 aoi-creation-tool
```

### Docker Compose

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - '8080:80'
    environment:
      - NODE_ENV=production
```

---

## Environment Variables

### Production Variables

Create `.env.production`:

```bash
VITE_APP_NAME=AOI Creation Tool
VITE_WMS_URL=https://www.wms.nrw.de/geobasis/wms_nw_dop
VITE_NOMINATIM_URL=https://nominatim.openstreetmap.org
VITE_DEFAULT_CENTER_LAT=51.4332
VITE_DEFAULT_CENTER_LNG=7.6616
VITE_DEFAULT_ZOOM=10
```

### Platform-Specific Setup

**Vercel:**

- Add in Vercel Dashboard → Settings → Environment Variables

**Netlify:**

- Add in Netlify Dashboard → Site settings → Environment variables

**GitHub Pages:**

- No environment variables at build time (use defaults)

**AWS:**

- Use Parameter Store or Secrets Manager

---

## Post-Deployment Checklist

- [ ] Verify site loads correctly
- [ ] Test map rendering and WMS layer
- [ ] Test drawing tools functionality
- [ ] Test search/geocoding
- [ ] Verify localStorage persistence
- [ ] Check mobile responsiveness
- [ ] Test in multiple browsers
- [ ] Verify custom domain (if configured)
- [ ] Set up SSL/TLS certificate
- [ ] Configure CDN caching
- [ ] Set up monitoring (Sentry, LogRocket)
- [ ] Configure analytics (Google Analytics, Plausible)
- [ ] Test performance (Lighthouse score)
- [ ] Verify CSP headers
- [ ] Check CORS configuration

---

## Performance Optimization

### CDN Configuration

**Cache Headers:**

- HTML: `no-cache` or `max-age=300`
- JS/CSS: `max-age=31536000, immutable`
- Images: `max-age=31536000`

### Compression

Ensure gzip/brotli compression is enabled:

- Vercel/Netlify: Enabled by default
- Nginx: Add to config
- CloudFront: Enable in distribution settings

---

## Monitoring & Analytics

### Recommended Tools

1. **Error Tracking**: Sentry

   ```bash
   npm install @sentry/react
   ```

2. **Analytics**: Plausible or Google Analytics

   ```bash
   npm install react-ga4
   ```

3. **Performance**: Lighthouse CI
   ```bash
   npm install -D @lhci/cli
   ```

---

## Rollback Strategy

### Vercel

```bash
vercel rollback
```

### Netlify

Dashboard → Deploys → Click previous deploy → "Publish deploy"

### AWS S3

Use versioning and restore previous version

---

## Security Headers

Add to deployment platform:

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://nominatim.openstreetmap.org https://www.wms.nrw.de;
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

---

## Support

For deployment issues:

- Check build logs
- Verify environment variables
- Review platform documentation
- Open an issue on GitHub

---

**Last Updated**: November 28, 2024  
**Version**: 1.0.0
