# PurePeel website
Needs Node.js 20+.
1. `npm install`
2. Copy `.env.example` to `.env`, fill in your Gmail + App Password (see comments inside), then run `node --env-file=.env server.js`
3. Open http://localhost:3000
Every enquiry is saved to `data/inquiries.json` AND emailed to CONTACT_TO. View saved ones at `/api/inquiries?key=ADMIN_KEY`.
Deploy on Render/Railway/any VPS as a Node web service (start command: `node server.js`); add the same env vars and a persistent disk for `data/`.
