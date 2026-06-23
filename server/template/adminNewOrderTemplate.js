// Email sent to store admins (role ADMIN / MANAGER) when a customer places a
// new order. Mirrors the style of orderReceiptTemplate. Online orders are
// flagged prominently because they sit in "Pending Verification" until an
// admin reviews the payment screenshot and approves or rejects it.
const generateAdminNewOrderEmail = (order, customer) => {
  const isOnlinePending =
    order.paymentMethod === "Online" &&
    order.paymentStatus === "Pending Verification";

  const itemsRows = (order.items || [])
    .map(
      (item) =>
        `<tr>
          <td style="padding:6px 8px;border-bottom:1px solid #eee;">${item.name}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right;">Rs. ${Number(
            item.price * item.quantity
          ).toLocaleString("en-IN")}</td>
        </tr>`
    )
    .join("");

  return `
  <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;padding:20px;color:#333;">
    <h2 style="color:#1d4ed8;margin-bottom:4px;">New Order Received</h2>
    <p style="color:#555;margin-top:0;">Order <strong>${order._id}</strong> was just placed.</p>

    ${
      isOnlinePending
        ? `<div style="background:#fffbeb;border:1px solid #fcd34d;border-radius:8px;padding:12px 14px;margin:12px 0;">
            <strong style="color:#b45309;">Action required:</strong>
            <span style="color:#92400e;"> This is an Online payment awaiting verification. Please review the payment screenshot and approve or reject it.</span>
          </div>`
        : ""
    }

    <table style="width:100%;border-collapse:collapse;margin-top:8px;">
      <tr>
        <td style="padding:4px 8px;color:#666;">Customer</td>
        <td style="padding:4px 8px;"><strong>${
          customer?.name || order.shippingAddress?.fullName || "Customer"
        }</strong> (${customer?.email || "no email"})</td>
      </tr>
      <tr>
        <td style="padding:4px 8px;color:#666;">Payment</td>
        <td style="padding:4px 8px;">${order.paymentMethod} &mdash; ${order.paymentStatus}</td>
      </tr>
      <tr>
        <td style="padding:4px 8px;color:#666;">Order status</td>
        <td style="padding:4px 8px;">${order.orderStatus}</td>
      </tr>
      <tr>
        <td style="padding:4px 8px;color:#666;">Ship to</td>
        <td style="padding:4px 8px;">${order.shippingAddress?.city || ""}${
    order.shippingAddress?.state ? ", " + order.shippingAddress.state : ""
  } - ${order.shippingAddress?.pincode || ""}</td>
      </tr>
    </table>

    <table style="width:100%;border-collapse:collapse;margin-top:14px;">
      <thead>
        <tr style="background:#f3f4f6;">
          <th style="padding:8px;text-align:left;">Item</th>
          <th style="padding:8px;text-align:center;">Qty</th>
          <th style="padding:8px;text-align:right;">Total</th>
        </tr>
      </thead>
      <tbody>${itemsRows}</tbody>
    </table>

    <p style="text-align:right;font-size:16px;margin-top:12px;">
      <strong>Grand Total: Rs. ${Number(order.grandTotal).toLocaleString("en-IN")}</strong>
    </p>
    <p style="color:#888;font-size:12px;margin-top:18px;">You are receiving this because new-order notifications are enabled in admin settings.</p>
  </div>`;
};

export default generateAdminNewOrderEmail;
