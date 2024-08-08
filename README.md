# Anitrack - anime episode tracker for me by me

## Setup

1. Install Railway CLI
2. Run `pnpm install`

Note:

- I use Railway for PostgreSQL database and deploying the API.
- Vercel is used for hosting the web app.

# Deploy

- Run `railway up` in `apps/api-go`
- Web app is deployed automatically on Vercel through Github Action (preview + production)

TODO:

- [x] Improve UI (+ mobile)
- [ ] Refactor Go API
- [ ] Still show new eps even if new ep is out only in one sourse. And update other source when ep is out.
- [ ] Add a cron job and integrate ntfy.sh for notifications
- [ ] Setup autofix.yml for Golang API
- [ ] Add video demo
