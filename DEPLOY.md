# Stun Backend Deployment Guide

Complete guide for deploying the Stun backend to Google Cloud Run.

---

## Prerequisites

- Google Cloud account
- Google Cloud CLI installed
- Gemini API key from [Google AI Studio](https://aistudio.google.com)

---

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click **Select Project** → **New Project**
3. Configure your project:
   - **Project Name:** `stun-ai`
   - **Project ID:** `stun-ai-xxxxx` (auto-generated)
4. Click **Create**

---

## Step 2: Enable Required APIs

Navigate to **APIs & Services** → **Library** and enable:

- ✅ Cloud Run API
- ✅ Artifact Registry API
- ✅ Cloud Build API
- ✅ Firestore API
- ✅ Vertex AI API

---

## Step 3: Create Firestore Database

1. Navigate to **Firestore** → **Create Database**
2. Select configuration:
   - **Mode:** Native
   - **Region:** `us-central1`
3. Click **Create**

---

## Step 4: Create Service Account

1. Navigate to **IAM & Admin** → **Service Accounts**
2. Click **Create Service Account**
3. Configure:
   - **Name:** `stun-backend`
   - **Description:** Service account for Stun backend
4. Grant the following roles:
   - Cloud Run Admin
   - Vertex AI User
   - Cloud Datastore User
5. Click **Done**
6. Select the service account → **Keys** → **Add Key** → **JSON**
7. Download and save the JSON key file securely

---

## Step 5: Prepare Environment Variables

Create a `.env` file in the `backend` directory:

```bash
# Server Configuration
PORT=8080
NODE_ENV=production

# Google Cloud Configuration
GCP_PROJECT_ID=your_project_id
GCP_REGION=us-central1

# Gemini API
GOOGLE_API_KEY=your_gemini_api_key

# Firebase/Firestore
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"..."}
BOARDS_COLLECTION=boards

# AI Model Configuration
VERTEX_MODEL=gemini-2.0-flash
```

**Get your Gemini API key:**
- Visit [Google AI Studio](https://aistudio.google.com)
- Create an API key
- Copy and paste into `GOOGLE_API_KEY`

**Firebase Service Account Key:**
- Paste the entire JSON content from Step 4 as a single-line string

---

## Step 6: Prepare Dockerfile

Create `Dockerfile` in the `backend` directory:

```dockerfile
FROM oven/bun:1

WORKDIR /app

# Install dependencies
COPY package.json bun.lock ./
RUN bun install

# Copy source code
COPY . .

# Build TypeScript
RUN bun run build

# Expose port
EXPOSE 8080

# Start server
CMD ["bun", "run", "start"]
```

---

## Step 7: Install Google Cloud CLI

1. Download and install from [cloud.google.com/sdk](https://cloud.google.com/sdk)
2. Authenticate:
   ```bash
   gcloud auth login
   ```
3. Set your project:
   ```bash
   gcloud config set project YOUR_PROJECT_ID
   ```

---

## Step 8: Build Container Image

From the `backend` directory, run:

```bash
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/stun-backend
```

Example:
```bash
gcloud builds submit --tag gcr.io/stun-ai/stun-backend
```

This builds and uploads your container to Google Container Registry.

---

## Step 9: Deploy to Cloud Run

Deploy the container:

```bash
gcloud run deploy stun-backend \
  --image gcr.io/YOUR_PROJECT_ID/stun-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1
```

The CLI will prompt you to set environment variables during deployment.

---

## Step 10: Configure Environment Variables

When prompted, add these environment variables:

```bash
PORT=8080
NODE_ENV=production
GCP_PROJECT_ID=stun-ai
GOOGLE_API_KEY=xxxxxxxxxxxxxxxx
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
BOARDS_COLLECTION=boards
VERTEX_MODEL=gemini-2.0-flash
GCP_REGION=us-central1
```

Alternatively, set them via Cloud Console:
1. Go to Cloud Run → Select your service
2. Click **Edit & Deploy New Revision**
3. Navigate to **Variables & Secrets** tab
4. Add each environment variable

---

## Step 11: Get Backend URL

After successful deployment, you'll receive a service URL:

```
https://stun-backend-abc123-uc.a.run.app
```

Save this URL - you'll need it for frontend configuration.

---

## Step 12: Test Backend Health

Test the health endpoint:

```bash
curl https://your-backend-url/health
```

Expected response:
```json
{
  "status": "ok",
  "service": "stun-backend"
}
```

---

## Step 13: Test AI Endpoint

Test the AI planning endpoint:

```bash
POST https://your-backend-url/api/ai/plan
Content-Type: application/json

{
  "boardId": "test-board",
  "command": "create a node",
  "screenshot": "data:image/png;base64,...",
  "nodes": []
}
```

Expected response:
```json
{
  "actions": [
    {
      "type": "create",
      "nodeType": "text",
      "text": "New Node",
      "position": { "x": 100, "y": 100 }
    }
  ]
}
```

---

## Step 14: Configure Frontend

Update your frontend `.env` file:

```bash
NEXT_PUBLIC_API_URL=https://your-backend-url
```

The frontend will now communicate with your deployed backend.

---

## Step 15: Configure Autoscaling

Optimize Cloud Run settings for production:

1. Go to Cloud Run → Select your service
2. Click **Edit & Deploy New Revision**
3. Configure scaling:
   - **Minimum instances:** 0 (cost-effective)
   - **Maximum instances:** 10
   - **Memory:** 512 MB
   - **CPU:** 1
   - **Request timeout:** 300 seconds
   - **Concurrency:** 80

These settings are ideal for hackathon/demo usage.

---

## Deployment Architecture

```
┌─────────────────┐
│   Frontend      │
│   (Next.js)     │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   Cloud Run     │
│   (Backend)     │
└────────┬────────┘
         │
    ┌────┴────┐
    ↓         ↓
┌─────────┐ ┌──────────┐
│Firestore│ │ Gemini   │
│ (Boards)│ │   API    │
└─────────┘ └──────────┘
```

---

## Cost Estimation

For hackathon/demo usage (estimated monthly):

| Service | Usage | Cost |
|---------|-------|------|
| Cloud Run | ~1000 requests/day | ~$0 (free tier) |
| Firestore | ~10K reads/writes | ~$0 (free tier) |
| Gemini API | ~500 requests | ~$1-3 |
| **Total** | | **~$1-3/month** |

Very cost-effective for development and demos!

---

## Troubleshooting

### Build Fails
- Verify `package.json` and `tsconfig.json` are correct
- Check that all dependencies are listed
- Ensure TypeScript compiles locally: `npm run build`

### Deployment Fails
- Verify all required APIs are enabled
- Check service account has correct permissions
- Ensure environment variables are set correctly

### Runtime Errors
- Check Cloud Run logs: `gcloud run logs read stun-backend`
- Verify Firestore database is created
- Confirm Gemini API key is valid
- Check service account JSON is properly formatted

### Connection Issues
- Verify `--allow-unauthenticated` flag was used
- Check firewall rules in Cloud Run settings
- Confirm frontend has correct backend URL

---

## Updating Deployment

To deploy updates:

```bash
# 1. Build new container
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/stun-backend

# 2. Deploy new revision
gcloud run deploy stun-backend \
  --image gcr.io/YOUR_PROJECT_ID/stun-backend \
  --platform managed \
  --region us-central1
```

Cloud Run will automatically handle zero-downtime deployment.

---

## Security Best Practices

1. **Never commit `.env` files** - Add to `.gitignore`
2. **Rotate API keys regularly** - Update in Cloud Run settings
3. **Use Secret Manager** - For production, migrate to Google Secret Manager
4. **Enable authentication** - Remove `--allow-unauthenticated` for production
5. **Monitor usage** - Set up billing alerts in Google Cloud Console

---

## Additional Resources

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Firestore Documentation](https://cloud.google.com/firestore/docs)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [Google Cloud CLI Reference](https://cloud.google.com/sdk/gcloud/reference)

---

**Deployment Status:** ✅ Production Ready

**Last Updated:** March 5, 2026