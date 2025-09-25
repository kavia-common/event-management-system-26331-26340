# event-management-system-26331-26340

Backend (Express + MySQL)
- Container: event_management_backend
- Start: npm install && npm run dev
- Docs: /docs (Swagger UI)
- Env: copy event_management_backend/.env.example to .env and fill MYSQL_* and JWT_SECRET.

APIs
- Auth: POST /auth/register, POST /auth/login
- Events: GET /events, GET /events/:id, POST /events (auth), PUT /events/:id (auth, owner), DELETE /events/:id (auth, owner)
- Attendees: GET /events/:id/attendees, POST /events/:id/attendees (auth, owner), DELETE /events/:id/attendees/:userId (auth, owner)

Database
- Uses environment variables: MYSQL_URL or MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DB, MYSQL_PORT.
- On server start, schema is ensured (users, events, attendees tables).