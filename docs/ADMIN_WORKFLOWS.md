# Admin Workflows

This guide describes the operations available to **admin** users. Authorization
is role-based: a route guarded by the `admin` middleware is accessible when the
JWT's `role` claim is `ADMIN` or `MANAGER` (see
[Architecture → Authentication](./ARCHITECTURE.md#authentication--authorization-flow)).
All admin calls require the `Authorization: Bearer <token>` header.

For exact request/response details of every endpoint mentioned here, see the
[API Reference](./API_REFERENCE.md).

---

## User management

Endpoints under `/api/user/admin/*`.

- **List users** — `GET /api/user/admin/get`
- **View a user** — `GET /api/user/admin/get/:id`
- **Change a user's role** — `PUT /api/user/admin/update`
  Roles are `USER`, `MANAGER`, `ADMIN`. A role change takes effect on the
  user's **next login** (the role is carried in the JWT).
- **Change account status** — `PATCH /api/user/admin/:id/status`
  Status is `Active`, `Warning`, or `Suspended`. Only `Active` users can log in,
  so setting `Suspended` effectively blocks access.
- **Delete a user** — `DELETE /api/user/admin/delete/:id`

---

## Catalogue management

The catalogue is made of **Brands**, **Bike Models**, and **Parts**. Create and
mutate operations are admin-only; read endpoints are public so the storefront
can render without authentication.

### Brands — `/api/brand`
- Create: `POST /add` (`image` file + `name`)
- Update: `PUT /update/:id`
- Delete: `DELETE /delete/:id`

### Bike Models — `/api/bike-model`
- Create: `POST /add` (`image` file + `name`, `brand`, `engineType`, `yearStart`, `yearEnd`)
- Update: `PUT /update/:id`
- Delete: `DELETE /delete/:id`

Leaving `yearStart` / `yearEnd` / `engineType` empty marks a model as
universally compatible (it matches any year / engine in compatibility search).

### Parts (products) — `/api/parts`
- Create: `POST /add` (up to 5 `images` + product fields incl. `category` and `vehicleCompatibility`)
- Update: `PUT /update/:id`
- Delete: `DELETE /delete/:id`

`category` must be one of the predefined catalogue categories and
`vehicleCompatibility` is a list of Bike Model ids — see
[Database Schema → Part](./DATABASE_SCHEMA.md#part).

---

## Order processing & payment verification

Endpoints under `/api/orders/admin/*`.

- **List all orders** — `GET /api/orders/admin/all`
- **Verify a payment** — `PUT /api/orders/admin/verify/:id`
  Body `{ action, rejectionReason }`. Used for **Online (UPI)** orders where the
  customer uploaded a payment screenshot: approve to move the order forward, or
  reject with a reason.
- **Advance order status** — `PUT /api/orders/admin/status/:id`
  Body `{ orderStatus }`.

### Order & payment lifecycle

`paymentMethod` is `COD` or `Online`.

`paymentStatus` progresses through:
`Pending → Pending Verification → Success` (or `Failed`).

`orderStatus` progresses through:
`Pending Verification → Confirmed → Processing → Shipped → Delivered`
(or `Cancelled`).

A typical **Online (UPI)** flow:

```
Customer places order with UPI screenshot
   → paymentStatus: Pending Verification, orderStatus: Pending Verification
Admin reviews proof: PUT /admin/verify/:id  { action: "approve" }
   → paymentStatus: Success, order moves to Confirmed
Admin fulfils: PUT /admin/status/:id  { orderStatus: "Processing" → "Shipped" → "Delivered" }
```

Rejecting a payment records the `rejectionReason` on the order. A **COD** order
skips payment verification and is `Confirmed` from the start.

---

## Coupons

Endpoints under `/api/coupon/admin/*`.

- Create: `POST /admin/create`
- List: `GET /admin/get`
- Update: `PUT /admin/update/:id`
- Delete: `DELETE /admin/delete/:id`

A coupon is `PERCENTAGE` or `FIXED`. For percentage coupons, `maxDiscount` caps
the rupee discount (`0` = no cap). `usageLimit` caps total redemptions across
all users (`0` = unlimited) and `usedCount` tracks how many times it has been
applied. Customers apply a coupon against their cart via
`POST /api/coupon/validate`.

---

## Payment settings

Endpoints under `/api/payment-settings`.

- **Read** — `GET /` (authenticated; surfaced at checkout)
- **Update** — `PUT /admin/update` (`qrImage` file + `upiId`)

These hold the store's UPI id and QR image shown to customers paying online.

---

## Support tickets

Endpoints under `/api/support/admin/*`.

- **List all tickets** — `GET /admin/get`
- **View a ticket** — `GET /admin/:id`
- **Update status** — `PUT /admin/:id/status` (`Open` / `In Progress` / `Resolved` / `Closed`)
- **Reply** — `POST /admin/:id/reply` (`{ body }`)

Each ticket keeps a full message thread and a `lastActivityAt` timestamp so the
admin view can be sorted by most-recent activity.

---

## Analytics & inventory

Endpoints under `/api/orders/admin/*` (all computed from live data — no
hardcoded values):

- **Dashboard analytics** — `GET /admin/analytics`
  Revenue, order counts and related KPIs for the admin dashboard.
- **Inventory overview** — `GET /admin/inventory`
  Stock health and low-stock visibility across the catalogue.
- **Sales analytics** — `GET /admin/sales-analytics`
  Chart-oriented data: monthly trends, top products, customer growth and recent
  orders for the dedicated Sales Analytics page.

---

> Admin endpoints share the same controllers as the rest of the API; when you
> add a new admin capability, document it here and in the
> [API Reference](./API_REFERENCE.md) in the same PR.
