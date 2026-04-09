# AarogyaLink Deployment (Step-by-Step)

1. Push latest code to GitHub.

```bash
git add .
git commit -m "prepare deployment"
git push
```

2. Create MongoDB Atlas database and copy connection string.

3. Deploy backend (Render/Railway/Fly/VPS).

- Root directory: `server`
- Build command: `npm install`
- Start command: `npm start`

4. Add backend environment variables.

```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
CLIENT_URL=https://your-frontend-domain
```

5. Deploy backend and copy backend URL.

Example:

```text
https://your-api.onrender.com
```

6. Deploy frontend as a Render Static Site.

- Root directory: `client`
- Build command: `npm install && npm run build`
- Publish directory: `dist`
- Rewrite rule: `/*` -> `/index.html` (Action: Rewrite)

7. Add frontend environment variable in Render.

```env
VITE_API_URL=https://your-api.onrender.com/api
```

8. Deploy frontend and copy frontend URL.

Example:

```text
https://your-app.vercel.app
```

9. Update backend `CLIENT_URL` with final frontend URL (without trailing slash).

```env
CLIENT_URL=https://your-app.vercel.app
```

10. Redeploy backend after updating `CLIENT_URL`.

11. Test in production:

- Register/login
- Doctor approval
- Book appointment
- Queue updates
- Complete treatment flow
- Notifications and dashboards
- Refresh on nested routes (e.g. `/register`, `/login`, `/patient/dashboard`) to verify SPA fallback
