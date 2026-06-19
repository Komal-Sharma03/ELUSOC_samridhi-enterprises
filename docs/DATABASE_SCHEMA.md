# Database Schema

Samridhi Enterprises stores its data in **MongoDB** via **Mongoose**. All
schemas live in `server/models/`. Every collection except `Brand` and
`BikeModel` has Mongoose `timestamps` enabled (`createdAt` / `updatedAt`).

Image fields are stored as **Cloudinary** references:

```js
{ public_id: String, url: String }
```

### Collections at a glance

| Model | File | Purpose |
|-------|------|---------|
| User | `userModel.js` | Accounts, auth, roles, OTP state |
| Brand | `brandModel.js` | Vehicle brands |
| BikeModel | `bikeModel.js` | Bike models (compatibility targets) |
| Part | `partModel.js` | Spare-part products + reviews |
| Cart | `cartModel.js` | One active cart per user |
| Order | `orderModel.js` | Placed orders (cart snapshot) |
| Coupon | `couponModel.js` | Discount coupons |
| Address | `addressModel.js` | User shipping addresses |
| PaymentSettings | `paymentSettingsModel.js` | Store UPI id + QR image (singleton) |
| SupportTicket | `supportTicketModel.js` | Support tickets + message threads |

---

## User

Registered as model `User`.

| Field | Type | Notes |
|-------|------|-------|
| `name` | String | Required |
| `email` | String | Required, unique |
| `password` | String | Required, bcrypt-hashed on save (`pre("save")`) |
| `avatar` | String | Cloudinary URL, default `""` |
| `mobile` | String | Default `null` |
| `verifyEmail` | Boolean | Default `false` — set true after OTP verification |
| `login_otp` | String | Email-verification OTP, default `null` |
| `login_expiry` | Date | OTP expiry, default `null` |
| `failedAttempts` | Number | Default `0` |
| `lastLogin` | Date | Default `null` |
| `status` | String enum | `Active` \| `Warning` \| `Suspended` (default `Active`) |
| `addressDetails` | [ObjectId → `address`] | User's addresses |
| `orderHistory` | [ObjectId → `Order`] | User's orders |
| `forgot_password_otp` | String | Reset OTP, default `null` |
| `forgot_password_expiry` | Date | Reset OTP expiry |
| `resetPasswordToken` | String | Hashed reset token |
| `resetPasswordExpire` | Date | Reset token expiry |
| `role` | String enum | `ADMIN` \| `MANAGER` \| `USER` (default `USER`) |

**Methods**

- `getJWTToken()` → signs `{ id, role }` with `JWT_SECRET`, expiring after `JWT_EXPIRE`.
- `comparePassword(password)` → bcrypt compare.
- `getResetPasswordToken()` → 20-byte random token; stores its SHA-256 hash and a 15-minute expiry; returns the raw token.

> Login is gated on `status === "Active"`. The token's `role` claim is what the
> `admin` middleware checks, so role changes take effect on the user's next login.

---

## Brand

Registered as model `Brand`.

| Field | Type | Notes |
|-------|------|-------|
| `name` | String | Required, unique |
| `images` | [{ public_id, url }] | Brand logo(s) |

---

## BikeModel

Registered as model `BikeModel`.

| Field | Type | Notes |
|-------|------|-------|
| `name` | String | Required |
| `brand` | ObjectId → `Brand` | Required |
| `yearStart` | Number | `min: 1900`, default `null` — empty = any year |
| `yearEnd` | Number | `min: 1900`, default `null` — empty = any year |
| `engineType` | String | Trimmed, default `""` — empty = any engine |
| `images` | [{ public_id, url }] | Model image(s) |

The optional year/engine fields make a model "universal" when left empty, so
older records keep matching compatibility searches.

---

## Part

Registered as model `Part`. This is the product catalogue.

| Field | Type | Notes |
|-------|------|-------|
| `product_id` | String | Required (business SKU) |
| `name` | String | Required |
| `description` | String | Optional |
| `price` | Number | Required, `min: 0` |
| `stock` | Number | Required, default `1`, `min: 0` |
| `vehicleCompatibility` | [ObjectId → `BikeModel`] | Compatible bike models |
| `ratings` | Number | `0–5`, default `0` (aggregate) |
| `category` | String enum | One of the predefined catalogue categories (below) |
| `images` | [{ public_id, url }] | Product images (up to 5) |
| `numOfReviews` | Number | Default `0` |
| `reviews` | [Review] | Embedded reviews (below) |
| `bestseller` | Boolean | Default `false` |

**Embedded review**

| Field | Type | Notes |
|-------|------|-------|
| `user` | ObjectId → `User` | Required |
| `name` | String | Required (captured at post time) |
| `rating` | Number | Required, `1–5` |
| `comment` | String | Required |
| `createdAt` | Date | Default now |

**`category` enum**

