# Advanced E‑Commerce API (Node.js + MongoDB )

**Features**
- JWT auth (User/Admin), role-based access
- Products CRUD with pagination/sort/filter
- Cart (add/update/remove)
- Checkout with **atomic stock reservation** (transactions)
- Mock payment: finalize order + decrement stock
<!-- - Async jobs with **BullMQ/Redis** for email and 15‑minute unpaid cancellation -->
- Centralized error handler, Joi validation

## Setup
```bash
cp .env
npm install
# Start Mongo & Redis (Docker)
# docker run -d -p 27017:27017 mongo
# docker run -d -p 6379:6379 redis
npm run dev
```
Server on `http://localhost:3000`

## Routes (summary)
- POST `/auth/register`, `/auth/login`
- Products: `GET /products`, `POST/PUT/DELETE /products/:id` (admin)
- Cart: `GET /cart`, `POST /cart/items`, `DELETE /cart/items/:productId`
- Orders: `POST /orders/checkout`, `POST /orders/:id/pay`, `GET /orders`, `GET /orders/:id`
- Admin: `GET /admin/orders`, `PATCH /admin/orders/:id/status`

## Notes
- Use `Authorization: Bearer <token>` after login.
<!-- - For emails in dev, use MailHog (SMTP localhost:1025) or read logs. -->


## USER
"email": "lokendrauser@example.com",
  "password": "Password@123"

## ADMIN
"email": "admin@example.com",
  "password": "Password@123"