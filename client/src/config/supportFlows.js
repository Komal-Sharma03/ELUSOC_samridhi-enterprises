// Rule-based customer support assistant — conversational decision tree.
//
// This file is the single source of truth for every flow the assistant can
// walk a user through. It contains NO logic and NO UI — just data — so new
// topics, questions, and answers can be added or edited here without touching
// the component. To add a topic: add a node keyed by a unique id, give it a
// `message`, and a list of `options` whose `next` points at another node id
// (or use `action` for a terminal step like escalation).
//
// Node shape:
//   {
//     message: string            // what the assistant says at this step
//     options?: [                // buttons the user can tap
//       { label: string, next?: string, action?: string, href?: string }
//     ]
//   }
//
// Reserved node id: "root" is always where a conversation (re)starts.
// Reserved actions: "restart" returns to root; "escalate" surfaces the
// contact options. Anything else is treated as a normal navigation via `next`.

export const SUPPORT_CONTACT = {
  email: "email@gmail.com",
  phone: "+919999999999",
  phoneLabel: "+91 99999 99999",
};

export const supportFlows = {
  root: {
    message:
      "Hi! I'm the Samridhi support assistant. What do you need help with today?",
    options: [
      { label: "Order Status", next: "order_status" },
      { label: "Shipping Info", next: "shipping" },
      { label: "Returns & Refunds", next: "returns" },
      { label: "Product Availability", next: "availability" },
      { label: "Payment Help", next: "payment" },
      { label: "Talk to Support", next: "escalate" },
    ],
  },

  // ----- Order status -----
  order_status: {
    message:
      "I can help with orders. What would you like to know?",
    options: [
      { label: "Where is my order?", next: "order_track" },
      { label: "Order statuses explained", next: "order_statuses" },
      { label: "Cancel an order", next: "order_cancel" },
      { label: "← Back", next: "root" },
    ],
  },
  order_track: {
    message:
      "You can track any order from your account. Go to My Orders to see its current status and full history. Online-payment orders move to \"Confirmed\" once our team verifies your payment.",
    options: [
      { label: "Go to My Orders", action: "link", href: "/my-orders" },
      { label: "Order statuses explained", next: "order_statuses" },
      { label: "← Back to start", action: "restart" },
    ],
  },
  order_statuses: {
    message:
      "Orders move through these stages: Pending Verification (awaiting payment check) → Confirmed → Processing → Shipped → Delivered. An order may show Cancelled if payment couldn't be verified or you cancelled it.",
    options: [
      { label: "Where is my order?", next: "order_track" },
      { label: "← Back to start", action: "restart" },
    ],
  },
  order_cancel: {
    message:
      "Orders that are still Pending Verification or Confirmed can usually be cancelled from My Orders. Once an order is Shipped it can no longer be cancelled — you'd need to use our returns process after delivery.",
    options: [
      { label: "Go to My Orders", action: "link", href: "/my-orders" },
      { label: "Returns & Refunds", next: "returns" },
      { label: "← Back to start", action: "restart" },
    ],
  },

  // ----- Shipping -----
  shipping: {
    message: "Here's what I can tell you about shipping.",
    options: [
      { label: "Delivery time", next: "shipping_time" },
      { label: "Shipping charges", next: "shipping_cost" },
      { label: "Where do you ship?", next: "shipping_areas" },
      { label: "← Back", next: "root" },
    ],
  },
  shipping_time: {
    message:
      "Most orders are dispatched within 1–2 business days after confirmation and delivered within 3–7 business days depending on your location. You'll see the status update to Shipped once it's on the way.",
    options: [
      { label: "Shipping charges", next: "shipping_cost" },
      { label: "← Back to start", action: "restart" },
    ],
  },
  shipping_cost: {
    message:
      "Shipping charges are calculated at checkout based on your order and delivery location. The exact amount is always shown in your order summary before you pay.",
    options: [
      { label: "Delivery time", next: "shipping_time" },
      { label: "← Back to start", action: "restart" },
    ],
  },
  shipping_areas: {
    message:
      "We currently ship across India. Enter your pincode at checkout to confirm serviceability for your address.",
    options: [
      { label: "Browse products", action: "link", href: "/products" },
      { label: "← Back to start", action: "restart" },
    ],
  },

  // ----- Returns & refunds -----
  returns: {
    message: "Our returns and refunds work like this — what do you need?",
    options: [
      { label: "Return policy", next: "returns_policy" },
      { label: "How refunds work", next: "returns_refund" },
      { label: "Start a return", next: "returns_start" },
      { label: "← Back", next: "root" },
    ],
  },
  returns_policy: {
    message:
      "Items can be returned within 7 days of delivery if they're unused, in original packaging, and in resalable condition. Certain parts may be non-returnable for safety/fitment reasons — this is noted on the product page.",
    options: [
      { label: "How refunds work", next: "returns_refund" },
      { label: "← Back to start", action: "restart" },
    ],
  },
  returns_refund: {
    message:
      "Once we receive and inspect a returned item, the refund is issued to your original payment method. Online payments are refunded to the source account; please allow a few business days for it to reflect.",
    options: [
      { label: "Return policy", next: "returns_policy" },
      { label: "← Back to start", action: "restart" },
    ],
  },
  returns_start: {
    message:
      "To start a return, please reach our support team with your order ID and the reason for return, and they'll guide you through the next steps.",
    options: [
      { label: "Contact Support", next: "escalate" },
      { label: "← Back to start", action: "restart" },
    ],
  },

  // ----- Product availability -----
  availability: {
    message:
      "Each product page shows live stock status — In Stock, Low Stock, or Out of Stock — pulled from our current inventory. Out-of-stock items can't be ordered until restocked.",
    options: [
      { label: "Browse products", action: "link", href: "/products" },
      { label: "Notify / restock question", next: "availability_restock" },
      { label: "← Back", next: "root" },
    ],
  },
  availability_restock: {
    message:
      "Restock timing varies by part. If something you need is out of stock, contact our support team with the product name and they can advise on expected availability.",
    options: [
      { label: "Contact Support", next: "escalate" },
      { label: "← Back to start", action: "restart" },
    ],
  },

  // ----- Payment -----
  payment: {
    message: "Here's help with payments.",
    options: [
      { label: "Payment methods", next: "payment_methods" },
      { label: "Payment verification", next: "payment_verify" },
      { label: "Payment failed/declined", next: "payment_failed" },
      { label: "← Back", next: "root" },
    ],
  },
  payment_methods: {
    message:
      "We support Cash on Delivery (COD) and Online payment via UPI. For UPI, you complete the payment and upload a screenshot as proof, which our team then verifies.",
    options: [
      { label: "Payment verification", next: "payment_verify" },
      { label: "← Back to start", action: "restart" },
    ],
  },
  payment_verify: {
    message:
      "For online (UPI) orders, after you upload your payment screenshot the order enters Pending Verification. Our team checks it and, once approved, your order moves to Confirmed and you'll receive a receipt by email.",
    options: [
      { label: "Order statuses explained", next: "order_statuses" },
      { label: "← Back to start", action: "restart" },
    ],
  },
  payment_failed: {
    message:
      "If a payment was declined or couldn't be verified, the order is marked Cancelled and no amount is captured for COD. For UPI, if money was debited but the order shows Cancelled, contact support with your UPI reference and we'll resolve it.",
    options: [
      { label: "Contact Support", next: "escalate" },
      { label: "← Back to start", action: "restart" },
    ],
  },

  // ----- Escalation (terminal) -----
  escalate: {
    message:
      "No problem — our support team is happy to help directly. You can reach us using the options below, and we'll get back to you as soon as possible.",
    options: [
      { label: "Email us", action: "link", href: `mailto:${SUPPORT_CONTACT.email}` },
      { label: "Call us", action: "link", href: `tel:${SUPPORT_CONTACT.phone}` },
      { label: "← Back to start", action: "restart" },
    ],
  },
};

export default supportFlows;
