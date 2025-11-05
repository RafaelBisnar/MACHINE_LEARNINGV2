# Deploying to Render.com - Quick Guide

## Prerequisites ✅
- [ ] GitHub account
- [ ] Render.com account (free tier works!)
- [ ] Your code pushed to GitHub

## Deployment Steps

### Step 1: Push Your Code to GitHub
```powershell
cd c:\Users\RafaelDaniel\Documents\GitHub\MACHINE_LEARNINGV2
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

### Step 2: Deploy ML Service First (Python Flask)

1. Go to https://render.com/
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository: `RafaelBisnar/MACHINE_LEARNINGV2`
4. Configure the service:
   - **Name**: `charactle-ml-service` (or any name you like)
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: Leave empty
   - **Environment**: `Python 3`
   - **Build Command**: 
     ```bash
     cd ml-service && pip install -r requirements.txt
     ```
   - **Start Command**: 
     ```bash
     cd ml-service && gunicorn app:app --bind 0.0.0.0:$PORT --workers 1 --timeout 600
     ```
   - **Instance Type**: `Free`

5. Click **"Create Web Service"**
6. **IMPORTANT**: Copy the service URL (e.g., `https://charactle-ml-service.onrender.com`)
7. Wait for deployment (5-10 minutes for first deployment)

### Step 3: Deploy Main App (Node.js)

1. Click **"New +"** → **"Web Service"** again
2. Select same repository: `RafaelBisnar/MACHINE_LEARNINGV2`
3. Configure the service:
   - **Name**: `charactle-app` (or any name you like)
   - **Region**: Same as ML service
   - **Branch**: `main`
   - **Root Directory**: Leave empty
   - **Environment**: `Node`
   - **Build Command**: 
     ```bash
     pnpm install && pnpm build
     ```
   - **Start Command**: 
     ```bash
     pnpm start
     ```
   - **Instance Type**: `Free`

4. **Add Environment Variables** (click "Environment" tab):
   - Key: `ML_SERVICE_URL`
   - Value: `https://charactle-ml-service.onrender.com` (the URL from Step 2)
   
   - Key: `NODE_ENV`
   - Value: `production`

5. Click **"Create Web Service"**
6. Wait for deployment (3-5 minutes)

### Step 4: Test Your Deployment 🎉

Once both services are deployed:

1. Visit your main app URL (e.g., `https://charactle-app.onrender.com`)
2. Test the ML features in the game
3. Check health: `https://charactle-app.onrender.com/api/ml/health`

## Important Notes ⚠️

### Free Tier Limitations
- **Spin down**: Services sleep after 15 minutes of inactivity
- **First request slow**: Takes 30-60 seconds to wake up
- **Build time**: 750 hours/month build time shared across services
- **Training**: Model training happens on first request, may timeout

### Optimization Tips
1. **Pre-train models locally**: 
   - Run training scripts locally
   - Commit trained model files (`.pkl` files)
   - Update app.py to load existing models instead of training

2. **Keep services awake** (for demo day):
   - Use [UptimeRobot](https://uptimerobot.com/) to ping your service every 5 minutes
   - Or use [Render Cron Jobs](https://render.com/docs/cronjobs) on paid tier

3. **Monitor logs**:
   - Check Render dashboard logs if something fails
   - Look for Python/Node errors

## Alternative: Using Render Blueprint (render.yaml)

The included `render.yaml` file can automate deployment:

1. Go to Render Dashboard
2. Click **"New +"** → **"Blueprint"**
3. Connect your GitHub repo
4. Render will detect `render.yaml` and create both services
5. **Update** the `ML_SERVICE_URL` in render.yaml after ML service is created

## Troubleshooting

### ML Service fails to start
- Check Python version (should be 3.11)
- Check if all dependencies installed
- Look for torch/transformers installation errors

### Main app can't connect to ML service
- Verify `ML_SERVICE_URL` environment variable is correct
- Ensure ML service is running (check its logs)
- Try hitting ML service directly: `https://your-ml-service.onrender.com/health`

### Timeout errors
- Increase gunicorn timeout: `--timeout 600`
- Use fewer workers on free tier: `--workers 1`
- Pre-train models to avoid training on first request

## Quick Test Commands

After deployment, test with curl:

```powershell
# Test main app
curl https://charactle-app.onrender.com/api/ping

# Test ML health
curl https://charactle-app.onrender.com/api/ml/health

# Test ML service directly
curl https://charactle-ml-service.onrender.com/health
```

## Cost Estimate
- **Free Tier**: $0/month (with limitations)
- **Starter**: $7/month per service (no sleep, better performance)
- **For demo**: Free tier is sufficient!

## Demo Day Checklist 📋
- [ ] Both services deployed and running
- [ ] Test all ML features work
- [ ] Set up UptimeRobot to keep services awake
- [ ] Test on mobile and desktop
- [ ] Prepare for 30-60s initial load time
- [ ] Have local backup running just in case

## Need Help?
- Render Docs: https://render.com/docs
- Render Community: https://community.render.com/
- Check service logs in Render dashboard

---

Good luck with your presentation! 🚀