`Abs`, `Belt Drive`, `Bearing Kit`, `BSVI Products`, `Brake Switch`, `CDEI`,
`C.D.I`, `Consumable Filters`,
`Drum / Drum Plate / Coupling Hub / Wheel Rim`, `Electronic Relay`,
`Filters & Horn`, `Footrest Bracket`,
`Other Products (Cylinder Kit / Fuse Blade)`, `Flasher / Buzzer`,
`Floor Set / Speedo Gear`, `Fuel Items`, `Lever & Yoke`, `Varroc Oil / Grease`,
`Handle Bar Switch / Handle Bar Weigth`, `Ignition Coil`,
`Insulator For Carburetor`, `Lighting Products`, `Magneto Assembly & Spares`,
`Modular Switch`, `Oring`, `Other (Oil Pump Gear / Clutch Roller / Plug Cap)`,
`Oil Seal Kit`, `Gaskets`, `Rear View Mirror`, `Regulator Rectifier (R.R.)`,
`Rubber Items`, `Relay`, `Switches / Locks`, `Starter Moter & Spares`,
`Speedo Gear`, `TPSR / Swing Arm Assly`.

---

## Cart

Registered as model `Cart`. One cart per user.

| Field | Type | Notes |
|-------|------|-------|
| `user` | ObjectId → `User` | Required |
| `items` | [CartItem] | Lines (below) |
| `total` | Number | Default `0`, `min: 0` |

**Cart item**

| Field | Type | Notes |
|-------|------|-------|
| `part` | ObjectId → `Part` | Required |
| `quantity` | Number | Required, `min: 1` |
| `price` | Number | Required, `min: 0` (unit price) |
| `name` | String | Required (snapshot) |

---

## Order

Registered as model `Order`. Stores a **snapshot** of the cart so the order is
unaffected by later changes to (or deletion of) the underlying parts.

| Field | Type | Notes |
|-------|------|-------|
| `user` | ObjectId → `User` | Required |
| `items` | [OrderItem] | Snapshot lines: `{ part, name, price, quantity, image }` |
| `shippingAddress` | Object | `{ fullName, phone, addressLine, city, state, pincode }` |
| `itemsTotal` | Number | Required, `min: 0` |
| `couponCode` | String | Default `""` |
| `discount` | Number | Default `0`, `min: 0` |
| `grandTotal` | Number | `itemsTotal − discount`, default `0` |
| `paymentMethod` | String enum | `COD` \| `Online` (required) |
| `paymentStatus` | String enum | `Pending` \| `Pending Verification` \| `Success` \| `Failed` (default `Pending`) |
| `orderStatus` | String enum | `Pending Verification` \| `Confirmed` \| `Processing` \| `Shipped` \| `Delivered` \| `Cancelled` (default `Confirmed`) |
| `paymentScreenshot` | { public_id, url } | Customer UPI proof (Online only) |
| `upiReference` | String | Default `""` |
| `verifiedAt` | Date | Default `null` |
| `rejectionReason` | String | Default `""` |

---

## Coupon

Registered as model `Coupon`.

| Field | Type | Notes |
|-------|------|-------|
| `code` | String | Required, unique, uppercased, trimmed |
| `description` | String | Default `""` |
| `discountType` | String enum | `PERCENTAGE` \| `FIXED` (required) |
| `discountValue` | Number | Required, `min: 0` (percent for PERCENTAGE, ₹ for FIXED) |
| `minOrderAmount` | Number | Default `0` — minimum subtotal to apply |
| `maxDiscount` | Number | Default `0` — caps ₹ discount for PERCENTAGE (`0` = no cap) |
| `expiresAt` | Date | Default `null` |
| `usageLimit` | Number | Default `0` — total redemptions allowed (`0` = unlimited) |
| `usedCount` | Number | Default `0` |
| `isActive` | Boolean | Default `true` |

---

## Address

Registered as model `address`.

| Field | Type | Notes |
|-------|------|-------|
| `user` | ObjectId → `User` | Required |
| `label` | String | Optional, max 40 chars (e.g. "Home") |
| `fullName` | String | Required |
| `phone` | String | Required |
| `addressLine` | String | Required |
| `city` | String | Required |
| `state` | String | Default `""` |
| `pincode` | String | Required |
| `isDefault` | Boolean | Default `false` — exactly one default per user (enforced by the controller) |

---

## PaymentSettings

Registered as model `PaymentSettings`. Effectively a singleton holding the
store's UPI payment details surfaced at checkout.

| Field | Type | Notes |
|-------|------|-------|
| `upiId` | String | Default `""` |
| `qrImage` | { public_id, url } | UPI QR image |

---

## SupportTicket

Registered as model `SupportTicket`, with an embedded message sub-schema.

**Ticket**

| Field | Type | Notes |
|-------|------|-------|
| `user` | ObjectId → `User` | Required |
| `subject` | String | Required, max 150 chars |
| `category` | String enum | `Order` \| `Payment` \| `Product` \| `Shipping` \| `Account` \| `Other` (default `Other`) |
| `status` | String enum | `Open` \| `In Progress` \| `Resolved` \| `Closed` (default `Open`) |
| `priority` | String enum | `Low` \| `Medium` \| `High` (default `Medium`) |
| `messages` | [TicketMessage] | Conversation thread (opening message pushed at creation) |
| `lastActivityAt` | Date | Updated on each message/status change (admin sorting) |

**Ticket message**

| Field | Type | Notes |
|-------|------|-------|
| `sender` | String enum | `USER` \| `ADMIN` (required) |
| `senderName` | String | Display name captured at post time |
| `body` | String | Required |

---

> Keep this document in sync with `server/models/` — when you add a field or
> change an enum, update the matching table in the same PR.
