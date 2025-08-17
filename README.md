# LOVE MUST BE FREE — full project (no images)
Built: 2025-08-15T21:36:41.825682Z

Add images to `public/images/`:
- Background_1.webp, Background_2.webp, Logo_1.webp, Logo_2.webp

Run locally:
- npm install
- set DATABASE_URL in .env
- npx prisma db push
- npm run prisma:seed
- npm run dev

Deploy on Render:
- Build: npm install && npm run prisma:push && npm run prisma:seed && npm run build
- Start: npm start
- Env: DATABASE_URL, ADMIN_LOGIN, ADMIN_PASSWORD
