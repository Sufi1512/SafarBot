# Vercel Deployment Guide for SafarBot

This guide will help you deploy your SafarBot application to Vercel, including both the FastAPI backend and React frontend.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub/GitLab Account**: Your code should be in a Git repository
3. **SerpApi Key**: You'll need your SerpApi key for the flight search functionality

## Step 1: Prepare Your Repository

Make sure your code is pushed to a Git repository (GitHub, GitLab, or Bitbucket).

## Step 2: Set Up Environment Variables

Before deploying, you need to set up your environment variables in Vercel:

### Required Environment Variables:
- `SERP_API_KEY`: Your SerpApi key for flight search functionality
- `LANGSMITH_API_KEY`: (Optional) For LangSmith tracking
- `LANGSMITH_PROJECT`: (Optional) LangSmith project name
- `LANGSMITH_ENDPOINT`: (Optional) LangSmith endpoint

## Step 3: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your Git repository
4. Configure the project:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (root of your project)
   - **Build Command**: `npm run build`
   - **Output Directory**: `client/dist`
   - **Install Command**: `npm install`

5. Add your environment variables in the "Environment Variables" section
6. Click "Deploy"

### Option B: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy from your project root:
   ```bash
   vercel
   ```

4. Follow the prompts and add your environment variables when asked

## Step 4: Configure Custom Domain (Optional)

1. In your Vercel dashboard, go to your project
2. Click on "Settings" → "Domains"
3. Add your custom domain
4. Configure DNS settings as instructed

## Step 5: Verify Deployment

After deployment, your application will be available at:
- **Frontend**: `https://your-project-name.vercel.app`
- **API**: `https://your-project-name.vercel.app/api/v1`

### Test the API endpoints:
- Health check: `https://your-project-name.vercel.app/api/v1/health`
- Flight search: `https://your-project-name.vercel.app/api/v1/flights/search`
- Popular flights: `https://your-project-name.vercel.app/api/v1/flights/popular`

## Project Structure for Vercel

```
SafarBot/
├── vercel.json              # Vercel configuration
├── .vercelignore            # Files to exclude from deployment
├── package.json             # Root package.json
├── client/                  # React frontend
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json        # TypeScript config (fixed)
│   ├── tsconfig.node.json   # Node TypeScript config
│   └── src/
├── server/                  # FastAPI backend
│   ├── main.py
│   ├── requirements.txt
│   └── routers/
└── README.md
```

## Configuration Files

### vercel.json
- Configures both Python (FastAPI) and Node.js (React) builds
- Routes API requests to the backend
- Routes all other requests to the frontend

### package.json (Root)
- Defines build scripts for Vercel
- Specifies Node.js version requirements

### vite.config.ts
- Configures build output directory as `dist`
- Optimizes bundle splitting for production

### tsconfig.json (Fixed)
- Excludes `vite.config.ts` from main compilation
- Uses `tsc --noEmit` for type checking only
- Prevents TypeScript build errors during deployment

## Troubleshooting

### Common Issues:

1. **TypeScript Build Errors**:
   - **Error**: `Output file '/vercel/path0/client/vite.config.d.ts' has not been built`
   - **Solution**: Fixed by updating `tsconfig.json` to exclude `vite.config.ts` from main compilation
   - **Prevention**: Use `tsc --noEmit` in build script for type checking only

2. **Build Failures**:
   - Check that all dependencies are in `requirements.txt`
   - Ensure Node.js version is compatible (>=18.0.0)
   - Verify environment variables are set correctly
   - Check that `.vercelignore` excludes unnecessary files

3. **API Not Working**:
   - Check that `SERP_API_KEY` is set in Vercel environment variables
   - Verify CORS settings in `server/main.py`
   - Check Vercel function logs for errors

4. **Frontend Not Loading**:
   - Ensure build output directory is `client/dist`
   - Check that all React dependencies are installed
   - Verify Vite configuration

5. **Environment Variables Not Working**:
   - Redeploy after adding environment variables
   - Check variable names match exactly (case-sensitive)
   - Verify variables are set for all environments (Production, Preview, Development)

### Debugging:

1. **Check Vercel Logs**:
   - Go to your project dashboard
   - Click on "Functions" to see serverless function logs
   - Check "Deployments" for build logs

2. **Test Locally First**:
   ```bash
   # Test backend
   cd server && python main.py
   
   # Test frontend
   cd client && npm run dev
   
   # Test build process
   cd client && npm run build
   ```

3. **TypeScript Issues**:
   ```bash
   # Check TypeScript compilation
   cd client && npx tsc --noEmit
   
   # Check Vite build
   cd client && npx vite build
   ```

## Performance Optimization

1. **API Response Caching**: Consider implementing caching for flight search results
2. **Image Optimization**: Use Vercel's image optimization for airline logos
3. **Bundle Splitting**: Already configured in `vite.config.ts`
4. **CDN**: Vercel automatically provides global CDN

## Security Considerations

1. **API Keys**: Never commit API keys to your repository
2. **CORS**: Configured to allow only necessary origins
3. **Rate Limiting**: Consider implementing rate limiting for API endpoints
4. **Input Validation**: Ensure all user inputs are validated

## Monitoring and Analytics

1. **Vercel Analytics**: Enable in your project settings
2. **Error Tracking**: Consider adding error tracking services
3. **Performance Monitoring**: Use Vercel's built-in performance monitoring

## Next Steps

After successful deployment:

1. Set up monitoring and error tracking
2. Configure custom domain
3. Set up CI/CD for automatic deployments
4. Implement caching strategies
5. Add performance monitoring

## Support

If you encounter issues:

1. Check Vercel documentation: [vercel.com/docs](https://vercel.com/docs)
2. Review Vercel community forums
3. Check your project's function logs in the Vercel dashboard
4. Verify all environment variables are correctly set
5. Check the troubleshooting section above for common issues 