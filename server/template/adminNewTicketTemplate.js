// Email sent to store admins (role ADMIN / MANAGER) when a customer raises a
// new support ticket. Mirrors the style of adminNewOrderTemplate. High-priority
// tickets are flagged prominently with an "Action required" banner so urgent
// issues stand out in the admin's inbox.
const generateAdminNewTicketEmail = (ticket, customer) => {
  const isHighPriority = ticket.priority === "High";

  // The opening message is the first entry in the thread.
  const openingMessage =
    (ticket.messages && ticket.messages[0] && ticket.messages[0].body) || "";

  // Basic HTML-escape so a customer's message can't inject markup into the email.
  const escapeHtml = (str) =>
    String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  return `
  <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;padding:20px;color:#333;">
    <h2 style="color:#1d4ed8;margin-bottom:4px;">New Support Ticket Raised</h2>
    <p style="color:#555;margin-top:0;">Ticket <strong>${ticket._id}</strong> was just opened.</p>

    ${
      isHighPriority
        ? `<div style="background:#fef2f2;border:1px solid #fca5a5;border-radius:8px;padding:12px 14px;margin:12px 0;">
            <strong style="color:#b91c1c;">Action required:</strong>
            <span style="color:#991b1b;"> This ticket is marked High priority. Please review and respond as soon as possible.</span>
          </div>`
        : ""
    }

    <table style="width:100%;border-collapse:collapse;margin-top:8px;">
      <tr>
        <td style="padding:4px 8px;color:#666;">Customer</td>
        <td style="padding:4px 8px;"><strong>${
          customer?.name || "Customer"
        }</strong> (${customer?.email || "no email"})</td>
      </tr>
      <tr>
        <td style="padding:4px 8px;color:#666;">Subject</td>
        <td style="padding:4px 8px;"><strong>${escapeHtml(
          ticket.subject
        )}</strong></td>
      </tr>
      <tr>
        <td style="padding:4px 8px;color:#666;">Category</td>
        <td style="padding:4px 8px;">${ticket.category}</td>
      </tr>
      <tr>
        <td style="padding:4px 8px;color:#666;">Priority</td>
        <td style="padding:4px 8px;">${ticket.priority}</td>
      </tr>
      <tr>
        <td style="padding:4px 8px;color:#666;">Status</td>
        <td style="padding:4px 8px;">${ticket.status}</td>
      </tr>
    </table>

    ${
      openingMessage
        ? `<div style="margin-top:14px;">
            <p style="color:#666;margin:0 0 4px;">Message</p>
            <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:12px 14px;color:#333;white-space:pre-wrap;">${escapeHtml(
              openingMessage
            )}</div>
          </div>`
        : ""
    }

    <p style="color:#888;font-size:12px;margin-top:18px;">You are receiving this because new-ticket notifications are enabled in admin settings.</p>
  </div>`;
};

export default generateAdminNewTicketEmail;
