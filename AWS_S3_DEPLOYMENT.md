# 🚀 AWS S3 Deployment Guide for MangaAI

## 📊 Current App Analysis

Your MangaAI app has:

- ✅ **Static pages**: Home, auth, credits, projects (can be on S3)
- ⚠️ **Dynamic routes**: `/manga-flow/[id]` and `/manga-reader/[id]` (need special handling)
- 🔌 **API calls**: Uses external APIs (Supabase, Stripe, etc.)

## 🏗️ Deployment Options

### Option 1: Hybrid S3 + CloudFront (Recommended)

**Static Assets on S3 + Dynamic Routes via CloudFront Functions**

```bash
# 1. Configure for static export (partially done)
# 2. Build static files
npm run build

# 3. Upload to S3
aws s3 sync .next/static/ s3://your-bucket-name/static/ --delete
aws s3 sync public/ s3://your-bucket-name/ --delete

# 4. Configure CloudFront for dynamic routing
```

### Option 2: Full Static with Client-Side Routing

**Make dynamic routes work with static export:**

1. **Pre-generate known routes** (if you have limited manga IDs)
2. **Use client-side routing** for dynamic content
3. **Handle 404s gracefully**

### Option 3: S3 + Lambda@Edge (Best Performance)

**Serverless with edge computing:**

- Static files on S3
- Lambda@Edge for dynamic routes
- CloudFront for global CDN

## ⚡ Quick Setup for Static-First Approach

### Step 1: Modify Dynamic Routes

Create a static fallback system:

```javascript
// In manga-flow/[id]/page.tsx
export async function generateStaticParams() {
  // Return empty array to make it fully client-side
  return [];
}

// Use client-side routing
const { id } = useParams();
// Handle loading state while fetching data
```

### Step 2: Configure S3 Bucket

```bash
# Create S3 bucket
aws s3 mb s3://your-mangaai-app

# Enable static website hosting
aws s3 website s3://your-mangaai-app \
  --index-document index.html \
  --error-document 404.html
```

### Step 3: Configure Bucket Policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-mangaai-app/*"
    }
  ]
}
```

### Step 4: Deploy Script

```bash
# Add to package.json scripts
"deploy:s3": "next build && aws s3 sync out/ s3://your-mangaai-app --delete"
"deploy:with-cloudfront": "npm run deploy:s3 && aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths '/*'"
```

## 🔧 Required Changes for Full Static Export

### 1. Handle Dynamic Imports

```javascript
// Use dynamic imports for heavy components
const HeavyComponent = dynamic(() => import("./HeavyComponent"), {
  loading: () => <div>Loading...</div>,
});
```

### 2. Environment Variables

```bash
# Create .env.production
NEXT_PUBLIC_API_URL=https://your-api.com
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_STRIPE_KEY=your-stripe-key
```

### 3. Image Optimization

Since S3 can't handle Next.js image optimization:

```javascript
// Use unoptimized images
import Image from "next/image";

<Image
  src="/manga.png"
  alt="Manga"
  unoptimized={true}
  width={500}
  height={300}
/>;
```

## 💰 Cost Estimation

### S3 Only (Basic)

- **Storage**: ~$0.50/month (20GB)
- **Requests**: ~$1/month (100k requests)
- **Data Transfer**: ~$2/month (20GB out)
- **Total**: ~$3.50/month

### S3 + CloudFront (Recommended)

- **S3**: ~$3.50/month
- **CloudFront**: ~$1/month (small traffic)
- **Lambda@Edge**: ~$0.50/month (if used)
- **Total**: ~$5/month

## 📈 Performance Benefits

✅ **Global CDN**: Sub-100ms load times worldwide  
✅ **Infinite Scale**: Handle millions of users  
✅ **99.99% Uptime**: AWS reliability  
✅ **Cost Effective**: Pay only for usage  
✅ **Security**: Built-in DDoS protection

## ⚠️ Limitations

❌ **No Server-Side Rendering**: All rendering happens client-side  
❌ **No API Routes**: Need external APIs (you already use Supabase ✅)  
❌ **SEO Challenges**: Dynamic content not pre-rendered  
❌ **Cold Start**: Initial page load includes all JavaScript

## 🎯 Recommended Architecture

```
┌─────────────────┐    ┌──────────────┐    ┌─────────────┐
│   CloudFront    │────│   S3 Bucket  │    │  Supabase   │
│   (Global CDN)  │    │  (Static)    │    │  (Database) │
└─────────────────┘    └──────────────┘    └─────────────┘
         │                                         │
         ▼                                         ▼
┌─────────────────┐                      ┌─────────────┐
│   Lambda@Edge   │                      │   Stripe    │
│   (Dynamic)     │                      │ (Payments)  │
└─────────────────┘                      └─────────────┘
```

## 🚀 Next Steps

1. **Test locally**: `npm run build` and serve the `out/` folder
2. **Create S3 bucket**: Follow AWS S3 setup
3. **Configure CloudFront**: For better performance
4. **Set up CI/CD**: Automate deployments
5. **Monitor**: Set up CloudWatch for metrics

Would you like me to help you implement any of these approaches?
