# Deploy server first, then client

Two separate Vercel projects (same Git repo, different **Root Directory**).

## 1. Deploy the server

1. [Vercel Dashboard](https://vercel.com) → **Add New** → **Project** → import this repo.
2. **Root Directory:** `server`
3. **Framework Preset:** Other
4. **Environment variables** (Production):

   | Name | Value |
   |------|--------|
   | `MONGODB_URI` | MongoDB Atlas connection string |
   | `JWT_SECRET` | Long random string |
   | `GEMINI_API_KEY` | Google AI key |
   | `BROWSERBASE_API_KEY` | Browserbase key |
   | `CRON_SECRET` | Random string (Vercel Cron auth) |
   | `CLIENT_URL` | Leave empty for now; set after step 2 |

5. Deploy. Copy the production URL, e.g. `https://seo-api-xxx.vercel.app`.

6. In MongoDB Atlas → **Network Access**, allow Vercel (or `0.0.0.0/0` for testing).

7. After the client is deployed, edit the server project and set `CLIENT_URL` to the client URL (exact origin, no trailing slash).

## 2. Deploy the client

1. **Add New** → **Project** → same repo again.
2. **Root Directory:** `client`
3. **Framework Preset:** Vite
4. **Environment variables** (Production):

   | Name | Value |
   |------|--------|
   | `VITE_BACKEND_URL` | Server URL from step 1 (no trailing slash) |

5. Deploy. Copy the client URL.

6. Go back to the **server** project → **Settings** → **Environment Variables** → set `CLIENT_URL` to the client URL → **Redeploy** server.

## 3. Verify

- Open client URL → register / login.
- Server root: `https://your-server.vercel.app/` → `Server is running..!`
- Cron (Pro plan): daily job hits `/api/cron/rank-tracking` with `CRON_SECRET`.

## CLI (optional)

```bash
cd server
npx vercel --prod

cd ../client
# Set VITE_BACKEND_URL in Vercel dashboard or:
npx vercel env add VITE_BACKEND_URL production
npx vercel --prod
```
