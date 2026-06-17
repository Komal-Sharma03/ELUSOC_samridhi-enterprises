import mongoose from "mongoose";

// A single message within a support ticket's conversation thread. Either the
// customer who opened the ticket or an admin/manager can post messages.
const ticketMessageSchema = new mongoose.Schema(
  {
    sender: {
      type: String,
      enum: ["USER", "ADMIN"],
      required: true,
    },
    // Display name captured at post time so the thread reads correctly even if
    // the user later changes their name.
    senderName: { type: String, default: "" },
    body: {
      type: String,
      required: [true, "Message cannot be empty"],
      trim: true,
    },
  },
  { timestamps: true }
);

const supportTicketSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subject: {
      type: String,
      required: [true, "Please enter a subject"],
      trim: true,
      maxlength: [150, "Subject cannot exceed 150 characters"],
    },
    category: {
      type: String,
      enum: ["Order", "Payment", "Product", "Shipping", "Account", "Other"],
      default: "Other",
    },
    status: {
      type: String,
      enum: ["Open", "In Progress", "Resolved", "Closed"],
      default: "Open",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    // The full conversation thread; the opening message is pushed at creation.
    messages: { type: [ticketMessageSchema], default: [] },
    // Convenience timestamp for sorting the admin dashboard by most-recent
    // activity (updated whenever a message is added or the status changes).
    lastActivityAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Newest-activity-first for both the customer's history and the admin list.
supportTicketSchema.index({ user: 1, lastActivityAt: -1 });
supportTicketSchema.index({ status: 1, lastActivityAt: -1 });

export default mongoose.model("SupportTicket", supportTicketSchema);
